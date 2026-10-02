import { ArrowLeft, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, assetUrl } from '../services/api';
import { useTranslation } from 'react-i18next';
export default function BiodataPage() {
  const [p, setP] = useState(null),
    [error, setError] = useState(''),
    [includeSensitive, setIncludeSensitive] = useState(false), { t } = useTranslation();
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
        <label className="checkbox-label biodata-sensitive-toggle"><input type="checkbox" checked={includeSensitive} onChange={(event) => setIncludeSensitive(event.target.checked)} /> Include sensitive family details</label>
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
            [t('profile.family'), p.family?.familyDescription],
            ['Native place', p.paternalFamily?.nativePlace || p.location?.nativePlace],
            ['Clan / Gotra', p.paternalFamily?.clan || p.community?.clan]
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
        {includeSensitive && <section className="biodata-sensitive"><h2>Sensitive family context</h2><p><strong>Maternal family:</strong> {[p.maternalFamily?.maternalFamilySurname, p.maternalFamily?.maternalNativePlace || p.maternalFamily?.maternalVillage].filter(Boolean).join(' • ') || t('profile.notShared')}</p><p><strong>Siblings:</strong> {p.family?.siblingDetails?.map((s) => `${s.relation}${s.name ? ` — ${s.name}` : ''}${s.spouseNativePlace ? `, family connection in ${s.spouseNativePlace}` : ''}`).join('; ') || p.family?.siblings || t('profile.notShared')}</p><p><strong>Marital history:</strong> {p.maritalStatus || t('profile.notShared')}</p><p><strong>Family assets:</strong> {p.familyAssets?.propertySummary || t('profile.notShared')}</p></section>}
        <footer>Kshatriya Matrimonial Society • {t('profile.privateBiodata')}</footer>
      </article>
    </div>
  );
}
