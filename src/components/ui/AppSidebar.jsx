import {
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  NavLink
} from 'react-router-dom';

import {
  useTranslation
} from 'react-i18next';

import BrandLogo from '../BrandLogo';
import LanguageSwitcher from '../LanguageSwitcher';

import '../../styles/sidebar.css';

const subtitles = {
  member:
    'brand.society',

  admin:
    'brand.administration',

  manager:
    'brand.relationshipDesk'
};

export default function AppSidebar({
  variant = 'member',
  sections = [],
  identity,
  badges = {},
  onLogout
}) {
  const {
    t
  } =
    useTranslation();

  const [
    mobileOpen,
    setMobileOpen
  ] =
    useState(false);

  const [
    hovered,
    setHovered
  ] =
    useState(false);

  const [
    pinned,
    setPinned
  ] =
    useState(false);

  const sidebarRef =
    useRef(null);

  const triggerRef =
    useRef(null);

  const expanded =
    hovered ||
    pinned;

  useEffect(
    () => {
      if (
        !mobileOpen
      ) {
        return undefined;
      }

      const previous =
        document.body.style
          .overflow;

      document.body.style.overflow =
        'hidden';

      const close =
        (
          event
        ) => {
          if (
            event.key ===
            'Escape'
          ) {
            setMobileOpen(
              false
            );

            triggerRef.current?.focus();
          }
        };

      document.addEventListener(
        'keydown',
        close
      );

      requestAnimationFrame(
        () =>
          sidebarRef.current
            ?.querySelector(
              'a, button'
            )
            ?.focus()
      );

      return () => {
        document.body.style.overflow =
          previous;

        document.removeEventListener(
          'keydown',
          close
        );
      };
    },
    [
      mobileOpen
    ]
  );

  const closeMobile =
    () =>
      setMobileOpen(
        false
      );

  const handleBlur =
    (
      event
    ) => {
      if (
        !event.currentTarget.contains(
          event.relatedTarget
        )
      ) {
        setHovered(
          false
        );
      }
    };

  const homeRoute =
    variant ===
    'member'
      ? '/dashboard'
      : variant ===
          'manager'
        ? '/manager'
        : '/admin';

  return (
    <>
      {/* =====================================
          MOBILE TRIGGER
      ====================================== */}

      <button
        ref={
          triggerRef
        }
        type="button"
        className="app-sidebar-trigger"
        aria-label={
          t(
            'sidebar.open'
          )
        }
        aria-expanded={
          mobileOpen
        }
        aria-controls="application-sidebar"
        onClick={() =>
          setMobileOpen(
            true
          )
        }
      >
        <Menu
          aria-hidden="true"
        />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="app-sidebar-backdrop"
          aria-label={
            t(
              'sidebar.close'
            )
          }
          onClick={
            closeMobile
          }
        />
      )}

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside
        ref={
          sidebarRef
        }
        id="application-sidebar"
        className={`app-sidebar app-sidebar--${variant} ${
          expanded
            ? 'is-expanded'
            : ''
        } ${
          mobileOpen
            ? 'is-mobile-open'
            : ''
        }`}
        onMouseEnter={() =>
          setHovered(
            true
          )
        }
        onMouseLeave={() =>
          setHovered(
            false
          )
        }
        onFocus={() =>
          setHovered(
            true
          )
        }
        onBlur={
          handleBlur
        }
      >
        {/* =================================
            BRAND
        ================================== */}

        <div className="app-sidebar-brand">
          <NavLink
            to={
              homeRoute
            }
            onClick={
              closeMobile
            }
            aria-label="Royal Rajputana Matrimony"
          >
            {/* Collapsed sidebar */}

            <span
              className="app-sidebar-mark"
              aria-hidden="true"
            >
              <BrandLogo
                variant="whiteEmblem"
                alt=""
                className="mx-auto h-[48px] w-[48px] object-contain"
              />
            </span>

            {/* Expanded sidebar */}

            <span className="app-sidebar-brand-copy">
              <BrandLogo
                variant="whiteHorizontal"
                className="h-[40px] w-[168px] object-contain object-left"
              />

              <small>
                {t(
                  subtitles[
                    variant
                  ]
                )}
              </small>
            </span>
          </NavLink>

          <button
            type="button"
            className="app-sidebar-mobile-close"
            aria-label={
              t(
                'sidebar.close'
              )
            }
            onClick={
              closeMobile
            }
          >
            <X />
          </button>

          <button
            type="button"
            className="app-sidebar-pin"
            aria-label={
              t(
                pinned
                  ? 'sidebar.unpin'
                  : 'sidebar.pin'
              )
            }
            aria-expanded={
              pinned
            }
            onClick={() =>
              setPinned(
                (
                  value
                ) =>
                  !value
              )
            }
          >
            {pinned ? (
              <PanelLeftClose />
            ) : (
              <PanelLeftOpen />
            )}
          </button>
        </div>

        {/* =================================
            NAVIGATION
        ================================== */}

        <nav
          className="app-sidebar-nav"
          aria-label={
            t(
              'sidebar.navigation'
            )
          }
        >
          {sections.map(
            (
              section,
              index
            ) => (
              <section
                key={
                  section.groupKey ||
                  index
                }
              >
                {section.groupKey && (
                  <h2>
                    {t(
                      section.groupKey
                    )}
                  </h2>
                )}

                {section.links.map(
                  ({
                    to,
                    labelKey,
                    icon: Icon,
                    end,
                    badge
                  }) => {
                    const count =
                      badge
                        ? badges[
                            badge
                          ]
                        : 0;

                    return (
                      <NavLink
                        key={`${section.groupKey || 'main'}-${to}-${labelKey}`}
                        to={
                          to
                        }
                        end={
                          end
                        }
                        onClick={
                          closeMobile
                        }
                        data-tooltip={
                          t(
                            labelKey
                          )
                        }
                      >
                        <Icon
                          size={
                            19
                          }
                          aria-hidden="true"
                        />

                        <span className="app-sidebar-label">
                          {t(
                            labelKey
                          )}
                        </span>

                        {count >
                          0 && (
                          <b
                            className="app-sidebar-badge"
                            style={{ backgroundColor: '#c49b70', color: '#291817' }}
                            aria-label={
                              t(
                                'sidebar.unread',
                                {
                                  count
                                }
                              )
                            }
                          >
                            {
                              count
                            }
                          </b>
                        )}
                      </NavLink>
                    );
                  }
                )}
              </section>
            )
          )}
        </nav>

        {/* =================================
            FOOTER
        ================================== */}

        <div className="app-sidebar-footer">
          <div className="app-sidebar-language">
            <LanguageSwitcher />
          </div>

          <div className="app-sidebar-account">
            {identity?.image ? (
              <img
                src={
                  identity.image
                }
                alt=""
              />
            ) : (
              <span className="app-sidebar-avatar">
                {identity
                  ?.initial ||
                  'R'}
              </span>
            )}

            <span className="app-sidebar-account-copy">
              <strong>
                {
                  identity?.primary
                }
              </strong>

              <small>
                {
                  identity?.secondary
                }
              </small>
            </span>
          </div>

          <button
            type="button"
            className="app-sidebar-logout"
            data-tooltip={
              t(
                'actions.signOut'
              )
            }
            onClick={
              onLogout
            }
          >
            <LogOut
              size={
                18
              }
              aria-hidden="true"
            />

            <span className="app-sidebar-label">
              {t(
                'actions.signOut'
              )}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}