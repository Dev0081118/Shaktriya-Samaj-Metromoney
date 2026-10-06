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
import { api } from '../services/api';

/* eslint-disable react-refresh/only-export-components */

const AuthContext =
  createContext(null);

export function AuthProvider({
  children
}) {
  const hasToken =
    !!localStorage.getItem(
      'ksm_token'
    );

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(hasToken);

  useEffect(() => {
    const expired = () =>
      setUser(null);

    window.addEventListener(
      'ksm:unauthorized',
      expired
    );

    if (hasToken) {
      api('/auth/me')
        .then((result) => {
          setUser(
            result.data.user
          );

          if (
            result.data.user
              .preferredLanguage
          ) {
            i18n.changeLanguage(
              result.data.user
                .preferredLanguage
            );
          }
        })
        .catch(() =>
          localStorage.removeItem(
            'ksm_token'
          )
        )
        .finally(() =>
          setLoading(false)
        );
    }

    return () => {
      window.removeEventListener(
        'ksm:unauthorized',
        expired
      );
    };
  }, [hasToken]);

  const authenticate = async (
    path,
    values
  ) => {
    const result = await api(
      path,
      {
        method: 'POST',

        body: JSON.stringify({
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

    localStorage.setItem(
      'ksm_token',
      result.data.token
    );

    if (
      path ===
      '/auth/register'
    ) {
      const saved =
        sessionStorage.getItem(
          'ksm_matchfinder'
        );

      const criteria = saved
        ? JSON.parse(saved)
        : {};

      const status = await api(
        '/public/system-status'
      ).catch(() => ({
        data: {
          defaultCountry:
            'India'
        }
      }));

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

    setUser(
      result.data.user
    );

    if (
      result.data.user
        .preferredLanguage
    ) {
      i18n.changeLanguage(
        result.data.user
          .preferredLanguage
      );
    }

    return result;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated:
        !!user,

      login: (values) =>
        authenticate(
          '/auth/login',
          values
        ),

      register: (values) =>
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
              (current) => ({
                ...current,
                preferredLanguage
              })
            );
          } catch {
            // Local language selection remains usable
            // if preference sync fails.
          }
        },

      logout: async () => {
        try {
          await api(
            '/auth/logout',
            {
              method: 'POST'
            }
          );
        } finally {
          localStorage.removeItem(
            'ksm_token'
          );

          setUser(null);
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

export const useAuth = () =>
  useContext(AuthContext);