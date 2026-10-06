import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Printer
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  api,
  assetUrl
} from '../services/api';

export default function BiodataPage() {
  const [profile, setProfile] =
    useState(null);

  const [error, setError] =
    useState('');

  const [
    includeSensitive,
    setIncludeSensitive
  ] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    api('/profiles/me')
      .then((response) =>
        setProfile(
          response.data.profile
        )
      )
      .catch((caught) =>
        setError(caught.message)
      );
  }, []);

  if (error) {
    return (
      <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
        <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
          {error}
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-skeleton">
        {t(
          'profile.biodataLoading'
        )}
      </div>
    );
  }

  const fields = [
    [
      t('public.finderAge'),
      `${profile.age} ${t(
        'profile.years'
      )}`
    ],
    [
      t('profile.height'),
      `${profile.height} cm`
    ],
    [
      t('profile.education'),
      profile.education
        ?.highestEducation
    ],
    [
      t('profile.profession'),
      profile.career?.occupation
    ],
    [
      t('profile.location'),
      `${profile.location?.city}, ${profile.location?.state}`
    ],
    [
      t('profile.family'),
      profile.family
        ?.familyDescription
    ],
    [
      'Native place',
      profile.paternalFamily
        ?.nativePlace ||
        profile.location?.nativePlace
    ],
    [
      'Clan / Gotra',
      profile.paternalFamily
        ?.clan ||
        profile.community?.clan
    ]
  ];

  return (
    <div className="min-h-screen bg-[#eee4d8] p-[30px] print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-[790px] justify-between print:hidden">
        <Link
          to="/my-profile"
          className="flex items-center gap-2 text-[11px] text-[#431318]"
        >
          <ArrowLeft className="w-4" />

          {t('nav.myProfile')}
        </Link>

        <label className="flex items-center gap-[0.65rem] text-[11px]">
          <input
            type="checkbox"
            className="w-auto"
            checked={includeSensitive}
            onChange={(event) =>
              setIncludeSensitive(
                event.target.checked
              )
            }
          />

          Include sensitive family details
        </label>

        <button
          className="flex items-center gap-2 text-[11px] text-[#431318]"
          onClick={() =>
            window.print()
          }
        >
          <Printer className="w-4" />

          {t('profile.print')}
        </button>
      </div>

      <article className="mx-auto max-w-[790px] bg-[#fffdf8] p-[65px] shadow-[0_15px_50px_#3b21141e] print:max-w-none print:shadow-none">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
          Matrimonial profile •{' '}
          {profile.profileId}
        </p>

        <header className="mt-[25px] flex items-center justify-between">
          <div>
            <h1 className="font-['Cormorant_Garamond'] text-[58px] font-medium text-[#681d25]">
              {profile.firstName}{' '}
              {profile.lastName}
            </h1>

            <p className="text-[#756a60]">
              {profile.location?.city},{' '}
              {profile.location?.state}
            </p>
          </div>

          {profile.profilePhoto && (
            <img
              src={assetUrl(
                profile.profilePhoto
              )}
              alt=""
              className="h-[190px] w-[150px] rounded-t-[75px] object-cover"
            />
          )}
        </header>

        <div className="my-[35px] h-px bg-[#ddd0c1]" />

        <dl className="grid grid-cols-2 gap-[25px]">
          {fields.map(
            ([label, value]) => (
              <div key={label}>
                <dt className="text-[8px] uppercase tracking-[0.15em] text-[#756a60]">
                  {label}
                </dt>

                <dd className="font-['Cormorant_Garamond'] text-[21px] font-medium">
                  {value ||
                    t(
                      'profile.notShared'
                    )}
                </dd>
              </div>
            )
          )}
        </dl>

        <section className="mt-[35px] border-t border-[#ddd0c1] pt-[30px]">
          <h2 className="font-['Cormorant_Garamond'] text-[30px] font-medium">
            {t('profile.about')}
          </h2>

          <p className="text-[13px] leading-[1.9] text-[#756a60]">
            {profile.aboutMe ||
              t('profile.notShared')}
          </p>
        </section>

        {includeSensitive && (
          <section className="mt-[35px] border-t border-[#ddd0c1] pt-[30px]">
            <h2 className="font-['Cormorant_Garamond'] text-[30px] font-medium">
              Sensitive family context
            </h2>

            <p className="text-[13px] leading-[1.9] text-[#756a60]">
              <strong>
                Maternal family:
              </strong>{' '}
              {[
                profile.maternalFamily
                  ?.maternalFamilySurname,
                profile.maternalFamily
                  ?.maternalNativePlace ||
                  profile.maternalFamily
                    ?.maternalVillage
              ]
                .filter(Boolean)
                .join(' • ') ||
                t(
                  'profile.notShared'
                )}
            </p>

            <p className="text-[13px] leading-[1.9] text-[#756a60]">
              <strong>
                Siblings:
              </strong>{' '}
              {profile.family
                ?.siblingDetails
                ?.map(
                  (sibling) =>
                    `${sibling.relation}${
                      sibling.name
                        ? ` — ${sibling.name}`
                        : ''
                    }${
                      sibling.spouseNativePlace
                        ? `, family connection in ${sibling.spouseNativePlace}`
                        : ''
                    }`
                )
                .join('; ') ||
                profile.family
                  ?.siblings ||
                t(
                  'profile.notShared'
                )}
            </p>

            <p className="text-[13px] leading-[1.9] text-[#756a60]">
              <strong>
                Marital history:
              </strong>{' '}
              {profile.maritalStatus ||
                t(
                  'profile.notShared'
                )}
            </p>

            <p className="text-[13px] leading-[1.9] text-[#756a60]">
              <strong>
                Family assets:
              </strong>{' '}
              {profile.familyAssets
                ?.propertySummary ||
                t(
                  'profile.notShared'
                )}
            </p>
          </section>
        )}

        <footer className="mt-[55px] text-center text-[8px] uppercase text-[#756a60]">
          Kshatriya Matrimonial
          Society •{' '}
          {t(
            'profile.privateBiodata'
          )}
        </footer>
      </article>
    </div>
  );
}