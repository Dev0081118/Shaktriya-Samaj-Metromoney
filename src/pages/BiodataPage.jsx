import { ArrowLeft, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, assetUrl } from '../services/api';
import { useTranslation } from 'react-i18next';
export default function BiodataPage() {
  const [p, setP] = useState(null),
    [error, setError] = useState(''), { t } = useTranslation();
  useEffect(() => {
    api('/profiles/me')
      .then((r) => setP(r.data.profile))
      .catch((e) => setError(e.message));
  }, []);
  if (error)
    return (
      <div className="empty-state">
        <p>{error}</p>
      </div>
    );
  if (!p) return <div className="page-skeleton">{t('profile.biodataLoading')}</div>;
  return (
    <div className="biodata-shell">
      <div className="biodata-toolbar">
        <Link to="/my-profile">
          <ArrowLeft /> {t('nav.myProfile')}
        </Link>
        <button onClick={() => window.print()}>
          <Printer /> {t('profile.print')}
        </button>
      </div>
      <article className="biodata">
        <p className="eyebrow">Matrimonial profile • {p.profileId}</p>
        <header>
          <div>
            <h1>
              {p.firstName} {p.lastName}
            </h1>
            <p>
              {p.location?.city}, {p.location?.state}
            </p>
          </div>
          {p.profilePhoto && <img src={assetUrl(p.profilePhoto)} alt="" />}
        </header>
        <div className="biodata-rule" />
        <dl>
          {[
            [t('public.finderAge'), `${p.age} ${t('profile.years')}`],
            [t('profile.height'), `${p.height} cm`],
            [t('profile.education'), p.education?.highestEducation],
            [t('profile.profession'), p.career?.occupation],
            [t('profile.location'), `${p.location?.city}, ${p.location?.state}`],
            [t('profile.family'), p.family?.familyDescription]
          ].map(([a, b]) => (
            <div key={a}>
              <dt>{a}</dt>
              <dd>{b || t('profile.notShared')}</dd>
            </div>
          ))}
        </dl>
        <section>
          <h2>{t('profile.about')}</h2>
          <p>{p.aboutMe || t('profile.notShared')}</p>
        </section>
        <footer>Kshatriya Matrimonial Society • {t('profile.privateBiodata')}</footer>
      </article>
    </div>
  );
}
