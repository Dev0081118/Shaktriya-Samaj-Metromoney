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
          setMessage('If an account exists, a reset code has been sent.');
        } else {
          await api('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({
              email: form.email,
              code: form.code,
              newPassword: form.newPassword
            })
          });
          setMessage('Password reset. You can now sign in.');
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
    <div className="auth-shell">
      <section className="auth-visual">
        <Link to="/" className="back-home">
          <ArrowLeft size={16} /> Home
        </Link>
        <div>
          <p className="eyebrow">{t('auth.privateBeginning')}</p>
          <h1>
            {t('auth.visualTitle')}
          </h1>
          <p>{t('auth.visualBody')}</p>
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
              ? 'We’ll send a short-lived code without confirming whether an account exists.'
              : register
                ? 'Create an account first. Your matrimonial profile is built separately in guided steps.'
                : 'Continue to your family’s private space.'}
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
                    placeholder="At least 8 characters"
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
                  I agree to the{' '}
                  <Link to="/terms" target="_blank">
                    Terms of Use
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
                  I acknowledge the{' '}
                  <Link to="/privacy" target="_blank">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
            )}
            {error && <p className="form-error">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <button className="primary-button" disabled={busy}>
              {busy
                ? 'Please wait…'
                : forgot
                  ? resetSent
                    ? 'Set new password'
                    : 'Send reset code'
                  : register
                    ? 'Create account'
                    : 'Sign in'}
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
              ? 'Already registered?'
              : forgot
                ? 'Remembered your password?'
                : 'New to Kshatriya?'}{' '}
            <Link to={register || forgot ? '/login' : '/register'}>
              {register || forgot ? 'Sign in' : 'Create a profile'}
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
