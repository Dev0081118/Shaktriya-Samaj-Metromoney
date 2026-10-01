import { BadgeCheck, Bookmark, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { assetUrl } from "../../services/api";
import { useTranslation } from "react-i18next";
export default function ProfileCard({ profile, onShortlist, onInterest }) {
  const score = profile.compatibility?.score, { t } = useTranslation();
  return (
    <article className="profile-card">
      <div className="profile-card-image">
        {profile.profilePhoto ? (
          <img
            src={assetUrl(profile.profilePhoto)}
            alt={`${profile.firstName}'s profile`}
          />
        ) : (
          <div className="photo-placeholder">{profile.firstName?.[0]}</div>
        )}
        {profile.verification?.adminVerified && (
          <span className="verified">
            <BadgeCheck size={14} /> {t('profile.verified')}
          </span>
        )}
        <button
          className={`save-button ${profile.shortlisted ? "saved" : ""}`}
          onClick={() => onShortlist?.(profile)}
          aria-label={t('actions.shortlist')}
        >
          <Bookmark size={18} />
        </button>
      </div>
      <div className="profile-card-body">
        <div className="card-heading">
          <div>
            <h3>{profile.firstName}</h3>
            <p>
              {profile.age ?? "—"} {t('profile.years')} • {profile.height || "—"} cm •{" "}
              {profile.location?.city || "India"}
            </p>
          </div>
          {score !== undefined && (
            <span className="match-score">
              {score}%<small>{t('profile.match')}</small>
            </span>
          )}
        </div>
        <p className="profile-meta">
          {profile.education?.highestEducation || t('profile.educationMissing')} •{" "}
          {profile.career?.occupation || t('profile.professionMissing')}
        </p>
        <div className="card-actions">
          <Link to={`/profile/${profile.profileId}`} className="text-link">
            {t('actions.viewProfile')}
          </Link>
          <button
            className="interest-button"
            disabled={profile.interestSent}
            onClick={() => onInterest?.(profile)}
          >
            <Heart size={15} />{" "}
            {profile.interestSent ? t('member.interestSent') : t('actions.expressInterest')}
          </button>
        </div>
      </div>
    </article>
  );
}
