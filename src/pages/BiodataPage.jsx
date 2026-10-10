import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  ArrowLeft,
  LockKeyhole,
  Printer
} from 'lucide-react';

import {
  Link
} from 'react-router-dom';

import {
  api,
  assetUrl
} from '../services/api';

const notShared =
  'Not shared';

const labelClass =
  'text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#8a7768]';

const valueClass =
  "mt-1 font-['Cormorant_Garamond'] text-[19px] font-medium leading-[1.25] text-[#2b1b19]";

const sectionClass =
  'mt-8 border-t border-[#d9c9b8] pt-6 break-inside-avoid';

const sectionTitleClass =
  "font-['Cormorant_Garamond'] text-[28px] font-medium text-[#681d25]";

const smallTextClass =
  'text-[11px] leading-[1.8] text-[#6f6259]';

const toolbarButtonClass =
  'inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[99px] border border-[#cbb8a4] bg-[#fffdf8] px-4 text-[10px] font-extrabold text-[#431318] transition hover:border-[#681d25]';

const joinValues = (
  values,
  separator = ', '
) =>
  values
    .filter(
      (
        value
      ) =>
        value !==
          undefined &&
        value !==
          null &&
        value !==
          ''
    )
    .join(
      separator
    );

const formatDate = (
  value
) => {
  if (!value) {
    return '';
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      day:
        '2-digit',

      month:
        'long',

      year:
        'numeric'
    }
  ).format(
    date
  );
};

const formatIncome = (
  value
) => {
  const amount =
    Number(
      value
    );

  if (
    !Number.isFinite(
      amount
    ) ||
    amount <= 0
  ) {
    return '';
  }

  return new Intl.NumberFormat(
    'en-IN',
    {
      style:
        'currency',

      currency:
        'INR',

      maximumFractionDigits:
        0
    }
  ).format(
    amount
  );
};

function Field({
  label,
  value
}) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  return (
    <div className="break-inside-avoid">
      <dt
        className={
          labelClass
        }
      >
        {label}
      </dt>

      <dd
        className={
          valueClass
        }
      >
        {value}
      </dd>
    </div>
  );
}

function Section({
  title,
  children
}) {
  return (
    <section
      className={
        sectionClass
      }
    >
      <h2
        className={
          sectionTitleClass
        }
      >
        {title}
      </h2>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function MosalBlock({
  title,
  branch
}) {
  if (!branch) {
    return null;
  }

  const person =
    branch.mamaName ||
    branch.grandmotherName;

  const lineage =
    joinValues(
      [
        branch.familySurname,
        branch.clanSurname
      ],
      ' • '
    );

  const place =
    joinValues([
      branch.nativeVillage,
      branch.taluka,
      branch.district,
      branch.state
    ]);

  if (
    !person &&
    !lineage &&
    !place &&
    !branch.notes
  ) {
    return null;
  }

  return (
    <article className="border border-[#ded0c1] bg-[#fffdfa] p-4 break-inside-avoid">
      <h3 className="font-['Cormorant_Garamond'] text-[22px] font-medium text-[#431318]">
        {title}
      </h3>

      {person && (
        <p className="mt-2 text-[11px] font-bold text-[#2b1b19]">
          {person}
        </p>
      )}

      {lineage && (
        <p className="mt-1 text-[10px] text-[#6f6259]">
          {lineage}
        </p>
      )}

      {place && (
        <p className="mt-2 text-[10px] leading-5 text-[#6f6259]">
          {place}
        </p>
      )}

      {branch.notes && (
        <p className="mt-2 text-[9px] leading-5 text-[#8a7768]">
          {branch.notes}
        </p>
      )}
    </article>
  );
}

export default function BiodataPage() {
  const [
    profile,
    setProfile
  ] =
    useState(null);

  const [
    error,
    setError
  ] =
    useState('');

  const [
    includeSensitive,
    setIncludeSensitive
  ] =
    useState(
      false
    );

  const [
    includeAstrology,
    setIncludeAstrology
  ] =
    useState(
      true
    );

  const [
    includeContact,
    setIncludeContact
  ] =
    useState(
      false
    );

  const [
    includeAssets,
    setIncludeAssets
  ] =
    useState(
      false
    );

  useEffect(
    () => {
      let active =
        true;

      api(
        '/profiles/me'
      )
        .then(
          (
            response
          ) => {
            if (!active) {
              return;
            }

            const loaded =
              response.data
                .profile;

            setProfile(
              loaded
            );

            setIncludeSensitive(
              !!loaded
                .biodataPrivacy
                ?.includeSensitiveFamilyDetailsInBiodata
            );

            setIncludeAstrology(
              loaded
                .biodataPrivacy
                ?.includeAstrologyInBiodata ??
                true
            );

            setIncludeContact(
              !!loaded
                .biodataPrivacy
                ?.includeContactDetailsInBiodata
            );

            setIncludeAssets(
              !!loaded
                .biodataPrivacy
                ?.includeAssetsInBiodata
            );
          }
        )
        .catch(
          (
            caught
          ) => {
            if (
              active
            ) {
              setError(
                caught.message
              );
            }
          }
        );

      return () => {
        active =
          false;
      };
    },
    []
  );

  const derived =
    useMemo(
      () => {
        if (
          !profile
        ) {
          return {};
        }

        return {
          fullName:
            joinValues(
              [
                profile.firstName,
                profile.middleName,
                profile.lastName
              ],
              ' '
            ),

          location:
            joinValues([
              profile.location
                ?.city,
              profile.location
                ?.district,
              profile.location
                ?.state
            ]),

          vatan:
            joinValues([
              profile.location
                ?.nativePlace,
              profile.location
                ?.nativeTaluka,
              profile.location
                ?.nativeDistrict,
              profile.location
                ?.nativeState
            ]),

          birthPlace:
            joinValues([
              profile.birthDetails
                ?.city,
              profile.birthDetails
                ?.district,
              profile.birthDetails
                ?.state,
              profile.birthDetails
                ?.country
            ]),

          workLocation:
            joinValues([
              profile.career
                ?.workLocation
                ?.city,
              profile.career
                ?.workLocation
                ?.state,
              profile.career
                ?.workLocation
                ?.country
            ]),

          paternalPlace:
            joinValues([
              profile.paternalFamily
                ?.ancestralVillage ||
                profile.paternalFamily
                  ?.nativePlace,
              profile.paternalFamily
                ?.taluka,
              profile.paternalFamily
                ?.district,
              profile.paternalFamily
                ?.state
            ]),

          maternalPlace:
            joinValues([
              profile.maternalFamily
                ?.maternalVillage ||
                profile.maternalFamily
                  ?.maternalNativePlace,
              profile.maternalFamily
                ?.maternalTaluka,
              profile.maternalFamily
                ?.maternalDistrict,
              profile.maternalFamily
                ?.maternalState
            ]),

          currentAddress:
            joinValues([
              profile.contactDetails
                ?.currentAddress
                ?.addressLine1,
              profile.contactDetails
                ?.currentAddress
                ?.addressLine2,
              profile.contactDetails
                ?.currentAddress
                ?.city,
              profile.contactDetails
                ?.currentAddress
                ?.taluka,
              profile.contactDetails
                ?.currentAddress
                ?.district,
              profile.contactDetails
                ?.currentAddress
                ?.state,
              profile.contactDetails
                ?.currentAddress
                ?.pincode,
              profile.contactDetails
                ?.currentAddress
                ?.country
            ])
        };
      },
      [
        profile
      ]
    );

  if (
    error
  ) {
    return (
      <div className="min-h-screen bg-[#eee4d8] p-[30px]">
        <div className="mx-auto max-w-[790px] border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
          <h1 className="font-['Cormorant_Garamond'] text-[34px] font-medium text-[#431318]">
            Biodata unavailable
          </h1>

          <p className="mx-auto mt-3 max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (
    !profile
  ) {
    return (
      <div className="page-skeleton">
        Preparing biodata…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eee4d8] px-[20px] py-[30px] print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-[850px] flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/my-profile"
          className="inline-flex items-center gap-2 text-[11px] font-bold text-[#431318] no-underline"
        >
          <ArrowLeft
            size={
              16
            }
          />

          My Profile
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className={
              toolbarButtonClass
            }
            onClick={() =>
              window.print()
            }
          >
            <Printer
              size={
                15
              }
            />

            Print biodata
          </button>
        </div>
      </div>

      <div className="mx-auto mb-5 grid max-w-[850px] grid-cols-4 gap-2 print:hidden max-[850px]:grid-cols-2 max-[480px]:grid-cols-1">
        <label className="flex items-center gap-2 border border-[#d9c9b8] bg-[#fffdf8] px-3 py-3 text-[9px] font-bold text-[#5f5148]">
          <input
            type="checkbox"
            checked={
              includeSensitive
            }
            onChange={(
              event
            ) =>
              setIncludeSensitive(
                event.target
                  .checked
              )
            }
          />

          Family lineage
        </label>

        <label className="flex items-center gap-2 border border-[#d9c9b8] bg-[#fffdf8] px-3 py-3 text-[9px] font-bold text-[#5f5148]">
          <input
            type="checkbox"
            checked={
              includeAstrology
            }
            onChange={(
              event
            ) =>
              setIncludeAstrology(
                event.target
                  .checked
              )
            }
          />

          Astrology
        </label>

        <label className="flex items-center gap-2 border border-[#d9c9b8] bg-[#fffdf8] px-3 py-3 text-[9px] font-bold text-[#5f5148]">
          <input
            type="checkbox"
            checked={
              includeContact
            }
            onChange={(
              event
            ) =>
              setIncludeContact(
                event.target
                  .checked
              )
            }
          />

          Contact details
        </label>

        <label className="flex items-center gap-2 border border-[#d9c9b8] bg-[#fffdf8] px-3 py-3 text-[9px] font-bold text-[#5f5148]">
          <input
            type="checkbox"
            checked={
              includeAssets
            }
            onChange={(
              event
            ) =>
              setIncludeAssets(
                event.target
                  .checked
              )
            }
          />

          Family assets
        </label>
      </div>

      <article className="mx-auto max-w-[850px] bg-[#fffdf8] px-[60px] py-[55px] shadow-[0_15px_50px_#3b21141e] print:max-w-none print:px-[20mm] print:py-[15mm] print:shadow-none max-[700px]:px-[24px]">
        <header className="break-inside-avoid">
          <div className="flex items-start justify-between gap-8 max-[620px]:flex-col-reverse">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#aa7a42]">
                Marriage Bio-Data
              </p>

              <h1 className="mt-3 font-['Cormorant_Garamond'] text-[52px] font-medium leading-[0.95] text-[#681d25] max-[600px]:text-[42px]">
                {derived.fullName ||
                  profile.firstName}
              </h1>

              <p className="mt-4 text-[11px] leading-6 text-[#756a60]">
                {derived.location ||
                  notShared}
              </p>

              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#91867d]">
                Profile ID:{' '}
                {
                  profile.profileId
                }
              </p>
            </div>

            {profile.profilePhoto && (
              <img
                src={assetUrl(
                  profile.profilePhoto
                )}
                alt=""
                className="h-[190px] w-[145px] shrink-0 rounded-t-[72px] object-cover"
              />
            )}
          </div>

          <div className="mt-7 h-[2px] bg-[#681d25]" />
        </header>

        <Section
          title="Personal Details"
        >
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 max-[600px]:grid-cols-1">
            <Field
              label="Full Name"
              value={
                derived.fullName
              }
            />

            <Field
              label="Date of Birth"
              value={
                formatDate(
                  profile.dateOfBirth
                )
              }
            />

            <Field
              label="Age"
              value={
                profile.age
                  ? `${profile.age} years`
                  : ''
              }
            />

            <Field
              label="Time of Birth"
              value={
                profile.birthDetails
                  ?.timeOfBirth
              }
            />

            <Field
              label="Place of Birth"
              value={
                derived.birthPlace
              }
            />

            <Field
              label="Height"
              value={
                profile.height
                  ? `${profile.height} cm`
                  : ''
              }
            />

            <Field
              label="Blood Group"
              value={
                profile.bloodGroup
              }
            />

            <Field
              label="Complexion"
              value={
                profile.complexion
              }
            />

            <Field
              label="Marital Status"
              value={
                profile.maritalStatus
              }
            />

            <Field
              label="Diet"
              value={
                profile.lifestyle
                  ?.diet
              }
            />
          </dl>
        </Section>

        <Section
          title="Rajput Heritage"
        >
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 max-[600px]:grid-cols-1">
            <Field
              label="Religion"
              value={
                profile.community
                  ?.religion
              }
            />

            <Field
              label="Caste"
              value={
                profile.community
                  ?.caste
              }
            />

            <Field
              label="Community"
              value={
                profile.community
                  ?.name
              }
            />

            <Field
              label="Sub-Community"
              value={
                profile.community
                  ?.subCommunity
              }
            />

            <Field
              label="Clan / Shakh"
              value={
                profile.community
                  ?.clan
              }
            />

            <Field
              label="Gotra"
              value={
                profile.community
                  ?.gotra
              }
            />

            <Field
              label="Vansh"
              value={
                profile.community
                  ?.vansh
              }
            />

            <Field
              label="Kula Devi"
              value={
                profile.community
                  ?.kulaDevi
              }
            />

            <Field
              label="Ishta Devta"
              value={
                profile.community
                  ?.ishtaDevta
              }
            />

            <Field
              label="Vatan / Native Place"
              value={
                derived.vatan
              }
            />
          </dl>

          {profile.community
            ?.familyOrigin && (
            <p className={`${smallTextClass} mt-5`}>
              <strong className="text-[#431318]">
                Family origin:
              </strong>{' '}
              {
                profile.community
                  .familyOrigin
              }
            </p>
          )}
        </Section>

        <Section
          title="Education & Career"
        >
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 max-[600px]:grid-cols-1">
            <Field
              label="Highest Qualification"
              value={
                profile.education
                  ?.highestEducation
              }
            />

            <Field
              label="Degree"
              value={
                profile.education
                  ?.degree
              }
            />

            <Field
              label="Specialization"
              value={
                profile.education
                  ?.specialization
              }
            />

            <Field
              label="College"
              value={
                profile.education
                  ?.college
              }
            />

            <Field
              label="University"
              value={
                profile.education
                  ?.university
              }
            />

            <Field
              label="Occupation"
              value={
                profile.career
                  ?.occupation
              }
            />

            <Field
              label="Designation"
              value={
                profile.career
                  ?.designation
              }
            />

            <Field
              label="Organization / Business"
              value={
                profile.career
                  ?.companyName ||
                profile.career
                  ?.businessName
              }
            />

            <Field
              label="Job / Business Location"
              value={
                derived.workLocation
              }
            />

            <Field
              label="Annual Income"
              value={
                formatIncome(
                  profile.career
                    ?.annualIncome
                )
              }
            />
          </dl>

          {profile.education
            ?.educationDetails && (
            <p className={`${smallTextClass} mt-5`}>
              {
                profile.education
                  .educationDetails
              }
            </p>
          )}
        </Section>

        {profile.family && (
          <Section
            title="Immediate Family"
          >
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 max-[600px]:grid-cols-1">
              <Field
                label="Father"
                value={
                  joinValues(
                    [
                      profile.family
                        .fatherName,
                      profile.family
                        .fatherOccupation
                    ],
                    ' — '
                  )
                }
              />

              <Field
                label="Mother"
                value={
                  joinValues(
                    [
                      profile.family
                        .motherName,
                      profile.family
                        .motherOccupation
                    ],
                    ' — '
                  )
                }
              />

              <Field
                label="Family Type"
                value={
                  profile.family
                    .familyType
                }
              />

              <Field
                label="Family Location"
                value={
                  profile.family
                    .familyLocation
                }
              />
            </dl>

            {profile.family
              .familyDescription && (
              <p className={`${smallTextClass} mt-5`}>
                {
                  profile.family
                    .familyDescription
                }
              </p>
            )}
          </Section>
        )}

        {includeSensitive &&
          profile.paternalFamily && (
            <Section
              title="Paternal Lineage"
            >
              <dl className="grid grid-cols-2 gap-x-8 gap-y-5 max-[600px]:grid-cols-1">
                <Field
                  label="Family Surname"
                  value={
                    profile
                      .paternalFamily
                      .familySurname
                  }
                />

                <Field
                  label="Clan"
                  value={
                    profile
                      .paternalFamily
                      .clan
                  }
                />

                <Field
                  label="Gotra"
                  value={
                    profile
                      .paternalFamily
                      .gotra
                  }
                />

                <Field
                  label="Ancestral / Native Place"
                  value={
                    derived.paternalPlace
                  }
                />
              </dl>

              {profile
                .paternalFamily
                .notes && (
                <p className={`${smallTextClass} mt-5`}>
                  {
                    profile
                      .paternalFamily
                      .notes
                  }
                </p>
              )}
            </Section>
          )}

        {includeSensitive &&
          profile.maternalFamily && (
            <Section
              title="Maternal Family"
            >
              <dl className="grid grid-cols-2 gap-x-8 gap-y-5 max-[600px]:grid-cols-1">
                <Field
                  label="Maternal Grandfather"
                  value={
                    profile
                      .maternalFamily
                      .maternalGrandfatherName
                  }
                />

                <Field
                  label="Family Surname"
                  value={
                    profile
                      .maternalFamily
                      .maternalFamilySurname
                  }
                />

                <Field
                  label="Clan"
                  value={
                    profile
                      .maternalFamily
                      .maternalClan
                  }
                />

                <Field
                  label="Mosal / Native Place"
                  value={
                    derived.maternalPlace
                  }
                />
              </dl>
            </Section>
          )}

        {includeSensitive &&
          profile.maternalLineage && (
            <Section
              title="Three-Generation Mosal"
            >
              <div className="grid grid-cols-3 gap-3 max-[700px]:grid-cols-1">
                <MosalBlock
                  title="Self Mosal"
                  branch={
                    profile
                      .maternalLineage
                      .selfMosal
                  }
                />

                <MosalBlock
                  title="Father's Mosal"
                  branch={
                    profile
                      .maternalLineage
                      .fathersMosal
                  }
                />

                <MosalBlock
                  title="Mother's Mosal"
                  branch={
                    profile
                      .maternalLineage
                      .mothersMosal
                  }
                />
              </div>
            </Section>
          )}

        {includeSensitive &&
          profile.family
            ?.siblingDetails
            ?.length >
            0 && (
            <Section
              title="Siblings & Marriage Relations"
            >
              <div className="grid gap-4">
                {profile.family.siblingDetails.map(
                  (
                    sibling,
                    index
                  ) => {
                    const spouseFamily =
                      joinValues(
                        [
                          sibling.spouseClan,
                          sibling.spouseFamilySurname
                        ],
                        ' • '
                      );

                    const sasariyu =
                      joinValues([
                        sibling.spouseVillage ||
                          sibling.spouseNativePlace,
                        sibling.spouseTaluka,
                        sibling.spouseDistrict,
                        sibling.spouseState
                      ]);

                    return (
                      <article
                        key={`${sibling.relation || 'sibling'}-${index}`}
                        className="border border-[#ded0c1] p-4 break-inside-avoid"
                      >
                        <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                          <Field
                            label={
                              sibling.relation ||
                              'Sibling'
                            }
                            value={
                              sibling.name
                            }
                          />

                          <Field
                            label="Marital Status"
                            value={
                              sibling.maritalStatus
                            }
                          />

                          <Field
                            label="Education"
                            value={
                              sibling.education
                            }
                          />

                          <Field
                            label="Occupation"
                            value={
                              sibling.occupation
                            }
                          />

                          {sibling.maritalStatus ===
                            'Married' && (
                            <>
                              <Field
                                label="Spouse"
                                value={
                                  sibling.spouseName
                                }
                              />

                              <Field
                                label="Spouse Family"
                                value={
                                  spouseFamily
                                }
                              />

                              <Field
                                label="Sasariyu"
                                value={
                                  sasariyu
                                }
                              />
                            </>
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </Section>
          )}

        {includeSensitive &&
          profile.maritalHistory &&
          profile.maritalStatus !==
            'Never Married' && (
            <Section
              title="Marital History"
            >
              <div className="flex items-start gap-3 border border-[#c9aeb0] bg-[#681d2507] p-4">
                <LockKeyhole
                  size={
                    16
                  }
                  className="mt-1 shrink-0 text-[#681d25]"
                />

                <div className="grid flex-1 grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                  <Field
                    label="Status"
                    value={
                      profile
                        .maritalHistory
                        .status ||
                      profile.maritalStatus
                    }
                  />

                  <Field
                    label="Previous Marriage Ended"
                    value={
                      formatDate(
                        profile
                          .maritalHistory
                          .previousMarriageEndedAt
                      )
                    }
                  />

                  <Field
                    label="Children"
                    value={
                      profile
                        .maritalHistory
                        .childrenFromPreviousMarriage
                        ? `${profile.maritalHistory.childrenCount || 0} child/children`
                        : 'No children shared'
                    }
                  />

                  <Field
                    label="Children Living With"
                    value={
                      profile
                        .maritalHistory
                        .childrenLivingWith
                    }
                  />
                </div>
              </div>
            </Section>
          )}

        {includeAstrology &&
          profile.astrology && (
            <Section
              title="Astrology"
            >
              <dl className="grid grid-cols-3 gap-x-8 gap-y-5 max-[600px]:grid-cols-1">
                <Field
                  label="Rashi"
                  value={
                    profile.astrology
                      .rashi
                  }
                />

                <Field
                  label="Nakshatra"
                  value={
                    profile.astrology
                      .nakshatra
                  }
                />

                <Field
                  label="Manglik"
                  value={
                    profile.astrology
                      .manglik
                  }
                />
              </dl>
            </Section>
          )}

        {includeAssets &&
          profile.familyAssets && (
            <Section
              title="Family Assets"
            >
              <dl className="grid grid-cols-2 gap-x-8 gap-y-5 max-[600px]:grid-cols-1">
                <Field
                  label="Primary Residence"
                  value={
                    profile
                      .familyAssets
                      .primaryResidenceType
                  }
                />

                {profile.familyAssets
                  .agricultureLand
                  ?.hasLand && (
                  <Field
                    label="Agricultural Land"
                    value={
                      joinValues(
                        [
                          profile
                            .familyAssets
                            .agricultureLand
                            .approximateArea,
                          profile
                            .familyAssets
                            .agricultureLand
                            .unit
                        ],
                        ' '
                      )
                    }
                  />
                )}

                <Field
                  label="Property Summary"
                  value={
                    profile
                      .familyAssets
                      .propertySummary
                  }
                />

                <Field
                  label="Business Assets"
                  value={
                    profile
                      .familyAssets
                      .businessAssetsSummary
                  }
                />
              </dl>
            </Section>
          )}

        <Section
          title="About"
        >
          <p
            className={
              smallTextClass
            }
          >
            {profile.aboutMe ||
              notShared}
          </p>

          {profile.lifestyle
            ?.interests
            ?.length >
            0 && (
            <p className={`${smallTextClass} mt-3`}>
              <strong className="text-[#431318]">
                Interests:
              </strong>{' '}
              {profile.lifestyle.interests.join(
                ', '
              )}
            </p>
          )}
        </Section>

        {includeContact && (
          <Section
            title="Contact Details"
          >
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 max-[600px]:grid-cols-1">
              <Field
                label="Current Address"
                value={
                  derived.currentAddress
                }
              />

              <Field
                label="Primary Guardian"
                value={
                  joinValues(
                    [
                      profile.contactDetails
                        ?.guardianName,
                      profile.contactDetails
                        ?.guardianRelation
                    ],
                    ' — '
                  )
                }
              />

              <Field
                label="Guardian Contact"
                value={
                  profile.contactDetails
                    ?.guardianPhone
                }
              />

              <Field
                label="Self Contact"
                value={
                  profile.contactDetails
                    ?.selfPhone
                }
              />

              <Field
                label="Email"
                value={
                  profile.contactDetails
                    ?.email
                }
              />
            </dl>
          </Section>
        )}

        <footer className="mt-12 break-inside-avoid border-t border-[#681d25] pt-5 text-center">
          <p className="font-['Cormorant_Garamond'] text-[18px] font-medium text-[#681d25]">
            Kshatriya Matrimonial Society
          </p>

          <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.18em] text-[#8a7768]">
            Private matrimonial biodata • Profile{' '}
            {
              profile.profileId
            }
          </p>

          <p className="mx-auto mt-3 max-w-[560px] text-[7px] leading-4 text-[#a09287]">
            This biodata is generated by the profile owner for matrimonial purposes. Sensitive family, contact and asset information should be shared only with trusted families.
          </p>
        </footer>
      </article>
    </div>
  );
}