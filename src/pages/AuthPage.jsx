import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getHomeRouteForRole } from '../utils/roleRoutes';
import { useTranslation } from 'react-i18next';

export default function AuthPage({ mode }) {
  const register = mode === 'register',
    forgot = mode === 'forgot',
    navigate = useNavigate(),
    auth = useAuth(),
    { t } = useTranslation();
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    code: '',
    newPassword: '',
    acceptTerms: false,
    acceptPrivacy: false
  });
  const [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [resetSent, setResetSent] = useState(false);
  useEffect(() => {
    if (auth.user && !register && !forgot)
      navigate(getHomeRouteForRole(auth.user.role), { replace: true });
  }, [auth.user, forgot, navigate, register]);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (forgot) {
        if (!resetSent) {
          await api('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email: form.email })
          });
          setResetSent(true);
          setMessage(t('redesign:auth.resetSent'));
        } else {
          await api('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({
              email: form.email,
              code: form.code,
              newPassword: form.newPassword
            })
          });
          setMessage(t('redesign:auth.resetDone'));
        }
      } else {
        const result = await (register ? auth.register(form) : auth.login(form));
        navigate(
          register ? '/onboarding' : getHomeRouteForRole(result.data.user.role),
          { replace: true }
        );
      }
    } catch (caught) {
      setError(caught.code ? t(`errors.${caught.code}`, { defaultValue: caught.message }) : caught.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={`auth-shell auth-${mode}`}>
      <section className="auth-visual">
        <Link to="/" className="back-home">
          <ArrowLeft size={16} /> {t('redesign:auth.home')}
        </Link>
        <div>
          <p className="eyebrow">{t('auth.privateBeginning')}</p>
          <h1>
            {t('auth.visualTitle')}
          </h1>
          <p>{t('auth.visualBody')}</p>
          <div className="auth-trust"><ShieldCheck size={18} /><div><strong>{t('redesign:auth.trust')}</strong><span>{t('redesign:auth.trustBody')}</span></div></div>
        </div>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <p className="eyebrow">
            {forgot
              ? t('auth.accountRecovery')
              : register
                ? t('auth.createAccount')
                : t('auth.welcomeBack')}
          </p>
          <h2>
            {forgot
              ? t('auth.resetTitle')
              : register
                ? t('auth.registerTitle')
                : t('auth.signInTitle')}
          </h2>
          <p className="form-intro">
            {forgot
              ? t('redesign:auth.forgotIntro')
              : register
                ? t('redesign:auth.registerIntro')
                : t('redesign:auth.loginIntro')}
          </p>
          <form onSubmit={submit}>
            {register && (
              <label>
                {t('auth.phone')}
                <input
                  value={form.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </label>
            )}
            <label>
              {t('auth.email')}
              <input
                type="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                placeholder="you@example.com"
                required
                readOnly={forgot && resetSent}
              />
            </label>
            {forgot && resetSent ? (
              <>
                <label>
                  {t('auth.resetCode')}
                  <input
                    inputMode="numeric"
                    value={form.code}
                    onChange={(event) => update('code', event.target.value)}
                    required
                  />
                </label>
                <label>
                  {t('auth.newPassword')}
                  <input
                    type="password"
                    minLength="8"
                    value={form.newPassword}
                    onChange={(event) =>
                      update('newPassword', event.target.value)
                    }
                    required
                  />
                </label>
              </>
            ) : (
              !forgot && (
                <label>
                  {t('auth.password')}
                  <input
                    type="password"
                    minLength="8"
                    value={form.password}
                    onChange={(event) => update('password', event.target.value)}
                    placeholder={t('redesign:auth.passwordHint')}
                    required
                  />
                </label>
              )
            )}
            {register && (
              <div className="consent-fields">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={(event) =>
                      update('acceptTerms', event.target.checked)
                    }
                    required
                  />{' '}
                  {t('redesign:auth.termsPrefix')}{' '}
                  <Link to="/terms" target="_blank">
                    {t('redesign:auth.terms')}
                  </Link>
                  .
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={form.acceptPrivacy}
                    onChange={(event) =>
                      update('acceptPrivacy', event.target.checked)
                    }
                    required
                  />{' '}
                  {t('redesign:auth.privacyPrefix')}{' '}
                  <Link to="/privacy" target="_blank">
                    {t('redesign:auth.privacy')}
                  </Link>
                  .
                </label>
              </div>
            )}
            {error && <p className="form-error">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <button className="primary-button" disabled={busy}>
              {busy
                ? t('redesign:auth.wait')
                : forgot
                  ? resetSent
                    ? t('redesign:auth.setPassword')
                    : t('redesign:auth.sendCode')
                  : register
                    ? t('redesign:auth.createAccount')
                    : t('redesign:auth.signIn')}
              <ArrowRight size={17} />
            </button>
          </form>
          {!register && !forgot && (
            <p className="auth-switch">
              <Link to="/forgot-password">{t('auth.forgot')}</Link>
            </p>
          )}
          <p className="auth-switch">
            {register
              ? t('redesign:auth.registered')
              : forgot
                ? t('redesign:auth.remembered')
                : t('redesign:auth.newHere')}{' '}
            <Link to={register || forgot ? '/login' : '/register'}>
              {register || forgot ? t('redesign:auth.signIn') : t('redesign:auth.createProfile')}
            </Link>
          </p>
          <div className="security-note">
            <ShieldCheck size={17} /> {t('auth.security')}
          </div>
        </div>
      </section>
    </div>
  );
}
