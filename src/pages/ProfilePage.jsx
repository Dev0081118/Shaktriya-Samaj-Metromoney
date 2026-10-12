import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  BadgeCheck,
  Bookmark,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck
} from 'lucide-react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import FamilyAssetsDisplay from '../components/FamilyAssetsDisplay';

import {
  useToast
} from '../context/ToastContext';

import {
  api,
  assetUrl
} from '../services/api';

const primaryButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-55';

const outlineButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-55';

const iconButtonClass =
  'grid h-11 w-11 place-items-center rounded-full border border-[#ddd0c1] text-[#756a60] transition hover:border-[#681d25] hover:text-[#681d25]';

const eyebrowClass =
  'text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]';

const sectionClass =
  'border-b border-[#ddd0c1] py-10';

const sectionGridClass =
  'grid grid-cols-[185px_minmax(0,1fr)] gap-[35px] max-[767px]:grid-cols-1 max-[767px]:gap-4';

const sectionTitleClass =
  "font-['Cormorant_Garamond'] text-[32px] font-medium text-[#291a17]";

const bodyClass =
  'text-[13px] leading-[1.9] text-[#756a60]';

const cardClass =
  'border border-[#ddd0c1] bg-[#fffdf8] p-5';

const labelClass =
  'text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#91867d]';

const valueClass =
  "mt-1 break-words font-['Cormorant_Garamond'] text-[20px] font-medium leading-[1.25] text-[#291a17]";

const joinValues =
  (
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

const formatDate =
  (
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
          'short',

        year:
          'numeric'
      }
    ).format(
      date
    );
  };

const formatIncome =
  (
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
      amount <=
        0
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

const whatsappUrl =
  (
    value
  ) => {
    if (!value) {
      return '';
    }

    const digits =
      String(
        value
      ).replace(
        /\D/g,
        ''
      );

    return digits
      ? `https://wa.me/${digits}`
      : '';
  };

function Detail({
  label,
  value
}) {
  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ''
  ) {
    return null;
  }

  return (
    <div
      className={
        cardClass
      }
    >
      <p
        className={
          labelClass
        }
      >
        {label}
      </p>

      <p
        className={
          valueClass
        }
      >
        {value}
      </p>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children
}) {
  return (
    <section
      className={
        sectionClass
      }
    >
      <div
        className={
          sectionGridClass
        }
      >
        <div>
          <p
            className={
              eyebrowClass
            }
          >
            {eyebrow}
          </p>
        </div>

        <div>
          <h2
            className={
              sectionTitleClass
            }
          >
            {title}
          </h2>

          <div className="mt-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function MosalCard({
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

  const location =
    joinValues([
      branch.nativeVillage,
      branch.taluka,
      branch.district,
      branch.state
    ]);

  if (
    !person &&
    !lineage &&
    !location &&
    !branch.notes
  ) {
    return null;
  }

  return (
    <article
      className={
        cardClass
      }
    >
      <p
        className={
          labelClass
        }
      >
        {title}
      </p>

      {person && (
        <p className="mt-3 text-[12px] font-bold text-[#291a17]">
          {person}
        </p>
      )}

      {lineage && (
        <p className="mt-1 text-[11px] text-[#756a60]">
          {lineage}
        </p>
      )}

      {location && (
        <p className="mt-2 text-[11px] leading-5 text-[#756a60]">
          {location}
        </p>
      )}

      {branch.notes && (
        <p className="mt-3 text-[10px] leading-5 text-[#91867d]">
          {branch.notes}
        </p>
      )}
    </article>
  );
}

export default function ProfilePage({
  own = false
}) {
  const {
    profileId
  } =
    useParams();

  const navigate =
    useNavigate();

  const notify =
    useToast();

  const [
    data,
    setData
  ] =
    useState(
      null
    );

  const [
    error,
    setError
  ] =
    useState('');

  const [
    busyAction,
    setBusyAction
  ] =
    useState('');

  const [
    reporting,
    setReporting
  ] =
    useState(
      false
    );

  const [
    reportReason,
    setReportReason
  ] =
    useState(
      'Fake Profile'
    );

  const endpoint =
    own
      ? '/profiles/me'
      : `/profiles/${profileId}`;

  const load =
    useCallback(
      async () => {
        setError('');

        try {
          const result =
            await api(
              endpoint
            );

          setData(
            result.data
          );
        } catch (
          caught
        ) {
          setError(
            caught.message
          );
        }
      },
      [
        endpoint
      ]
    );

  useEffect(
    () => {
      let active =
        true;

      api(
        endpoint
      )
        .then(
          (
            result
          ) => {
            if (
              active
            ) {
              setData(
                result.data
              );

              setError('');
            }
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
    [
      endpoint
    ]
  );

  const action =
    async (
      name
    ) => {
      const targetId =
        data
          ?.profile
          ?._id;

      if (
        !targetId
      ) {
        return;
      }

      setBusyAction(
        name
      );

      try {
        if (
          name ===
          'interest'
        ) {
          await api(
            '/interests',
            {
              method:
                'POST',

              body:
                JSON.stringify({
                  receiverProfile:
                    targetId
                })
            }
          );
        }

        if (
          name ===
          'shortlist'
        ) {
          await api(
            '/shortlist',
            {
              method:
                'POST',

              body:
                JSON.stringify({
                  profileId:
                    targetId
                })
            }
          );
        }

        if (
          name ===
          'contact'
        ) {
          await api(
            '/contact-requests',
            {
              method:
                'POST',

              body:
                JSON.stringify({
                  receiverProfile:
                    targetId
                })
            }
          );
        }

        if (
          name ===
          'unlock'
        ) {
          const requestId =
            data
              ?.actionState
              ?.contactRequest
              ?.id;

          if (
            requestId
          ) {
            await api(
              `/contact-requests/${requestId}/unlock`,
              {
                method:
                  'POST'
              }
            );
          }
        }

        if (
          name ===
          'block'
        ) {
          await api(
            '/blocks',
            {
              method:
                'POST',

              body:
                JSON.stringify({
                  profileId:
                    targetId
                })
            }
          );

          notify(
            'Profile blocked.'
          );

          navigate(
            '/discover'
          );

          return;
        }

        await load();

        notify(
          {
            interest:
              'Interest sent.',

            shortlist:
              'Profile shortlisted.',

            contact:
              'Contact request sent.',

            unlock:
              'Contact details unlocked.'
          }[
            name
          ] ||
            'Profile updated.'
        );
      } catch (
        caught
      ) {
        notify(
          caught.message,
          'error'
        );
      } finally {
        setBusyAction('');
      }
    };

  const respond =
    async (
      response
    ) => {
      const request =
        data
          ?.actionState
          ?.contactRequest;

      if (
        !request?.id
      ) {
        return;
      }

      setBusyAction(
        response
      );

      try {
        await api(
          `/contact-requests/${request.id}/${response}`,
          {
            method:
              'PATCH'
          }
        );

        await load();

        notify(
          response ===
          'accept'
            ? 'Contact request accepted.'
            : 'Contact request declined.'
        );
      } catch (
        caught
      ) {
        notify(
          caught.message,
          'error'
        );
      } finally {
        setBusyAction('');
      }
    };

  const report =
    async (
      event
    ) => {
      event.preventDefault();

      const description =
        event
          .currentTarget
          .elements
          .description
          .value
          .trim();

      if (
        !description
      ) {
        notify(
          'Please describe the issue.',
          'error'
        );

        return;
      }

      setBusyAction(
        'report'
      );

      try {
        await api(
          '/reports',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                reportedProfile:
                  data.profile
                    ._id,

                reason:
                  reportReason,

                description
              })
          }
        );

        setReporting(
          false
        );

        notify(
          'Report submitted for review.'
        );
      } catch (
        caught
      ) {
        notify(
          caught.message,
          'error'
        );
      } finally {
        setBusyAction('');
      }
    };

  if (
    error
  ) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
        <h2 className="font-['Cormorant_Garamond'] text-[34px] font-medium">
          Profile unavailable
        </h2>

        <p className="mt-3 max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
          {error}
        </p>

        <button
          type="button"
          className={`${outlineButtonClass} mt-5`}
          onClick={
            load
          }
        >
          Try again
        </button>
      </div>
    );
  }

  if (
    !data
  ) {
    return (
      <div className="page-skeleton">
        Loading profile…
      </div>
    );
  }

  const profile =
    data.profile;

  const request =
    data
      .actionState
      ?.contactRequest;

  const location =
    joinValues([
      profile.location
        ?.city,

      profile.location
        ?.state
    ]);

  const vatan =
    joinValues([
      profile.location
        ?.nativePlace,

      profile.location
        ?.nativeTaluka,

      profile.location
        ?.nativeDistrict,

      profile.location
        ?.nativeState
    ]);

  const birthPlace =
    joinValues([
      profile.birthDetails
        ?.city,

      profile.birthDetails
        ?.district,

      profile.birthDetails
        ?.state
    ]);

  const workLocation =
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
    ]);

  const paternalPlace =
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
    ]);

  const maternalPlace =
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
    ]);

  const currentAddress =
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
        ?.pincode
    ]);

  const fullName =
    joinValues(
      [
        profile.firstName,
        profile.middleName,
        profile.lastName
      ],
      ' '
    );

  const unlockedPhone =
    profile.contact
      ?.phone ||
    profile.contactDetails
      ?.selfPhone;

  const unlockedWhatsApp =
    profile.contact
      ?.whatsappPhone ||
    unlockedPhone;

  const unlockedWhatsAppUrl =
    whatsappUrl(
      unlockedWhatsApp
    );

  return (
    <article className="mx-auto max-w-[1120px]">
      <div className="grid grid-cols-[350px_minmax(0,1fr)] items-center gap-[55px] max-[850px]:grid-cols-1 max-[850px]:gap-8">
        {profile.profilePhoto ? (
          <img
            src={
              assetUrl(
                profile.profilePhoto
              )
            }
            alt={`${profile.firstName}'s profile`}
            className="h-[500px] w-full rounded-t-[175px] object-cover max-[850px]:mx-auto max-[850px]:h-[460px] max-[850px]:max-w-[390px]"
          />
        ) : (
          <div className="grid h-[500px] w-full place-items-center rounded-t-[175px] bg-[#e8dace] font-['Cormorant_Garamond'] text-[84px] text-[#681d25] max-[850px]:mx-auto max-[850px]:h-[460px] max-[850px]:max-w-[390px]">
            {profile
              .firstName?.[0] ||
              '?'}
          </div>
        )}

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p
              className={
                eyebrowClass
              }
            >
              {profile.profileId}
            </p>

            {profile
              .verification
              ?.adminVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#76946f] px-3 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#45643f]">
                <ShieldCheck
                  size={
                    13
                  }
                />

                Verified
              </span>
            )}
          </div>

          <h1 className="mt-3 flex flex-wrap items-center gap-3 font-['Cormorant_Garamond'] text-[clamp(52px,7vw,78px)] font-medium leading-[0.95] text-[#291a17]">
            {fullName}

            {profile
              .verification
              ?.adminVerified && (
              <BadgeCheck
                size={
                  28
                }
                className="text-[#681d25]"
              />
            )}
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2 text-[12px] text-[#756a60]">
            {profile.age && (
              <span>
                {profile.age}{' '}
                years
              </span>
            )}

            {profile.height && (
              <>
                <span>
                  •
                </span>

                <span>
                  {profile.height}{' '}
                  cm
                </span>
              </>
            )}

            {profile.maritalStatus && (
              <>
                <span>
                  •
                </span>

                <span>
                  {
                    profile.maritalStatus
                  }
                </span>
              </>
            )}
          </div>

          {location && (
            <p className="mt-3 flex items-center gap-2 text-[12px] text-[#756a60]">
              <MapPin
                size={
                  15
                }
              />

              {location}
            </p>
          )}

          <p className="mt-4 text-[13px] leading-7 text-[#756a60]">
            {joinValues(
              [
                profile.education
                  ?.highestEducation,

                profile.career
                  ?.occupation
              ],
              ' • '
            ) ||
              'Education and profession not shared'}
          </p>

          {profile.community
            ?.clan && (
            <p className="mt-2 text-[11px] font-bold text-[#681d25]">
              {joinValues(
                [
                  profile.community
                    ?.clan,

                  profile.community
                    ?.gotra,

                  profile.location
                    ?.nativePlace
                ],
                ' • '
              )}
            </p>
          )}

          {data.compatibility && (
            <div className="mt-6 max-w-[500px] border border-[#c49b70] bg-[#c49b7010] px-4 py-3">
              <strong className="text-[12px] text-[#681d25]">
                {
                  data.compatibility
                    .score
                }
                % preference match
              </strong>

              {data.compatibility
                .matchedFactors
                ?.length >
                0 && (
                <p className="mt-1 text-[10px] leading-5 text-[#756a60]">
                  Shared preferences:{' '}
                  {data.compatibility
                    .matchedFactors
                    .slice(
                      0,
                      4
                    )
                    .join(
                      ', '
                    )
                    .toLowerCase()}
                </p>
              )}
            </div>
          )}

          {!own && (
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                className={
                  primaryButtonClass
                }
                disabled={
                  busyAction ===
                  'interest' ||
                  data.actionState
                    ?.interestSent
                }
                onClick={() =>
                  action(
                    'interest'
                  )
                }
              >
                <Heart
                  size={
                    16
                  }
                />

                {data.actionState
                  ?.interestSent
                  ? 'Interest sent'
                  : 'Send interest'}
              </button>

              <button
                type="button"
                className={
                  outlineButtonClass
                }
                disabled={
                  busyAction ===
                  'shortlist' ||
                  data.actionState
                    ?.shortlisted
                }
                onClick={() =>
                  action(
                    'shortlist'
                  )
                }
              >
                <Bookmark
                  size={
                    16
                  }
                />

                {data.actionState
                  ?.shortlisted
                  ? 'Shortlisted'
                  : 'Shortlist'}
              </button>

              {!request && (
                <button
                  type="button"
                  className={
                    outlineButtonClass
                  }
                  disabled={
                    busyAction ===
                    'contact'
                  }
                  onClick={() =>
                    action(
                      'contact'
                    )
                  }
                >
                  <Phone
                    size={
                      16
                    }
                  />

                  Request contact
                </button>
              )}

              {request?.incoming &&
                request.status ===
                  'Pending' && (
                  <>
                    <button
                      type="button"
                      className={
                        primaryButtonClass
                      }
                      disabled={
                        !!busyAction
                      }
                      onClick={() =>
                        respond(
                          'accept'
                        )
                      }
                    >
                      Accept contact
                    </button>

                    <button
                      type="button"
                      className={
                        outlineButtonClass
                      }
                      disabled={
                        !!busyAction
                      }
                      onClick={() =>
                        respond(
                          'decline'
                        )
                      }
                    >
                      Decline
                    </button>
                  </>
                )}

              {request?.status ===
                'Accepted' &&
                !request.unlocked && (
                <button
                  type="button"
                  className={
                    primaryButtonClass
                  }
                  disabled={
                    busyAction ===
                    'unlock'
                  }
                  onClick={() =>
                    action(
                      'unlock'
                    )
                  }
                >
                  Unlock contact
                </button>
              )}

              <button
                type="button"
                className={
                  iconButtonClass
                }
                aria-label="Report profile"
                onClick={() =>
                  setReporting(
                    true
                  )
                }
              >
                <Flag
                  size={
                    16
                  }
                />
              </button>
            </div>
          )}

          {unlockedPhone && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={`tel:${unlockedPhone}`}
                className={
                  outlineButtonClass
                }
              >
                <Phone
                  size={
                    15
                  }
                />

                {unlockedPhone}
              </a>

              {unlockedWhatsAppUrl && (
                <a
                  href={
                    unlockedWhatsAppUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className={
                    outlineButtonClass
                  }
                >
                  <MessageCircle
                    size={
                      15
                    }
                  />

                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-[70px] border-t border-[#ddd0c1]">
        <Section
          eyebrow="Introduction"
          title={`About ${profile.firstName}`}
        >
          <p
            className={
              bodyClass
            }
          >
            {profile.aboutMe ||
              'Not shared'}
          </p>
        </Section>

        <Section
          eyebrow="Personal"
          title="Personal details"
        >
          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            <Detail
              label="Age"
              value={
                profile.age
                  ? `${profile.age} years`
                  : ''
              }
            />

            {own &&
              profile.dateOfBirth && (
              <Detail
                label="Date of birth"
                value={
                  formatDate(
                    profile.dateOfBirth
                  )
                }
              />
            )}

            <Detail
              label="Height"
              value={
                profile.height
                  ? `${profile.height} cm`
                  : ''
              }
            />

            <Detail
              label="Blood group"
              value={
                profile.bloodGroup
              }
            />

            <Detail
              label="Marital status"
              value={
                profile.maritalStatus
              }
            />

            <Detail
              label="Profile created for"
              value={
                profile.profileFor
              }
            />
          </div>
        </Section>

        {(profile.birthDetails ||
          profile.astrology) && (
          <Section
            eyebrow="Traditional details"
            title="Birth & horoscope"
          >
            <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
              <Detail
                label="Time of birth"
                value={
                  profile.birthDetails
                    ?.timeOfBirth
                }
              />

              <Detail
                label="Place of birth"
                value={
                  birthPlace
                }
              />

              <Detail
                label="Rashi"
                value={
                  profile.astrology
                    ?.rashi
                }
              />

              <Detail
                label="Nakshatra"
                value={
                  profile.astrology
                    ?.nakshatra
                }
              />

              <Detail
                label="Manglik"
                value={
                  profile.astrology
                    ?.manglik
                }
              />
            </div>
          </Section>
        )}

        <Section
          eyebrow="Samaj & heritage"
          title="Rajput lineage"
        >
          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            <Detail
              label="Surname"
              value={
                profile.community
                  ?.clan
              }
            />

            <Detail
              label="Gotra"
              value={
                profile.community
                  ?.gotra
              }
            />

            <Detail
              label="Kul / Vansh"
              value={
                profile.community
                  ?.vansh
              }
            />

            <Detail
              label="Kuldevi"
              value={
                profile.community
                  ?.kulaDevi
              }
            />

            <Detail
              label="Vatan / Native place"
              value={
                vatan
              }
            />
          </div>
        </Section>

        <Section
          eyebrow="Education & career"
          title="Studies and profession"
        >
          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            <Detail
              label="Highest qualification"
              value={
                profile.education
                  ?.highestEducation
              }
            />

            <Detail
              label="Degree"
              value={
                profile.education
                  ?.degree
              }
            />

            <Detail
              label="Specialization"
              value={
                profile.education
                  ?.specialization
              }
            />

            <Detail
              label="College"
              value={
                profile.education
                  ?.college
              }
            />

            <Detail
              label="University"
              value={
                profile.education
                  ?.university
              }
            />

            <Detail
              label="Employment type"
              value={
                profile.career
                  ?.occupationType
              }
            />

            <Detail
              label="Profession / Occupation"
              value={
                profile.career
                  ?.occupation
              }
            />

            <Detail
              label="Designation"
              value={
                profile.career
                  ?.designation
              }
            />

            <Detail
              label="Company / Organization"
              value={
                profile.career
                  ?.companyName
              }
            />

            <Detail
              label="Business name"
              value={
                profile.career
                  ?.businessName
              }
            />

            <Detail
              label="Work location"
              value={
                workLocation
              }
            />

            <Detail
              label="Annual income"
              value={
                formatIncome(
                  profile.career
                    ?.annualIncome
                )
              }
            />
          </div>

          {profile.education
            ?.educationDetails && (
            <p className={`${bodyClass} mt-5`}>
              {
                profile.education
                  .educationDetails
              }
            </p>
          )}
        </Section>

        {profile.family && (
          <Section
            eyebrow="Family"
            title="Family details"
          >
            <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
              <Detail
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

              <Detail
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

              <Detail
                label="Family type"
                value={
                  profile.family
                    .familyType
                }
              />

              <Detail
                label="Family values"
                value={
                  profile.family
                    .familyValues
                }
              />
            </div>

            {profile.family
              .familyDescription && (
              <p className={`${bodyClass} mt-5`}>
                {
                  profile.family
                    .familyDescription
                }
              </p>
            )}
          </Section>
        )}

        {profile.paternalFamily && (
          <Section
            eyebrow="Paternal lineage"
            title="Paternal family"
          >
            <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
              <Detail
                label="Family surname"
                value={
                  profile
                    .paternalFamily
                    .familySurname
                }
              />

              <Detail
                label="Shakh"
                value={
                  profile
                    .paternalFamily
                    .clan
                }
              />

              <Detail
                label="Gotra"
                value={
                  profile
                    .paternalFamily
                    .gotra
                }
              />

              <Detail
                label="Ancestral / Native place"
                value={
                  paternalPlace
                }
              />
            </div>
          </Section>
        )}

        {profile.maternalFamily && (
          <Section
            eyebrow="Maternal lineage"
            title="Mosal details"
          >
            <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
              <Detail
                label="Maternal grandfather"
                value={
                  profile
                    .maternalFamily
                    .maternalGrandfatherName
                }
              />

              <Detail
                label="Maternal Shakh"
                value={
                  profile
                    .maternalFamily
                    .maternalClan
                }
              />

              <Detail
                label="Maternal native place"
                value={
                  maternalPlace
                }
              />
            </div>
          </Section>
        )}

        {profile.maternalLineage && (
          <Section
            eyebrow="Extended lineage"
            title="Extended Mosal"
          >
            <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
              <MosalCard
                title="Father's Mosal"
                branch={
                  profile
                    .maternalLineage
                    .fathersMosal
                }
              />

              <MosalCard
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

        {profile.family
          ?.siblingDetails
          ?.length >
          0 && (
          <Section
            eyebrow="Relations"
            title="Siblings & marriage relations"
          >
            <div className="grid gap-4">
              {profile.family.siblingDetails.map(
                (
                  sibling,
                  index
                ) => {
                  const spousePlace =
                    joinValues([
                      sibling.spouseVillage ||
                      sibling.spouseNativePlace,

                      sibling.spouseTaluka,

                      sibling.spouseDistrict,

                      sibling.spouseState
                    ]);

                  const spouseSurname =
                    joinValues(
                      [
                        sibling.spouseClan,
                        sibling.spouseFamilySurname
                      ],
                      ' • '
                    );

                  return (
                    <article
                      key={`${sibling.relation || 'sibling'}-${index}`}
                      className={
                        cardClass
                      }
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p
                            className={
                              labelClass
                            }
                          >
                            {sibling.relation ||
                              'Sibling'}
                          </p>

                          <h3 className="mt-1 font-['Cormorant_Garamond'] text-[25px] font-medium text-[#291a17]">
                            {sibling.name ||
                              'Name not shared'}
                          </h3>
                        </div>

                        {sibling.maritalStatus && (
                          <span className="rounded-full border border-[#cbb8a4] px-3 py-1 text-[8px] font-bold uppercase text-[#756a60]">
                            {
                              sibling.maritalStatus
                            }
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-[11px] leading-6 text-[#756a60]">
                        {joinValues(
                          [
                            sibling.education,
                            sibling.occupation
                          ],
                          ' • '
                        ) ||
                          'Education and profession not shared'}
                      </p>

                      {sibling.maritalStatus ===
                        'Married' && (
                        <div className="mt-4 border-t border-[#ddd0c1] pt-4 text-[10px] leading-6 text-[#756a60]">
                          {sibling.spouseName && (
                            <p>
                              Life Partner Name:{' '}
                              {
                                sibling.spouseName
                              }
                            </p>
                          )}

                          {spouseSurname && (
                            <p>
                              Life Partner Surname:{' '}
                              {
                                spouseSurname
                              }
                            </p>
                          )}

                          {spousePlace && (
                            <p>
                              Sasariyu / Village:{' '}
                              {
                                spousePlace
                              }
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          </Section>
        )}

        {profile.maritalHistory &&
          profile.maritalStatus !==
            'Never Married' && (
            <Section
              eyebrow="Private context"
              title="Marital history"
            >
              <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                <Detail
                  label="Status"
                  value={
                    profile.maritalStatus
                  }
                />

                <Detail
                  label="Previous marriage ended"
                  value={
                    formatDate(
                      profile
                        .maritalHistory
                        .previousMarriageEndedAt
                    )
                  }
                />

                <Detail
                  label="Divorce finalized"
                  value={
                    profile
                      .maritalHistory
                      .divorceFinalized ===
                    undefined
                      ? ''
                      : profile
                            .maritalHistory
                            .divorceFinalized
                        ? 'Yes'
                        : 'No'
                  }
                />

                <Detail
                  label="Children"
                  value={
                    profile
                      .maritalHistory
                      .childrenFromPreviousMarriage
                      ? `${profile.maritalHistory.childrenCount || 0} child/children`
                      : 'No children shared'
                  }
                />

                <Detail
                  label="Children living with"
                  value={
                    profile
                      .maritalHistory
                      .childrenLivingWith
                  }
                />
              </div>
            </Section>
          )}

        <FamilyAssetsDisplay
          assets={
            profile.familyAssets
          }
          mode="profile"
        />

        <Section
          eyebrow="Lifestyle"
          title="Lifestyle & interests"
        >
          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            <Detail
              label="Diet"
              value={
                profile.lifestyle
                  ?.diet
              }
            />

            <Detail
              label="Smoking"
              value={
                profile.lifestyle
                  ?.smoking
              }
            />

            <Detail
              label="Drinking"
              value={
                profile.lifestyle
                  ?.drinking
              }
            />
          </div>

          {profile.lifestyle
            ?.interests
            ?.length >
            0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.lifestyle.interests.map(
                (
                  interest
                ) => (
                  <span
                    key={
                      interest
                    }
                    className="rounded-full border border-[#d9c9b8] bg-[#fffdf8] px-3 py-2 text-[9px] font-bold text-[#756a60]"
                  >
                    {interest}
                  </span>
                )
              )}
            </div>
          )}
        </Section>

        {(profile.contactDetails ||
          profile.contact) && (
          <Section
            eyebrow="Contact"
            title="Contact information"
          >
            <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
              <Detail
                label="Current address"
                value={
                  currentAddress
                }
              />

              <Detail
                label="Guardian"
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

              <Detail
                label="Guardian phone"
                value={
                  profile.contactDetails
                    ?.guardianPhone
                }
              />

              <Detail
                label="Self phone"
                value={
                  unlockedPhone
                }
              />

              <Detail
                label="Email"
                value={
                  profile.contactDetails
                    ?.email ||
                  profile.contact
                    ?.email
                }
              />
            </div>

            {!own &&
              profile.contact &&
              unlockedWhatsAppUrl && (
                <div className="mt-5">
                  <a
                    href={
                      unlockedWhatsAppUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className={
                      outlineButtonClass
                    }
                  >
                    <MessageCircle
                      size={
                        16
                      }
                    />

                    Open WhatsApp
                  </a>
                </div>
              )}
          </Section>
        )}
      </div>

      {reporting && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#160b0bbd] p-5"
          role="presentation"
        >
          <form
            className="grid w-full max-w-[480px] gap-[18px] bg-[#fffdf8] p-8"
            onSubmit={
              report
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
          >
            <h2
              id="report-title"
              className="font-['Cormorant_Garamond'] text-[35px] font-medium"
            >
              Report this profile
            </h2>

            <label className="grid gap-2 text-[10px] uppercase tracking-[0.1em]">
              Reason

              <select
                className="border border-[#ddd0c1] bg-white p-[13px]"
                value={
                  reportReason
                }
                onChange={(
                  event
                ) =>
                  setReportReason(
                    event.target
                      .value
                  )
                }
              >
                {[
                  'Fake Profile',
                  'Inappropriate Content',
                  'Spam',
                  'Harassment',
                  'Incorrect Information',
                  'Other'
                ].map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option
                      }
                    >
                      {option}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="grid gap-2 text-[10px] uppercase tracking-[0.1em]">
              Details

              <textarea
                className="border border-[#ddd0c1] bg-white p-[13px]"
                name="description"
                rows="4"
                maxLength="1000"
                required
              />
            </label>

            <div className="flex justify-end gap-[10px]">
              <button
                type="button"
                className={
                  outlineButtonClass
                }
                disabled={
                  busyAction ===
                  'report'
                }
                onClick={() =>
                  setReporting(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  busyAction ===
                  'report'
                }
                className={
                  primaryButtonClass
                }
              >
                {busyAction ===
                'report'
                  ? 'Submitting…'
                  : 'Submit report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}