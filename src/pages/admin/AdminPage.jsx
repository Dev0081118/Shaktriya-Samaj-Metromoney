import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, assetUrl } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import AdminNav from '../../components/AdminNav';
function Async({ path, children }) {
  const [data, setData] = useState(null),
    [error, setError] = useState('');
  useEffect(() => {
    api(path)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
  }, [path]);
  if (error)
    return (
      <div className="empty-state">
        <p>{error}</p>
      </div>
    );
  if (!data)
    return <div className="page-skeleton">Loading administration data…</div>;
  return children(data, setData);
}
function Overview() {
  return (
    <Async path="/admin/overview">
      {(d) => (
        <>
          <header className="page-heading compact">
            <p className="eyebrow">System overview</p>
            <h1>Moderation dashboard</h1>
          </header>
          <div className="admin-metrics">
            {[
              [d.users, 'Total users'],
              [d.active, 'Active profiles'],
              [d.pending, 'Pending review'],
              [d.approvedThisWeek, 'Approved this week'],
              [d.matches, 'Matches'],
              [d.reports, 'Open reports']
            ].map(([n, l]) => (
              <article key={l}>
                <strong>{n}</strong>
                <span>{l}</span>
              </article>
            ))}
          </div>
          <Queue />
        </>
      )}
    </Async>
  );
}
function Queue() {
  const nav = useNavigate();
  return (
    <Async path="/admin/profiles?status=pending_review">
      {(d) => (
        <section className="admin-table">
          <div className="section-title">
            <div>
              <p className="eyebrow">Queue</p>
              <h2>Profiles awaiting review</h2>
            </div>
          </div>
          {d.profiles.length ? (
            d.profiles.map((p) => (
              <div className="admin-row" key={p._id}>
                <span className="avatar">{p.firstName?.[0]}</span>
                <div>
                  <strong>
                    {p.firstName} {p.lastName}
                  </strong>
                  <small>
                    {p.profileId} • {p.location?.city}
                  </small>
                </div>
                <time>{new Date(p.createdAt).toLocaleDateString('en-IN')}</time>
                <button
                  onClick={() => nav(`/admin/profiles/${p._id}`)}
                  className="outline-button"
                >
                  Review
                </button>
              </div>
            ))
          ) : (
            <p className="empty-inline">No pending profiles.</p>
          )}
        </section>
      )}
    </Async>
  );
}
function Review() {
  const { id } = useParams(),
    notify = useToast(),
    nav = useNavigate();
  const [notes, setNotes] = useState('');
  return (
    <Async path={`/admin/profiles/${id}`}>
      {(d) => {
        const p = d.profile;
        const act = async (action) => {
          try {
            await api(`/admin/profiles/${id}/${action}`, {
              method: 'PATCH',
              body: JSON.stringify({ notes })
            });
            notify('Moderation decision saved.');
            nav('/admin/profiles');
          } catch (e) {
            notify(e.message, 'error');
          }
        };
        return (
          <article className="admin-review">
            <header>
              {p.profilePhoto && <img src={assetUrl(p.profilePhoto)} alt="" />}
              <div>
                <p className="eyebrow">{p.profileId}</p>
                <h1>
                  {p.firstName} {p.lastName}
                </h1>
                <p>
                  {p.location?.city}, {p.location?.state} • {p.visibility}
                </p>
              </div>
            </header>
            <section>
              <h2>Profile details</h2>
              <p>{p.aboutMe || 'No introduction supplied.'}</p>
              <dl>
                <div>
                  <dt>Education</dt>
                  <dd>{p.education?.highestEducation}</dd>
                </div>
                <div>
                  <dt>Occupation</dt>
                  <dd>{p.career?.occupation}</dd>
                </div>
                <div>
                  <dt>Community</dt>
                  <dd>{p.community?.name}</dd>
                </div>
              </dl>
            </section>
            <label>
              Moderation notes
              <textarea
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <div className="profile-actions">
              <button onClick={() => act('approve')} className="primary-button">
                Approve
              </button>
              <button onClick={() => act('changes')} className="outline-button">
                Request changes
              </button>
              <button onClick={() => act('reject')} className="outline-button">
                Reject
              </button>
              <button onClick={() => act('suspend')} className="outline-button">
                Suspend
              </button>
            </div>
          </article>
        );
      }}
    </Async>
  );
}
function Users() {
  const notify = useToast(),
    { user } = useAuth();
  const change = async (target, patch, setData) => {
    try {
      const result = await api(`/admin/users/${target._id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      });
      setData((current) => ({
        ...current,
        users: current.users.map((item) =>
          item._id === target._id ? result.data.user : item
        )
      }));
      notify('User access updated.');
    } catch (error) {
      notify(error.message, 'error');
    }
  };
  return (
    <Async path="/admin/users">
      {(data, setData) => (
        <section className="admin-table">
          <div className="section-title">
            <h2>Members and staff</h2>
          </div>
          {data.users.map((member) => (
            <div className="admin-row" key={member._id}>
              <span className="avatar">{member.email?.[0].toUpperCase()}</span>
              <div>
                <strong>{member.email}</strong>
                <small>
                  {member.phone} • {member.role}
                </small>
              </div>
              <select
                value={member.status}
                onChange={(event) =>
                  change(member, { status: event.target.value }, setData)
                }
              >
                {['Active', 'Suspended', 'Blocked'].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              {user?.role === 'super_admin' && (
                <select
                  aria-label={`Role for ${member.email}`}
                  value={member.role}
                  onChange={(event) =>
                    change(member, { role: event.target.value }, setData)
                  }
                >
                  {[
                    'member',
                    'moderator',
                    'admin',
                    'relationship_manager',
                    'super_admin'
                  ].map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </section>
      )}
    </Async>
  );
}
function Reports() {
  const notify = useToast();
  return (
    <Async path="/admin/reports">
      {(d, setData) => (
        <section className="admin-table">
          <div className="section-title">
            <h2>Member reports</h2>
          </div>
          {d.reports.length ? (
            d.reports.map((r) => (
              <div className="admin-row report-row" key={r._id}>
                <div>
                  <strong>
                    {r.reason}: {r.reportedProfile?.firstName}
                  </strong>
                  <small>
                    {r.description} • reported by {r.reporter?.email}
                  </small>
                </div>
                <time>{r.status}</time>
                <select
                  value={r.status}
                  onChange={async (e) => {
                    const out = await api(`/admin/reports/${r._id}`, {
                      method: 'PATCH',
                      body: JSON.stringify({ status: e.target.value })
                    });
                    setData((x) => ({
                      ...x,
                      reports: x.reports.map((i) =>
                        i._id === r._id ? out.data.report : i
                      )
                    }));
                    notify('Report updated.');
                  }}
                >
                  {['Open', 'Reviewed', 'Resolved', 'Dismissed'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
            ))
          ) : (
            <p className="empty-inline">No reports.</p>
          )}
        </section>
      )}
    </Async>
  );
}
function Subscriptions() {
  return (
    <Async path="/admin/subscriptions">
      {(d) => (
        <section className="admin-table">
          <div className="section-title">
            <h2>Subscriptions</h2>
          </div>
          {d.subscriptions.length ? (
            d.subscriptions.map((s) => (
              <div className="admin-row" key={s._id}>
                <div>
                  <strong>{s.user?.email}</strong>
                  <small>{s.plan?.name}</small>
                </div>
                <time>{s.status}</time>
                <span>{s.payment?.status || 'No payment'}</span>
              </div>
            ))
          ) : (
            <p className="empty-inline">No subscriptions yet.</p>
          )}
        </section>
      )}
    </Async>
  );
}
export default function AdminPage() {
  return (
    <div className="admin-shell">
      <AdminNav />
      <main>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="profiles" element={<Queue />} />
          <Route path="profiles/:id" element={<Review />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="subscriptions" element={<Subscriptions />} />
        </Routes>
      </main>
    </div>
  );
}
