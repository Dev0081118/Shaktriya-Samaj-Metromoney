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
    'Personal details',
    'Tell us the essential details'
  ],

  [
    'Rajput heritage',
    'Share lineage, Vatan and community'
  ],

  [
    'Education & career',
    'Study and professional journey'
  ],

  [
    'Family',
    'Introduce the family and lineage'
  ],

  [
    'Lifestyle & contact',
    'Complete lifestyle, astrology and contact details'
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

const sectionClass =
  'mt-7 border border-[#ddd0c1] bg-[#fffdf8] p-5';

const sensitivePanelClass =
  'mt-5 border border-[#741f272e] bg-[#741f2709] p-5';

const sectionTitleClass =
  "font-['Cormorant_Garamond'] text-[28px] font-medium text-[#291a17]";

const sectionDescriptionClass =
  'mt-1 text-[11px] leading-6 text-[#756a60]';

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
    value < 0 ||
    value > 9
  ) {
    return 0;
  }

  return value;
};

const list = (
  value
) =>
  String(
    value ||
      ''
  )
    .split(',')
    .map(
      (item) =>
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
) => ({
  ...profile,

  city:
    profile.location
      ?.city ||
    '',

  taluka:
    profile.location
      ?.taluka ||
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

  birthCountry:
    profile.birthDetails
      ?.country ||
    'India',

  bloodGroup:
    profile.bloodGroup ||
    '',

  complexion:
    profile.complexion ||
    '',

  religion:
    profile.community
      ?.religion ||
    'Hinduism',

  caste:
    profile.community
      ?.caste ||
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

  ishtaDevta:
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

  ancestralVillage:
    profile.paternalFamily
      ?.ancestralVillage ||
    '',

  paternalNativePlace:
    profile.paternalFamily
      ?.nativePlace ||
    '',

  paternalTaluka:
    profile.paternalFamily
      ?.taluka ||
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

  paternalGotra:
    profile.paternalFamily
      ?.gotra ||
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

  maternalClan:
    profile.maternalFamily
      ?.maternalClan ||
    '',

  maternalNotes:
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

  currentAddressLine1:
    profile.contactDetails
      ?.currentAddress
      ?.addressLine1 ||
    '',

  currentAddressLine2:
    profile.contactDetails
      ?.currentAddress
      ?.addressLine2 ||
    '',

  currentAddressCity:
    profile.contactDetails
      ?.currentAddress
      ?.city ||
    '',

  currentAddressTaluka:
    profile.contactDetails
      ?.currentAddress
      ?.taluka ||
    '',

  currentAddressDistrict:
    profile.contactDetails
      ?.currentAddress
      ?.district ||
    '',

  currentAddressState:
    profile.contactDetails
      ?.currentAddress
      ?.state ||
    '',

  currentAddressPincode:
    profile.contactDetails
      ?.currentAddress
      ?.pincode ||
    '',

  currentAddressCountry:
    profile.contactDetails
      ?.currentAddress
      ?.country ||
    'India',

  guardianName:
    profile.contactDetails
      ?.guardianName ||
    '',

  guardianRelation:
    profile.contactDetails
      ?.guardianRelation ||
    '',

  guardianPhone:
    profile.contactDetails
      ?.guardianPhone ||
    '',

  selfPhone:
    profile.contactDetails
      ?.selfPhone ||
    '',

  contactEmail:
    profile.contactDetails
      ?.email ||
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

  astrologyVisibility:
    profile.privacy
      ?.astrologyVisibility ||
    'RegisteredMembers',

  contactAddressVisibility:
    profile.privacy
      ?.contactAddressVisibility ||
    'Private',

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

  includeContactDetailsInBiodata:
    !!profile.biodataPrivacy
      ?.includeContactDetailsInBiodata,

  includeAstrologyInBiodata:
    profile.biodataPrivacy
      ?.includeAstrologyInBiodata ??
    true,

  includeAssetsInBiodata:
    !!profile.biodataPrivacy
      ?.includeAssetsInBiodata,

  dateOfBirth:
    profile.dateOfBirth
      ?.slice?.(
        0,
        10
      ) ||
    ''
});

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

  bloodGroup:
    data.bloodGroup,

  complexion:
    data.complexion,

  maritalStatus:
    data.maritalStatus,

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
      data.birthCountry ||
      'India'
  },

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

    taluka:
      data.taluka,

    district:
      data.district,

    state:
      data.state,

    country:
      data.country ||
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
    religion:
      data.religion ||
      'Hinduism',

    caste:
      data.caste,

    name:
      data.communityName,

    subCommunity:
      data.subCommunity,

    clan:
      data.clan,

    gotra:
      data.gotra,

    vansh:
      data.vansh,

    kulaDevi:
      data.kulaDevi,

    ishtaDevta:
      data.ishtaDevta,

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

    workLocation: {
      city:
        data.workCity,

      state:
        data.workState,

      country:
        data.workCountry ||
        'India'
    },

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

    taluka:
      data.paternalTaluka,

    district:
      data.paternalDistrict,

    state:
      data.paternalState,

    familySurname:
      data.paternalFamilySurname,

    clan:
      data.paternalClan,

    gotra:
      data.paternalGotra,

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

    maternalTaluka:
      data.maternalTaluka,

    maternalDistrict:
      data.maternalDistrict,

    maternalState:
      data.maternalState,

    maternalClan:
      data.maternalClan,

    notes:
      data.maternalNotes
  },

  maternalLineage: {
    selfMosal: {
      ...(data.selfMosal ||
        emptyMosal())
    },

    fathersMosal: {
      ...(data.fathersMosal ||
        emptyMosal())
    },

    mothersMosal: {
      ...(data.mothersMosal ||
        emptyMosal())
    }
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

  contactDetails: {
    currentAddress: {
      addressLine1:
        data.currentAddressLine1,

      addressLine2:
        data.currentAddressLine2,

      city:
        data.currentAddressCity,

      taluka:
        data.currentAddressTaluka,

      district:
        data.currentAddressDistrict,

      state:
        data.currentAddressState,

      pincode:
        data.currentAddressPincode,

      country:
        data.currentAddressCountry ||
        'India'
    },

    guardianName:
      data.guardianName,

    guardianRelation:
      data.guardianRelation,

    guardianPhone:
      data.guardianPhone,

    selfPhone:
      data.selfPhone,

    email:
      data.contactEmail
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

    astrologyVisibility:
      data.astrologyVisibility ||
      'RegisteredMembers',

    contactAddressVisibility:
      data.contactAddressVisibility ||
      'Private',

    fullNameVisibility:
      data.fullNameVisibility ||
      'RegisteredMembers'
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

  marriageTimeline:
    data.marriageTimeline,

  aboutMe:
    data.aboutMe,

  profilePhoto:
    data.profilePhoto,

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
    age < 18 ||
    age > 80
    ? 'Age must be between 18 and 80 years.'
    : '';
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
          ? `${labelClass} col-span-full max-[767px]:col-span-1`
          : labelClass
      }
    >
      {label}

      {multiline ? (
        <textarea
          className={fieldClass}
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
          className={fieldClass}
          type={type}
          min={min}
          max={max}
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
        className={fieldClass}
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
          (option) => (
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

function SectionHeader({
  title,
  description
}) {
  return (
    <div className="mb-5">
      <h3
        className={
          sectionTitleClass
        }
      >
        {title}
      </h3>

      {description && (
        <p
          className={
            sectionDescriptionClass
          }
        >
          {description}
        </p>
      )}
    </div>
  );
}

function MosalSection({
  title,
  description,
  value,
  onChange,
  showMama = false,
  showGrandmother = false
}) {
  const update =
    (
      key,
      fieldValue
    ) => {
      onChange({
        ...(value ||
          emptyMosal()),

        [
          key
        ]:
          fieldValue
      });
    };

  return (
    <div
      className={
        sensitivePanelClass
      }
    >
      <SectionHeader
        title={title}
        description={
          description
        }
      />

      <div
        className={
          fieldsGridClass
        }
      >
        {showMama && (
          <TextField
            label="Mama name"
            value={
              value?.mamaName
            }
            onChange={(
              fieldValue
            ) =>
              update(
                'mamaName',
                fieldValue
              )
            }
          />
        )}

        {showGrandmother && (
          <TextField
            label="Grandmother name"
            value={
              value?.grandmotherName
            }
            onChange={(
              fieldValue
            ) =>
              update(
                'grandmotherName',
                fieldValue
              )
            }
          />
        )}

        <TextField
          label="Family surname"
          value={
            value?.familySurname
          }
          onChange={(
            fieldValue
          ) =>
            update(
              'familySurname',
              fieldValue
            )
          }
        />

        <TextField
          label="Clan / surname"
          value={
            value?.clanSurname
          }
          onChange={(
            fieldValue
          ) =>
            update(
              'clanSurname',
              fieldValue
            )
          }
        />

        <TextField
          label="Native village"
          value={
            value?.nativeVillage
          }
          onChange={(
            fieldValue
          ) =>
            update(
              'nativeVillage',
              fieldValue
            )
          }
        />

        <TextField
          label="Taluka"
          value={
            value?.taluka
          }
          onChange={(
            fieldValue
          ) =>
            update(
              'taluka',
              fieldValue
            )
          }
        />

        <TextField
          label="District"
          value={
            value?.district
          }
          onChange={(
            fieldValue
          ) =>
            update(
              'district',
              fieldValue
            )
          }
        />

        <TextField
          label="State"
          value={
            value?.state
          }
          onChange={(
            fieldValue
          ) =>
            update(
              'state',
              fieldValue
            )
          }
        />

        <TextField
          label="Notes"
          multiline
          value={
            value?.notes
          }
          onChange={(
            fieldValue
          ) =>
            update(
              'notes',
              fieldValue
            )
          }
        />
      </div>
    </div>
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
                '',

              selfPhone:
                serverProfile
                  .contactDetails
                  ?.selfPhone ||
                user?.phone ||
                '',

              contactEmail:
                serverProfile
                  .contactDetails
                  ?.email ||
                user?.email ||
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
              religion:
                'Hinduism',

              birthCountry:
                'India',

              country:
                'India',

              workCountry:
                'India',

              currentAddressCountry:
                'India',

              manglik:
                'Unknown',

              includeAstrologyInBiodata:
                true,

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
                '',

              selfPhone:
                draft.selfPhone ||
                user?.phone ||
                '',

              contactEmail:
                draft.contactEmail ||
                user?.email ||
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
      user?.email,
      user?.phoneVerified
    ]
  );

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
              '',

            selfPhone:
              current.selfPhone ||
              user?.phone ||
              '',

            contactEmail:
              current.contactEmail ||
              user?.email ||
              ''
          })
        );
      }

      return savedProfile;
    };

  const saveAndExit =
    async () => {
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
        step === 0 &&
        !data.profileFor
      ) {
        setError(
          'Please choose who this profile is for.'
        );

        return;
      }

      if (
        step === 1 &&
        !verified
      ) {
        setError(
          'Verify the mobile number before continuing.'
        );

        return;
      }

      if (
        step === 2 ||
        step >= 7
      ) {
        const basicsError =
          profileBasicsError(
            data
          );

        if (
          basicsError
        ) {
          if (
            step > 2
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

      if (
        data.currentAddressPincode &&
        !/^[0-9]{6}$/.test(
          data.currentAddressPincode
        )
      ) {
        if (
          step === 6
        ) {
          setError(
            'Current address pincode must contain exactly 6 digits.'
          );

          return;
        }
      }

      setError('');

      if (
        step === 7
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

          return;
        } finally {
          setBusy(
            false
          );
        }
      }

      if (
        step === 9
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
          step + 1
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
                    step - 1
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
              {step + 1}{' '}
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

        <section className="mx-auto my-[clamp(40px,8vh,90px)] w-[min(700px,calc(100%_-_40px))]">
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

          {step === 0 && (
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
                    {item}
                  </button>
                )
              )}
            </div>
          )}

          {step === 1 && (
            <>
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
                <p className="mt-4 border border-[#76946f] bg-[#76946f0d] px-4 py-3 text-[11px] font-bold text-[#45643f]">
                  Mobile number
                  verified.
                </p>
              ) : (
                <button
                  disabled={
                    busy ||
                    cooldown > 0
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
                  <TextField
                    label="Six-digit code"
                    value={
                      otp
                    }
                    onChange={
                      setOtp
                    }
                  />

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

          {step === 2 && (
            <>
              <div
                className={
                  fieldsGridClass
                }
              >
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
                  label="Time of birth"
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
                  label="Birth city / town"
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
                  label="Birth district"
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

                <TextField
                  label="Birth state"
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
                  label="Blood group"
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
                  options={[
                    'A+',
                    'A-',
                    'B+',
                    'B-',
                    'AB+',
                    'AB-',
                    'O+',
                    'O-',
                    'Unknown'
                  ]}
                />

                <TextField
                  label="Complexion"
                  value={
                    data.complexion
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'complexion',
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
                  options={[
                    'Never Married',
                    'Divorced',
                    'Widowed',
                    'Annulled',
                    'Separated'
                  ]}
                />
              </div>

              {data.maritalStatus &&
                data.maritalStatus !==
                  'Never Married' && (
                  <div
                    className={
                      sensitivePanelClass
                    }
                  >
                    <p className="mb-4 flex items-center gap-2 text-[0.78rem] font-bold text-[#741f27]">
                      <LockKeyhole
                        size={
                          15
                        }
                      />

                      Private marital
                      context
                    </p>

                    <div
                      className={
                        fieldsGridClass
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
                        label="Marital history notes"
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
            </>
          )}

          {step === 3 && (
            <>
              <div
                className={
                  sectionClass
                }
              >
                <SectionHeader
                  title="Rajput heritage"
                  description="Core community and lineage information used in the matrimonial biodata."
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
                  <TextField
                    label="Religion"
                    value={
                      data.religion
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'religion',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Caste"
                    placeholder="Rajput / Kshatriya / Darbar"
                    value={
                      data.caste
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'caste',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Community"
                    value={
                      data.communityName
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'communityName',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Sub-community"
                    value={
                      data.subCommunity
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'subCommunity',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Clan / Shakh"
                    value={
                      data.clan
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'clan',
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
                    label="Vansh"
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
                    options={[
                      'Suryavanshi',
                      'Chandravanshi',
                      'Agnivanshi',
                      'Other'
                    ]}
                  />

                  <TextField
                    label="Kula Devi"
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
                    label="Ishta Devta"
                    value={
                      data.ishtaDevta
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'ishtaDevta',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Family origin"
                    multiline
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

              <div
                className={
                  sectionClass
                }
              >
                <SectionHeader
                  title="Current location"
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
                  <TextField
                    label="City"
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
                    label="Taluka"
                    value={
                      data.taluka
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'taluka',
                        value
                      )
                    }
                  />

                  <TextField
                    label="District"
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

                  <TextField
                    label="State"
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
                  />
                </div>
              </div>

              <div
                className={
                  sectionClass
                }
              >
                <SectionHeader
                  title="Vatan / Native place"
                  description="Traditional native village and district information."
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
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
                    label="Native taluka"
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
                    label="Native district"
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

                  <TextField
                    label="Native state"
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
                  />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div
                className={
                  sectionClass
                }
              >
                <SectionHeader
                  title="Education"
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
                  <TextField
                    label="Highest qualification"
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
                    label="Education details"
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

              <div
                className={
                  sectionClass
                }
              >
                <SectionHeader
                  title="Career"
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
                  <TextField
                    label="Occupation type"
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
                  />

                  <TextField
                    label="Occupation"
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
                    label="Business name"
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
                    label="Annual income"
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

                  <TextField
                    label="Work city"
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

                  <TextField
                    label="Work state"
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
                  />
                </div>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div
                className={
                  sectionClass
                }
              >
                <SectionHeader
                  title="Immediate family"
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
                  <TextField
                    label="Father name"
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
                    label="Father profession"
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
                    label="Mother name"
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
                    label="Mother profession"
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

                  <TextField
                    label="Family type"
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
                  />

                  <TextField
                    label="Family location"
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
                  />

                  <TextField
                    label="Family description"
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
              </div>

              <div
                className={
                  sensitivePanelClass
                }
              >
                <SectionHeader
                  title="Paternal lineage"
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
                  <TextField
                    label="Family surname"
                    value={
                      data.paternalFamilySurname
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'paternalFamilySurname',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Clan"
                    value={
                      data.paternalClan
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'paternalClan',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Gotra"
                    value={
                      data.paternalGotra
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'paternalGotra',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Ancestral village"
                    value={
                      data.ancestralVillage
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'ancestralVillage',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Native place"
                    value={
                      data.paternalNativePlace
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'paternalNativePlace',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Taluka"
                    value={
                      data.paternalTaluka
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'paternalTaluka',
                        value
                      )
                    }
                  />

                  <TextField
                    label="District"
                    value={
                      data.paternalDistrict
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'paternalDistrict',
                        value
                      )
                    }
                  />

                  <TextField
                    label="State"
                    value={
                      data.paternalState
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'paternalState',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Paternal notes"
                    multiline
                    value={
                      data.paternalNotes
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'paternalNotes',
                        value
                      )
                    }
                  />
                </div>
              </div>

              <div
                className={
                  sensitivePanelClass
                }
              >
                <SectionHeader
                  title="Maternal family"
                  description="Basic Mosal information."
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
                  <TextField
                    label="Maternal grandfather"
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
                    label="Family surname"
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

                  <TextField
                    label="Native place"
                    value={
                      data.maternalNativePlace
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'maternalNativePlace',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Village"
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
                    label="Taluka"
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
                    label="District"
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

                  <TextField
                    label="State"
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
                  />

                  <TextField
                    label="Clan"
                    value={
                      data.maternalClan
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'maternalClan',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Maternal notes"
                    multiline
                    value={
                      data.maternalNotes
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'maternalNotes',
                        value
                      )
                    }
                  />
                </div>
              </div>

              <MosalSection
                title="Self Mosal"
                description="Mother's parental family."
                showMama
                value={
                  data.selfMosal
                }
                onChange={(
                  value
                ) =>
                  update(
                    'selfMosal',
                    value
                  )
                }
              />

              <MosalSection
                title="Father's Mosal"
                description="Paternal grandmother's parental family."
                showGrandmother
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

              <MosalSection
                title="Mother's Mosal"
                description="Maternal grandmother's parental family."
                showGrandmother
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

              <div
                className={
                  sensitivePanelClass
                }
              >
                <div className="mb-4 flex items-start justify-between gap-4 max-[640px]:flex-col">
                  <SectionHeader
                    title="Siblings & marriage relations"
                    description="For married siblings, include sasariyu / spouse-family information where appropriate."
                  />

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
                      className="relative border-t border-[#741f2721] py-5 pr-11"
                      key={`${sibling.relation || 'sibling'}-${index}`}
                    >
                      <div
                        className={
                          fieldsGridClass
                        }
                      >
                        <SelectField
                          label="Relation"
                          value={
                            sibling.relation ||
                            'Brother'
                          }
                          onChange={(
                            value
                          ) =>
                            updateSibling(
                              index,
                              'relation',
                              value
                            )
                          }
                          options={[
                            'Brother',
                            'Sister'
                          ]}
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
                              index,
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
                              index,
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
                              index,
                              'occupation',
                              value
                            )
                          }
                        />

                        <SelectField
                          label="Marital status"
                          value={
                            sibling.maritalStatus ||
                            'Unmarried'
                          }
                          onChange={(
                            value
                          ) =>
                            updateSibling(
                              index,
                              'maritalStatus',
                              value
                            )
                          }
                          options={[
                            'Unmarried',
                            'Married'
                          ]}
                        />

                        {sibling.maritalStatus ===
                          'Married' && (
                          <>
                            <TextField
                              label="Spouse name"
                              value={
                                sibling.spouseName
                              }
                              onChange={(
                                value
                              ) =>
                                updateSibling(
                                  index,
                                  'spouseName',
                                  value
                                )
                              }
                            />

                            <TextField
                              label="Spouse clan"
                              value={
                                sibling.spouseClan
                              }
                              onChange={(
                                value
                              ) =>
                                updateSibling(
                                  index,
                                  'spouseClan',
                                  value
                                )
                              }
                            />

                            <TextField
                              label="Spouse family surname"
                              value={
                                sibling.spouseFamilySurname
                              }
                              onChange={(
                                value
                              ) =>
                                updateSibling(
                                  index,
                                  'spouseFamilySurname',
                                  value
                                )
                              }
                            />

                            <TextField
                              label="Sasariyu native place"
                              value={
                                sibling.spouseNativePlace
                              }
                              onChange={(
                                value
                              ) =>
                                updateSibling(
                                  index,
                                  'spouseNativePlace',
                                  value
                                )
                              }
                            />

                            <TextField
                              label="Sasariyu village"
                              value={
                                sibling.spouseVillage
                              }
                              onChange={(
                                value
                              ) =>
                                updateSibling(
                                  index,
                                  'spouseVillage',
                                  value
                                )
                              }
                            />

                            <TextField
                              label="Sasariyu taluka"
                              value={
                                sibling.spouseTaluka
                              }
                              onChange={(
                                value
                              ) =>
                                updateSibling(
                                  index,
                                  'spouseTaluka',
                                  value
                                )
                              }
                            />

                            <TextField
                              label="Sasariyu district"
                              value={
                                sibling.spouseDistrict
                              }
                              onChange={(
                                value
                              ) =>
                                updateSibling(
                                  index,
                                  'spouseDistrict',
                                  value
                                )
                              }
                            />

                            <TextField
                              label="Sasariyu state"
                              value={
                                sibling.spouseState
                              }
                              onChange={(
                                value
                              ) =>
                                updateSibling(
                                  index,
                                  'spouseState',
                                  value
                                )
                              }
                            />
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        className="absolute right-0 top-5 grid h-11 w-11 place-items-center rounded-full border border-[#ddd0c1] text-[#756a60]"
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

              <div
                className={
                  sensitivePanelClass
                }
              >
                <SectionHeader
                  title="Family assets"
                  description="Optional. Exact property addresses should never be entered here."
                />

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
                    <TextField
                      label="Approximate area"
                      type="number"
                      min="0"
                      value={
                        data.approximateArea
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          'approximateArea',
                          value
                        )
                      }
                    />

                    <SelectField
                      label="Unit"
                      value={
                        data.landUnit ||
                        'Vigha'
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          'landUnit',
                          value
                        )
                      }
                      options={[
                        'Vigha',
                        'Acre',
                        'Hectare'
                      ]}
                    />
                  </div>
                )}

                <div className={`${fieldsGridClass} mt-4`}>
                  <TextField
                    label="Property summary"
                    multiline
                    value={
                      data.propertySummary
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'propertySummary',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Primary residence type"
                    value={
                      data.primaryResidenceType
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'primaryResidenceType',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Business assets summary"
                    multiline
                    value={
                      data.businessAssetsSummary
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'businessAssetsSummary',
                        value
                      )
                    }
                  />
                </div>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <div
                className={
                  sectionClass
                }
              >
                <SectionHeader
                  title="About & lifestyle"
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
                  <TextField
                    label="About me"
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
                  />

                  <TextField
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
                  />

                  <TextField
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
                  />

                  <TextField
                    label="Interests"
                    placeholder="Travel, reading, sports..."
                    value={
                      data.interests
                    }
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
                    label="Marriage timeline"
                    value={
                      data.marriageTimeline
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'marriageTimeline',
                        value
                      )
                    }
                  />
                </div>
              </div>

              <div
                className={
                  sectionClass
                }
              >
                <SectionHeader
                  title="Astrology"
                  description="Optional traditional matching information."
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
                  <TextField
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
                  />

                  <TextField
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
                    options={[
                      'Yes',
                      'No',
                      'Anshik',
                      'Unknown'
                    ]}
                  />
                </div>
              </div>

              <div
                className={
                  sensitivePanelClass
                }
              >
                <SectionHeader
                  title="Current address & contact"
                  description="Private by default. These details are controlled by contact privacy and contact-unlock rules."
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
                  <TextField
                    label="Address line 1"
                    value={
                      data.currentAddressLine1
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'currentAddressLine1',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Address line 2"
                    value={
                      data.currentAddressLine2
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'currentAddressLine2',
                        value
                      )
                    }
                  />

                  <TextField
                    label="City"
                    value={
                      data.currentAddressCity
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'currentAddressCity',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Taluka"
                    value={
                      data.currentAddressTaluka
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'currentAddressTaluka',
                        value
                      )
                    }
                  />

                  <TextField
                    label="District"
                    value={
                      data.currentAddressDistrict
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'currentAddressDistrict',
                        value
                      )
                    }
                  />

                  <TextField
                    label="State"
                    value={
                      data.currentAddressState
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'currentAddressState',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Pincode"
                    value={
                      data.currentAddressPincode
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'currentAddressPincode',
                        value.replace(
                          /\D/g,
                          ''
                        ).slice(
                          0,
                          6
                        )
                      )
                    }
                  />

                  <TextField
                    label="Guardian name"
                    value={
                      data.guardianName
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'guardianName',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Guardian relation"
                    value={
                      data.guardianRelation
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'guardianRelation',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Guardian phone"
                    value={
                      data.guardianPhone
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'guardianPhone',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Self phone"
                    value={
                      data.selfPhone
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'selfPhone',
                        value
                      )
                    }
                  />

                  <TextField
                    label="Email"
                    type="email"
                    value={
                      data.contactEmail
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'contactEmail',
                        value
                      )
                    }
                  />
                </div>
              </div>

              <div
                className={
                  sensitivePanelClass
                }
              >
                <SectionHeader
                  title="Privacy controls"
                  description="Control how sensitive matrimonial information is revealed."
                />

                <div
                  className={
                    fieldsGridClass
                  }
                >
                  <SelectField
                    label="Family overview"
                    value={
                      data.familyOverviewVisibility ||
                      'AcceptedInterests'
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'familyOverviewVisibility',
                        value
                      )
                    }
                    options={[
                      'RegisteredMembers',
                      'AcceptedInterests',
                      'MutualMatches',
                      'Private'
                    ]}
                  />

                  <SelectField
                    label="Maternal / Mosal details"
                    value={
                      data.maternalFamilyVisibility ||
                      'AcceptedInterests'
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'maternalFamilyVisibility',
                        value
                      )
                    }
                    options={[
                      'AcceptedInterests',
                      'MutualMatches',
                      'Private'
                    ]}
                  />

                  <SelectField
                    label="Sibling details"
                    value={
                      data.siblingDetailsVisibility ||
                      'AcceptedInterests'
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'siblingDetailsVisibility',
                        value
                      )
                    }
                    options={[
                      'AcceptedInterests',
                      'MutualMatches',
                      'Private'
                    ]}
                  />

                  <SelectField
                    label="Family assets"
                    value={
                      data.assetVisibility ||
                      'Private'
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'assetVisibility',
                        value
                      )
                    }
                    options={[
                      'AcceptedInterests',
                      'MutualMatches',
                      'Private'
                    ]}
                  />

                  <SelectField
                    label="Astrology"
                    value={
                      data.astrologyVisibility ||
                      'RegisteredMembers'
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'astrologyVisibility',
                        value
                      )
                    }
                    options={[
                      'RegisteredMembers',
                      'AcceptedInterests',
                      'MutualMatches',
                      'Private'
                    ]}
                  />

                  <SelectField
                    label="Structured address"
                    value={
                      data.contactAddressVisibility ||
                      'Private'
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'contactAddressVisibility',
                        value
                      )
                    }
                    options={[
                      'AcceptedInterests',
                      'MutualMatches',
                      'Private'
                    ]}
                  />
                </div>
              </div>

              <div
                className={
                  sensitivePanelClass
                }
              >
                <SectionHeader
                  title="Printed biodata"
                  description="Choose which optional sections may appear when you print your own biodata."
                />

                <div className="grid gap-4">
                  {[
                    [
                      'includeSensitiveFamilyDetailsInBiodata',
                      'Include sensitive family / Mosal details'
                    ],

                    [
                      'includeAstrologyInBiodata',
                      'Include astrology information'
                    ],

                    [
                      'includeContactDetailsInBiodata',
                      'Include current contact details'
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
                        className="flex items-center gap-3 text-[12px] text-[#5e4e46]"
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
                              event
                                .target
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

          {step === 7 && (
            <div
              className={
                fieldsGridClass
              }
            >
              <TextField
                label="Minimum age"
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
                label="Maximum age"
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
                label="Minimum height"
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
                label="Maximum height"
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

              <TextField
                label="Preferred cities"
                value={
                  data.locations
                }
                onChange={(
                  value
                ) =>
                  update(
                    'locations',
                    value
                  )
                }
              />

              <TextField
                label="Preferred states"
                value={
                  data.states
                }
                onChange={(
                  value
                ) =>
                  update(
                    'states',
                    value
                  )
                }
              />

              <TextField
                label="Education preferences"
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
                label="Occupation preferences"
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
                label="Diet preferences"
                value={
                  data.dietPreferences
                }
                onChange={(
                  value
                ) =>
                  update(
                    'dietPreferences',
                    value
                  )
                }
              />

              <TextField
                label="Community preferences"
                value={
                  data.communityPreferences
                }
                onChange={(
                  value
                ) =>
                  update(
                    'communityPreferences',
                    value
                  )
                }
              />

              <TextField
                label="Accepted marital statuses"
                value={
                  data.acceptedMaritalStatuses
                }
                onChange={(
                  value
                ) =>
                  update(
                    'acceptedMaritalStatuses',
                    value
                  )
                }
              />

              <SelectField
                label="Open to remarriage"
                value={
                  data.willingForRemarriage ||
                  'Open to Discuss'
                }
                onChange={(
                  value
                ) =>
                  update(
                    'willingForRemarriage',
                    value
                  )
                }
                options={[
                  'Yes',
                  'No',
                  'Open to Discuss'
                ]}
              />

              <TextField
                label="Additional preferences"
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
          )}

          {step === 8 && (
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

          {step === 9 && (
            <div className="bg-[#f1e8dc] p-[30px]">
              <h3 className="font-['Cormorant_Garamond'] text-[34px] font-medium">
                {data.firstName ||
                  'Your'}{' '}
                {data.middleName ||
                  ''}{' '}
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

              <dl className="my-[25px] grid grid-cols-2 gap-[14px] max-[600px]:grid-cols-1">
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
                    'Height',
                    data.height
                      ? `${data.height} cm`
                      : ''
                  ],

                  [
                    'Blood group',
                    data.bloodGroup
                  ],

                  [
                    'Education',
                    data.highestEducation
                  ],

                  [
                    'Profession',
                    data.occupation
                  ],

                  [
                    'Religion / Caste',
                    [
                      data.religion,
                      data.caste
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ' • '
                      )
                  ],

                  [
                    'Clan / Shakh',
                    data.clan
                  ],

                  [
                    'Gotra',
                    data.gotra
                  ],

                  [
                    'Vansh',
                    data.vansh
                  ],

                  [
                    'Kula Devi',
                    data.kulaDevi
                  ],

                  [
                    'Vatan',
                    [
                      data.nativePlace,
                      data.nativeDistrict,
                      data.nativeState
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ', '
                      )
                  ],

                  [
                    'Mosal',
                    [
                      data.selfMosal
                        ?.familySurname,
                      data.selfMosal
                        ?.nativeVillage,
                      data.selfMosal
                        ?.district
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ', '
                      )
                  ],

                  [
                    'Astrology',
                    [
                      data.rashi,
                      data.nakshatra,
                      data.manglik &&
                      data.manglik !==
                        'Unknown'
                        ? data.manglik
                        : ''
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ' • '
                      )
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
                        {label}
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
              {error}
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
              : step === 9
                ? 'Submit for review'
                : 'Continue'}

            <ArrowRight />
          </button>
        </section>
      </main>
    </div>
  );
}