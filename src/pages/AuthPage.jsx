import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  Link,
  useNavigate
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getHomeRouteForRole } from '../utils/roleRoutes';

const labelClass =
  "grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]";

const inputClass =
  "min-h-[53px] w-full border-0 border-b border-[#ddd0c1] bg-transparent px-[2px] py-[14px] text-[14px] tracking-normal text-[#191614] normal-case outline-none focus:border-[#681d25] focus:shadow-[0_3px_0_0_#681d2510]";

const primaryButtonClass =
  "mt-[5px] inline-flex min-h-[54px] items-center justify-center gap-[10px] rounded-[2px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:opacity-55";

export default function AuthPage({ mode }) {
  const register = mode === 'register';
  const forgot = mode === 'forgot';

  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    code: '',
    newPassword: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (auth.user && !register && !forgot) {
      navigate(
        getHomeRouteForRole(auth.user.role),
        { replace: true }
      );
    }
  }, [
    auth.user,
    forgot,
    navigate,
    register
  ]);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (forgot) {
        if (!resetSent) {
          await api(
            '/auth/forgot-password',
            {
              method: 'POST',
              body: JSON.stringify({
                email: form.email
              })
            }
          );

          setResetSent(true);
          setMessage(
            t('redesign:auth.resetSent')
          );
        } else {
          await api(
            '/auth/reset-password',
            {
              method: 'POST',
              body: JSON.stringify({
                email: form.email,
                code: form.code,
                newPassword:
                  form.newPassword
              })
            }
          );

          setMessage(
            t('redesign:auth.resetDone')
          );
        }
      } else {
        const result = await (
          register
            ? auth.register(form)
            : auth.login(form)
        );

        navigate(
          register
            ? '/onboarding'
            : getHomeRouteForRole(
                result.data.user.role
              ),
          { replace: true }
        );
      }
    } catch (caught) {
      setError(
        caught.code
          ? t(
              `errors.${caught.code}`,
              {
                defaultValue:
                  caught.message
              }
            )
          : caught.message
      );
    } finally {
      setBusy(false);
    }
  };

  const visualBackground = register
    ? "linear-gradient(0deg,rgba(35,12,14,.74),rgba(35,12,14,.3)),url('/assets/auth/auth-register.webp')"
    : forgot
      ? "linear-gradient(0deg,rgba(35,12,14,.78),rgba(35,12,14,.34)),url('/assets/auth/auth-recovery.webp')"
      : "linear-gradient(0deg,rgba(35,12,14,.82),rgba(35,12,14,.45)),url('/assets/auth/auth-login.webp')";

  return (
    <div className="grid min-h-screen grid-cols-[minmax(380px,0.9fr)_1.1fr] bg-[#fffdf8] max-[1024px]:grid-cols-[minmax(340px,.8fr)_1.2fr] max-[767px]:grid-cols-1">
      <section
        className="relative flex flex-col justify-between bg-cover bg-center px-[clamp(42px,5vw,88px)] py-[50px] text-white after:pointer-events-none after:absolute after:inset-6 after:border after:border-white/10 after:content-[''] max-[767px]:min-h-[390px] max-[767px]:px-7 max-[767px]:py-[35px] max-[767px]:after:inset-[14px]"
        style={{
          backgroundImage:
            visualBackground
        }}
      >
        <Link
          to="/"
          className="relative z-[1] flex items-center gap-2 text-[12px] text-white"
        >
          <ArrowLeft size={16} />
          {t('redesign:auth.home')}
        </Link>

        <div className="relative z-[1]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
            {t(
              'auth.privateBeginning'
            )}
          </p>

          <h1 className="mt-5 font-['Cormorant_Garamond'] text-[clamp(48px,5vw,76px)] font-medium leading-[0.98]">
            {t('auth.visualTitle')}
          </h1>

          <p className="mt-[22px] max-w-[480px] text-[13px] leading-[1.8] text-white/70">
            {t('auth.visualBody')}
          </p>

          <div className="mt-9 flex max-w-[440px] gap-[14px] border-t border-white/15 pt-6">
            <ShieldCheck
              size={18}
            />

            <div>
              <strong className="block text-[10px] uppercase tracking-[0.14em] text-[#e1bd88]">
                {t(
                  'redesign:auth.trust'
                )}
              </strong>

              <span className="mt-[7px] block text-[11px] leading-[1.7] text-white/60">
                {t(
                  'redesign:auth.trustBody'
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid place-items-center bg-[#f7f2ea] px-[clamp(28px,6vw,105px)] py-[70px] max-[767px]:px-[22px] max-[767px]:pb-[100px] max-[767px]:pt-[50px]">
        <div className="w-full max-w-[480px]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
            {forgot
              ? t(
                  'auth.accountRecovery'
                )
              : register
                ? t(
                    'auth.createAccount'
                  )
                : t(
                    'auth.welcomeBack'
                  )}
          </p>

          <h2 className="mt-[13px] font-['Cormorant_Garamond'] text-[clamp(48px,5vw,66px)] font-medium leading-none">
            {forgot
              ? t(
                  'auth.resetTitle'
                )
              : register
                ? t(
                    'auth.registerTitle'
                  )
                : t(
                    'auth.signInTitle'
                  )}
          </h2>

          <p className="mb-[30px] mt-[18px] text-[13px] leading-[1.8] text-[#756a60]">
            {forgot
              ? t(
                  'redesign:auth.forgotIntro'
                )
              : register
                ? t(
                    'redesign:auth.registerIntro'
                  )
                : t(
                    'redesign:auth.loginIntro'
                  )}
          </p>

          <form
            className="grid gap-[18px]"
            onSubmit={submit}
          >
            {register && (
              <label className={labelClass}>
                {t('auth.phone')}

                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(event) =>
                    update(
                      'phone',
                      event.target.value
                    )
                  }
                  placeholder="+91 98765 43210"
                  required
                />
              </label>
            )}

            <label className={labelClass}>
              {t('auth.email')}

              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(event) =>
                  update(
                    'email',
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                required
                readOnly={
                  forgot &&
                  resetSent
                }
              />
            </label>

            {forgot &&
            resetSent ? (
              <>
                <label className={labelClass}>
                  {t(
                    'auth.resetCode'
                  )}

                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={form.code}
                    onChange={(event) =>
                      update(
                        'code',
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                <label className={labelClass}>
                  {t(
                    'auth.newPassword'
                  )}

                  <input
                    className={inputClass}
                    type="password"
                    minLength="8"
                    value={
                      form.newPassword
                    }
                    onChange={(event) =>
                      update(
                        'newPassword',
                        event.target.value
                      )
                    }
                    required
                  />
                </label>
              </>
            ) : (
              !forgot && (
                <label className={labelClass}>
                  {t(
                    'auth.password'
                  )}

                  <input
                    className={inputClass}
                    type="password"
                    minLength="8"
                    value={
                      form.password
                    }
                    onChange={(event) =>
                      update(
                        'password',
                        event.target.value
                      )
                    }
                    placeholder={t(
                      'redesign:auth.passwordHint'
                    )}
                    required
                  />
                </label>
              )
            )}

            {register && (
              <div className="my-1 grid gap-[0.65rem]">
                <label className="flex items-start gap-[0.55rem] text-[0.86rem] font-normal text-[#5e4e46]">
                  <input
                    type="checkbox"
                    className="mt-[0.2rem] w-auto"
                    checked={
                      form.acceptTerms
                    }
                    onChange={(event) =>
                      update(
                        'acceptTerms',
                        event.target.checked
                      )
                    }
                    required
                  />

                  <span>
                    {t(
                      'redesign:auth.termsPrefix'
                    )}{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      className="font-extrabold text-[#681d25]"
                    >
                      {t(
                        'redesign:auth.terms'
                      )}
                    </Link>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-[0.55rem] text-[0.86rem] font-normal text-[#5e4e46]">
                  <input
                    type="checkbox"
                    className="mt-[0.2rem] w-auto"
                    checked={
                      form.acceptPrivacy
                    }
                    onChange={(event) =>
                      update(
                        'acceptPrivacy',
                        event.target.checked
                      )
                    }
                    required
                  />

                  <span>
                    {t(
                      'redesign:auth.privacyPrefix'
                    )}{' '}
                    <Link
                      to="/privacy"
                      target="_blank"
                      className="font-extrabold text-[#681d25]"
                    >
                      {t(
                        'redesign:auth.privacy'
                      )}
                    </Link>
                    .
                  </span>
                </label>
              </div>
            )}

            {error && (
              <p className="bg-[#f8e9e8] px-[14px] py-3 text-[12px] text-[#8b1e26]">
                {error}
              </p>
            )}

            {message && (
              <p className="text-[13px] text-[#426843]">
                {message}
              </p>
            )}

            <button
              className={primaryButtonClass}
              disabled={busy}
            >
              {busy
                ? t(
                    'redesign:auth.wait'
                  )
                : forgot
                  ? resetSent
                    ? t(
                        'redesign:auth.setPassword'
                      )
                    : t(
                        'redesign:auth.sendCode'
                      )
                  : register
                    ? t(
                        'redesign:auth.createAccount'
                      )
                    : t(
                        'redesign:auth.signIn'
                      )}

              <ArrowRight size={17} />
            </button>
          </form>

          {!register &&
            !forgot && (
              <p className="mt-[25px] text-center text-[12px] text-[#756a60]">
                <Link
                  to="/forgot-password"
                  className="font-extrabold text-[#681d25]"
                >
                  {t(
                    'auth.forgot'
                  )}
                </Link>
              </p>
            )}

          <p className="mt-[25px] text-center text-[12px] text-[#756a60]">
            {register
              ? t(
                  'redesign:auth.registered'
                )
              : forgot
                ? t(
                    'redesign:auth.remembered'
                  )
                : t(
                    'redesign:auth.newHere'
                  )}{' '}

            <Link
              to={
                register || forgot
                  ? '/login'
                  : '/register'
              }
              className="font-extrabold text-[#681d25]"
            >
              {register || forgot
                ? t(
                    'redesign:auth.signIn'
                  )
                : t(
                    'redesign:auth.createProfile'
                  )}
            </Link>
          </p>

          <div className="mt-7 flex items-center gap-[9px] border-t border-[#ddd0c1] pt-6 text-[11px] text-[#756a60]">
            <ShieldCheck size={17} />

            {t('auth.security')}
          </div>
        </div>
      </section>
    </div>
  );
}