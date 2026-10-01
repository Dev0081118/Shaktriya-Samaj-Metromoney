/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AdminNav from '../../components/AdminNav';

const emptyPlan = {
  name: '',
  slug: '',
  price: 0,
  durationDays: 90,
  active: true,
  features: {
    interestLimit: 0,
    contactViewLimit: 0,
    messageLimit: 0,
    advancedSearch: false,
    profileBoost: false,
    prioritySupport: false,
    relationshipManager: false
  }
};
export default function AdminOperationsPage({ type }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [editing, setEditing] = useState(emptyPlan);
  const notify = useToast(),
    paths = {
      support: '/admin/support',
      plans: '/admin/plans',
      payments: '/admin/payments',
      settings: '/admin/settings',
      audit: '/admin/audit-logs'
    };
  const load = () =>
    api(paths[type])
      .then((result) => setData(result.data))
      .catch((caught) => setError(caught.message));
  useEffect(load, [type]);
  const updateTicket = async (ticket, status) => {
    const result = await api(`/admin/support/${ticket._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    setData((current) => ({
      ...current,
      tickets: current.tickets.map((item) =>
        item._id === ticket._id ? result.data.ticket : item
      )
    }));
    notify('Support ticket updated.');
  };
  const saveSettings = async (event) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    for (const key of [
      'maintenanceMode',
      'registrationEnabled',
      'paymentsEnabled'
    ])
      form[key] = event.currentTarget.elements[key].checked;
    form.maxPhotos = Number(form.maxPhotos);
    const result = await api('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(form)
    });
    setData((current) => ({ ...current, settings: result.data.settings }));
    notify('System settings saved.');
  };
  const savePlan = async (event) => {
    event.preventDefault();
    try {
      const path = editing._id ? `/admin/plans/${editing._id}` : '/admin/plans',
        method = editing._id ? 'PATCH' : 'POST';
      await api(path, { method, body: JSON.stringify(editing) });
      setEditing(emptyPlan);
      await load();
      notify(
        'Plan saved. Existing subscriptions keep their entitlement snapshot.'
      );
    } catch (caught) {
      notify(caught.message, 'error');
    }
  };
  const planField = (key, value) =>
      setEditing((current) => ({ ...current, [key]: value })),
    feature = (key, value) =>
      setEditing((current) => ({
        ...current,
        features: { ...current.features, [key]: value }
      }));
  return (
    <div className="admin-shell">
      <AdminNav />
      <main>
        {error ? (
          <div className="empty-state">
            <p>{error}</p>
          </div>
        ) : !data ? (
          <div className="page-skeleton">Loading administration data…</div>
        ) : (
          <>
            <header className="page-heading compact">
              <p className="eyebrow">Operations</p>
              <h1>
                {type === 'audit'
                  ? 'Audit logs'
                  : type[0].toUpperCase() + type.slice(1)}
              </h1>
            </header>
            {type === 'support' && (
              <section className="admin-table">
                {data.tickets.map((ticket) => (
                  <div className="admin-row report-row" key={ticket._id}>
                    <div>
                      <strong>
                        {ticket.priority === 'Priority' ? 'Priority · ' : ''}
                        {ticket.category}: {ticket.name}
                      </strong>
                      <small>
                        {ticket.email} · {ticket.message}
                      </small>
                    </div>
                    <time>
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                    </time>
                    <select
                      value={ticket.status}
                      onChange={(event) =>
                        updateTicket(ticket, event.target.value)
                      }
                    >
                      {['Open', 'In Progress', 'Resolved', 'Closed'].map(
                        (option) => (
                          <option key={option}>{option}</option>
                        )
                      )}
                    </select>
                  </div>
                ))}
              </section>
            )}
            {type === 'plans' && (
              <>
                <form className="settings-form plan-editor" onSubmit={savePlan}>
                  <h2>{editing._id ? 'Edit plan' : 'Create plan'}</h2>
                  {[
                    ['name', 'Name'],
                    ['slug', 'Slug'],
                    ['price', 'Price (INR)'],
                    ['durationDays', 'Duration (days)']
                  ].map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        required
                        name={key}
                        type={
                          ['price', 'durationDays'].includes(key)
                            ? 'number'
                            : 'text'
                        }
                        value={editing[key]}
                        onChange={(event) =>
                          planField(
                            key,
                            ['price', 'durationDays'].includes(key)
                              ? Number(event.target.value)
                              : event.target.value
                          )
                        }
                      />
                    </label>
                  ))}
                  {['interestLimit', 'contactViewLimit', 'messageLimit'].map(
                    (key) => (
                      <label key={key}>
                        {key}
                        <input
                          type="number"
                          min="0"
                          value={editing.features[key]}
                          onChange={(event) =>
                            feature(key, Number(event.target.value))
                          }
                        />
                      </label>
                    )
                  )}
                  {[
                    'advancedSearch',
                    'profileBoost',
                    'prioritySupport',
                    'relationshipManager'
                  ].map((key) => (
                    <label className="check" key={key}>
                      <input
                        type="checkbox"
                        checked={editing.features[key]}
                        onChange={(event) => feature(key, event.target.checked)}
                      />
                      {key}
                    </label>
                  ))}
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={editing.active}
                      onChange={(event) =>
                        planField('active', event.target.checked)
                      }
                    />
                    Active
                  </label>
                  <div className="profile-actions">
                    <button className="primary-button">Save plan</button>
                    {editing._id && (
                      <button
                        type="button"
                        className="outline-button"
                        onClick={() => setEditing(emptyPlan)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
                <section className="admin-table">
                  {data.plans.map((plan) => (
                    <div className="admin-row" key={plan._id}>
                      <div>
                        <strong>{plan.name}</strong>
                        <small>
                          {plan.durationDays} days ·{' '}
                          {plan.active ? 'Active' : 'Inactive'}
                        </small>
                      </div>
                      <time>₹{plan.price.toLocaleString('en-IN')}</time>
                      <button
                        className="outline-button"
                        onClick={() =>
                          setEditing({
                            ...plan,
                            features: {
                              ...emptyPlan.features,
                              ...plan.features
                            }
                          })
                        }
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </section>
              </>
            )}
            {type === 'payments' && (
              <section className="admin-table">
                {data.payments.map((payment) => (
                  <div className="admin-row" key={payment._id}>
                    <div>
                      <strong>{payment.user?.email}</strong>
                      <small>
                        {payment.providerOrderId} · {payment.plan?.name}
                      </small>
                    </div>
                    <time>{payment.status}</time>
                    <span>₹{payment.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </section>
            )}
            {type === 'audit' && (
              <section className="admin-table">
                {data.logs.map((log) => (
                  <div className="admin-row" key={log._id}>
                    <div>
                      <strong>{log.action}</strong>
                      <small>
                        {log.actor?.email || 'System'} · {log.entityType}{' '}
                        {log.entityId}
                      </small>
                    </div>
                    <time>
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </time>
                  </div>
                ))}
              </section>
            )}
            {type === 'settings' && (
              <>
                <form className="settings-form" onSubmit={saveSettings}>
                  {[
                    ['platformName', 'Platform name'],
                    ['supportEmail', 'Support email'],
                    ['supportPhone', 'Support phone'],
                    ['defaultCountry', 'Default country'],
                    ['maxPhotos', 'Maximum photos']
                  ].map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        name={key}
                        type={key === 'maxPhotos' ? 'number' : 'text'}
                        defaultValue={data.settings[key] || ''}
                      />
                    </label>
                  ))}
                  {[
                    ['maintenanceMode', 'Maintenance mode'],
                    ['registrationEnabled', 'Registration enabled'],
                    ['paymentsEnabled', 'Payments enabled']
                  ].map(([key, label]) => (
                    <label className="check" key={key}>
                      <input
                        name={key}
                        type="checkbox"
                        defaultChecked={data.settings[key]}
                      />
                      {label}
                    </label>
                  ))}
                  <button className="primary-button">Save settings</button>
                </form>
                {data.providers && (
                  <section className="admin-table">
                    <h2>Provider readiness</h2>
                    {Object.entries(data.providers).map(([key, provider]) => (
                      <div className="admin-row" key={key}>
                        <strong>
                          {key}: {provider.name}
                        </strong>
                        <span>
                          {provider.configured
                            ? 'Configured'
                            : `Missing ${provider.missing.join(', ')}`}
                        </span>
                      </div>
                    ))}
                  </section>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
