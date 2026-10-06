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
  MessageCircle,
  Phone,
  Printer,
  ShieldX
} from 'lucide-react';
import {
  Link,
  useNavigate,
  useParams
} from 'react-router-dom';

import { useToast } from '../context/ToastContext';
import {
  api,
  assetUrl
} from '../services/api';

const value = (input) =>
  input || 'Not shared';

const primaryButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:opacity-55';

const outlineButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:opacity-55';

const iconButtonClass =
  'grid h-11 w-11 place-items-center rounded-full border border-[#ddd0c1] text-[#756a60]';

const eyebrowClass =
  'text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]';

const detailSectionClass =
  'grid grid-cols-[180px_1fr] gap-[25px] border-b border-[#ddd0c1] py-10 max-[767px]:grid-cols-1';

const detailTitleClass =
  "font-['Cormorant_Garamond'] text-[31px] font-medium";

const detailTextClass =
  'leading-[1.9] text-[#756a60]';

const dtClass =
  'text-[9px] uppercase text-[#756a60]';

const ddClass =
  "font-['Cormorant_Garamond'] text-[20px] font-medium";

export default function ProfilePage({
  own = false
}) {
  const { profileId } =
    useParams();

  const navigate =
    useNavigate();

  const notify = useToast();

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState('');

  const [
    reporting,
    setReporting
  ] = useState(false);

  const [reason, setReason] =
    useState('Fake Profile');

  const load = useCallback(
    () =>
      api(
        own
          ? '/profiles/me'
          : `/profiles/${profileId}`
      )
        .then((result) =>
          setData(result.data)
        )
        .catch((caught) =>
          setError(caught.message)
        ),
    [
      own,
      profileId
    ]
  );

  useEffect(() => {
    load();
  }, [load]);

  const action = async (name) => {
    try {
      if (name === 'interest') {
        await api('/interests', {
          method: 'POST',
          body: JSON.stringify({
            receiverProfile:
              data.profile._id
          })
        });
      }

      if (name === 'shortlist') {
        await api('/shortlist', {
          method: 'POST',
          body: JSON.stringify({
            profileId:
              data.profile._id
          })
        });
      }

      if (name === 'contact') {
        await api(
          '/contact-requests',
          {
            method: 'POST',
            body: JSON.stringify({
              receiverProfile:
                data.profile._id
            })
          }
        );
      }

      if (name === 'unlock') {
        await api(
          `/contact-requests/${data.actionState.contactRequest.id}/unlock`,
          {
            method: 'POST'
          }
        );
      }

      if (name === 'block') {
        await api('/blocks', {
          method: 'POST',
          body: JSON.stringify({
            profileId:
              data.profile._id
          })
        });

        navigate('/discover');

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
        }[name] ||
          'Profile updated.'
      );
    } catch (caught) {
      notify(
        caught.message,
        'error'
      );
    }
  };

  const respond = async (
    response
  ) => {
    try {
      await api(
        `/contact-requests/${data.actionState.contactRequest.id}/${response}`,
        {
          method: 'PATCH'
        }
      );

      await load();

      notify(
        `Contact request ${response}ed.`
      );
    } catch (caught) {
      notify(
        caught.message,
        'error'
      );
    }
  };

  const report = async (
    event
  ) => {
    event.preventDefault();

    try {
      await api('/reports', {
        method: 'POST',
        body: JSON.stringify({
          reportedProfile:
            data.profile._id,
          reason,
          description:
            event.currentTarget
              .description.value
        })
      });

      setReporting(false);

      notify(
        'Report submitted for review.'
      );
    } catch (caught) {
      notify(
        caught.message,
        'error'
      );
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
        <h2 className="m-[15px] font-['Cormorant_Garamond'] text-[34px] font-medium">
          Profile unavailable
        </h2>

        <p className="max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-skeleton">
        Loading profile…
      </div>
    );
  }

  const profile = data.profile;

  const contact =
    data.actionState
      ?.contactRequest;

  return (
    <article className="mx-auto max-w-[1050px]">
      <div className="grid grid-cols-[330px_1fr] items-center gap-[50px] max-[767px]:grid-cols-1 max-[767px]:gap-7">
        {profile.profilePhoto ? (
          <img
            src={assetUrl(
              profile.profilePhoto
            )}
            alt={`${profile.firstName}'s profile`}
            className="h-[450px] w-full rounded-t-[170px] object-cover max-[767px]:h-[430px]"
          />
        ) : (
          <div className="grid h-[450px] w-full place-items-center rounded-t-[170px] bg-[#e8dace] font-['Cormorant_Garamond'] text-[70px] text-[#681d25] max-[767px]:h-[430px]">
            {
              profile
                .firstName?.[0]
            }
          </div>
        )}

        <div>
          <p className={eyebrowClass}>
            {profile.profileId} •{' '}
            {profile.visibility?.replace(
              '_',
              ' '
            )}
          </p>

          <h1 className="mt-3 flex items-center gap-3 font-['Cormorant_Garamond'] text-[68px] font-medium max-[767px]:text-[52px]">
            {profile.firstName}{' '}
            {profile.lastName || ''}

            {profile.verification
              ?.adminVerified && (
              <BadgeCheck className="text-[#681d25]" />
            )}
          </h1>

          <p className="text-[#756a60]">
            {value(profile.age)} years
            • {value(profile.height)} cm
            •{' '}
            {value(
              profile.location?.city
            )}
            ,{' '}
            {value(
              profile.location?.state
            )}
          </p>

          <p className="mt-2 text-[#756a60]">
            {value(
              profile.education
                ?.highestEducation
            )}{' '}
            •{' '}
            {value(
              profile.career
                ?.occupation
            )}
          </p>

          {data.compatibility && (
            <p className="mt-4 text-[12px] text-[#756a60]">
              <strong className="text-[#681d25]">
                {
                  data.compatibility
                    .score
                }
                % Preference Match
              </strong>{' '}
              • You align on{' '}
              {data.compatibility
                .matchedFactors
                .slice(0, 3)
                .join(', ')
                .toLowerCase()}
              .
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-[10px]">
            {own ? (
              <>
                <Link
                  to="/onboarding"
                  className={
                    primaryButtonClass
                  }
                >
                  Edit profile
                </Link>

                <Link
                  to="/my-profile/biodata"
                  className={
                    outlineButtonClass
                  }
                >
                  <Printer
                    size={16}
                  />

                  Biodata
                </Link>
              </>
            ) : (
              <>
                <button
                  disabled={
                    data.actionState
                      ?.interestSent
                  }
                  onClick={() =>
                    action('interest')
                  }
                  className={
                    primaryButtonClass
                  }
                >
                  <Heart size={16} />

                  {data.actionState
                    ?.interestSent
                    ? 'Interest sent'
                    : 'Express interest'}
                </button>

                <button
                  disabled={
                    data.actionState
                      ?.shortlisted
                  }
                  onClick={() =>
                    action('shortlist')
                  }
                  className={
                    outlineButtonClass
                  }
                >
                  <Bookmark
                    size={16}
                  />

                  {data.actionState
                    ?.shortlisted
                    ? 'Shortlisted'
                    : 'Shortlist'}
                </button>

                {profile.contact ? (
                  <>
                    <a
                      className={
                        outlineButtonClass
                      }
                      href={`tel:${profile.contact.phone}`}
                    >
                      <Phone
                        size={16}
                      />

                      {
                        profile.contact
                          .phone
                      }
                    </a>

                    {profile.contact
                      .whatsappPhone && (
                      <a
                        className={
                          outlineButtonClass
                        }
                        href={`https://wa.me/${profile.contact.whatsappPhone}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle
                          size={16}
                        />

                        WhatsApp
                      </a>
                    )}
                  </>
                ) : contact?.status ===
                    'Accepted' &&
                  !contact.unlocked ? (
                  <button
                    onClick={() =>
                      action('unlock')
                    }
                    className={
                      outlineButtonClass
                    }
                  >
                    <Phone
                      size={16}
                    />

                    Unlock contact
                  </button>
                ) : contact?.incoming &&
                  contact.status ===
                    'Pending' ? (
                  <>
                    <button
                      className={
                        outlineButtonClass
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
                      className={
                        outlineButtonClass
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
                ) : (
                  <button
                    disabled={
                      contact?.status ===
                        'Pending' ||
                      contact?.status ===
                        'Declined'
                    }
                    onClick={() =>
                      action('contact')
                    }
                    className={
                      outlineButtonClass
                    }
                  >
                    <Phone
                      size={16}
                    />

                    {contact?.status ===
                    'Pending'
                      ? 'Contact requested'
                      : contact?.status ===
                          'Declined'
                        ? 'Request declined'
                        : 'Request contact'}
                  </button>
                )}

                <button
                  onClick={() =>
                    action('block')
                  }
                  className={
                    iconButtonClass
                  }
                  aria-label="Block profile"
                >
                  <ShieldX
                    size={16}
                  />
                </button>

                <button
                  onClick={() =>
                    setReporting(true)
                  }
                  className={
                    iconButtonClass
                  }
                  aria-label="Report profile"
                >
                  <Flag size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-[65px] border-t border-[#ddd0c1]">
        <section className={detailSectionClass}>
          <p className={eyebrowClass}>
            Introduction
          </p>

          <div>
            <h2 className={detailTitleClass}>
              About {profile.firstName}
            </h2>

            <p className={detailTextClass}>
              {value(profile.aboutMe)}
            </p>
          </div>
        </section>

        <section className={detailSectionClass}>
          <p className={eyebrowClass}>
            Education & career
          </p>

          <dl className="grid grid-cols-3 gap-5 max-[767px]:grid-cols-2">
            <div>
              <dt className={dtClass}>
                Highest education
              </dt>

              <dd className={ddClass}>
                {value(
                  profile.education
                    ?.highestEducation
                )}
              </dd>
            </div>

            <div>
              <dt className={dtClass}>
                Profession
              </dt>

              <dd className={ddClass}>
                {value(
                  profile.career
                    ?.occupation
                )}
              </dd>
            </div>

            <div>
              <dt className={dtClass}>
                Work location
              </dt>

              <dd className={ddClass}>
                {value(
                  profile.location
                    ?.city
                )}
              </dd>
            </div>

            {profile.career
              ?.annualIncome && (
              <div>
                <dt
                  className={
                    dtClass
                  }
                >
                  Annual income
                </dt>

                <dd
                  className={
                    ddClass
                  }
                >
                  {
                    profile.career
                      .annualIncome
                  }
                </dd>
              </div>
            )}
          </dl>
        </section>

        {profile.family && (
          <section className={detailSectionClass}>
            <p className={eyebrowClass}>
              Family
            </p>

            <div>
              <h2 className={detailTitleClass}>
                {value(
                  profile.family
                    .familyType
                )}{' '}
                family
              </h2>

              <p className={detailTextClass}>
                {value(
                  profile.family
                    .familyDescription
                )}
              </p>

              {profile.family
                .siblingDetails
                ?.length > 0 && (
                <div className="mt-6 border-t border-[#ddd0c1] pt-5">
                  <h3 className="font-['Cormorant_Garamond'] text-[24px] font-medium">
                    Sibling context
                  </h3>

                  {profile.family.siblingDetails.map(
                    (
                      sibling,
                      index
                    ) => (
                      <p
                        className="mt-2 text-[12px] leading-[1.8] text-[#756a60]"
                        key={index}
                      >
                        {
                          sibling.relation
                        }
                        :{' '}
                        {sibling.name ||
                          'Name private'}

                        {sibling.occupation
                          ? ` • ${sibling.occupation}`
                          : ''}

                        {sibling.maritalStatus ===
                          'Married' &&
                        sibling.spouseNativePlace
                          ? ` • Family connection in ${sibling.spouseNativePlace}`
                          : ''}
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {profile.maternalFamily && (
          <section className={detailSectionClass}>
            <p className={eyebrowClass}>
              Maternal family
            </p>

            <dl className="grid grid-cols-3 gap-5 max-[767px]:grid-cols-2">
              <div>
                <dt className={dtClass}>
                  Family surname
                </dt>

                <dd className={ddClass}>
                  {value(
                    profile
                      .maternalFamily
                      .maternalFamilySurname
                  )}
                </dd>
              </div>

              <div>
                <dt className={dtClass}>
                  Native place / Mosal
                </dt>

                <dd className={ddClass}>
                  {value(
                    profile
                      .maternalFamily
                      .maternalNativePlace ||
                      profile
                        .maternalFamily
                        .maternalVillage
                  )}
                </dd>
              </div>

              <div>
                <dt className={dtClass}>
                  Clan / Gotra
                </dt>

                <dd className={ddClass}>
                  {value(
                    profile
                      .maternalFamily
                      .maternalClan
                  )}
                </dd>
              </div>
            </dl>
          </section>
        )}

        {profile.maritalHistory &&
          profile.maritalStatus !==
            'Never Married' && (
            <section className={detailSectionClass}>
              <p className={eyebrowClass}>
                Marital context
              </p>

              <div>
                <h2 className={detailTitleClass}>
                  {
                    profile.maritalStatus
                  }
                </h2>

                <p className={detailTextClass}>
                  {profile
                    .maritalHistory
                    .childrenFromPreviousMarriage
                    ? `${
                        profile
                          .maritalHistory
                          .childrenCount ||
                        0
                      } child/children from the previous marriage`
                    : 'No children from the previous marriage shared.'}
                </p>
              </div>
            </section>
          )}

        {profile.familyAssets && (
          <section className={detailSectionClass}>
            <p className={eyebrowClass}>
              Family assets
            </p>

            <div>
              <h2 className={detailTitleClass}>
                Shared with permission
              </h2>

              <p className={detailTextClass}>
                {value(
                  profile.familyAssets
                    .propertySummary
                )}
              </p>

              {profile.familyAssets
                .agricultureLand
                ?.hasLand && (
                <p className={detailTextClass}>
                  Approximate agricultural
                  land:{' '}
                  {profile.familyAssets
                    .agricultureLand
                    .approximateArea ||
                    'Area not shared'}{' '}
                  {profile.familyAssets
                    .agricultureLand
                    .unit || ''}
                </p>
              )}
            </div>
          </section>
        )}

        <section className={detailSectionClass}>
          <p className={eyebrowClass}>
            Lifestyle
          </p>

          <p className={detailTextClass}>
            {[
              profile.lifestyle?.diet,
              profile.lifestyle?.smoking,
              profile.lifestyle?.drinking
            ]
              .filter(Boolean)
              .join(' • ') ||
              'Not shared'}
          </p>
        </section>
      </div>

      {reporting && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#160b0bbd] p-5"
          role="dialog"
          aria-modal="true"
        >
          <form
            className="grid w-full max-w-[480px] gap-[18px] bg-[#fffdf8] p-8"
            onSubmit={report}
          >
            <h2 className="font-['Cormorant_Garamond'] text-[35px] font-medium">
              Report this profile
            </h2>

            <label className="grid gap-2 text-[10px] uppercase tracking-[0.1em]">
              Reason

              <select
                className="border border-[#ddd0c1] bg-white p-[13px]"
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value
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
                ].map((option) => (
                  <option key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-[10px] uppercase tracking-[0.1em]">
              Details

              <textarea
                className="border border-[#ddd0c1] bg-white p-[13px]"
                name="description"
                rows="4"
                required
              />
            </label>

            <div className="flex justify-end gap-[10px]">
              <button
                type="button"
                className={
                  outlineButtonClass
                }
                onClick={() =>
                  setReporting(false)
                }
              >
                Cancel
              </button>

              <button
                className={
                  primaryButtonClass
                }
              >
                Submit report
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}