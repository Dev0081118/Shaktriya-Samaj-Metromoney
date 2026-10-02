import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
const csv = (v) => (Array.isArray(v) ? v.join(', ') : v || ''),
  arrays = (v) =>
    String(v || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
const privacyOptions = {
  photoVisibility: [
    'Everyone',
    'RegisteredMembers',
    'AcceptedInterests',
    'Private'
  ],
  contactVisibility: ['AcceptedInterests', 'MutualMatches', 'Private'],
  incomeVisibility: [
    'Everyone',
    'RegisteredMembers',
    'AcceptedInterests',
    'Private'
  ],
  familyVisibility: ['RegisteredMembers', 'AcceptedInterests', 'Private'],
  familyOverviewVisibility: ['RegisteredMembers', 'AcceptedInterests', 'MutualMatches', 'Private'],
  maternalFamilyVisibility: ['AcceptedInterests', 'MutualMatches', 'Private'],
  siblingDetailsVisibility: ['AcceptedInterests', 'MutualMatches', 'Private'],
  assetVisibility: ['AcceptedInterests', 'MutualMatches', 'Private'],
  fullNameVisibility: ['Everyone', 'RegisteredMembers']
};
export default function SettingsPage({ section }) {
  const [form, setForm] = useState({}),
    [profile, setProfile] = useState(null),
    [blocks, setBlocks] = useState([]),
    [notifications, setNotifications] = useState({}),
    [tab, setTab] = useState(section ? 'Preferences' : 'Privacy'),
    [loading, setLoading] = useState(true);
  const { user, logout } = useAuth(),
    notify = useToast(),
    navigate = useNavigate();
  useEffect(() => {
    if (section) {
      api('/preferences')
        .then((r) => setForm(r.data.preferences))
        .catch((e) => notify(e.message, 'error'))
        .finally(() => setLoading(false));
      return;
    }
    Promise.all([
      api('/profiles/me'),
      api('/blocks'),
      api('/notification-preferences')
    ])
      .then(([p, b, n]) => {
        setProfile(p.data.profile);
        setForm(p.data.profile.privacy || {});
        setBlocks(b.data.blocks || []);
        setNotifications(n.data.preferences || {});
      })
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [section, notify]);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async (e) => {
    e.preventDefault();
    try {
      if (section) {
        const payload = { ...form };
        [
          'locations',
          'states',
          'countries',
          'educationPreferences',
          'occupationPreferences',
          'dietPreferences',
          'communityPreferences',
          'marriageTimeline',
          'maritalStatus',
          'acceptedMaritalStatuses'
        ].forEach((k) => {
          if (typeof payload[k] === 'string') payload[k] = arrays(payload[k]);
        });
        await api('/preferences', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else
        await api('/profiles/privacy', {
          method: 'PATCH',
          body: JSON.stringify(form)
        });
      notify(section ? 'Preferences saved.' : 'Privacy updated.');
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const password = async (e) => {
    e.preventDefault();
    try {
      await api('/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: e.currentTarget.current.value,
          newPassword: e.currentTarget.next.value
        })
      });
      e.currentTarget.reset();
      notify('Password changed.');
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const lifecycle = async (status) => {
    try {
      const r = await api('/profiles/lifecycle', {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setProfile((p) => ({
        ...p,
        visibility: r.data.visibility,
        lifecycleStatus: r.data.status
      }));
      notify(r.message);
    } catch (e) {
      notify(e.message, 'error');
    }
  };
  const saveNotifications = async (e) => {
    e.preventDefault();
    try {
      await api('/notification-preferences', {
        method: 'PUT',
        body: JSON.stringify(notifications)
      });
      notify('Notification preferences saved.');
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const removeAccount = async () => {
    if (
      !window.confirm(
        'Close this account and remove the profile from discovery? This cannot be undone from the app.'
      )
    )
      return;
    try {
      await api('/auth/account', { method: 'DELETE' });
      await logout();
      navigate('/');
    } catch (e) {
      notify(e.message, 'error');
    }
  };
  if (loading) return <div className="page-skeleton">Loading settings…</div>;
  return (
    <>
      <header className="page-heading compact">
        <p className="eyebrow">Your account</p>
        <h1>{section ? 'Partner preferences' : 'Settings & privacy'}</h1>
        <p>
          Choose what feels comfortable. Sensitive information is filtered by
          the server.
        </p>
      </header>
      {section ? (
        <form className="settings-form" onSubmit={save}>
          <h2>The person you hope to meet</h2>
          <label>
            Preferred gender
            <select
              value={form.preferredGender || ''}
              onChange={(e) => update('preferredGender', e.target.value)}
            >
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
            </select>
          </label>
          <div className="form-row">
            {[
              ['ageMin', 'Minimum age'],
              ['ageMax', 'Maximum age'],
              ['heightMin', 'Minimum height'],
              ['heightMax', 'Maximum height']
            ].map(([k, l]) => (
              <label key={k}>
                {l}
                <input
                  type="number"
                  value={form[k] || ''}
                  onChange={(e) => update(k, Number(e.target.value) || '')}
                />
              </label>
            ))}
          </div>
          {[
            ['locations', 'Preferred cities'],
            ['states', 'Preferred states'],
            ['educationPreferences', 'Education'],
            ['occupationPreferences', 'Occupations'],
            ['dietPreferences', 'Diet'],
            ['communityPreferences', 'Communities']
          ].map(([k, l]) => (
            <label key={k}>
              {l}
              <input
                value={csv(form[k])}
                onChange={(e) => update(k, e.target.value)}
                placeholder="Comma separated"
              />
            </label>
          ))}
          <label>Accepted marital statuses<input value={csv(form.acceptedMaritalStatuses)} onChange={(e) => update('acceptedMaritalStatuses', e.target.value)} placeholder="Never Married, Divorced, Widowed" /></label>
          <label>Willing to consider remarriage<select value={form.willingForRemarriage || 'Open to Discuss'} onChange={(e) => update('willingForRemarriage', e.target.value)}><option>Yes</option><option>No</option><option>Open to Discuss</option></select></label>
          <button className="primary-button">Save preferences</button>
        </form>
      ) : (
        <div className="settings-grid">
          <nav>
            {[
              'Privacy',
              'Account',
              'Password',
              'Notifications',
              'Blocked profiles'
            ].map((x) => (
              <button
                className={tab === x ? 'active' : ''}
                onClick={() => setTab(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </nav>
          <div>
            {tab === 'Privacy' && (
              <form className="settings-form" onSubmit={save}>
                <h2>Privacy controls</h2>
                {Object.entries(privacyOptions).map(([k, options]) => (
                  <label key={k}>
                    {k.replace(/([A-Z])/g, ' $1')}
                    <select
                      value={form[k] || ''}
                      onChange={(e) => update(k, e.target.value)}
                    >
                      {options.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                ))}
                <button className="primary-button">Save changes</button>
              </form>
            )}
            {tab === 'Account' && (
              <section className="settings-form">
                <h2>Account & profile status</h2>
                <p>
                  {user.email} • {user.phone || 'No phone number'}
                </p>
                <p>Current status: {profile?.lifecycleStatus || 'Active'}</p>
                <div className="profile-actions">
                  <button
                    onClick={() =>
                      lifecycle(
                        profile?.lifecycleStatus === 'Paused'
                          ? 'Active'
                          : 'Paused'
                      )
                    }
                    className="outline-button"
                  >
                    {profile?.lifecycleStatus === 'Paused'
                      ? 'Resume profile'
                      : 'Pause profile'}
                  </button>
                  <button
                    onClick={() => lifecycle('Married')}
                    className="outline-button"
                  >
                    We found a match / Got married
                  </button>
                </div>
                <div className="danger-zone">
                  <h3>Delete account</h3>
                  <p>
                    Your profile is hidden immediately and identifying login
                    data is anonymized.
                  </p>
                  <button onClick={removeAccount} className="outline-button">
                    Delete account
                  </button>
                </div>
              </section>
            )}
            {tab === 'Password' && (
              <form className="settings-form" onSubmit={password}>
                <h2>Change password</h2>
                <label>
                  Current password
                  <input name="current" type="password" required />
                </label>
                <label>
                  New password
                  <input name="next" type="password" minLength="8" required />
                </label>
                <button className="primary-button">Change password</button>
              </form>
            )}
            {tab === 'Notifications' && (
              <form className="settings-form" onSubmit={saveNotifications}>
                <h2>Notification preferences</h2>
                {[
                  ['emailInterests', 'Email for interests'],
                  ['emailMatches', 'Email for matches'],
                  ['emailPayments', 'Email for payments'],
                  ['smsCritical', 'SMS for critical updates'],
                  ['whatsappFuture', 'Allow future WhatsApp updates']
                ].map(([k, l]) => (
                  <label className="check" key={k}>
                    <input
                      type="checkbox"
                      checked={!!notifications[k]}
                      onChange={(e) =>
                        setNotifications((n) => ({
                          ...n,
                          [k]: e.target.checked
                        }))
                      }
                    />
                    {l}
                  </label>
                ))}
                <button className="primary-button">Save preferences</button>
              </form>
            )}
            {tab === 'Blocked profiles' && (
              <section className="settings-form">
                <h2>Blocked profiles</h2>
                {blocks.length ? (
                  blocks.map((b) => (
                    <div className="blocked-row" key={b._id}>
                      <span>{b.blockedProfile?.firstName}</span>
                      <button
                        className="text-link"
                        onClick={async () => {
                          await api(`/blocks/${b.blockedProfile._id}`, {
                            method: 'DELETE'
                          });
                          setBlocks((x) => x.filter((y) => y._id !== b._id));
                          notify('Profile unblocked.');
                        }}
                      >
                        Unblock
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No blocked profiles.</p>
                )}
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}
