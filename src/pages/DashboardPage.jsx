import { ArrowRight, Camera, CheckCircle2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProfileCard from '../components/ui/ProfileCard';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
export default function DashboardPage() {
  const [data, setData] = useState(null),
    [error, setError] = useState('');
  const notify = useToast();
  useEffect(() => {
    api('/dashboard')
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
  }, []);
  const interest = async (p) => {
    try {
      await api('/interests', {
        method: 'POST',
        body: JSON.stringify({ receiverProfile: p._id })
      });
      setData((d) => ({
        ...d,
        recommendedProfiles: d.recommendedProfiles.map((x) =>
          x._id === p._id ? { ...x, interestSent: true } : x
        )
      }));
      notify('Interest sent.');
    } catch (e) {
      notify(e.message, 'error');
    }
  };
  const shortlist = async (p) => {
    try {
      await api('/shortlist', {
        method: 'POST',
        body: JSON.stringify({ profileId: p._id })
      });
      setData((d) => ({
        ...d,
        shortlistCount: d.shortlistCount + 1,
        recommendedProfiles: d.recommendedProfiles.map((x) =>
          x._id === p._id ? { ...x, shortlisted: true } : x
        )
      }));
      notify('Profile shortlisted.');
    } catch (e) {
      notify(e.message, 'error');
    }
  };
  if (error)
    return (
      <div className="empty-state">
        <h2>Dashboard unavailable</h2>
        <p>{error}</p>
      </div>
    );
  if (!data)
    return <div className="page-skeleton">Preparing your dashboard…</div>;
  if (!data.profile)
    return (
      <div className="empty-state large">
        <h2>Begin your matrimonial profile</h2>
        <p>Your account is ready. Create the profile your family will share.</p>
        <Link className="primary-button" to="/onboarding">
          Start onboarding
        </Link>
      </div>
    );
  return (
    <>
      <header className="page-heading dashboard-welcome">
        <p className="eyebrow">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
        <h1>
          Good to see you, {data.profile.firstName}.{' '}
          <em>Meaningful introductions await.</em>
        </h1>
        <p>
          Here are a few thoughtful recommendations selected around your
          preferences.
        </p>
      </header>
      <section className="completion-panel">
        <div
          className="completion-ring"
          style={{
            background: `conic-gradient(var(--wine) ${data.profileCompletion}%,#e7ded2 0)`
          }}
        >
          <strong>{data.profileCompletion}</strong>
          <small>%</small>
        </div>
        <div>
          <p className="eyebrow">
            Profile strength · {data.profileStatus.replace('_', ' ')}
          </p>
          <h2>
            {data.profileCompletion < 100
              ? 'A few details will make your profile stand out.'
              : 'Your introduction is ready.'}
          </h2>
          <p>Keep your information and partner preferences current.</p>
        </div>
        <Link className="outline-button" to="/onboarding">
          Complete profile <ArrowRight size={16} />
        </Link>
      </section>
      <section className="stats-row">
        {[
          [data.newInterestsCount, 'New interests'],
          [data.mutualMatchesCount, 'Mutual matches'],
          [data.shortlistCount, 'Shortlisted'],
          [data.unreadNotificationsCount, 'Unread'],
          [data.profileViewsLast30Days, 'Profile views']
        ].map(([n, l]) => (
          <div key={l}>
            <strong>{n}</strong>
            <span>{l}</span>
          </div>
        ))}
      </section>
      <div className="section-title">
        <div>
          <p className="eyebrow">Selected for you</p>
          <h2>Recommended profiles</h2>
        </div>
        <Link to="/discover">
          View all <ArrowRight size={16} />
        </Link>
      </div>
      {data.recommendedProfiles.length ? (
        <div className="profile-grid">
          {data.recommendedProfiles.map((p) => (
            <ProfileCard
              key={p.profileId}
              profile={p}
              onInterest={interest}
              onShortlist={shortlist}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>We’re still looking for profiles aligned with your preferences.</p>
        </div>
      )}
      <section className="activity-panel">
        <h2>Suggested next steps</h2>
        <div>
          <span>
            <Camera />
            <b>Add a recent photograph</b>
            <small>
              Profiles with photos receive more considered responses.
            </small>
          </span>
          <span>
            <CheckCircle2 />
            <b>Review partner preferences</b>
            <small>Keep recommendations precise and relevant.</small>
          </span>
          <span>
            <Eye />
            <b>Review privacy</b>
            <small>Choose what other members can see.</small>
          </span>
        </div>
      </section>
    </>
  );
}
