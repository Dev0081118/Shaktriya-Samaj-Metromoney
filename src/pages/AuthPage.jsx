import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AuthPage({ mode }) {
  const register = mode === 'register',
    forgot = mode === 'forgot',
    navigate = useNavigate(),
    auth = useAuth();
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
        await (register ? auth.register(form) : auth.login(form));
        navigate(register ? '/onboarding' : '/dashboard');
      }
    } catch (caught) {
      setError(caught.message);
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
          <p className="eyebrow">A private beginning</p>
          <h1>
            Meaningful introductions,
            <br />
            <em>thoughtfully made.</em>
          </h1>
          <p>Your information stays protected throughout the journey.</p>
        </div>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <p className="eyebrow">
            {forgot
              ? 'Account recovery'
              : register
                ? 'Create your account'
                : 'Welcome back'}
          </p>
          <h2>
            {forgot
              ? 'Reset your password'
              : register
                ? 'Begin your journey'
                : 'Sign in privately'}
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
                Mobile number
                <input
                  value={form.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </label>
            )}
            <label>
              Email address
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
                  Reset code
                  <input
                    inputMode="numeric"
                    value={form.code}
                    onChange={(event) => update('code', event.target.value)}
                    required
                  />
                </label>
                <label>
                  New password
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
                  Password
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
              <Link to="/forgot-password">Forgot password?</Link>
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
            <ShieldCheck size={17} /> Secure access. We never show your contact
            details publicly.
          </div>
        </div>
      </section>
    </div>
  );
}
