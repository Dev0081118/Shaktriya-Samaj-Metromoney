import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Plus,
  Save,
  Trash2
} from 'lucide-react';

import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import {
  useAuth
} from '../context/AuthContext';

import {
  useToast
} from '../context/ToastContext';

import {
  api,
  assetUrl
} from '../services/api';

const steps = [
  [
    'Profile for',
    'Who are you creating this profile for?'
  ],

  [
    'Verification',
    'Verify the account mobile number'
  ],

  [
    'Basics',
    'Tell us the essential details'
  ],

  [
    'Community',
    'Share heritage and background'
  ],

  [
    'Education & career',
    'Study and professional journey'
  ],

  [
    'Family',
    'Introduce the family'
  ],

  [
    'About & lifestyle',
    'Add personality and preferences'
  ],

  [
    'Partner preferences',
    'Who would feel compatible?'
  ],

  [
    'Photographs',
    'Add a warm first impression'
  ],

  [
    'Review',
    'Review before moderation'
  ]
];

const fields = {
  2: [
    [
      'firstName',
      'First name'
    ],

    [
      'middleName',
      'Middle name'
    ],

    [
      'lastName',
      'Last name'
    ],

    [
      'gender',
      'Gender'
    ],

    [
      'dateOfBirth',
      'Date of birth',
      'date'
    ],

    [
      'height',
      'Height in cm',
      'number'
    ],

    [
      'maritalStatus',
      'Marital status'
    ],

    [
      'city',
      'City'
    ],

    [
      'district',
      'District'
    ],

    [
      'state',
      'State'
    ],

    [
      'country',
      'Country'
    ]
  ],

  3: [
    [
      'communityName',
      'Community'
    ],

    [
      'subCommunity',
      'Sub-community'
    ],

    [
      'nativePlace',
      'Native place'
    ],

    [
      'clan',
      'Clan / Gotra'
    ],

    [
      'familyOrigin',
      'Family origin'
    ]
  ],

  4: [
    [
      'highestEducation',
      'Highest education'
    ],

    [
      'degree',
      'Degree'
    ],

    [
      'specialization',
      'Specialization'
    ],

    [
      'college',
      'College'
    ],

    [
      'educationDetails',
      'Education details'
    ],

    [
      'occupationType',
      'Occupation type'
    ],

    [
      'occupation',
      'Occupation'
    ],

    [
      'designation',
      'Designation'
    ],

    [
      'companyName',
      'Company'
    ],

    [
      'businessName',
      'Business'
    ],

    [
      'annualIncome',
      'Annual income',
      'number'
    ]
  ],

  5: [
    [
      'fatherName',
      'Father’s name'
    ],

    [
      'fatherOccupation',
      'Father’s occupation'
    ],

    [
      'motherName',
      'Mother’s name'
    ],

    [
      'motherOccupation',
      'Mother’s occupation'
    ],

    [
      'siblings',
      'Siblings'
    ],

    [
      'familyType',
      'Family type'
    ],

    [
      'familyLocation',
      'Family location'
    ],

    [
      'familyDescription',
      'About the family'
    ]
  ],

  6: [
    [
      'aboutMe',
      'About me'
    ],

    [
      'diet',
      'Diet'
    ],

    [
      'smoking',
      'Smoking'
    ],

    [
      'drinking',
      'Drinking'
    ],

    [
      'interests',
      'Interests'
    ],

    [
      'marriageTimeline',
      'Marriage timeline'
    ]
  ],

  7: [
    [
      'ageMin',
      'Minimum age',
      'number'
    ],

    [
      'ageMax',
      'Maximum age',
      'number'
    ],

    [
      'heightMin',
      'Minimum height',
      'number'
    ],

    [
      'heightMax',
      'Maximum height',
      'number'
    ],

    [
      'locations',
      'Preferred cities'
    ],

    [
      'states',
      'Preferred states'
    ],

    [
      'educationPreferences',
      'Education preferences'
    ],

    [
      'occupationPreferences',
      'Occupation preferences'
    ],

    [
      'dietPreferences',
      'Diet preferences'
    ],

    [
      'communityPreferences',
      'Community preferences'
    ],

    [
      'additionalPreferences',
      'Anything else?'
    ]
  ]
};

const readDraft = () => {
  try {
    const raw =
      localStorage.getItem(
        'ksm_onboarding'
      );

    if (!raw) {
      return {};
    }

    const parsed =
      JSON.parse(
        raw
      );

    return parsed &&
      typeof parsed ===
        'object' &&
      !Array.isArray(
        parsed
      )
      ? parsed
      : {};
  } catch {
    localStorage.removeItem(
      'ksm_onboarding'
    );

    return {};
  }
};

const readDraftStep = () => {
  const value =
    Number(
      localStorage.getItem(
        'ksm_onboarding_step'
      )
    );

  if (
    !Number.isInteger(
      value
    ) ||
    value <
      0 ||
    value >
      9
  ) {
    return 0;
  }

  return value;
};

const preferenceToForm = (
  preferences
) =>
  Object.fromEntries(
    Object.entries(
      preferences ||
        {}
    ).map(
      ([
        key,
        value
      ]) => [
        key,

        Array.isArray(
          value
        )
          ? value.join(
              ', '
            )
          : value
      ]
    )
  );

const flatten = (
  profile
) => ({
  /*
   * Keep harmless top-level server
   * fields such as profileId,
   * visibility, profilePhoto, etc.
   */
  ...profile,

  /*
   * IMPORTANT:
   * Do not spread nested objects here.
   *
   * paternalFamily.nativePlace used
   * to overwrite location.nativePlace,
   * paternalFamily.clan used to overwrite
   * community.clan, and district/state
   * had the same collision.
   */
  city:
    profile.location
      ?.city ||
    '',

  district:
    profile.location
      ?.district ||
    '',

  state:
    profile.location
      ?.state ||
    '',

  country:
    profile.location
      ?.country ||
    'India',

  nativePlace:
    profile.location
      ?.nativePlace ||
    '',

  communityName:
    profile.community
      ?.name ||
    '',

  subCommunity:
    profile.community
      ?.subCommunity ||
    '',

  clan:
    profile.community
      ?.clan ||
    '',

  familyOrigin:
    profile.community
      ?.familyOrigin ||
    '',

  highestEducation:
    profile.education
      ?.highestEducation ||
    '',

  degree:
    profile.education
      ?.degree ||
    '',

  specialization:
    profile.education
      ?.specialization ||
    '',

  college:
    profile.education
      ?.college ||
    '',

  educationDetails:
    profile.education
      ?.educationDetails ||
    '',

  occupationType:
    profile.career
      ?.occupationType ||
    '',

  occupation:
    profile.career
      ?.occupation ||
    '',

  designation:
    profile.career
      ?.designation ||
    '',

  companyName:
    profile.career
      ?.companyName ||
    '',

  businessName:
    profile.career
      ?.businessName ||
    '',

  annualIncome:
    profile.career
      ?.annualIncome ??
    '',

  diet:
    profile.lifestyle
      ?.diet ||
    '',

  smoking:
    profile.lifestyle
      ?.smoking ||
    '',

  drinking:
    profile.lifestyle
      ?.drinking ||
    '',

  interests: (
    profile.lifestyle
      ?.interests ||
    []
  ).join(
    ', '
  ),

  fatherName:
    profile.family
      ?.fatherName ||
    '',

  fatherOccupation:
    profile.family
      ?.fatherOccupation ||
    '',

  motherName:
    profile.family
      ?.motherName ||
    '',

  motherOccupation:
    profile.family
      ?.motherOccupation ||
    '',

  siblings:
    profile.family
      ?.siblings ||
    '',

  siblingDetails:
    profile.family
      ?.siblingDetails ||
    [],

  familyType:
    profile.family
      ?.familyType ||
    '',

  familyLocation:
    profile.family
      ?.familyLocation ||
    '',

  familyDescription:
    profile.family
      ?.familyDescription ||
    '',

  previousMarriageEndedAt:
    profile.maritalHistory
      ?.previousMarriageEndedAt
      ?.slice?.(
        0,
        10
      ) ||
    '',

  divorceFinalized:
    !!profile.maritalHistory
      ?.divorceFinalized,

  childrenFromPreviousMarriage:
    !!profile.maritalHistory
      ?.childrenFromPreviousMarriage,

  childrenCount:
    profile.maritalHistory
      ?.childrenCount ??
    '',

  childrenLivingWith:
    profile.maritalHistory
      ?.childrenLivingWith ||
    '',

  maritalHistoryNotes:
    profile.maritalHistory
      ?.notes ||
    '',

  /*
   * Paternal fields get their own
   * names so they never overwrite
   * location/community state.
   */
  ancestralVillage:
    profile.paternalFamily
      ?.ancestralVillage ||
    '',

  paternalNativePlace:
    profile.paternalFamily
      ?.nativePlace ||
    '',

  paternalDistrict:
    profile.paternalFamily
      ?.district ||
    '',

  paternalState:
    profile.paternalFamily
      ?.state ||
    '',

  paternalFamilySurname:
    profile.paternalFamily
      ?.familySurname ||
    '',

  paternalClan:
    profile.paternalFamily
      ?.clan ||
    '',

  paternalNotes:
    profile.paternalFamily
      ?.notes ||
    '',

  maternalGrandfatherName:
    profile.maternalFamily
      ?.maternalGrandfatherName ||
    '',

  maternalFamilySurname:
    profile.maternalFamily
      ?.maternalFamilySurname ||
    '',

  maternalNativePlace:
    profile.maternalFamily
      ?.maternalNativePlace ||
    '',

  maternalVillage:
    profile.maternalFamily
      ?.maternalVillage ||
    '',

  maternalDistrict:
    profile.maternalFamily
      ?.maternalDistrict ||
    '',

  maternalState:
    profile.maternalFamily
      ?.maternalState ||
    '',

  maternalClan:
    profile.maternalFamily
      ?.maternalClan ||
    '',

  maternalNotes:
    profile.maternalFamily
      ?.notes ||
    '',

  hasLand:
    !!profile.familyAssets
      ?.agricultureLand
      ?.hasLand,

  approximateArea:
    profile.familyAssets
      ?.agricultureLand
      ?.approximateArea ??
    '',

  landUnit:
    profile.familyAssets
      ?.agricultureLand
      ?.unit ||
    'Vigha',

  propertySummary:
    profile.familyAssets
      ?.propertySummary ||
    '',

  primaryResidenceType:
    profile.familyAssets
      ?.primaryResidenceType ||
    '',

  businessAssetsSummary:
    profile.familyAssets
      ?.businessAssetsSummary ||
    '',

  familyOverviewVisibility:
    profile.privacy
      ?.familyOverviewVisibility ||
    'AcceptedInterests',

  maternalFamilyVisibility:
    profile.privacy
      ?.maternalFamilyVisibility ||
    'AcceptedInterests',

  siblingDetailsVisibility:
    profile.privacy
      ?.siblingDetailsVisibility ||
    'AcceptedInterests',

  assetVisibility:
    profile.privacy
      ?.assetVisibility ||
    'Private',

  /*
   * Preserve all other privacy
   * settings so editing this page
   * cannot silently reset them.
   */
  photoVisibility:
    profile.privacy
      ?.photoVisibility ||
    'RegisteredMembers',

  contactVisibility:
    profile.privacy
      ?.contactVisibility ||
    'MutualMatches',

  incomeVisibility:
    profile.privacy
      ?.incomeVisibility ||
    'Private',

  familyVisibility:
    profile.privacy
      ?.familyVisibility ||
    'RegisteredMembers',

  fullNameVisibility:
    profile.privacy
      ?.fullNameVisibility ||
    'RegisteredMembers',

  includeSensitiveFamilyDetailsInBiodata:
    !!profile.biodataPrivacy
      ?.includeSensitiveFamilyDetailsInBiodata,

  dateOfBirth:
    profile.dateOfBirth
      ?.slice?.(
        0,
        10
      ) ||
    ''
});

const list = (
  value
) =>
  String(
    value ||
      ''
  )
    .split(
      ','
    )
    .map(
      (
        item
      ) =>
        item.trim()
    )
    .filter(
      Boolean
    );

const optionalNumber = (
  value
) => {
  if (
    value === '' ||
    value === undefined ||
    value === null
  ) {
    return undefined;
  }

  const number =
    Number(
      value
    );

  return Number.isFinite(
    number
  )
    ? number
    : undefined;
};

const profilePayload = (
  data,
  visibilityOverride
) => ({
  profileFor:
    data.profileFor,

  firstName:
    data.firstName,

  middleName:
    data.middleName,

  lastName:
    data.lastName,

  gender:
    data.gender,

  dateOfBirth:
    data.dateOfBirth,

  height:
    optionalNumber(
      data.height
    ),

  maritalStatus:
    data.maritalStatus,

  maritalHistory: {
    status:
      data.maritalStatus,

    isRemarriage:
      Boolean(
        data.maritalStatus &&
          data.maritalStatus !==
            'Never Married'
      ),

    previousMarriageEndedAt:
      data.previousMarriageEndedAt ||
      undefined,

    divorceFinalized:
      data.maritalStatus ===
      'Divorced'
        ? !!data.divorceFinalized
        : undefined,

    childrenFromPreviousMarriage:
      !!data.childrenFromPreviousMarriage,

    childrenCount:
      data.childrenFromPreviousMarriage
        ? optionalNumber(
            data.childrenCount
          ) ??
          0
        : 0,

    childrenLivingWith:
      data.childrenFromPreviousMarriage
        ? data.childrenLivingWith
        : undefined,

    notes:
      data.maritalHistoryNotes
  },

  location: {
    city:
      data.city,

    district:
      data.district,

    state:
      data.state,

    country:
      data.country ||
      'India',

    nativePlace:
      data.nativePlace
  },

  community: {
    name:
      data.communityName,

    subCommunity:
      data.subCommunity,

    clan:
      data.clan,

    familyOrigin:
      data.familyOrigin
  },

  education: {
    highestEducation:
      data.highestEducation,

    degree:
      data.degree,

    specialization:
      data.specialization,

    college:
      data.college,

    educationDetails:
      data.educationDetails
  },

  career: {
    occupationType:
      data.occupationType,

    occupation:
      data.occupation,

    designation:
      data.designation,

    companyName:
      data.companyName,

    businessName:
      data.businessName,

    annualIncome:
      optionalNumber(
        data.annualIncome
      )
  },

  lifestyle: {
    diet:
      data.diet,

    smoking:
      data.smoking,

    drinking:
      data.drinking,

    interests:
      list(
        data.interests
      )
  },

  family: {
    fatherName:
      data.fatherName,

    fatherOccupation:
      data.fatherOccupation,

    motherName:
      data.motherName,

    motherOccupation:
      data.motherOccupation,

    siblings:
      data.siblings,

    siblingDetails:
      data.siblingDetails ||
      [],

    familyType:
      data.familyType,

    familyLocation:
      data.familyLocation,

    familyDescription:
      data.familyDescription
  },

  paternalFamily: {
    ancestralVillage:
      data.ancestralVillage,

    nativePlace:
      data.paternalNativePlace,

    district:
      data.paternalDistrict,

    state:
      data.paternalState,

    familySurname:
      data.paternalFamilySurname,

    clan:
      data.paternalClan,

    notes:
      data.paternalNotes
  },

  maternalFamily: {
    maternalGrandfatherName:
      data.maternalGrandfatherName,

    maternalFamilySurname:
      data.maternalFamilySurname,

    maternalNativePlace:
      data.maternalNativePlace,

    maternalVillage:
      data.maternalVillage,

    maternalDistrict:
      data.maternalDistrict,

    maternalState:
      data.maternalState,

    maternalClan:
      data.maternalClan,

    notes:
      data.maternalNotes
  },

  familyAssets: {
    agricultureLand: {
      hasLand:
        !!data.hasLand,

      approximateArea:
        data.hasLand
          ? optionalNumber(
              data.approximateArea
            )
          : undefined,

      unit:
        data.hasLand
          ? data.landUnit ||
            'Vigha'
          : undefined
    },

    propertySummary:
      data.propertySummary,

    primaryResidenceType:
      data.primaryResidenceType,

    businessAssetsSummary:
      data.businessAssetsSummary
  },

  privacy: {
    photoVisibility:
      data.photoVisibility ||
      'RegisteredMembers',

    contactVisibility:
      data.contactVisibility ||
      'MutualMatches',

    incomeVisibility:
      data.incomeVisibility ||
      'Private',

    familyVisibility:
      data.familyVisibility ||
      'RegisteredMembers',

    familyOverviewVisibility:
      data.familyOverviewVisibility ||
      'AcceptedInterests',

    maternalFamilyVisibility:
      data.maternalFamilyVisibility ||
      'AcceptedInterests',

    siblingDetailsVisibility:
      data.siblingDetailsVisibility ||
      'AcceptedInterests',

    assetVisibility:
      data.assetVisibility ||
      'Private',

    fullNameVisibility:
      data.fullNameVisibility ||
      'RegisteredMembers'
  },

  biodataPrivacy: {
    includeSensitiveFamilyDetailsInBiodata:
      !!data.includeSensitiveFamilyDetailsInBiodata
  },

  marriageTimeline:
    data.marriageTimeline,

  aboutMe:
    data.aboutMe,

  /*
   * Existing profile photo is kept.
   * Actual replacement still happens
   * through /profiles/photo.
   */
  profilePhoto:
    data.profilePhoto,

  /*
   * Critical fix:
   * intermediate saves no longer
   * reset active/pending profiles
   * back to draft.
   */
  visibility:
    visibilityOverride ??
    data.visibility ??
    'draft'
});

const preferencePayload = (
  data
) => ({
  ageMin:
    optionalNumber(
      data.ageMin
    ),

  ageMax:
    optionalNumber(
      data.ageMax
    ),

  heightMin:
    optionalNumber(
      data.heightMin
    ),

  heightMax:
    optionalNumber(
      data.heightMax
    ),

  locations:
    list(
      data.locations
    ),

  states:
    list(
      data.states
    ),

  countries:
    list(
      data.countries
    ),

  educationPreferences:
    list(
      data.educationPreferences
    ),

  occupationPreferences:
    list(
      data.occupationPreferences
    ),

  dietPreferences:
    list(
      data.dietPreferences
    ),

  communityPreferences:
    list(
      data.communityPreferences
    ),

  marriageTimeline:
    list(
      data.preferredMarriageTimeline
    ),

  acceptedMaritalStatuses:
    list(
      data.acceptedMaritalStatuses
    ),

  willingForRemarriage:
    data.willingForRemarriage ||
    'Open to Discuss',

  additionalPreferences:
    data.additionalPreferences
});

const profileBasicsError = (
  data
) => {
  if (
    !data.firstName
      ?.trim()
  ) {
    return 'Enter the first name before continuing.';
  }

  if (
    ![
      'Male',
      'Female'
    ].includes(
      data.gender
    )
  ) {
    return 'Select a gender before continuing.';
  }

  if (
    !data.dateOfBirth
  ) {
    return 'Enter the date of birth before continuing.';
  }

  const birth =
    new Date(
      data.dateOfBirth
    );

  const age =
    (
      Date.now() -
      birth.getTime()
    ) /
    (
      365.25 *
      864e5
    );

  return !Number.isFinite(
    age
  ) ||
    age <
      18 ||
    age >
      80
    ? 'Age must be between 18 and 80 years.'
    : '';
};

const labelClass =
  'grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]';

const fieldClass =
  'w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] tracking-normal text-[#191614] normal-case outline-none focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]';

const primaryButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-55';

const outlineButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-55';

const fieldsGridClass =
  'grid grid-cols-2 gap-[18px] max-[767px]:grid-cols-1';

const sensitivePanelClass =
  'mt-5 border border-[#741f272e] bg-[#741f2709] p-5';

export default function OnboardingPage() {
  const navigate =
    useNavigate();

  const notify =
    useToast();

  const {
    user
  } =
    useAuth();

  /*
   * Do NOT initialize editing state directly
   * from localStorage.
   *
   * We first ask the server whether this
   * user already has a profile.
   */
  const [
    step,
    setStep
  ] =
    useState(
      0
    );

  const [
    data,
    setData
  ] =
    useState(
      {}
    );

  const [
    hasExistingProfile,
    setHasExistingProfile
  ] =
    useState(
      false
    );

  const [
    hydrated,
    setHydrated
  ] =
    useState(
      false
    );

  const [
    error,
    setError
  ] =
    useState('');

  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );

  const [
    otpSent,
    setOtpSent
  ] =
    useState(
      false
    );

  const [
    otp,
    setOtp
  ] =
    useState('');

  const [
    verified,
    setVerified
  ] =
    useState(
      !!user
        ?.phoneVerified
    );

  const [
    busy,
    setBusy
  ] =
    useState(
      false
    );

  const [
    cooldown,
    setCooldown
  ] =
    useState(
      0
    );

  const update = (
    key,
    value
  ) => {
    setData(
      (
        current
      ) => ({
        ...current,

        [
          key
        ]:
          value
      })
    );
  };

  const updateSibling = (
    index,
    key,
    value
  ) => {
    setData(
      (
        current
      ) => ({
        ...current,

        siblingDetails:
          (
            current.siblingDetails ||
            []
          ).map(
            (
              sibling,
              itemIndex
            ) =>
              itemIndex ===
              index
                ? {
                    ...sibling,

                    [
                      key
                    ]:
                      value
                  }
                : sibling
          )
      })
    );
  };

  /*
   * Initial hydration.
   *
   * EXISTING PROFILE:
   * server wins completely.
   *
   * NEW PROFILE:
   * local draft is restored.
   */
  useEffect(
    () => {
      let active =
        true;

      const hydrate =
        async () => {
          const [
            profileResult,
            preferenceResult
          ] =
            await Promise.allSettled([
              api(
                '/profiles/me?optional=true'
              ),

              api(
                '/preferences?optional=true'
              )
            ]);

          if (!active) {
            return;
          }

          const serverProfile =
            profileResult.status ===
              'fulfilled'
              ? profileResult
                  .value
                  .data
                  .profile
              : null;

          const serverPreferences =
            preferenceResult.status ===
              'fulfilled'
              ? preferenceResult
                  .value
                  .data
                  .preferences
              : null;

          const preferences =
            preferenceToForm(
              serverPreferences
            );

          if (
            serverProfile
          ) {
            /*
             * Existing profile = DB is source
             * of truth.
             *
             * Any old onboarding draft is removed
             * so blank/stale values cannot overwrite
             * the server profile.
             */
            localStorage.removeItem(
              'ksm_onboarding'
            );

            localStorage.removeItem(
              'ksm_onboarding_step'
            );

            setHasExistingProfile(
              true
            );

            setStep(
              0
            );

            setData({
              ...flatten(
                serverProfile
              ),

              ...preferences,

              phone:
                user?.phone ||
                ''
            });
          } else {
            const draft =
              readDraft();

            setHasExistingProfile(
              false
            );

            setStep(
              readDraftStep()
            );

            setData({
              ...preferences,

              ...draft,

              phone:
                draft.phone ||
                user?.phone ||
                ''
            });
          }

          setVerified(
            !!user
              ?.phoneVerified
          );

          setHydrated(
            true
          );

          setLoading(
            false
          );
        };

      hydrate().catch(
        (
          caught
        ) => {
          if (!active) {
            return;
          }

          setError(
            caught.message ||
            'Unable to prepare your profile.'
          );

          setHydrated(
            true
          );

          setLoading(
            false
          );
        }
      );

      return () => {
        active =
          false;
      };
    },
    [
      user?.phone,
      user?.phoneVerified
    ]
  );

  /*
   * Only NEW onboarding profiles use
   * localStorage draft persistence.
   *
   * Existing profiles are never merged
   * with stale browser drafts anymore.
   */
  useEffect(
    () => {
      if (
        !hydrated ||
        hasExistingProfile
      ) {
        return;
      }

      localStorage.setItem(
        'ksm_onboarding',
        JSON.stringify(
          data
        )
      );

      localStorage.setItem(
        'ksm_onboarding_step',
        String(
          step
        )
      );
    },
    [
      data,
      step,
      hydrated,
      hasExistingProfile
    ]
  );

  useEffect(
    () => {
      if (
        !cooldown
      ) {
        return undefined;
      }

      const timer =
        setInterval(
          () =>
            setCooldown(
              (
                current
              ) =>
                Math.max(
                  0,
                  current -
                    1
                )
            ),
          1000
        );

      return () =>
        clearInterval(
          timer
        );
    },
    [
      cooldown
    ]
  );

  const sendOtp =
    async () => {
      setBusy(
        true
      );

      setError('');

      try {
        await api(
          '/auth/send-otp',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                phone:
                  data.phone
              })
          }
        );

        setOtpSent(
          true
        );

        setCooldown(
          30
        );

        notify(
          'Verification code sent.'
        );
      } catch (
        caught
      ) {
        setError(
          caught.message
        );
      } finally {
        setBusy(
          false
        );
      }
    };

  const verify =
    async () => {
      setBusy(
        true
      );

      setError('');

      try {
        await api(
          '/auth/verify-otp',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                phone:
                  data.phone,

                code:
                  otp
              })
          }
        );

        setVerified(
          true
        );

        notify(
          'Mobile number verified.'
        );
      } catch (
        caught
      ) {
        setError(
          caught.message
        );
      } finally {
        setBusy(
          false
        );
      }
    };

  const saveProfile =
    async (
      visibilityOverride
    ) => {
      const basicsError =
        profileBasicsError(
          data
        );

      if (
        basicsError
      ) {
        setStep(
          2
        );

        throw new Error(
          basicsError
        );
      }

      const endpoint =
        hasExistingProfile
          ? '/profiles/me'
          : '/profiles';

      const method =
        hasExistingProfile
          ? 'PATCH'
          : 'POST';

      const result =
        await api(
          endpoint,
          {
            method,

            body:
              JSON.stringify(
                profilePayload(
                  data,
                  visibilityOverride
                )
              )
          }
        );

      const savedProfile =
        result.data
          .profile;

      if (
        savedProfile
      ) {
        setHasExistingProfile(
          true
        );

        setData(
          (
            current
          ) => ({
            ...current,

            ...flatten(
              savedProfile
            ),

            phone:
              current.phone ||
              user?.phone ||
              ''
          })
        );
      }

      return savedProfile;
    };

  const saveAndExit =
    async () => {
      /*
       * A brand-new profile can leave before
       * basics are complete; its draft is already
       * stored in localStorage.
       */
      if (
        !hasExistingProfile &&
        !data.firstName
      ) {
        navigate(
          '/dashboard'
        );

        return;
      }

      setBusy(
        true
      );

      setError('');

      try {
        await saveProfile();

        localStorage.removeItem(
          'ksm_onboarding'
        );

        localStorage.removeItem(
          'ksm_onboarding_step'
        );

        notify(
          'Profile changes saved.'
        );

        navigate(
          '/dashboard'
        );
      } catch (
        caught
      ) {
        setError(
          caught.message
        );
      } finally {
        setBusy(
          false
        );
      }
    };

  const upload =
    async (
      file
    ) => {
      const basicsError =
        profileBasicsError(
          data
        );

      if (
        basicsError
      ) {
        setStep(
          2
        );

        setError(
          basicsError
        );

        return;
      }

      setBusy(
        true
      );

      setError('');

      try {
        /*
         * Preserve current visibility while
         * ensuring the profile exists.
         */
        await saveProfile();

        const body =
          new FormData();

        body.append(
          'photo',
          file
        );

        const result =
          await api(
            '/profiles/photo',
            {
              method:
                'POST',

              body
            }
          );

        setData(
          (
            current
          ) => ({
            ...current,

            profilePhoto:
              result.data.path
          })
        );

        notify(
          'Photo uploaded.'
        );
      } catch (
        caught
      ) {
        setError(
          caught.message
        );
      } finally {
        setBusy(
          false
        );
      }
    };

  const next =
    async () => {
      if (
        step ===
          0 &&
        !data.profileFor
      ) {
        setError(
          'Please choose who this profile is for.'
        );

        return;
      }

      if (
        step ===
          1 &&
        !verified
      ) {
        setError(
          'Verify the mobile number before continuing.'
        );

        return;
      }

      if (
        step ===
          2 ||
        step >=
          7
      ) {
        const basicsError =
          profileBasicsError(
            data
          );

        if (
          basicsError
        ) {
          if (
            step >
            2
          ) {
            setStep(
              2
            );
          }

          setError(
            basicsError
          );

          return;
        }
      }

      setError('');

      if (
        step ===
        7
      ) {
        setBusy(
          true
        );

        try {
          await saveProfile();

          await api(
            '/preferences',
            {
              method:
                'PUT',

              body:
                JSON.stringify(
                  preferencePayload(
                    data
                  )
                )
            }
          );

          /*
           * Server now owns the profile,
           * so stale draft should not survive.
           */
          localStorage.removeItem(
            'ksm_onboarding'
          );

          localStorage.removeItem(
            'ksm_onboarding_step'
          );
        } catch (
          caught
        ) {
          setError(
            caught.message
          );

          setBusy(
            false
          );

          return;
        } finally {
          setBusy(
            false
          );
        }
      }

      if (
        step ===
        9
      ) {
        setBusy(
          true
        );

        try {
          await saveProfile(
            'pending_review'
          );

          localStorage.removeItem(
            'ksm_onboarding'
          );

          localStorage.removeItem(
            'ksm_onboarding_step'
          );

          notify(
            'Profile submitted for review.'
          );

          navigate(
            '/dashboard'
          );
        } catch (
          caught
        ) {
          setError(
            caught.message
          );
        } finally {
          setBusy(
            false
          );
        }

        return;
      }

      setStep(
        Math.min(
          9,
          step +
            1
        )
      );
    };

  if (
    loading
  ) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f0e8] font-['Cormorant_Garamond'] text-[28px] text-[#681d25]">
        Preparing your profile…
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-[minmax(320px,38%)_1fr] max-[1024px]:grid-cols-[300px_1fr] max-[767px]:grid-cols-1">
      <aside className="flex flex-col justify-between bg-[linear-gradient(0deg,#281213dc,#28121380),url('/assets/member/onboarding.webp')] bg-cover bg-center p-[45px] text-white max-[767px]:hidden">
        <a
          href="/"
          className="font-['Cormorant_Garamond'] text-[21px] font-semibold text-white"
        >
          KSHATRIYA

          <small className="block font-['Manrope'] text-[7px] font-bold tracking-[0.25em]">
            Matrimonial Society
          </small>
        </a>

        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
            A thoughtful introduction
          </p>

          <h1 className="mt-5 font-['Cormorant_Garamond'] text-[clamp(42px,4vw,65px)] font-medium leading-none">
            Every family story
            deserves to be told
            with{' '}
            <em className="text-[#dbaf79]">
              care.
            </em>
          </h1>
        </div>

        <p className="text-[11px] text-white/50">
          {hasExistingProfile
            ? 'Your saved profile is loaded directly from the secure server.'
            : 'Saved privately as you progress.'}
        </p>
      </aside>

      <main className="bg-[#fffdf8]">
        <header className="grid h-[82px] grid-cols-[1fr_2fr_1fr] items-center border-b border-[#ddd0c1] px-10 max-[767px]:grid-cols-[auto_1fr_auto] max-[767px]:gap-[14px] max-[767px]:px-[18px]">
          <button
            type="button"
            className="justify-self-start"
            onClick={() =>
              step
                ? setStep(
                    step -
                      1
                  )
                : navigate(
                    '/dashboard'
                  )
            }
            aria-label="Go back"
          >
            <ArrowLeft />
          </button>

          <div>
            <span className="text-[9px] uppercase tracking-[0.14em]">
              Step{' '}
              {step +
                1}{' '}
              of 10
            </span>

            <div className="mt-[9px] h-[2px] bg-[#e8ddd1]">
              <i
                className="block h-full bg-[#681d25] transition-[width] duration-300"
                style={{
                  width:
                    `${
                      (
                        step +
                        1
                      ) *
                      10
                    }%`
                }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={
              busy
            }
            className="flex items-center gap-2 justify-self-end text-[10px] disabled:opacity-50 max-[767px]:text-[0px]"
            onClick={
              saveAndExit
            }
          >
            <Save />

            <span className="max-[767px]:hidden">
              {busy
                ? 'Saving…'
                : 'Save & exit'}
            </span>
          </button>
        </header>

        <section className="mx-auto my-[clamp(40px,8vh,90px)] w-[min(650px,calc(100%_-_40px))]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
            {
              steps[
                step
              ][0]
            }
          </p>

          <h2 className="mb-[35px] mt-[13px] font-['Cormorant_Garamond'] text-[clamp(40px,5vw,58px)] font-medium leading-none">
            {
              steps[
                step
              ][1]
            }
          </h2>

          {step ===
            0 && (
            <div className="grid grid-cols-3 gap-3 max-[767px]:grid-cols-2">
              {[
                'Self',
                'Son',
                'Daughter',
                'Brother',
                'Sister',
                'Relative'
              ].map(
                (
                  item
                ) => (
                  <button
                    type="button"
                    className={`border p-[22px] font-['Cormorant_Garamond'] text-[21px] font-medium ${
                      data.profileFor ===
                      item
                        ? 'border-[#681d25] bg-[#681d2508] text-[#681d25]'
                        : 'border-[#ddd0c1] bg-[#fffdf8]'
                    }`}
                    onClick={() =>
                      update(
                        'profileFor',
                        item
                      )
                    }
                    key={
                      item
                    }
                  >
                    {
                      item
                    }
                  </button>
                )
              )}
            </div>
          )}

          {step ===
            1 && (
            <>
              <label className={labelClass}>
                Mobile number

                <input
                  className={fieldClass}
                  value={
                    data.phone ||
                    ''
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      'phone',
                      event
                        .target
                        .value
                    )
                  }
                />
              </label>

              {verified ? (
                <p className="mt-4 border border-[#76946f] bg-[#76946f0d] px-4 py-3 text-[11px] font-bold text-[#45643f]">
                  Mobile number
                  verified.
                </p>
              ) : (
                <button
                  disabled={
                    busy ||
                    cooldown >
                      0
                  }
                  onClick={
                    sendOtp
                  }
                  className={`${outlineButtonClass} mt-4`}
                  type="button"
                >
                  {cooldown
                    ? `Resend in ${cooldown}s`
                    : 'Send verification code'}
                </button>
              )}

              {otpSent &&
                !verified && (
                <div className="mt-[15px] flex items-end gap-3">
                  <label className={`${labelClass} flex-1`}>
                    Six-digit code

                    <input
                      className={fieldClass}
                      inputMode="numeric"
                      maxLength="6"
                      value={
                        otp
                      }
                      onChange={(
                        event
                      ) =>
                        setOtp(
                          event
                            .target
                            .value
                        )
                      }
                    />
                  </label>

                  <button
                    type="button"
                    disabled={
                      busy
                    }
                    onClick={
                      verify
                    }
                    className={
                      primaryButtonClass
                    }
                  >
                    Verify
                  </button>
                </div>
              )}
            </>
          )}

          {fields[
            step
          ] && (
            <div className={fieldsGridClass}>
              {fields[
                step
              ].map(
                ([
                  key,
                  label,
                  type
                ]) => {
                  const multiline =
                    key.includes(
                      'Description'
                    ) ||
                    key ===
                      'aboutMe' ||
                    key ===
                      'educationDetails' ||
                    key ===
                      'additionalPreferences';

                  return (
                    <label
                      className={`${
                        multiline
                          ? 'col-span-full max-[767px]:col-span-1'
                          : ''
                      } ${labelClass}`}
                      key={
                        key
                      }
                    >
                      {
                        label
                      }

                      {multiline ? (
                        <textarea
                          className={
                            fieldClass
                          }
                          rows="3"
                          value={
                            data[
                              key
                            ] ||
                            ''
                          }
                          onChange={(
                            event
                          ) =>
                            update(
                              key,
                              event
                                .target
                                .value
                            )
                          }
                        />
                      ) : key ===
                        'gender' ? (
                        <select
                          className={
                            fieldClass
                          }
                          value={
                            data[
                              key
                            ] ||
                            ''
                          }
                          onChange={(
                            event
                          ) =>
                            update(
                              key,
                              event
                                .target
                                .value
                            )
                          }
                        >
                          <option value="">
                            Select gender
                          </option>

                          <option value="Male">
                            Male
                          </option>

                          <option value="Female">
                            Female
                          </option>
                        </select>
                      ) : key ===
                        'maritalStatus' ? (
                        <select
                          className={
                            fieldClass
                          }
                          value={
                            data[
                              key
                            ] ||
                            ''
                          }
                          onChange={(
                            event
                          ) =>
                            update(
                              key,
                              event
                                .target
                                .value
                            )
                          }
                        >
                          <option value="">
                            Select marital
                            status
                          </option>

                          {[
                            'Never Married',
                            'Divorced',
                            'Widowed',
                            'Annulled',
                            'Separated'
                          ].map(
                            (
                              status
                            ) => (
                              <option
                                key={
                                  status
                                }
                                value={
                                  status
                                }
                              >
                                {
                                  status
                                }
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <input
                          className={
                            fieldClass
                          }
                          type={
                            type ||
                            'text'
                          }
                          value={
                            data[
                              key
                            ] ??
                            ''
                          }
                          onChange={(
                            event
                          ) =>
                            update(
                              key,
                              event
                                .target
                                .value
                            )
                          }
                        />
                      )}
                    </label>
                  );
                }
              )}
            </div>
          )}

          {step ===
            2 &&
            data.maritalStatus &&
            data.maritalStatus !==
              'Never Married' && (
              <div className={sensitivePanelClass}>
                <p className="mb-4 flex items-center gap-2 text-[0.78rem] font-bold text-[#741f27]">
                  <LockKeyhole
                    size={
                      15
                    }
                  />

                  Private context —
                  shown only after an
                  accepted
                  introduction.
                </p>

                <div className={fieldsGridClass}>
                  <label className={labelClass}>
                    Previous marriage
                    ended on
                    (optional)

                    <input
                      className={fieldClass}
                      type="date"
                      value={
                        data.previousMarriageEndedAt ||
                        ''
                      }
                      onChange={(
                        event
                      ) =>
                        update(
                          'previousMarriageEndedAt',
                          event
                            .target
                            .value
                        )
                      }
                    />
                  </label>

                  {data.maritalStatus ===
                    'Divorced' && (
                    <label className="flex items-center gap-[0.65rem]">
                      <input
                        type="checkbox"
                        checked={
                          !!data.divorceFinalized
                        }
                        onChange={(
                          event
                        ) =>
                          update(
                            'divorceFinalized',
                            event
                              .target
                              .checked
                          )
                        }
                      />

                      Divorce legally
                      finalized
                    </label>
                  )}

                  <label className="flex items-center gap-[0.65rem]">
                    <input
                      type="checkbox"
                      checked={
                        !!data.childrenFromPreviousMarriage
                      }
                      onChange={(
                        event
                      ) =>
                        update(
                          'childrenFromPreviousMarriage',
                          event
                            .target
                            .checked
                        )
                      }
                    />

                    Children from
                    previous marriage
                  </label>

                  {data.childrenFromPreviousMarriage && (
                    <>
                      <label className={labelClass}>
                        Number of
                        children

                        <input
                          className={fieldClass}
                          type="number"
                          min="0"
                          max="20"
                          value={
                            data.childrenCount ??
                            ''
                          }
                          onChange={(
                            event
                          ) =>
                            update(
                              'childrenCount',
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </label>

                      <label className={labelClass}>
                        Children living
                        with

                        <input
                          className={fieldClass}
                          value={
                            data.childrenLivingWith ||
                            ''
                          }
                          onChange={(
                            event
                          ) =>
                            update(
                              'childrenLivingWith',
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </label>
                    </>
                  )}

                  <label className={`${labelClass} col-span-full max-[767px]:col-span-1`}>
                    Marital history
                    notes

                    <textarea
                      rows="3"
                      className={fieldClass}
                      value={
                        data.maritalHistoryNotes ||
                        ''
                      }
                      onChange={(
                        event
                      ) =>
                        update(
                          'maritalHistoryNotes',
                          event
                            .target
                            .value
                        )
                      }
                    />
                  </label>
                </div>

                {data.maritalStatus ===
                  'Separated' && (
                  <p className="mt-4 text-[0.8rem] leading-[1.6] text-[#77675e]">
                    Separated is
                    distinct from
                    legally divorced.
                    This profile will
                    retain that status
                    clearly.
                  </p>
                )}
              </div>
            )}

          {step ===
            5 && (
            <div className="mt-6 grid gap-5">
              <div className={sensitivePanelClass}>
                <p className="mb-4 flex items-center gap-2 text-[0.78rem] font-bold text-[#741f27]">
                  <LockKeyhole
                    size={
                      15
                    }
                  />

                  Paternal heritage
                </p>

                <div className={fieldsGridClass}>
                  {[
                    [
                      'paternalFamilySurname',
                      'Family surname'
                    ],

                    [
                      'paternalClan',
                      'Clan'
                    ],

                    [
                      'ancestralVillage',
                      'Ancestral village'
                    ],

                    [
                      'paternalNativePlace',
                      'Native place'
                    ],

                    [
                      'paternalDistrict',
                      'District'
                    ],

                    [
                      'paternalState',
                      'State'
                    ]
                  ].map(
                    ([
                      key,
                      label
                    ]) => (
                      <label
                        className={
                          labelClass
                        }
                        key={
                          key
                        }
                      >
                        {
                          label
                        }

                        <input
                          className={
                            fieldClass
                          }
                          value={
                            data[
                              key
                            ] ||
                            ''
                          }
                          onChange={(
                            event
                          ) =>
                            update(
                              key,
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </label>
                    )
                  )}

                  <label className={`${labelClass} col-span-full max-[767px]:col-span-1`}>
                    Paternal notes

                    <textarea
                      rows="2"
                      className={
                        fieldClass
                      }
                      value={
                        data.paternalNotes ||
                        ''
                      }
                      onChange={(
                        event
                      ) =>
                        update(
                          'paternalNotes',
                          event
                            .target
                            .value
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              <div className={sensitivePanelClass}>
                <p className="mb-4 flex items-center gap-2 text-[0.78rem] font-bold text-[#741f27]">
                  <LockKeyhole
                    size={
                      15
                    }
                  />

                  Maternal family —
                  private by default
                </p>

                <div className={fieldsGridClass}>
                  {[
                    [
                      'maternalGrandfatherName',
                      'Maternal grandfather name'
                    ],

                    [
                      'maternalFamilySurname',
                      'Maternal family surname'
                    ],

                    [
                      'maternalNativePlace',
                      'Maternal native place'
                    ],

                    [
                      'maternalVillage',
                      'Maternal village'
                    ],

                    [
                      'maternalDistrict',
                      'Maternal district'
                    ],

                    [
                      'maternalState',
                      'Maternal state'
                    ],

                    [
                      'maternalClan',
                      'Maternal clan'
                    ]
                  ].map(
                    ([
                      key,
                      label
                    ]) => (
                      <label
                        className={
                          labelClass
                        }
                        key={
                          key
                        }
                      >
                        {
                          label
                        }

                        <input
                          className={
                            fieldClass
                          }
                          value={
                            data[
                              key
                            ] ||
                            ''
                          }
                          onChange={(
                            event
                          ) =>
                            update(
                              key,
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </label>
                    )
                  )}

                  <label className={`${labelClass} col-span-full max-[767px]:col-span-1`}>
                    Maternal notes

                    <textarea
                      rows="2"
                      className={
                        fieldClass
                      }
                      value={
                        data.maternalNotes ||
                        ''
                      }
                      onChange={(
                        event
                      ) =>
                        update(
                          'maternalNotes',
                          event
                            .target
                            .value
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              <div className={sensitivePanelClass}>
                <div className="mb-4 flex items-start justify-between gap-4 max-[640px]:flex-col">
                  <div>
                    <h3 className="font-['Cormorant_Garamond'] text-[1.5rem] text-[#291a17]">
                      Sibling context
                    </h3>

                    <p className="text-[0.8rem] leading-[1.6] text-[#77675e]">
                      Optional.
                      Spouse-family
                      details appear
                      only for married
                      siblings.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={
                      outlineButtonClass
                    }
                    onClick={() =>
                      setData(
                        (
                          current
                        ) => ({
                          ...current,

                          siblingDetails: [
                            ...(
                              current.siblingDetails ||
                              []
                            ),

                            {
                              relation:
                                'Brother',

                              maritalStatus:
                                'Unmarried'
                            }
                          ]
                        })
                      )
                    }
                  >
                    <Plus
                      size={
                        15
                      }
                    />

                    Add sibling
                  </button>
                </div>

                {(data.siblingDetails ||
                  []).map(
                  (
                    sibling,
                    index
                  ) => (
                    <div
                      className="relative border-t border-[#741f2721] py-4 pr-11"
                      key={`${sibling.relation || 'sibling'}-${index}`}
                    >
                      <div className={fieldsGridClass}>
                        <label className={labelClass}>
                          Relation

                          <select
                            className={fieldClass}
                            value={
                              sibling.relation ||
                              'Brother'
                            }
                            onChange={(
                              event
                            ) =>
                              updateSibling(
                                index,
                                'relation',
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="Brother">
                              Brother
                            </option>

                            <option value="Sister">
                              Sister
                            </option>
                          </select>
                        </label>

                        <label className={labelClass}>
                          Name

                          <input
                            className={fieldClass}
                            value={
                              sibling.name ||
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              updateSibling(
                                index,
                                'name',
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </label>

                        <label className={labelClass}>
                          Education

                          <input
                            className={fieldClass}
                            value={
                              sibling.education ||
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              updateSibling(
                                index,
                                'education',
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </label>

                        <label className={labelClass}>
                          Occupation

                          <input
                            className={fieldClass}
                            value={
                              sibling.occupation ||
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              updateSibling(
                                index,
                                'occupation',
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </label>

                        <label className={labelClass}>
                          Marital status

                          <select
                            className={fieldClass}
                            value={
                              sibling.maritalStatus ||
                              'Unmarried'
                            }
                            onChange={(
                              event
                            ) =>
                              updateSibling(
                                index,
                                'maritalStatus',
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="Unmarried">
                              Unmarried
                            </option>

                            <option value="Married">
                              Married
                            </option>
                          </select>
                        </label>

                        {sibling.maritalStatus ===
                          'Married' && (
                          <>
                            <label className={labelClass}>
                              Spouse name

                              <input
                                className={fieldClass}
                                value={
                                  sibling.spouseName ||
                                  ''
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateSibling(
                                    index,
                                    'spouseName',
                                    event
                                      .target
                                      .value
                                  )
                                }
                              />
                            </label>

                            <label className={labelClass}>
                              Spouse family
                              surname

                              <input
                                className={fieldClass}
                                value={
                                  sibling.spouseFamilySurname ||
                                  ''
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateSibling(
                                    index,
                                    'spouseFamilySurname',
                                    event
                                      .target
                                      .value
                                  )
                                }
                              />
                            </label>

                            <label className={labelClass}>
                              Spouse native
                              place

                              <input
                                className={fieldClass}
                                value={
                                  sibling.spouseNativePlace ||
                                  ''
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateSibling(
                                    index,
                                    'spouseNativePlace',
                                    event
                                      .target
                                      .value
                                  )
                                }
                              />
                            </label>

                            <label className={labelClass}>
                              Spouse village

                              <input
                                className={fieldClass}
                                value={
                                  sibling.spouseVillage ||
                                  ''
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateSibling(
                                    index,
                                    'spouseVillage',
                                    event
                                      .target
                                      .value
                                  )
                                }
                              />
                            </label>

                            <label className={labelClass}>
                              Spouse district

                              <input
                                className={fieldClass}
                                value={
                                  sibling.spouseDistrict ||
                                  ''
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateSibling(
                                    index,
                                    'spouseDistrict',
                                    event
                                      .target
                                      .value
                                  )
                                }
                              />
                            </label>

                            <label className={labelClass}>
                              Spouse state

                              <input
                                className={fieldClass}
                                value={
                                  sibling.spouseState ||
                                  ''
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateSibling(
                                    index,
                                    'spouseState',
                                    event
                                      .target
                                      .value
                                  )
                                }
                              />
                            </label>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        className="absolute right-0 top-4 grid h-11 w-11 place-items-center rounded-full border border-[#ddd0c1] text-[#756a60]"
                        aria-label="Remove sibling"
                        onClick={() =>
                          setData(
                            (
                              current
                            ) => ({
                              ...current,

                              siblingDetails:
                                (
                                  current.siblingDetails ||
                                  []
                                ).filter(
                                  (
                                    _,
                                    itemIndex
                                  ) =>
                                    itemIndex !==
                                    index
                                )
                            })
                          )
                        }
                      >
                        <Trash2
                          size={
                            16
                          }
                        />
                      </button>
                    </div>
                  )
                )}
              </div>

              <div className={sensitivePanelClass}>
                <p className="mb-4 flex items-center gap-2 text-[0.78rem] font-bold text-[#741f27]">
                  <LockKeyhole
                    size={
                      15
                    }
                  />

                  Family assets —
                  optional and never
                  public
                </p>

                <label className="flex items-center gap-[0.65rem]">
                  <input
                    type="checkbox"
                    checked={
                      !!data.hasLand
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'hasLand',
                        event
                          .target
                          .checked
                      )
                    }
                  />

                  Family has
                  agricultural land
                </label>

                {data.hasLand && (
                  <div className={`${fieldsGridClass} mt-4`}>
                    <label className={labelClass}>
                      Approximate area

                      <input
                        className={fieldClass}
                        type="number"
                        min="0"
                        value={
                          data.approximateArea ??
                          ''
                        }
                        onChange={(
                          event
                        ) =>
                          update(
                            'approximateArea',
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </label>

                    <label className={labelClass}>
                      Unit

                      <select
                        className={fieldClass}
                        value={
                          data.landUnit ||
                          'Vigha'
                        }
                        onChange={(
                          event
                        ) =>
                          update(
                            'landUnit',
                            event
                              .target
                              .value
                          )
                        }
                      >
                        <option value="Vigha">
                          Vigha
                        </option>

                        <option value="Acre">
                          Acre
                        </option>

                        <option value="Hectare">
                          Hectare
                        </option>
                      </select>
                    </label>
                  </div>
                )}

                <div className={`${fieldsGridClass} mt-4`}>
                  <label className={`${labelClass} col-span-full max-[767px]:col-span-1`}>
                    Property summary
                    (no exact address)

                    <textarea
                      className={fieldClass}
                      rows="2"
                      value={
                        data.propertySummary ||
                        ''
                      }
                      onChange={(
                        event
                      ) =>
                        update(
                          'propertySummary',
                          event
                            .target
                            .value
                        )
                      }
                    />
                  </label>

                  <label className={labelClass}>
                    Primary residence
                    type

                    <input
                      className={fieldClass}
                      value={
                        data.primaryResidenceType ||
                        ''
                      }
                      onChange={(
                        event
                      ) =>
                        update(
                          'primaryResidenceType',
                          event
                            .target
                            .value
                        )
                      }
                    />
                  </label>

                  <label className={`${labelClass} col-span-full max-[767px]:col-span-1`}>
                    Business assets
                    summary

                    <textarea
                      className={fieldClass}
                      rows="2"
                      value={
                        data.businessAssetsSummary ||
                        ''
                      }
                      onChange={(
                        event
                      ) =>
                        update(
                          'businessAssetsSummary',
                          event
                            .target
                            .value
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {step ===
            6 && (
            <div className={`${sensitivePanelClass} mt-6`}>
              <p className="mb-4 flex items-center gap-2 text-[0.78rem] font-bold text-[#741f27]">
                <LockKeyhole
                  size={
                    15
                  }
                />

                Privacy for family
                information
              </p>

              <div className={fieldsGridClass}>
                <label className={labelClass}>
                  Family overview

                  <select
                    className={fieldClass}
                    value={
                      data.familyOverviewVisibility ||
                      'AcceptedInterests'
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'familyOverviewVisibility',
                        event
                          .target
                          .value
                      )
                    }
                  >
                    <option value="RegisteredMembers">
                      Registered members
                    </option>

                    <option value="AcceptedInterests">
                      Accepted interests
                    </option>

                    <option value="MutualMatches">
                      Mutual matches
                    </option>

                    <option value="Private">
                      Private
                    </option>
                  </select>
                </label>

                <label className={labelClass}>
                  Maternal family

                  <select
                    className={fieldClass}
                    value={
                      data.maternalFamilyVisibility ||
                      'AcceptedInterests'
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'maternalFamilyVisibility',
                        event
                          .target
                          .value
                      )
                    }
                  >
                    <option value="AcceptedInterests">
                      Accepted interests
                    </option>

                    <option value="MutualMatches">
                      Mutual matches
                    </option>

                    <option value="Private">
                      Private
                    </option>
                  </select>
                </label>

                <label className={labelClass}>
                  Sibling details

                  <select
                    className={fieldClass}
                    value={
                      data.siblingDetailsVisibility ||
                      'AcceptedInterests'
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'siblingDetailsVisibility',
                        event
                          .target
                          .value
                      )
                    }
                  >
                    <option value="AcceptedInterests">
                      Accepted interests
                    </option>

                    <option value="MutualMatches">
                      Mutual matches
                    </option>

                    <option value="Private">
                      Private
                    </option>
                  </select>
                </label>

                <label className={labelClass}>
                  Family assets

                  <select
                    className={fieldClass}
                    value={
                      data.assetVisibility ||
                      'Private'
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'assetVisibility',
                        event
                          .target
                          .value
                      )
                    }
                  >
                    <option value="AcceptedInterests">
                      Accepted interests
                    </option>

                    <option value="MutualMatches">
                      Mutual matches
                    </option>

                    <option value="Private">
                      Private
                    </option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {step ===
            8 && (
            <div className="border border-dashed border-[#bfa98f] p-[45px] text-center">
              {data.profilePhoto && (
                <img
                  className="mx-auto mb-[15px] h-[160px] w-[130px] rounded-t-[70px] object-cover"
                  src={assetUrl(
                    data.profilePhoto
                  )}
                  alt="Preview"
                />
              )}

              <h3 className="font-['Cormorant_Garamond'] text-[25px] font-medium">
                {data.profilePhoto
                  ? 'Replace profile photograph'
                  : 'Add profile photograph'}
              </h3>

              <p className="m-[6px] text-[11px] text-[#756a60]">
                JPG, PNG or WebP.
                Maximum 5 MB.
              </p>

              <input
                disabled={
                  busy
                }
                onChange={(
                  event
                ) => {
                  const file =
                    event
                      .target
                      .files?.[0];

                  if (
                    file
                  ) {
                    upload(
                      file
                    );
                  }
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />
            </div>
          )}

          {step ===
            9 && (
            <div className="bg-[#f1e8dc] p-[30px]">
              <h3 className="font-['Cormorant_Garamond'] text-[34px] font-medium">
                {data.firstName ||
                  'Your'}{' '}
                {data.lastName ||
                  'profile'}
              </h3>

              <p>
                {data.city ||
                  'Location'}
                {' • '}
                {data.occupation ||
                  'Profession'}
              </p>

              <dl className="my-[25px] grid grid-cols-2 gap-[14px]">
                {[
                  [
                    'Profile for',
                    data.profileFor
                  ],

                  [
                    'Date of birth',
                    data.dateOfBirth
                  ],

                  [
                    'Marital status',
                    data.maritalStatus
                  ],

                  [
                    'Education',
                    data.highestEducation
                  ],

                  [
                    'Community',
                    data.communityName
                  ],

                  [
                    'Clan',
                    data.clan
                  ],

                  [
                    'Native place',
                    data.nativePlace
                  ],

                  [
                    'Family',
                    data.familyType
                  ]
                ].map(
                  ([
                    label,
                    value
                  ]) => (
                    <div
                      key={
                        label
                      }
                    >
                      <dt className="text-[8px] uppercase text-[#756a60]">
                        {
                          label
                        }
                      </dt>

                      <dd className="text-[12px]">
                        {value ||
                          'Not shared'}
                      </dd>
                    </div>
                  )
                )}
              </dl>

              <p className="text-[11px] leading-6 text-[#756a60]">
                Submitting sends
                this profile to
                moderation. You can
                edit it later without
                losing the existing
                saved details.
              </p>
            </div>
          )}

          {error && (
            <p className="mt-4 bg-[#f8e9e8] px-[14px] py-3 text-[12px] text-[#8b1e26]">
              {
                error
              }
            </p>
          )}

          <button
            type="button"
            disabled={
              busy
            }
            className={`${primaryButtonClass} mt-[30px] min-w-[160px]`}
            onClick={
              next
            }
          >
            {busy
              ? 'Saving…'
              : step ===
                  9
                ? 'Submit for review'
                : 'Continue'}

            <ArrowRight />
          </button>
        </section>
      </main>
    </div>
  );
}