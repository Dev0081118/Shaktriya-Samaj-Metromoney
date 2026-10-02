import {
  BadgeCheck,
  Bookmark,
  Heart,
  Printer,
  ShieldX,
  Flag,
  Phone,
  MessageCircle
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { api, assetUrl } from '../services/api';
import { useToast } from '../context/ToastContext';
const value = (input) => input || 'Not shared';
export default function ProfilePage({ own = false }) {
  const { profileId } = useParams(),
    navigate = useNavigate(),
    notify = useToast();
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [reporting, setReporting] = useState(false),
    [reason, setReason] = useState('Fake Profile');
  const load = useCallback(
    () =>
      api(own ? '/profiles/me' : `/profiles/${profileId}`)
        .then((result) => setData(result.data))
        .catch((caught) => setError(caught.message)),
    [own, profileId]
  );
  useEffect(() => {
    load();
  }, [load]);
  const action = async (name) => {
    try {
      if (name === 'interest')
        await api('/interests', {
          method: 'POST',
          body: JSON.stringify({ receiverProfile: data.profile._id })
        });
      if (name === 'shortlist')
        await api('/shortlist', {
          method: 'POST',
          body: JSON.stringify({ profileId: data.profile._id })
        });
      if (name === 'contact')
        await api('/contact-requests', {
          method: 'POST',
          body: JSON.stringify({ receiverProfile: data.profile._id })
        });
      if (name === 'unlock')
        await api(
          `/contact-requests/${data.actionState.contactRequest.id}/unlock`,
          { method: 'POST' }
        );
      if (name === 'block') {
        await api('/blocks', {
          method: 'POST',
          body: JSON.stringify({ profileId: data.profile._id })
        });
        navigate('/discover');
        return;
      }
      await load();
      notify(
        {
          interest: 'Interest sent.',
          shortlist: 'Profile shortlisted.',
          contact: 'Contact request sent.',
          unlock: 'Contact details unlocked.'
        }[name] || 'Profile updated.'
      );
    } catch (caught) {
      notify(caught.message, 'error');
    }
  };
  const respond = async (response) => {
    try {
      await api(
        `/contact-requests/${data.actionState.contactRequest.id}/${response}`,
        { method: 'PATCH' }
      );
      await load();
      notify(`Contact request ${response}ed.`);
    } catch (caught) {
      notify(caught.message, 'error');
    }
  };
  const report = async (event) => {
    event.preventDefault();
    try {
      await api('/reports', {
        method: 'POST',
        body: JSON.stringify({
          reportedProfile: data.profile._id,
          reason,
          description: event.currentTarget.description.value
        })
      });
      setReporting(false);
      notify('Report submitted for review.');
    } catch (caught) {
      notify(caught.message, 'error');
    }
  };
  if (error)
    return (
      <div className="empty-state large">
        <h2>Profile unavailable</h2>
        <p>{error}</p>
      </div>
    );
  if (!data) return <div className="page-skeleton">Loading profile…</div>;
  const profile = data.profile,
    contact = data.actionState?.contactRequest;
  return (
    <article className="profile-page">
      <div className="profile-hero">
        {profile.profilePhoto ? (
          <img
            src={assetUrl(profile.profilePhoto)}
            alt={`${profile.firstName}'s profile`}
          />
        ) : (
          <div className="photo-placeholder large">
            {profile.firstName?.[0]}
          </div>
        )}
        <div>
          <p className="eyebrow">
            {profile.profileId} • {profile.visibility?.replace('_', ' ')}
          </p>
          <h1>
            {profile.firstName} {profile.lastName || ''}{' '}
            {profile.verification?.adminVerified && <BadgeCheck />}
          </h1>
          <p>
            {value(profile.age)} years • {value(profile.height)} cm •{' '}
            {value(profile.location?.city)}, {value(profile.location?.state)}
          </p>
          <p className="profile-profession">
            {value(profile.education?.highestEducation)} •{' '}
            {value(profile.career?.occupation)}
          </p>
          {data.compatibility && (
            <p className="compatibility-note">
              <strong>{data.compatibility.score}% Preference Match</strong> •
              You align on{' '}
              {data.compatibility.matchedFactors
                .slice(0, 3)
                .join(', ')
                .toLowerCase()}
              .
            </p>
          )}
          <div className="profile-actions">
            {own ? (
              <>
                <Link to="/onboarding" className="primary-button">
                  Edit profile
                </Link>
                <Link to="/my-profile/biodata" className="outline-button">
                  <Printer size={16} /> Biodata
                </Link>
              </>
            ) : (
              <>
                <button
                  disabled={data.actionState?.interestSent}
                  onClick={() => action('interest')}
                  className="primary-button"
                >
                  <Heart size={16} />{' '}
                  {data.actionState?.interestSent
                    ? 'Interest sent'
                    : 'Express interest'}
                </button>
                <button
                  disabled={data.actionState?.shortlisted}
                  onClick={() => action('shortlist')}
                  className="outline-button"
                >
                  <Bookmark size={16} />{' '}
                  {data.actionState?.shortlisted ? 'Shortlisted' : 'Shortlist'}
                </button>
                {profile.contact ? (
                  <>
                    <a
                      className="outline-button"
                      href={`tel:${profile.contact.phone}`}
                    >
                      <Phone size={16} /> {profile.contact.phone}
                    </a>
                    {profile.contact.whatsappPhone && (
                      <a
                        className="outline-button"
                        href={`https://wa.me/${profile.contact.whatsappPhone}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle size={16} /> WhatsApp
                      </a>
                    )}
                  </>
                ) : contact?.status === 'Accepted' && !contact.unlocked ? (
                  <button
                    onClick={() => action('unlock')}
                    className="outline-button"
                  >
                    <Phone size={16} /> Unlock contact
                  </button>
                ) : contact?.incoming && contact.status === 'Pending' ? (
                  <>
                    <button
                      className="outline-button"
                      onClick={() => respond('accept')}
                    >
                      Accept contact
                    </button>
                    <button
                      className="outline-button"
                      onClick={() => respond('decline')}
                    >
                      Decline
                    </button>
                  </>
                ) : (
                  <button
                    disabled={
                      contact?.status === 'Pending' ||
                      contact?.status === 'Declined'
                    }
                    onClick={() => action('contact')}
                    className="outline-button"
                  >
                    <Phone size={16} />
                    {contact?.status === 'Pending'
                      ? 'Contact requested'
                      : contact?.status === 'Declined'
                        ? 'Request declined'
                        : 'Request contact'}
                  </button>
                )}
                <button
                  onClick={() => action('block')}
                  className="icon-action"
                  aria-label="Block profile"
                >
                  <ShieldX size={16} />
                </button>
                <button
                  onClick={() => setReporting(true)}
                  className="icon-action"
                  aria-label="Report profile"
                >
                  <Flag size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="profile-sections">
        <section>
          <p className="eyebrow">Introduction</p>
          <div>
            <h2>About {profile.firstName}</h2>
            <p>{value(profile.aboutMe)}</p>
          </div>
        </section>
        <section>
          <p className="eyebrow">Education & career</p>
          <dl>
            <div>
              <dt>Highest education</dt>
              <dd>{value(profile.education?.highestEducation)}</dd>
            </div>
            <div>
              <dt>Profession</dt>
              <dd>{value(profile.career?.occupation)}</dd>
            </div>
            <div>
              <dt>Work location</dt>
              <dd>{value(profile.location?.city)}</dd>
            </div>
            {profile.career?.annualIncome && (
              <div>
                <dt>Annual income</dt>
                <dd>{profile.career.annualIncome}</dd>
              </div>
            )}
          </dl>
        </section>
        {profile.family && (
          <section>
            <p className="eyebrow">Family</p>
            <div>
              <h2>{value(profile.family.familyType)} family</h2>
              <p>{value(profile.family.familyDescription)}</p>
              {profile.family.siblingDetails?.length > 0 && <div className="profile-subsection"><h3>Sibling context</h3>{profile.family.siblingDetails.map((sibling, index) => <p key={index}>{sibling.relation}: {sibling.name || 'Name private'}{sibling.occupation ? ` • ${sibling.occupation}` : ''}{sibling.maritalStatus === 'Married' && sibling.spouseNativePlace ? ` • Family connection in ${sibling.spouseNativePlace}` : ''}</p>)}</div>}
            </div>
          </section>
        )}
        {profile.maternalFamily && (
          <section><p className="eyebrow">Maternal family</p><dl><div><dt>Family surname</dt><dd>{value(profile.maternalFamily.maternalFamilySurname)}</dd></div><div><dt>Native place / Mosal</dt><dd>{value(profile.maternalFamily.maternalNativePlace || profile.maternalFamily.maternalVillage)}</dd></div><div><dt>Clan / Gotra</dt><dd>{value(profile.maternalFamily.maternalClan)}</dd></div></dl></section>
        )}
        {profile.maritalHistory && profile.maritalStatus !== 'Never Married' && (
          <section><p className="eyebrow">Marital context</p><div><h2>{profile.maritalStatus}</h2><p>{profile.maritalHistory.childrenFromPreviousMarriage ? `${profile.maritalHistory.childrenCount || 0} child/children from the previous marriage` : 'No children from the previous marriage shared.'}</p></div></section>
        )}
        {profile.familyAssets && (
          <section><p className="eyebrow">Family assets</p><div><h2>Shared with permission</h2><p>{value(profile.familyAssets.propertySummary)}</p>{profile.familyAssets.agricultureLand?.hasLand && <p>Approximate agricultural land: {profile.familyAssets.agricultureLand.approximateArea || 'Area not shared'} {profile.familyAssets.agricultureLand.unit || ''}</p>}</div></section>
        )}
        <section>
          <p className="eyebrow">Lifestyle</p>
          <p>
            {[
              profile.lifestyle?.diet,
              profile.lifestyle?.smoking,
              profile.lifestyle?.drinking
            ]
              .filter(Boolean)
              .join(' • ') || 'Not shared'}
          </p>
        </section>
      </div>
      {reporting && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="report-modal" onSubmit={report}>
            <h2>Report this profile</h2>
            <label>
              Reason
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              >
                {[
                  'Fake Profile',
                  'Inappropriate Content',
                  'Spam',
                  'Harassment',
                  'Incorrect Information',
                  'Other'
                ].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Details
              <textarea name="description" rows="4" required />
            </label>
            <div>
              <button
                type="button"
                className="outline-button"
                onClick={() => setReporting(false)}
              >
                Cancel
              </button>
              <button className="primary-button">Submit report</button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
