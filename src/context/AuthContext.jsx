import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import i18n, {
  normalizeLanguage
} from '../i18n';

import {
  api
} from '../services/api';

/* eslint-disable react-refresh/only-export-components */

const AuthContext =
  createContext(null);

export function AuthProvider({
  children
}) {
  const [
    user,
    setUser
  ] =
    useState(null);

  /*
   * Cookie state is not readable from JavaScript
   * because the session cookie is httpOnly.
   *
   * Therefore /auth/me is authoritative whenever
   * the application starts.
   */
  const [
    loading,
    setLoading
  ] =
    useState(true);

  useEffect(
    () => {
      /*
       * Remove the legacy JWT left by older builds.
       *
       * This is a one-time migration cleanup.
       */
      localStorage.removeItem(
        'ksm_token'
      );

      const unauthorized =
        () => {
          setUser(
            null
          );
        };

      window.addEventListener(
        'ksm:unauthorized',
        unauthorized
      );

      api(
        '/auth/me'
      )
        .then(
          (
            result
          ) => {
            const authenticatedUser =
              result.data
                .user;

            setUser(
              authenticatedUser
            );

            if (
              authenticatedUser
                ?.preferredLanguage
            ) {
              i18n.changeLanguage(
                authenticatedUser
                  .preferredLanguage
              );
            }
          }
        )
        .catch(
          () => {
            setUser(
              null
            );
          }
        )
        .finally(
          () => {
            setLoading(
              false
            );
          }
        );

      return () => {
        window.removeEventListener(
          'ksm:unauthorized',
          unauthorized
        );
      };
    },
    []
  );

  const authenticate =
    async (
      path,
      values
    ) => {
      const result =
        await api(
          path,
          {
            method:
              'POST',

            body:
              JSON.stringify({
                ...values,

                ...(path ===
                '/auth/register'
                  ? {
                      preferredLanguage:
                        normalizeLanguage(
                          i18n.language
                        )
                    }
                  : {})
              })
          }
        );

      /*
       * No JWT is stored in browser storage.
       *
       * The API response already installed the
       * httpOnly session cookie.
       */
      if (
        path ===
        '/auth/register'
      ) {
        const saved =
          sessionStorage.getItem(
            'ksm_matchfinder'
          );

        const criteria =
          saved
            ? JSON.parse(
                saved
              )
            : {};

        const status =
          await api(
            '/public/system-status'
          ).catch(
            () => ({
              data: {
                defaultCountry:
                  'India'
              }
            })
          );

        localStorage.removeItem(
          'ksm_onboarding_step'
        );

        localStorage.setItem(
          'ksm_onboarding',
          JSON.stringify({
            profileFor:
              criteria.profileFor,

            preferredGender:
              criteria.preferredGender,

            ageMin:
              criteria.ageMin,

            ageMax:
              criteria.ageMax,

            states:
              criteria.state,

            country:
              status.data
                .defaultCountry
          })
        );

        if (saved) {
          sessionStorage.removeItem(
            'ksm_matchfinder'
          );
        }
      }

      const authenticatedUser =
        result.data.user;

      setUser(
        authenticatedUser
      );

      if (
        authenticatedUser
          ?.preferredLanguage
      ) {
        i18n.changeLanguage(
          authenticatedUser
            .preferredLanguage
        );
      }

      return result;
    };

  const value =
    useMemo(
      () => ({
        user,

        loading,

        isAuthenticated:
          !!user,

        login:
          (
            values
          ) =>
            authenticate(
              '/auth/login',
              values
            ),

        register:
          (
            values
          ) =>
            authenticate(
              '/auth/register',
              values
            ),

        saveLanguage:
          async (
            preferredLanguage
          ) => {
            localStorage.setItem(
              'ksm_language',
              preferredLanguage
            );

            if (!user) {
              return;
            }

            try {
              await api(
                '/account/preferences/language',
                {
                  method:
                    'PATCH',

                  body:
                    JSON.stringify({
                      preferredLanguage
                    })
                }
              );

              setUser(
                (
                  current
                ) => ({
                  ...current,

                  preferredLanguage
                })
              );
            } catch {
              /*
               * Local language selection remains
               * available even if sync fails.
               */
            }
          },

        logout:
          async () => {
            try {
              await api(
                '/auth/logout',
                {
                  method:
                    'POST'
                }
              );
            } finally {
              /*
               * Server clears the httpOnly cookie.
               * Browser JavaScript only clears its
               * local user representation.
               */
              setUser(
                null
              );
            }
          }
      }),
      [
        user,
        loading
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth =
  () =>
    useContext(
      AuthContext
    );