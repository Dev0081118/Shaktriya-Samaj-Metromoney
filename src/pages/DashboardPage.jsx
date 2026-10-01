import { ArrowRight, Camera, CheckCircle2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProfileCard from '../components/ui/ProfileCard';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../utils/formatters';
import { translateStatus } from '../utils/translatedLabels';
export default function DashboardPage() {
  const [data, setData] = useState(null),
    [error, setError] = useState('');
  const notify = useToast(), { t, i18n } = useTranslation();
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
      notify(t('member.interestSent'));
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
      notify(t('member.shortlistedToast'));
    } catch (e) {
      notify(e.message, 'error');
    }
  };
  if (error)
    return (
      <div className="empty-state">
        <h2>{t('member.dashboardUnavailable')}</h2>
        <p>{error}</p>
      </div>
    );
  if (!data)
    return <div className="page-skeleton">{t('member.dashboardLoading')}</div>;
  if (!data.profile)
    return (
      <div className="empty-state large">
        <h2>{t('member.beginProfile')}</h2>
        <p>{t('member.beginProfileBody')}</p>
        <Link className="primary-button" to="/onboarding">
          {t('member.startOnboarding')}
        </Link>
      </div>
    );
  return (
    <>
      <header className="page-heading dashboard-welcome">
        <p className="eyebrow">
          {formatDate(new Date(), i18n.language, {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
        <h1>
          {t('member.greeting', { name: data.profile.firstName })}{' '}
          <em>{t('member.greetingEmphasis')}</em>
        </h1>
        <p>
          {t('member.recommendationBody')}
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
            {t('member.profileStrength')} · {translateStatus(t, data.profileStatus)}
          </p>
          <h2>
            {data.profileCompletion < 100
              ? t('member.profileIncomplete')
              : t('member.profileReady')}
          </h2>
          <p>{t('member.keepCurrent')}</p>
        </div>
        <Link className="outline-button" to="/onboarding">
          {t('member.completeProfileAction')} <ArrowRight size={16} />
        </Link>
      </section>
      <section className="stats-row">
        {[
          [data.newInterestsCount, t('member.newInterests')],
          [data.mutualMatchesCount, t('member.mutualMatches')],
          [data.shortlistCount, t('nav.shortlisted')],
          [data.unreadNotificationsCount, t('member.unread')],
          [data.profileViewsLast30Days, t('member.profileViews')]
        ].map(([n, l]) => (
          <div key={l}>
            <strong>{n}</strong>
            <span>{l}</span>
          </div>
        ))}
      </section>
      <div className="section-title">
        <div>
          <p className="eyebrow">{t('member.selectedForYou')}</p>
          <h2>{t('member.recommended')}</h2>
        </div>
        <Link to="/discover">
          {t('actions.viewAll')} <ArrowRight size={16} />
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
          <p>{t('member.noRecommendations')}</p>
        </div>
      )}
      <section className="activity-panel">
        <h2>{t('member.nextSteps')}</h2>
        <div>
          <span>
            <Camera />
            <b>{t('member.addPhoto')}</b>
            <small>
              Profiles with photos receive more considered responses.
            </small>
          </span>
          <span>
            <CheckCircle2 />
            <b>{t('member.reviewPreferences')}</b>
            <small>Keep recommendations precise and relevant.</small>
          </span>
          <span>
            <Eye />
            <b>{t('member.reviewPrivacy')}</b>
            <small>Choose what other members can see.</small>
          </span>
        </div>
      </section>
    </>
  );
}
