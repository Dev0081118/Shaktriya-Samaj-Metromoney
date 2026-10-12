const present = (
  value
) => {
  if (
    Array.isArray(
      value
    )
  ) {
    return value.length >
      0;
  }

  if (
    value ===
      true
  ) {
    return true;
  }

  if (
    value ===
      false ||
    value ===
      null ||
    value ===
      undefined
  ) {
    return false;
  }

  return Boolean(
    String(
      value
    ).trim()
  );
};

export function calculateAge(
  dateOfBirth
) {
  if (
    !dateOfBirth
  ) {
    return null;
  }

  const birth =
    new Date(
      dateOfBirth
    );

  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {
    return null;
  }

  const now =
    new Date();

  let age =
    now.getFullYear() -
    birth.getFullYear();

  if (
    now.getMonth() <
      birth.getMonth() ||
    (
      now.getMonth() ===
        birth.getMonth() &&
      now.getDate() <
        birth.getDate()
    )
  ) {
    age--;
  }

  return age;
}

/*
 * Canonical profile-completion calculation.
 *
 * IMPORTANT:
 * This must only use fields that belong to the
 * CURRENT profile flow.
 *
 * Removed fields such as:
 * - current city
 * - current district
 * - current state
 *
 * must never affect completion.
 *
 * Exact residential address is optional/private and
 * therefore also does not affect profile completion.
 */
export function completion(
  profile,
  hasPreferences = false
) {
  const residentialAddress =
    profile.contactDetails
      ?.currentAddress ||
    {};

  const fathersMosal =
    profile.maternalLineage
      ?.fathersMosal ||
    {};

  const mothersMosal =
    profile.maternalLineage
      ?.mothersMosal ||
    {};

  const residentialAddressComplete =
    [
      residentialAddress.addressLine1,
      residentialAddress.city,
      residentialAddress.district,
      residentialAddress.state,
      residentialAddress.pincode
    ].every(
      present
    );

  const fathersMosalComplete =
    [
      fathersMosal.familySurname,
      fathersMosal.nativeVillage,
      fathersMosal.district,
      fathersMosal.state
    ].every(
      present
    );

  const mothersMosalComplete =
    [
      mothersMosal.familySurname,
      mothersMosal.nativeVillage,
      mothersMosal.district,
      mothersMosal.state
    ].every(
      present
    );

  const checkpoints = [
    profile.profileFor,

    profile.firstName,

    profile.lastName,

    profile.gender,

    profile.dateOfBirth,

    profile.height,

    profile.maritalStatus ||
      profile.maritalHistory
        ?.status,

    profile.profilePhoto,

    profile.aboutMe,

    profile.community
      ?.clan,

    profile.community
      ?.gotra,

    profile.community
      ?.vansh,

    profile.location
      ?.nativePlace,

    profile.location
      ?.nativeDistrict,

    profile.education
      ?.highestEducation,

    profile.career
      ?.occupation,

    profile.family
      ?.fatherName,

    profile.family
      ?.motherName,

    profile.maternalFamily
      ?.maternalVillage ||
      profile.maternalFamily
        ?.maternalNativePlace,

    hasPreferences,

    residentialAddressComplete,

    fathersMosalComplete,

    mothersMosalComplete
  ];

  return Math.round(
    (
      checkpoints.filter(
        present
      ).length /
      checkpoints.length
    ) *
      100
  );
}

const includes = (
  list,
  value
) =>
  !list?.length ||
  list.some(
    (
      item
    ) =>
      String(
        item
      ).toLowerCase() ===
      String(
        value ||
          ''
      ).toLowerCase()
  );

const matchesAny = (
  list,
  value
) =>
  Boolean(
    list?.some(
      (
        item
      ) =>
        String(
          item
        ).toLowerCase() ===
        String(
          value ||
            ''
        ).toLowerCase()
    )
  );

export function evaluatePreferences(
  preferences,
  candidate
) {
  const age =
    calculateAge(
      candidate.dateOfBirth
    );

  const tests = [
    [
      'Preferred age range',

      !preferences ||
        (
          (
            !preferences.ageMin ||
            age >=
              preferences.ageMin
          ) &&
          (
            !preferences.ageMax ||
            age <=
              preferences.ageMax
          )
        )
    ],

    [
      'Preferred height',

      !preferences ||
        (
          (
            !preferences.heightMin ||
            candidate.height >=
              preferences.heightMin
          ) &&
          (
            !preferences.heightMax ||
            candidate.height <=
              preferences.heightMax
          )
        )
    ],

    [
      'Location preference',

      (
        !preferences
          ?.locations
          ?.length &&
        !preferences
          ?.states
          ?.length
      ) ||
        matchesAny(
          preferences.locations,
          candidate.location
            ?.city
        ) ||
        matchesAny(
          preferences.states,
          candidate.location
            ?.state
        )
    ],

    [
      'Education preference',

      includes(
        preferences
          ?.educationPreferences,

        candidate.education
          ?.highestEducation
      )
    ],

    [
      'Occupation preference',

      includes(
        preferences
          ?.occupationPreferences,

        candidate.career
          ?.occupation
      )
    ],

    [
      'Marital status',

      includes(
        preferences
          ?.acceptedMaritalStatuses
          ?.length
          ? preferences.acceptedMaritalStatuses
          : preferences
              ?.maritalStatus,

        candidate.maritalStatus ||
          candidate
            .maritalHistory
            ?.status
      )
    ],

    [
      'Diet preference',

      includes(
        preferences
          ?.dietPreferences,

        candidate.lifestyle
          ?.diet
      )
    ],

    [
      'Community preference',

      includes(
        preferences
          ?.communityPreferences,

        candidate.community
          ?.name
      )
    ],

    [
      'Marriage timeline',

      includes(
        preferences
          ?.marriageTimeline,

        candidate
          .marriageTimeline
      )
    ]
  ];

  const matched =
    tests
      .filter(
        ([
          ,
          value
        ]) =>
          value
      )
      .map(
        ([
          name
        ]) =>
          name
      );

  const unmatched =
    tests
      .filter(
        ([
          ,
          value
        ]) =>
          !value
      )
      .map(
        ([
          name
        ]) =>
          name
      );

  return {
    score:
      Math.round(
        (
          matched.length /
          tests.length
        ) *
          100
      ),

    matchedFactors:
      matched,

    unmatchedFactors:
      unmatched
  };
}

export function calculateCompatibility(
  profileA,
  preferencesA,
  profileB,
  preferencesB
) {
  const aToB =
    evaluatePreferences(
      preferencesA,
      profileB
    );

  const bToA =
    evaluatePreferences(
      preferencesB,
      profileA
    );

  return {
    score:
      Math.round(
        (
          aToB.score +
          bToA.score
        ) /
          2
      ),

    aToBScore:
      aToB.score,

    bToAScore:
      bToA.score,

    matchedFactors: [
      ...new Set([
        ...aToB.matchedFactors,
        ...bToA.matchedFactors
      ])
    ],

    unmatchedFactors: [
      ...new Set([
        ...aToB.unmatchedFactors,
        ...bToA.unmatchedFactors
      ])
    ]
  };
}

export function profileCard(
  profile,
  compatibility = null
) {
  const p =
    profile.toObject
      ? profile.toObject()
      : profile;

  return {
    _id:
      p._id,

    profileId:
      p.profileId,

    firstName:
      p.firstName,

    lastName:
      p.lastName,

    age:
      p.age ??
      calculateAge(
        p.dateOfBirth
      ),

    height:
      p.height,

    location:
      p.location,

    education:
      p.education,

    career: {
      occupation:
        p.career
          ?.occupation,

      designation:
        p.career
          ?.designation
    },

    profilePhoto:
      p.profilePhoto,

    verification:
      p.verification,

    visibility:
      p.visibility,

    compatibility
  };
}