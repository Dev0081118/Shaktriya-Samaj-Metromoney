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
  useMemo,
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

import {
  BLOOD_GROUP_OPTIONS,
  COUNTRY_OPTIONS,
  DIET_OPTIONS,
  DRINKING_OPTIONS,
  EMPLOYMENT_TYPES,
  FAMILY_TYPES,
  FAMILY_VALUES,
  INDIA_STATES,
  MANGLIK_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NAKSHATRA_OPTIONS,
  PREFERRED_SHAKHS,
  RAJPUT_SURNAMES,
  RASHI_OPTIONS,
  SMOKING_OPTIONS,
  VANSH_OPTIONS
} from '../data/profileOptions';

const steps = [
  [
    'Basic details',
    'Let us begin with the essentials'
  ],
  [
    'Community details',
    'Your Rajput heritage and lineage'
  ],
  [
    'Personal details',
    'Lifestyle and personal introduction'
  ],
  [
    'Education',
    'Academic background'
  ],
  [
    'Career',
    'Professional journey'
  ],
  [
    'Family',
    'Your family background'
  ],
  [
    'Mosal details',
    'Maternal family and lineage'
  ],
  [
    'Horoscope',
    'Traditional matching information'
  ],
  [
    'Photos & biodata',
    'Complete your matrimonial presentation'
  ],
  [
    'Partner preference',
    'Tell us what you are looking for'
  ]
];

const labelClass =
  'grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]';

const fieldClass =
  'w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] tracking-normal text-[#191614] normal-case outline-none focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]';

const primaryButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-55';

const outlineButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-[#cbb8a4] bg-transparent px-5 text-[12px] font-extrabold text-[#431318] transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-55';

const gridClass =
  'grid grid-cols-2 gap-[18px] max-[767px]:grid-cols-1';

const sectionClass =
  'mt-7 border border-[#ddd0c1] bg-[#fffdf8] p-5';

const sensitiveClass =
  'mt-5 border border-[#741f272e] bg-[#741f2709] p-5';

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
    return {};
  }
};

const readStep = () => {
  const step =
    Number(
      localStorage.getItem(
        'ksm_onboarding_step'
      )
    );

  return Number.isInteger(
    step
  ) &&
    step >= 0 &&
    step <= 9
    ? step
    : 0;
};

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

const list = (
  value
) => {
  if (
    Array.isArray(
      value
    )
  ) {
    return value.filter(
      Boolean
    );
  }

  return String(
    value ||
      ''
  )
    .split(',')
    .map(
      (
        item
      ) =>
        item.trim()
    )
    .filter(
      Boolean
    );
};

const knownSurname = (
  value
) =>
  RAJPUT_SURNAMES.includes(
    value
  ) &&
  value !==
    'Other';

const surnameForm = (
  value
) => ({
  selection:
    knownSurname(
      value
    )
      ? value
      : value
        ? 'Other'
        : '',

  custom:
    knownSurname(
      value
    )
      ? ''
      : value ||
        ''
});

const selectedSurname = (
  selection,
  custom
) =>
  selection ===
  'Other'
    ? custom
    : selection;

const preferenceToForm = (
  preferences
) => ({
  ...(
    preferences ||
    {}
  ),

  states:
    Array.isArray(
      preferences
        ?.states
    )
      ? preferences.states
      : [],

  preferredCountry:
    preferences
      ?.countries?.[0] ||
    '',

  preferredDiet:
    preferences
      ?.dietPreferences?.[0] ||
    '',

  preferredShakh:
    preferences
      ?.communityPreferences?.[0] ||
    '',

  preferredMaritalStatus:
    preferences
      ?.acceptedMaritalStatuses?.[0] ||
    '',

  locations:
    (
      preferences
        ?.locations ||
      []
    ).join(
      ', '
    ),

  educationPreferences:
    (
      preferences
        ?.educationPreferences ||
      []
    ).join(
      ', '
    ),

  occupationPreferences:
    (
      preferences
        ?.occupationPreferences ||
      []
    ).join(
      ', '
    )
});

const emptyMosal = () => ({
  mamaName:
    '',

  grandmotherName:
    '',

  familySurname:
    '',

  clanSurname:
    '',

  nativeVillage:
    '',

  taluka:
    '',

  district:
    '',

  state:
    '',

  notes:
    ''
});

const flattenMosal = (
  branch = {}
) => ({
  mamaName:
    branch.mamaName ||
    '',

  grandmotherName:
    branch.grandmotherName ||
    '',

  familySurname:
    branch.familySurname ||
    '',

  clanSurname:
    branch.clanSurname ||
    '',

  nativeVillage:
    branch.nativeVillage ||
    '',

  taluka:
    branch.taluka ||
    '',

  district:
    branch.district ||
    '',

  state:
    branch.state ||
    '',

  notes:
    branch.notes ||
    ''
});

const flatten = (
  profile
) => {
  const surname =
    surnameForm(
      profile.community
        ?.clan
    );

  const maternalSurname =
    surnameForm(
      profile.maternalFamily
        ?.maternalClan
    );

  return {
    ...profile,

    dateOfBirth:
      profile.dateOfBirth
        ?.slice?.(
          0,
          10
        ) ||
      '',

    maritalStatus:
      profile.maritalStatus ||
      profile.maritalHistory
        ?.status ||
      '',

    timeOfBirth:
      profile.birthDetails
        ?.timeOfBirth ||
      '',

    birthCity:
      profile.birthDetails
        ?.city ||
      '',

    birthDistrict:
      profile.birthDetails
        ?.district ||
      '',

    birthState:
      profile.birthDetails
        ?.state ||
      '',

    bloodGroup:
      profile.bloodGroup ||
      '',

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

    nativePlace:
      profile.location
        ?.nativePlace ||
      '',

    nativeTaluka:
      profile.location
        ?.nativeTaluka ||
      '',

    nativeDistrict:
      profile.location
        ?.nativeDistrict ||
      '',

    nativeState:
      profile.location
        ?.nativeState ||
      '',

    surnameSelection:
      surname.selection,

    customSurname:
      surname.custom,

    gotra:
      profile.community
        ?.gotra ||
      '',

    vansh:
      profile.community
        ?.vansh ||
      '',

    kulaDevi:
      profile.community
        ?.kulaDevi ||
      '',

    kulDevta:
      profile.community
        ?.ishtaDevta ||
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

    university:
      profile.education
        ?.university ||
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

    workCity:
      profile.career
        ?.workLocation
        ?.city ||
      '',

    workState:
      profile.career
        ?.workLocation
        ?.state ||
      '',

    workCountry:
      profile.career
        ?.workLocation
        ?.country ||
      'India',

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

    interests:
      (
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

    siblingDetails:
      profile.family
        ?.siblingDetails ||
      [],

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

    maternalGrandfatherName:
      profile.maternalFamily
        ?.maternalGrandfatherName ||
      '',

    maternalFamilySurname:
      profile.maternalFamily
        ?.maternalFamilySurname ||
      '',

    maternalVillage:
      profile.maternalFamily
        ?.maternalVillage ||
      profile.maternalFamily
        ?.maternalNativePlace ||
      '',

    maternalTaluka:
      profile.maternalFamily
        ?.maternalTaluka ||
      '',

    maternalDistrict:
      profile.maternalFamily
        ?.maternalDistrict ||
      '',

    maternalState:
      profile.maternalFamily
        ?.maternalState ||
      '',

    maternalSurnameSelection:
      maternalSurname.selection,

    maternalCustomSurname:
      maternalSurname.custom,

    maternalGotra:
      profile.maternalFamily
        ?.notes ||
      '',

    selfMosal:
      flattenMosal(
        profile.maternalLineage
          ?.selfMosal
      ),

    fathersMosal:
      flattenMosal(
        profile.maternalLineage
          ?.fathersMosal
      ),

    mothersMosal:
      flattenMosal(
        profile.maternalLineage
          ?.mothersMosal
      ),

    rashi:
      profile.astrology
        ?.rashi ||
      '',

    nakshatra:
      profile.astrology
        ?.nakshatra ||
      '',

    manglik:
      profile.astrology
        ?.manglik ||
      'Unknown',

    profilePhoto:
      profile.profilePhoto ||
      '',

    galleryAssets:
      profile.galleryAssets ||
      [],

    aboutMe:
      profile.aboutMe ||
      '',

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

    includeSensitiveFamilyDetailsInBiodata:
      !!profile
        .biodataPrivacy
        ?.includeSensitiveFamilyDetailsInBiodata,

    includeContactDetailsInBiodata:
      !!profile
        .biodataPrivacy
        ?.includeContactDetailsInBiodata,

    includeAstrologyInBiodata:
      profile
        .biodataPrivacy
        ?.includeAstrologyInBiodata ??
      true,

    includeAssetsInBiodata:
      !!profile
        .biodataPrivacy
        ?.includeAssetsInBiodata
  };
};

const profilePayload = (
  data,
  visibilityOverride
) => {
  const maritalStatus =
    data.maritalStatus ||
    undefined;

  return {
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

    bloodGroup:
      data.bloodGroup,

    maritalStatus,

    birthDetails: {
      timeOfBirth:
        data.timeOfBirth,

      city:
        data.birthCity,

      district:
        data.birthDistrict,

      state:
        data.birthState,

      country:
        'India'
    },

    maritalHistory: {
      status:
        maritalStatus,

      isRemarriage:
        maritalStatus
          ? maritalStatus !==
            'Never Married'
          : undefined,

      previousMarriageEndedAt:
        data.previousMarriageEndedAt ||
        undefined,

      divorceFinalized:
        maritalStatus ===
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
        'India',

      nativePlace:
        data.nativePlace,

      nativeTaluka:
        data.nativeTaluka,

      nativeDistrict:
        data.nativeDistrict,

      nativeState:
        data.nativeState
    },

    community: {
      name:
        'Rajput / Kshatriya',

      clan:
        selectedSurname(
          data.surnameSelection,
          data.customSurname
        ),

      gotra:
        data.gotra,

      vansh:
        data.vansh,

      kulaDevi:
        data.kulaDevi,

      ishtaDevta:
        data.kulDevta,

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

      university:
        data.university,

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
        ),

      workLocation: {
        city:
          data.workCity,

        state:
          data.workState,

        country:
          data.workCountry ||
          'India'
      }
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

    maternalFamily: {
      maternalGrandfatherName:
        data.maternalGrandfatherName,

      maternalFamilySurname:
        data.maternalFamilySurname,

      maternalNativePlace:
        data.maternalVillage,

      maternalVillage:
        data.maternalVillage,

      maternalTaluka:
        data.maternalTaluka,

      maternalDistrict:
        data.maternalDistrict,

      maternalState:
        data.maternalState,

      maternalClan:
        selectedSurname(
          data.maternalSurnameSelection,
          data.maternalCustomSurname
        ),

      notes:
        data.maternalGotra
    },

    maternalLineage: {
      selfMosal:
        data.selfMosal ||
        emptyMosal(),

      fathersMosal:
        data.fathersMosal ||
        emptyMosal(),

      mothersMosal:
        data.mothersMosal ||
        emptyMosal()
    },

    astrology: {
      rashi:
        data.rashi,

      nakshatra:
        data.nakshatra,

      manglik:
        data.manglik ||
        'Unknown'
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
        'Private'
    },

    biodataPrivacy: {
      includeSensitiveFamilyDetailsInBiodata:
        !!data.includeSensitiveFamilyDetailsInBiodata,

      includeContactDetailsInBiodata:
        !!data.includeContactDetailsInBiodata,

      includeAstrologyInBiodata:
        !!data.includeAstrologyInBiodata,

      includeAssetsInBiodata:
        !!data.includeAssetsInBiodata
    },

    aboutMe:
      data.aboutMe,

    visibility:
      visibilityOverride ??
      data.visibility ??
      'draft'
  };
};

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
    Array.isArray(
      data.states
    )
      ? data.states
      : list(
          data.states
        ),

  countries:
    data.preferredCountry
      ? [
          data.preferredCountry
        ]
      : [],

  educationPreferences:
    list(
      data.educationPreferences
    ),

  occupationPreferences:
    list(
      data.occupationPreferences
    ),

  dietPreferences:
    data.preferredDiet
      ? [
          data.preferredDiet
        ]
      : [],

  communityPreferences:
    data.preferredShakh &&
    data.preferredShakh !==
      'Any'
      ? [
          data.preferredShakh
        ]
      : [],

  acceptedMaritalStatuses:
    data.preferredMaritalStatus
      ? [
          data.preferredMaritalStatus
        ]
      : [],

  willingForRemarriage:
    data.willingForRemarriage ||
    'Open to Discuss',

  additionalPreferences:
    data.additionalPreferences
});

const validateBasics = (
  data
) => {
  if (
    !data.profileFor
  ) {
    return 'Select who this profile is for.';
  }

  if (
    !data.firstName
      ?.trim() ||
    !data.lastName
      ?.trim()
  ) {
    return 'First name and surname are required.';
  }

  if (
    ![
      'Male',
      'Female'
    ].includes(
      data.gender
    )
  ) {
    return 'Select gender.';
  }

  if (
    !data.dateOfBirth
  ) {
    return 'Date of birth is required.';
  }

  const age =
    (
      Date.now() -
      new Date(
        data.dateOfBirth
      ).getTime()
    ) /
    (
      365.25 *
      864e5
    );

  if (
    !Number.isFinite(
      age
    ) ||
    age < 18 ||
    age > 80
  ) {
    return 'Age must be between 18 and 80 years.';
  }

  if (
    !optionalNumber(
      data.height
    )
  ) {
    return 'Height is required.';
  }

  if (
    !data.maritalStatus
  ) {
    return 'Marital status is required.';
  }

  return '';
};

const localCompletion = (
  data
) => {
  const fields = [
    data.profileFor,
    data.firstName,
    data.lastName,
    data.gender,
    data.dateOfBirth,
    data.height,
    data.maritalStatus,
    data.profilePhoto,
    data.aboutMe,

    selectedSurname(
      data.surnameSelection,
      data.customSurname
    ),

    data.gotra,
    data.nativePlace,
    data.nativeDistrict,
    data.highestEducation,
    data.occupation,
    data.fatherName,
    data.motherName,
    data.maternalFamilySurname,
    data.maternalVillage,
    data.ageMin,
    data.ageMax
  ];

  const complete =
    fields.filter(
      Boolean
    ).length;

  return Math.round(
    (
      complete /
      fields.length
    ) *
      100
  );
};

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  multiline = false,
  placeholder = '',
  min,
  max
}) {
  return (
    <label
      className={
        multiline
          ? `${labelClass} col-span-full`
          : labelClass
      }
    >
      {label}

      {multiline ? (
        <textarea
          className={
            fieldClass
          }
          rows="3"
          value={
            value ??
            ''
          }
          placeholder={
            placeholder
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
        />
      ) : (
        <input
          className={
            fieldClass
          }
          type={type}
          value={
            value ??
            ''
          }
          placeholder={
            placeholder
          }
          min={min}
          max={max}
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select'
}) {
  return (
    <label
      className={
        labelClass
      }
    >
      {label}

      <select
        className={
          fieldClass
        }
        value={
          value ||
          ''
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
      >
        <option value="">
          {placeholder}
        </option>

        {options.map(
          (
            option
          ) => (
            <option
              key={
                option
              }
              value={
                option
              }
            >
              {option}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function SurnameField({
  label,
  selection,
  custom,
  onSelection,
  onCustom
}) {
  return (
    <>
      <SelectField
        label={label}
        value={
          selection
        }
        onChange={
          onSelection
        }
        options={
          RAJPUT_SURNAMES
        }
      />

      {selection ===
        'Other' && (
        <TextField
          label={`${label} - Other`}
          value={
            custom
          }
          onChange={
            onCustom
          }
          placeholder="Enter surname"
        />
      )}
    </>
  );
}

function MultiSelectDropdown({
  label,
  values = [],
  options,
  onChange,
  placeholder = 'Select options'
}) {
  const selected =
    Array.isArray(
      values
    )
      ? values
      : [];

  const toggle =
    (
      option
    ) => {
      if (
        selected.includes(
          option
        )
      ) {
        onChange(
          selected.filter(
            (
              item
            ) =>
              item !==
              option
          )
        );

        return;
      }

      onChange([
        ...selected,
        option
      ]);
    };

  return (
    <label
      className={
        labelClass
      }
    >
      {label}

      <details className="relative">
        <summary
          className={`${fieldClass} cursor-pointer list-none`}
        >
          {selected.length
            ? selected.join(
                ', '
              )
            : placeholder}
        </summary>

        <div className="absolute z-20 mt-1 max-h-[240px] w-full overflow-y-auto border border-[#ddd0c1] bg-[#fffdf8] p-3 shadow-lg">
          {options.map(
            (
              option
            ) => (
              <label
                key={
                  option
                }
                className="flex cursor-pointer items-center gap-3 border-b border-[#eee4d8] py-2 text-[12px] normal-case tracking-normal last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={
                    selected.includes(
                      option
                    )
                  }
                  onChange={() =>
                    toggle(
                      option
                    )
                  }
                />

                {option}
              </label>
            )
          )}
        </div>
      </details>
    </label>
  );
}

function MosalBranchFields({
  title,
  subtitle,
  value,
  onChange
}) {
  const branch =
    value ||
    emptyMosal();

  const updateBranch =
    (
      key,
      nextValue
    ) =>
      onChange({
        ...branch,

        [
          key
        ]:
          nextValue
      });

  return (
    <section className="mt-6 border border-[#ddd0c1] bg-[#fffdf8] p-5">
      <div className="mb-5">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#91683f]">
          Mosal
        </p>

        <h3 className="mt-1 font-['Cormorant_Garamond'] text-[27px] font-medium text-[#431318]">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-1 text-[10px] leading-5 text-[#756a60]">
            {subtitle}
          </p>
        )}
      </div>

      <div
        className={
          gridClass
        }
      >
        <TextField
          label="Family Surname"
          value={
            branch.familySurname
          }
          onChange={(
            nextValue
          ) =>
            updateBranch(
              'familySurname',
              nextValue
            )
          }
        />

        <TextField
          label="Native Village"
          value={
            branch.nativeVillage
          }
          onChange={(
            nextValue
          ) =>
            updateBranch(
              'nativeVillage',
              nextValue
            )
          }
        />

        <TextField
          label="District"
          value={
            branch.district
          }
          onChange={(
            nextValue
          ) =>
            updateBranch(
              'district',
              nextValue
            )
          }
        />

        <SelectField
          label="State"
          value={
            branch.state
          }
          onChange={(
            nextValue
          ) =>
            updateBranch(
              'state',
              nextValue
            )
          }
          options={
            INDIA_STATES
          }
        />
      </div>
    </section>
  );
}

export default function OnboardingPage() {
  const navigate =
    useNavigate();

  const notify =
    useToast();

  const {
    user
  } =
    useAuth();

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
    existing,
    setExisting
  ] =
    useState(
      false
    );

  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );

  const [
    busy,
    setBusy
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
    verified,
    setVerified
  ] =
    useState(
      !!user
        ?.phoneVerified
    );

  const [
    otp,
    setOtp
  ] =
    useState('');

  const [
    otpSent,
    setOtpSent
  ] =
    useState(
      false
    );

  const completion =
    useMemo(
      () =>
        localCompletion(
          data
        ),
      [
        data
      ]
    );

  const update = (
    key,
    value
  ) =>
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

  useEffect(
    () => {
      let active =
        true;

      Promise.allSettled([
        api(
          '/profiles/me?optional=true'
        ),

        api(
          '/preferences?optional=true'
        )
      ]).then(
        ([
          profileResult,
          preferenceResult
        ]) => {
          if (
            !active
          ) {
            return;
          }

          const profile =
            profileResult.status ===
              'fulfilled'
              ? profileResult
                  .value
                  .data
                  .profile
              : null;

          const preferences =
            preferenceResult.status ===
              'fulfilled'
              ? preferenceToForm(
                  preferenceResult
                    .value
                    .data
                    .preferences
                )
              : {};

          if (
            profile
          ) {
            localStorage.removeItem(
              'ksm_onboarding'
            );

            localStorage.removeItem(
              'ksm_onboarding_step'
            );

            setExisting(
              true
            );

            setData({
              ...flatten(
                profile
              ),

              ...preferences,

              phone:
                user?.phone ||
                ''
            });

            setStep(
              0
            );
          } else {
            const draft =
              readDraft();

            setData({
              workCountry:
                'India',

              preferredCountry:
                'India',

              manglik:
                'Unknown',

              includeAstrologyInBiodata:
                true,

              states:
                [],

              selfMosal:
                emptyMosal(),

              fathersMosal:
                emptyMosal(),

              mothersMosal:
                emptyMosal(),

              ...preferences,

              ...draft,

              phone:
                draft.phone ||
                user?.phone ||
                ''
            });

            setStep(
              readStep()
            );
          }

          setVerified(
            !!user
              ?.phoneVerified
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

  useEffect(
    () => {
      if (
        loading ||
        existing
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
      loading,
      existing
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

  const verifyOtp =
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
          'Mobile verified.'
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
      const validation =
        validateBasics(
          data
        );

      if (
        validation
      ) {
        throw new Error(
          validation
        );
      }

      const result =
        await api(
          existing
            ? '/profiles/me'
            : '/profiles',
          {
            method:
              existing
                ? 'PATCH'
                : 'POST',

            body:
              JSON.stringify(
                profilePayload(
                  data,
                  visibilityOverride
                )
              )
          }
        );

      const saved =
        result.data
          .profile;

      setExisting(
        true
      );

      if (
        saved
      ) {
        setData(
          (
            current
          ) => ({
            ...current,

            ...flatten(
              saved
            ),

            phone:
              current.phone ||
              user?.phone ||
              ''
          })
        );
      }

      localStorage.removeItem(
        'ksm_onboarding'
      );

      localStorage.removeItem(
        'ksm_onboarding_step'
      );

      return saved;
    };

  const saveAndExit =
    async () => {
      setBusy(
        true
      );

      setError('');

      try {
        await saveProfile();

        notify(
          'Profile saved.'
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

  const next =
    async () => {
      setError('');

      if (
        step === 0
      ) {
        const validation =
          validateBasics(
            data
          );

        if (
          validation
        ) {
          setError(
            validation
          );

          return;
        }

        if (
          !verified
        ) {
          setError(
            'Verify mobile number before continuing.'
          );

          return;
        }
      }

      if (
        step === 1
      ) {
        const surname =
          selectedSurname(
            data.surnameSelection,
            data.customSurname
          );

        if (
          !surname ||
          !data.gotra ||
          !data.nativePlace ||
          !data.nativeDistrict
        ) {
          setError(
            'Surname, Gotra, native village and native district are required.'
          );

          return;
        }
      }

      if (
        step === 2 &&
        !data.aboutMe
          ?.trim()
      ) {
        setError(
          'About Me is required.'
        );

        return;
      }

      if (
        step === 9
      ) {
        if (
          !data.profilePhoto
        ) {
          setStep(
            8
          );

          setError(
            'Profile photo is required before submission.'
          );

          return;
        }

        setBusy(
          true
        );

        try {
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

          await saveProfile(
            'pending_review'
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

      setBusy(
        true
      );

      try {
        await saveProfile();

        setStep(
          (
            current
          ) =>
            Math.min(
              9,
              current +
                1
            )
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

  const uploadProfilePhoto =
    async (
      file
    ) => {
      setBusy(
        true
      );

      try {
        await saveProfile();

        const form =
          new FormData();

        form.append(
          'photo',
          file
        );

        const result =
          await api(
            '/profiles/photo',
            {
              method:
                'POST',

              body:
                form
            }
          );

        update(
          'profilePhoto',
          result.data.path
        );

        notify(
          'Profile photo uploaded.'
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

  const uploadGalleryPhoto =
    async (
      file
    ) => {
      setBusy(
        true
      );

      try {
        const form =
          new FormData();

        form.append(
          'photo',
          file
        );

        const result =
          await api(
            '/profiles/gallery',
            {
              method:
                'POST',

              body:
                form
            }
          );

        update(
          'galleryAssets',
          result.data.gallery ||
          []
        );

        notify(
          'Additional photo uploaded.'
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

  const removeGallery =
    async (
      assetId
    ) => {
      setBusy(
        true
      );

      try {
        const result =
          await api(
            `/profiles/gallery/${assetId}`,
            {
              method:
                'DELETE'
            }
          );

        update(
          'galleryAssets',
          result.data.gallery ||
          []
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
    <div className="min-h-screen bg-[#fffdf8]">
      <header className="sticky top-0 z-30 border-b border-[#ddd0c1] bg-[#fffdf8]/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[920px] items-center justify-between gap-5">
          <button
            type="button"
            aria-label="Go back"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#ddd0c1]"
            onClick={() =>
              step > 0
                ? setStep(
                    (
                      current
                    ) =>
                      current - 1
                  )
                : navigate(
                    '/dashboard'
                  )
            }
          >
            <ArrowLeft
              size={
                17
              }
            />
          </button>

          <div className="flex-1">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.12em] text-[#756a60]">
              <span>
                Step{' '}
                {step + 1}{' '}
                of 10
              </span>

              <span>
                {completion}% complete
              </span>
            </div>

            <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#e9dfd3]">
              <div
                className="h-full bg-[#681d25] transition-all"
                style={{
                  width:
                    `${
                      Math.max(
                        (
                          step +
                          1
                        ) *
                          10,
                        completion
                      )
                    }%`
                }}
              />
            </div>
          </div>

          <button
            type="button"
            className={
              outlineButtonClass
            }
            disabled={
              busy
            }
            onClick={
              saveAndExit
            }
          >
            <Save
              size={
                15
              }
            />

            Save
          </button>
        </div>
      </header>

      <main className="mx-auto w-[min(780px,calc(100%_-_32px))] py-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#aa7a42]">
          {
            steps[
              step
            ][0]
          }
        </p>

        <h1 className="mt-3 font-['Cormorant_Garamond'] text-[clamp(40px,6vw,58px)] font-medium leading-none text-[#291a17]">
          {
            steps[
              step
            ][1]
          }
        </h1>

        {step === 0 && (
          <>
            <div
              className={
                sectionClass
              }
            >
              <div
                className={
                  gridClass
                }
              >
                <SelectField
                  label="Profile created for"
                  value={
                    data.profileFor
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'profileFor',
                      value
                    )
                  }
                  options={[
                    'Self',
                    'Son',
                    'Daughter',
                    'Brother',
                    'Sister',
                    'Relative'
                  ]}
                />

                <SelectField
                  label="Gender"
                  value={
                    data.gender
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'gender',
                      value
                    )
                  }
                  options={[
                    'Male',
                    'Female'
                  ]}
                />

                <TextField
                  label="First name"
                  value={
                    data.firstName
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'firstName',
                      value
                    )
                  }
                />

                <TextField
                  label="Middle name"
                  value={
                    data.middleName
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'middleName',
                      value
                    )
                  }
                />

                <TextField
                  label="Surname"
                  value={
                    data.lastName
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'lastName',
                      value
                    )
                  }
                />

                <TextField
                  label="Date of birth"
                  type="date"
                  value={
                    data.dateOfBirth
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'dateOfBirth',
                      value
                    )
                  }
                />

                <TextField
                  label="Height in cm"
                  type="number"
                  min="100"
                  max="250"
                  value={
                    data.height
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'height',
                      value
                    )
                  }
                />

                <SelectField
                  label="Marital status"
                  value={
                    data.maritalStatus
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'maritalStatus',
                      value
                    )
                  }
                  options={
                    MARITAL_STATUS_OPTIONS
                  }
                />
              </div>
            </div>

            {data.maritalStatus &&
              data.maritalStatus !==
                'Never Married' && (
                <div
                  className={
                    sensitiveClass
                  }
                >
                  <p className="mb-5 flex items-center gap-2 text-[11px] font-bold text-[#681d25]">
                    <LockKeyhole
                      size={
                        15
                      }
                    />

                    Private marital context
                  </p>

                  <div
                    className={
                      gridClass
                    }
                  >
                    <TextField
                      label="Previous marriage ended"
                      type="date"
                      value={
                        data.previousMarriageEndedAt
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          'previousMarriageEndedAt',
                          value
                        )
                      }
                    />

                    {data.maritalStatus ===
                      'Divorced' && (
                      <label className="flex items-center gap-3 text-[12px]">
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
                              event.target
                                .checked
                            )
                          }
                        />

                        Divorce finalized
                      </label>
                    )}

                    <label className="flex items-center gap-3 text-[12px]">
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
                            event.target
                              .checked
                          )
                        }
                      />

                      Children from previous marriage
                    </label>

                    {data.childrenFromPreviousMarriage && (
                      <>
                        <TextField
                          label="Number of children"
                          type="number"
                          min="0"
                          max="20"
                          value={
                            data.childrenCount
                          }
                          onChange={(
                            value
                          ) =>
                            update(
                              'childrenCount',
                              value
                            )
                          }
                        />

                        <TextField
                          label="Children living with"
                          value={
                            data.childrenLivingWith
                          }
                          onChange={(
                            value
                          ) =>
                            update(
                              'childrenLivingWith',
                              value
                            )
                          }
                        />
                      </>
                    )}

                    <TextField
                      label="Additional notes"
                      multiline
                      value={
                        data.maritalHistoryNotes
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          'maritalHistoryNotes',
                          value
                        )
                      }
                    />
                  </div>
                </div>
              )}

            <div
              className={
                sectionClass
              }
            >
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#681d25]">
                Mobile verification
              </p>

              <TextField
                label="Mobile number"
                value={
                  data.phone
                }
                onChange={(
                  value
                ) =>
                  update(
                    'phone',
                    value
                  )
                }
              />

              {verified ? (
                <p className="mt-4 text-[11px] font-bold text-[#45643f]">
                  ✓ Mobile verified
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={
                      busy
                    }
                    className={`${outlineButtonClass} mt-4`}
                    onClick={
                      sendOtp
                    }
                  >
                    Send verification code
                  </button>

                  {otpSent && (
                    <div className="mt-4 flex items-end gap-3">
                      <TextField
                        label="OTP"
                        value={
                          otp
                        }
                        onChange={
                          setOtp
                        }
                      />

                      <button
                        type="button"
                        className={
                          primaryButtonClass
                        }
                        onClick={
                          verifyOtp
                        }
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="mt-7 border border-[#c49b70] bg-[#c49b7010] p-5">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#91683f]">
                Dedicated Community
              </p>

              <h2 className="mt-2 font-['Cormorant_Garamond'] text-[28px] font-medium text-[#431318]">
                Rajput / Darbar / Kshatriya Samaj
              </h2>

              <p className="mt-2 text-[11px] leading-6 text-[#756a60]">
                Religion, caste and Sub-Samaj are not asked because this platform is built exclusively for the community.
              </p>
            </div>

            <div
              className={
                sectionClass
              }
            >
              <div
                className={
                  gridClass
                }
              >
                <SurnameField
                  label="Surname"
                  selection={
                    data.surnameSelection
                  }
                  custom={
                    data.customSurname
                  }
                  onSelection={(
                    value
                  ) =>
                    update(
                      'surnameSelection',
                      value
                    )
                  }
                  onCustom={(
                    value
                  ) =>
                    update(
                      'customSurname',
                      value
                    )
                  }
                />

                <TextField
                  label="Gotra"
                  value={
                    data.gotra
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'gotra',
                      value
                    )
                  }
                />

                <SelectField
                  label="Kul / Vansh"
                  value={
                    data.vansh
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'vansh',
                      value
                    )
                  }
                  options={
                    VANSH_OPTIONS
                  }
                />

                <TextField
                  label="Kuldevi"
                  value={
                    data.kulaDevi
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'kulaDevi',
                      value
                    )
                  }
                />

                <TextField
                  label="Kuldevta"
                  value={
                    data.kulDevta
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'kulDevta',
                      value
                    )
                  }
                />

                <TextField
                  label="Native village / Vatan"
                  value={
                    data.nativePlace
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'nativePlace',
                      value
                    )
                  }
                />

                <TextField
                  label="Native Taluka"
                  value={
                    data.nativeTaluka
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'nativeTaluka',
                      value
                    )
                  }
                />

                <TextField
                  label="Native District"
                  value={
                    data.nativeDistrict
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'nativeDistrict',
                      value
                    )
                  }
                />

                <SelectField
                  label="Native State"
                  value={
                    data.nativeState
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'nativeState',
                      value
                    )
                  }
                  options={
                    INDIA_STATES
                  }
                />

                <TextField
                  label="Family Introduction"
                  multiline
                  placeholder="Briefly introduce your family, background, values and connection with the Samaj."
                  value={
                    data.familyOrigin
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'familyOrigin',
                      value
                    )
                  }
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div
            className={
              sectionClass
            }
          >
            <div
              className={
                gridClass
              }
            >
              <TextField
                label="Birth Time"
                type="time"
                value={
                  data.timeOfBirth
                }
                onChange={(
                  value
                ) =>
                  update(
                    'timeOfBirth',
                    value
                  )
                }
              />

              <TextField
                label="Birth Place"
                value={
                  data.birthCity
                }
                onChange={(
                  value
                ) =>
                  update(
                    'birthCity',
                    value
                  )
                }
              />

              <TextField
                label="Birth District"
                value={
                  data.birthDistrict
                }
                onChange={(
                  value
                ) =>
                  update(
                    'birthDistrict',
                    value
                  )
                }
              />

              <SelectField
                label="Birth State"
                value={
                  data.birthState
                }
                onChange={(
                  value
                ) =>
                  update(
                    'birthState',
                    value
                  )
                }
                options={
                  INDIA_STATES
                }
              />

              <SelectField
                label="Blood Group"
                value={
                  data.bloodGroup
                }
                onChange={(
                  value
                ) =>
                  update(
                    'bloodGroup',
                    value
                  )
                }
                options={
                  BLOOD_GROUP_OPTIONS
                }
              />

              <SelectField
                label="Diet"
                value={
                  data.diet
                }
                onChange={(
                  value
                ) =>
                  update(
                    'diet',
                    value
                  )
                }
                options={
                  DIET_OPTIONS
                }
              />

              <SelectField
                label="Smoking"
                value={
                  data.smoking
                }
                onChange={(
                  value
                ) =>
                  update(
                    'smoking',
                    value
                  )
                }
                options={
                  SMOKING_OPTIONS
                }
              />

              <SelectField
                label="Drinking"
                value={
                  data.drinking
                }
                onChange={(
                  value
                ) =>
                  update(
                    'drinking',
                    value
                  )
                }
                options={
                  DRINKING_OPTIONS
                }
              />

              <TextField
                label="Hobbies / Interests"
                value={
                  data.interests
                }
                placeholder="Travel, reading, sports..."
                onChange={(
                  value
                ) =>
                  update(
                    'interests',
                    value
                  )
                }
              />

              <TextField
                label="About Me"
                multiline
                value={
                  data.aboutMe
                }
                onChange={(
                  value
                ) =>
                  update(
                    'aboutMe',
                    value
                  )
                }
              />

              <TextField
                label="Current City"
                value={
                  data.city
                }
                onChange={(
                  value
                ) =>
                  update(
                    'city',
                    value
                  )
                }
              />

              <TextField
                label="Current District"
                value={
                  data.district
                }
                onChange={(
                  value
                ) =>
                  update(
                    'district',
                    value
                  )
                }
              />

              <SelectField
                label="Current State"
                value={
                  data.state
                }
                onChange={(
                  value
                ) =>
                  update(
                    'state',
                    value
                  )
                }
                options={
                  INDIA_STATES
                }
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div
            className={
              sectionClass
            }
          >
            <div
              className={
                gridClass
              }
            >
              <TextField
                label="Highest Education"
                value={
                  data.highestEducation
                }
                onChange={(
                  value
                ) =>
                  update(
                    'highestEducation',
                    value
                  )
                }
              />

              <TextField
                label="Degree"
                value={
                  data.degree
                }
                onChange={(
                  value
                ) =>
                  update(
                    'degree',
                    value
                  )
                }
              />

              <TextField
                label="Specialization"
                value={
                  data.specialization
                }
                onChange={(
                  value
                ) =>
                  update(
                    'specialization',
                    value
                  )
                }
              />

              <TextField
                label="College"
                value={
                  data.college
                }
                onChange={(
                  value
                ) =>
                  update(
                    'college',
                    value
                  )
                }
              />

              <TextField
                label="University"
                value={
                  data.university
                }
                onChange={(
                  value
                ) =>
                  update(
                    'university',
                    value
                  )
                }
              />

              <TextField
                label="Education Details"
                multiline
                value={
                  data.educationDetails
                }
                onChange={(
                  value
                ) =>
                  update(
                    'educationDetails',
                    value
                  )
                }
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div
            className={
              sectionClass
            }
          >
            <div
              className={
                gridClass
              }
            >
              <SelectField
                label="Employment Type"
                value={
                  data.occupationType
                }
                onChange={(
                  value
                ) =>
                  update(
                    'occupationType',
                    value
                  )
                }
                options={
                  EMPLOYMENT_TYPES
                }
              />

              <TextField
                label="Profession / Occupation"
                value={
                  data.occupation
                }
                onChange={(
                  value
                ) =>
                  update(
                    'occupation',
                    value
                  )
                }
              />

              <TextField
                label="Company / Organization"
                value={
                  data.companyName
                }
                onChange={(
                  value
                ) =>
                  update(
                    'companyName',
                    value
                  )
                }
              />

              <TextField
                label="Designation"
                value={
                  data.designation
                }
                onChange={(
                  value
                ) =>
                  update(
                    'designation',
                    value
                  )
                }
              />

              <TextField
                label="Business Name"
                value={
                  data.businessName
                }
                onChange={(
                  value
                ) =>
                  update(
                    'businessName',
                    value
                  )
                }
              />

              <TextField
                label="Annual Income"
                type="number"
                min="0"
                value={
                  data.annualIncome
                }
                onChange={(
                  value
                ) =>
                  update(
                    'annualIncome',
                    value
                  )
                }
              />

              <SelectField
                label="Income visibility"
                value={
                  data.incomeVisibility ||
                  'Private'
                }
                onChange={(
                  value
                ) =>
                  update(
                    'incomeVisibility',
                    value
                  )
                }
                options={[
                  'Everyone',
                  'RegisteredMembers',
                  'AcceptedInterests',
                  'Private'
                ]}
              />

              <TextField
                label="Work City"
                value={
                  data.workCity
                }
                onChange={(
                  value
                ) =>
                  update(
                    'workCity',
                    value
                  )
                }
              />

              <SelectField
                label="Work State"
                value={
                  data.workState
                }
                onChange={(
                  value
                ) =>
                  update(
                    'workState',
                    value
                  )
                }
                options={
                  INDIA_STATES
                }
              />

              <TextField
                label="Work Country"
                value={
                  data.workCountry
                }
                onChange={(
                  value
                ) =>
                  update(
                    'workCountry',
                    value
                  )
                }
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div
            className={
              sectionClass
            }
          >
            <div
              className={
                gridClass
              }
            >
              <TextField
                label="Father's Name"
                value={
                  data.fatherName
                }
                onChange={(
                  value
                ) =>
                  update(
                    'fatherName',
                    value
                  )
                }
              />

              <TextField
                label="Father's Occupation"
                value={
                  data.fatherOccupation
                }
                onChange={(
                  value
                ) =>
                  update(
                    'fatherOccupation',
                    value
                  )
                }
              />

              <TextField
                label="Mother's Name"
                value={
                  data.motherName
                }
                onChange={(
                  value
                ) =>
                  update(
                    'motherName',
                    value
                  )
                }
              />

              <TextField
                label="Mother's Occupation"
                value={
                  data.motherOccupation
                }
                onChange={(
                  value
                ) =>
                  update(
                    'motherOccupation',
                    value
                  )
                }
              />

              <SelectField
                label="Family Type"
                value={
                  data.familyType
                }
                onChange={(
                  value
                ) =>
                  update(
                    'familyType',
                    value
                  )
                }
                options={
                  FAMILY_TYPES
                }
              />

              <SelectField
                label="Family Values"
                value={
                  data.familyValues
                }
                onChange={(
                  value
                ) =>
                  update(
                    'familyValues',
                    value
                  )
                }
                options={
                  FAMILY_VALUES
                }
              />

              <SelectField
                label="Family Residence"
                value={
                  data.familyLocation
                }
                onChange={(
                  value
                ) =>
                  update(
                    'familyLocation',
                    value
                  )
                }
                options={
                  INDIA_STATES
                }
                placeholder="Select state"
              />

              <TextField
                label="Family Details"
                multiline
                value={
                  data.familyDescription
                }
                onChange={(
                  value
                ) =>
                  update(
                    'familyDescription',
                    value
                  )
                }
              />
            </div>

            <div className="mt-6 border-t border-[#ddd0c1] pt-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-['Cormorant_Garamond'] text-[27px] font-medium">
                    Brothers & Sisters
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-[#756a60]">
                    Married siblings can include their life partner and Sasariyu details.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    outlineButtonClass
                  }
                  onClick={() =>
                    update(
                      'siblingDetails',
                      [
                        ...(
                          data.siblingDetails ||
                          []
                        ),

                        {
                          relation:
                            'Brother',

                          maritalStatus:
                            'Unmarried',

                          name:
                            '',

                          education:
                            '',

                          occupation:
                            '',

                          spouseName:
                            '',

                          spouseFamilySurname:
                            '',

                          spouseVillage:
                            ''
                        }
                      ]
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
                ) => {
                  const updateSibling =
                    (
                      key,
                      value
                    ) => {
                      const next =
                        [
                          ...data.siblingDetails
                        ];

                      next[
                        index
                      ] = {
                        ...next[
                          index
                        ],

                        [
                          key
                        ]:
                          value
                      };

                      update(
                        'siblingDetails',
                        next
                      );
                    };

                  return (
                    <div
                      className="relative mt-4 border border-[#ddd0c1] p-4"
                      key={
                        index
                      }
                    >
                      <div
                        className={
                          gridClass
                        }
                      >
                        <SelectField
                          label="Relation"
                          value={
                            sibling.relation
                          }
                          options={[
                            'Brother',
                            'Sister'
                          ]}
                          onChange={(
                            value
                          ) =>
                            updateSibling(
                              'relation',
                              value
                            )
                          }
                        />

                        <TextField
                          label="Name"
                          value={
                            sibling.name
                          }
                          onChange={(
                            value
                          ) =>
                            updateSibling(
                              'name',
                              value
                            )
                          }
                        />

                        <TextField
                          label="Education"
                          value={
                            sibling.education
                          }
                          onChange={(
                            value
                          ) =>
                            updateSibling(
                              'education',
                              value
                            )
                          }
                        />

                        <TextField
                          label="Occupation"
                          value={
                            sibling.occupation
                          }
                          onChange={(
                            value
                          ) =>
                            updateSibling(
                              'occupation',
                              value
                            )
                          }
                        />

                        <SelectField
                          label="Marital Status"
                          value={
                            sibling.maritalStatus
                          }
                          options={[
                            'Unmarried',
                            'Married'
                          ]}
                          onChange={(
                            value
                          ) =>
                            updateSibling(
                              'maritalStatus',
                              value
                            )
                          }
                        />
                      </div>

                      {sibling.maritalStatus ===
                        'Married' && (
                        <div className="mt-5 border-t border-[#ddd0c1] pt-5">
                          <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#91683f]">
                            Marriage Details
                          </p>

                          <div
                            className={
                              gridClass
                            }
                          >
                            <TextField
                              label="Life Partner Name"
                              value={
                                sibling.spouseName
                              }
                              onChange={(
                                value
                              ) =>
                                updateSibling(
                                  'spouseName',
                                  value
                                )
                              }
                            />

                            <TextField
                              label="Life Partner Surname"
                              value={
                                sibling.spouseFamilySurname
                              }
                              onChange={(
                                value
                              ) =>
                                updateSibling(
                                  'spouseFamilySurname',
                                  value
                                )
                              }
                            />

                            <TextField
                              label="Sasariyu / Village"
                              value={
                                sibling.spouseVillage ||
                                sibling.spouseNativePlace
                              }
                              onChange={(
                                value
                              ) => {
                                const next =
                                  [
                                    ...data.siblingDetails
                                  ];

                                next[
                                  index
                                ] = {
                                  ...next[
                                    index
                                  ],

                                  spouseVillage:
                                    value,

                                  spouseNativePlace:
                                    value
                                };

                                update(
                                  'siblingDetails',
                                  next
                                );
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        aria-label={`Remove ${sibling.relation || 'sibling'}`}
                        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-[#ddd0c1]"
                        onClick={() =>
                          update(
                            'siblingDetails',
                            data.siblingDetails.filter(
                              (
                                _,
                                itemIndex
                              ) =>
                                itemIndex !==
                                index
                            )
                          )
                        }
                      >
                        <Trash2
                          size={
                            14
                          }
                        />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {step === 6 && (
          <>
            <div
              className={
                sectionClass
              }
            >
              <div className="mb-5">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#91683f]">
                  Mother's Family
                </p>

                <h2 className="mt-1 font-['Cormorant_Garamond'] text-[29px] font-medium text-[#431318]">
                  Main Mosal Details
                </h2>
              </div>

              <div
                className={
                  gridClass
                }
              >
                <TextField
                  label="Maternal Grandfather's Name"
                  value={
                    data.maternalGrandfatherName
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'maternalGrandfatherName',
                      value
                    )
                  }
                />

                <TextField
                  label="Maternal Family Surname"
                  value={
                    data.maternalFamilySurname
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'maternalFamilySurname',
                      value
                    )
                  }
                />

                <SurnameField
                  label="Maternal Surname / Shakh"
                  selection={
                    data.maternalSurnameSelection
                  }
                  custom={
                    data.maternalCustomSurname
                  }
                  onSelection={(
                    value
                  ) =>
                    update(
                      'maternalSurnameSelection',
                      value
                    )
                  }
                  onCustom={(
                    value
                  ) =>
                    update(
                      'maternalCustomSurname',
                      value
                    )
                  }
                />

                <TextField
                  label="Maternal Gotra"
                  value={
                    data.maternalGotra
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'maternalGotra',
                      value
                    )
                  }
                />

                <TextField
                  label="Maternal Native Village"
                  value={
                    data.maternalVillage
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'maternalVillage',
                      value
                    )
                  }
                />

                <TextField
                  label="Maternal Taluka"
                  value={
                    data.maternalTaluka
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'maternalTaluka',
                      value
                    )
                  }
                />

                <TextField
                  label="Maternal District"
                  value={
                    data.maternalDistrict
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'maternalDistrict',
                      value
                    )
                  }
                />

                <SelectField
                  label="Maternal State"
                  value={
                    data.maternalState
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'maternalState',
                      value
                    )
                  }
                  options={
                    INDIA_STATES
                  }
                />
              </div>
            </div>

            <MosalBranchFields
              title="Father's Mosal"
              subtitle="Your father's maternal family details."
              value={
                data.fathersMosal
              }
              onChange={(
                value
              ) =>
                update(
                  'fathersMosal',
                  value
                )
              }
            />

            <MosalBranchFields
              title="Mother's Mosal"
              subtitle="Your mother's maternal family details."
              value={
                data.mothersMosal
              }
              onChange={(
                value
              ) =>
                update(
                  'mothersMosal',
                  value
                )
              }
            />
          </>
        )}

        {step === 7 && (
          <div
            className={
              sectionClass
            }
          >
            <p className="mb-5 text-[11px] leading-6 text-[#756a60]">
              Horoscope details are optional.
            </p>

            <div
              className={
                gridClass
              }
            >
              <SelectField
                label="Rashi"
                value={
                  data.rashi
                }
                onChange={(
                  value
                ) =>
                  update(
                    'rashi',
                    value
                  )
                }
                options={
                  RASHI_OPTIONS
                }
              />

              <SelectField
                label="Nakshatra"
                value={
                  data.nakshatra
                }
                onChange={(
                  value
                ) =>
                  update(
                    'nakshatra',
                    value
                  )
                }
                options={
                  NAKSHATRA_OPTIONS
                }
              />

              <SelectField
                label="Manglik"
                value={
                  data.manglik ||
                  'Unknown'
                }
                onChange={(
                  value
                ) =>
                  update(
                    'manglik',
                    value
                  )
                }
                options={
                  MANGLIK_OPTIONS
                }
              />
            </div>
          </div>
        )}

        {step === 8 && (
          <>
            <div
              className={
                sectionClass
              }
            >
              <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                Profile Photo
              </h2>

              {data.profilePhoto && (
                <img
                  className="my-5 h-[190px] w-[150px] rounded-t-[75px] object-cover"
                  src={assetUrl(
                    data.profilePhoto
                  )}
                  alt="Profile"
                />
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={
                  busy
                }
                onChange={(
                  event
                ) => {
                  const file =
                    event.target
                      .files?.[0];

                  if (
                    file
                  ) {
                    uploadProfilePhoto(
                      file
                    );
                  }
                }}
              />
            </div>

            <div
              className={
                sectionClass
              }
            >
              <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                Additional Photos
              </h2>

              <div className="mt-5 grid grid-cols-3 gap-3 max-[600px]:grid-cols-2">
                {(data.galleryAssets ||
                  []).map(
                  (
                    asset
                  ) => (
                    <div
                      className="relative"
                      key={
                        asset._id
                      }
                    >
                      <img
                        src={assetUrl(
                          asset.url
                        )}
                        className="h-[150px] w-full object-cover"
                        alt=""
                      />

                      <button
                        type="button"
                        aria-label="Remove gallery photo"
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white"
                        onClick={() =>
                          removeGallery(
                            asset._id
                          )
                        }
                      >
                        <Trash2
                          size={
                            13
                          }
                        />
                      </button>
                    </div>
                  )
                )}
              </div>

              <input
                className="mt-4"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={
                  busy
                }
                onChange={(
                  event
                ) => {
                  const file =
                    event.target
                      .files?.[0];

                  if (
                    file
                  ) {
                    uploadGalleryPhoto(
                      file
                    );
                  }
                }}
              />
            </div>

            <div
              className={
                sectionClass
              }
            >
              <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium">
                Biodata Privacy
              </h2>

              <div className="mt-5 grid gap-4 text-[12px]">
                {[
                  [
                    'includeSensitiveFamilyDetailsInBiodata',
                    'Include detailed family / Mosal information'
                  ],

                  [
                    'includeAstrologyInBiodata',
                    'Include horoscope information'
                  ],

                  [
                    'includeContactDetailsInBiodata',
                    'Include contact details'
                  ],

                  [
                    'includeAssetsInBiodata',
                    'Include family assets'
                  ]
                ].map(
                  ([
                    key,
                    label
                  ]) => (
                    <label
                      key={
                        key
                      }
                      className="flex items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={
                          !!data[
                            key
                          ]
                        }
                        onChange={(
                          event
                        ) =>
                          update(
                            key,
                            event.target
                              .checked
                          )
                        }
                      />

                      {label}
                    </label>
                  )
                )}
              </div>
            </div>
          </>
        )}

        {step === 9 && (
          <>
            <div
              className={
                sectionClass
              }
            >
              <div
                className={
                  gridClass
                }
              >
                <TextField
                  label="Minimum Age"
                  type="number"
                  value={
                    data.ageMin
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'ageMin',
                      value
                    )
                  }
                />

                <TextField
                  label="Maximum Age"
                  type="number"
                  value={
                    data.ageMax
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'ageMax',
                      value
                    )
                  }
                />

                <TextField
                  label="Minimum Height"
                  type="number"
                  value={
                    data.heightMin
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'heightMin',
                      value
                    )
                  }
                />

                <TextField
                  label="Maximum Height"
                  type="number"
                  value={
                    data.heightMax
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'heightMax',
                      value
                    )
                  }
                />

                <SelectField
                  label="Preferred Shakh"
                  value={
                    data.preferredShakh
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'preferredShakh',
                      value
                    )
                  }
                  options={
                    PREFERRED_SHAKHS
                  }
                  placeholder="Select preferred Shakh"
                />

                <TextField
                  label="Preferred Education"
                  value={
                    data.educationPreferences
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'educationPreferences',
                      value
                    )
                  }
                />

                <TextField
                  label="Preferred Profession"
                  value={
                    data.occupationPreferences
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'occupationPreferences',
                      value
                    )
                  }
                />

                <TextField
                  label="Preferred Location"
                  value={
                    data.locations
                  }
                  placeholder="City or region"
                  onChange={(
                    value
                  ) =>
                    update(
                      'locations',
                      value
                    )
                  }
                />

                <MultiSelectDropdown
                  label="Preferred States"
                  values={
                    data.states ||
                    []
                  }
                  onChange={(
                    values
                  ) =>
                    update(
                      'states',
                      values
                    )
                  }
                  options={
                    INDIA_STATES
                  }
                  placeholder="Select one or more states"
                />

                <SelectField
                  label="Preferred Country"
                  value={
                    data.preferredCountry
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'preferredCountry',
                      value
                    )
                  }
                  options={
                    COUNTRY_OPTIONS
                  }
                />

                <SelectField
                  label="Preferred Marital Status"
                  value={
                    data.preferredMaritalStatus
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'preferredMaritalStatus',
                      value
                    )
                  }
                  options={
                    MARITAL_STATUS_OPTIONS
                  }
                />

                <SelectField
                  label="Diet Preference"
                  value={
                    data.preferredDiet
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'preferredDiet',
                      value
                    )
                  }
                  options={
                    DIET_OPTIONS
                  }
                />

                <TextField
                  label="Other Expectations"
                  multiline
                  value={
                    data.additionalPreferences
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'additionalPreferences',
                      value
                    )
                  }
                />
              </div>
            </div>

            <div className="mt-6 border border-[#c49b70] bg-[#c49b7010] p-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#91683f]">
                Profile completion
              </p>

              <p className="mt-2 font-['Cormorant_Garamond'] text-[40px] font-medium text-[#681d25]">
                {completion}% Complete
              </p>

              <p className="mt-2 text-[11px] leading-6 text-[#756a60]">
                You can update optional details later from Edit Profile.
              </p>
            </div>
          </>
        )}

        {error && (
          <p className="mt-5 border border-[#d6a0a5] bg-[#f8e9e8] px-4 py-3 text-[12px] text-[#8b1e26]">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={
            busy
          }
          onClick={
            next
          }
          className={`${primaryButtonClass} mt-8 min-w-[190px]`}
        >
          {busy
            ? 'Saving…'
            : step === 9
              ? 'Submit for review'
              : 'Save & continue'}

          <ArrowRight
            size={
              15
            }
          />
        </button>
      </main>
    </div>
  );
}