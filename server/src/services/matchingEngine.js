const IMPORTANCE_MULTIPLIER = {
  Low:
    0.6,

  Medium:
    1,

  High:
    1.4,

  'Must Have':
    1.8
};

/*
 * Default category importance.
 *
 * User-selected importance is multiplied on top of
 * these base values.
 */
const BASE_WEIGHT = {
  age:
    10,

  height:
    5,

  weight:
    5,

  maritalStatus:
    9,

  location:
    7,

  shakh:
    10,

  gotra:
    5,

  vansh:
    4,

  education:
    6,

  occupation:
    6,

  income:
    8,

  diet:
    6,

  familyType:
    5,

  familyValues:
    7,

  smoking:
    3,

  drinking:
    3,

  ownResidence:
    5,

  agricultureLand:
    4,

  businessAssets:
    3,

  marriageTimeline:
    4
};

const normalize =
  (
    value
  ) =>
    String(
      value ??
        ''
    )
      .trim()
      .toLowerCase();

const numberOrNull =
  (
    value
  ) => {
    if (
      value ===
        '' ||
      value ===
        null ||
      value ===
        undefined
    ) {
      return null;
    }

    const number =
      Number(
        value
      );

    return Number.isFinite(
      number
    )
      ? number
      : null;
  };

const normalizeList =
  (
    value
  ) =>
    Array.isArray(
      value
    )
      ? value
          .map(
            normalize
          )
          .filter(
            Boolean
          )
      : [];

const hasList =
  (
    value
  ) =>
    Array.isArray(
      value
    ) &&
    value.length >
      0;

/*
 * Exact multiple-choice matcher.
 *
 * Example:
 *
 * preference:
 * ["Vegetarian", "Jain"]
 *
 * candidate:
 * "Vegetarian"
 *
 * => full match
 */
const exactListScore =
  (
    preferences,
    candidate
  ) => {
    if (
      !hasList(
        preferences
      )
    ) {
      return {
        active:
          false
      };
    }

    const actual =
      normalize(
        candidate
      );

    if (
      !actual
    ) {
      return {
        active:
          true,

        known:
          false
      };
    }

    const expected =
      normalizeList(
        preferences
      );

    return {
      active:
        true,

      known:
        true,

      score:
        expected.includes(
          actual
        )
          ? 1
          : 0
    };
  };

/*
 * Fuzzy text matcher for education / profession.
 *
 * Example:
 *
 * "Software Engineer"
 * preference "Engineer"
 *
 * => match
 */
const fuzzyListScore =
  (
    preferences,
    candidate
  ) => {
    if (
      !hasList(
        preferences
      )
    ) {
      return {
        active:
          false
      };
    }

    const actual =
      normalize(
        candidate
      );

    if (
      !actual
    ) {
      return {
        active:
          true,

        known:
          false
      };
    }

    const expected =
      normalizeList(
        preferences
      );

    const matched =
      expected.some(
        (
          item
        ) =>
          actual.includes(
            item
          ) ||
          item.includes(
            actual
          )
      );

    return {
      active:
        true,

      known:
        true,

      score:
        matched
          ? 1
          : 0
    };
  };

/*
 * Numeric range score with gradual penalty.
 *
 * A preferred field does not immediately become 0
 * when slightly outside the range unless that field
 * is marked Must Have.
 */
const rangeScore =
  (
    value,
    min,
    max,
    tolerance
  ) => {
    const actual =
      numberOrNull(
        value
      );

    const minimum =
      numberOrNull(
        min
      );

    const maximum =
      numberOrNull(
        max
      );

    if (
      minimum ===
        null &&
      maximum ===
        null
    ) {
      return {
        active:
          false
      };
    }

    if (
      actual ===
        null
    ) {
      return {
        active:
          true,

        known:
          false
      };
    }

    if (
      minimum !==
        null &&
      actual <
        minimum
    ) {
      const difference =
        minimum -
        actual;

      return {
        active:
          true,

        known:
          true,

        score:
          Math.max(
            0,
            1 -
              difference /
                tolerance
          )
      };
    }

    if (
      maximum !==
        null &&
      actual >
        maximum
    ) {
      const difference =
        actual -
        maximum;

      return {
        active:
          true,

        known:
          true,

        score:
          Math.max(
            0,
            1 -
              difference /
                tolerance
          )
      };
    }

    return {
      active:
        true,

      known:
        true,

      score:
        1
    };
  };

/*
 * Property-type yes/no preference.
 */
const yesNoScore =
  (
    preference,
    actual,
    known
  ) => {
    if (
      !preference ||
      preference ===
        'Any'
    ) {
      return {
        active:
          false
      };
    }

    if (
      !known
    ) {
      return {
        active:
          true,

        known:
          false
      };
    }

    const expectsYes =
      preference ===
      'Yes';

    return {
      active:
        true,

      known:
        true,

      score:
        Boolean(
          actual
        ) ===
        expectsYes
          ? 1
          : 0
    };
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

  const beforeBirthday =
    now.getMonth() <
      birth.getMonth() ||
    (
      now.getMonth() ===
        birth.getMonth() &&
      now.getDate() <
        birth.getDate()
    );

  if (
    beforeBirthday
  ) {
    age -=
      1;
  }

  return age;
}

const importanceFor =
  (
    preferences,
    key
  ) =>
    preferences
      ?.importance?.[
        key
      ] ||
    'Medium';

const effectiveWeight =
  (
    preferences,
    key
  ) => {
    const base =
      BASE_WEIGHT[
        key
      ] ||
      1;

    const importance =
      importanceFor(
        preferences,
        key
      );

    const multiplier =
      IMPORTANCE_MULTIPLIER[
        importance
      ] ||
      1;

    return (
      base *
      multiplier
    );
  };

/*
 * Returns true only when an asset section appears to
 * contain meaningful information.
 *
 * This helps avoid automatically treating an unfilled
 * Family Assets section as "No".
 */
const hasMeaningfulObject =
  (
    value
  ) => {
    if (
      !value ||
      typeof value !==
        'object'
    ) {
      return false;
    }

    return Object.values(
      value
    ).some(
      (
        item
      ) => {
        if (
          item ===
            true
        ) {
          return true;
        }

        if (
          Array.isArray(
            item
          )
        ) {
          return item.length >
            0;
        }

        if (
          item &&
          typeof item ===
            'object'
        ) {
          return hasMeaningfulObject(
            item
          );
        }

        return (
          item !==
            undefined &&
          item !==
            null &&
          String(
            item
          ).trim() !==
            ''
        );
      }
    );
  };

/*
 * Directional evaluator
 * ---------------------
 *
 * evaluateDirectionalMatch(A's preferences, B)
 *
 * means:
 *
 * "How well does B satisfy A's requirements?"
 *
 * This is intentionally NOT symmetrical.
 */
export function evaluateDirectionalMatch(
  preferences,
  candidate
) {
  const preference =
    preferences
      ?.toObject?.() ||
    preferences ||
    {};

  const person =
    candidate
      ?.toObject?.() ||
    candidate ||
    {};

  const matchedFactors = [];

  const unmatchedFactors = [];

  const unknownFactors = [];

  const hardFailures = [];

  let totalPreferenceWeight =
    0;

  let knownPreferenceWeight =
    0;

  let matchedWeight =
    0;

  let activeCriteria =
    0;

  const addCriterion =
    (
      key,
      label,
      result
    ) => {
      if (
        !result?.active
      ) {
        return;
      }

      activeCriteria +=
        1;

      const weight =
        effectiveWeight(
          preference,
          key
        );

      const importance =
        importanceFor(
          preference,
          key
        );

      totalPreferenceWeight +=
        weight;

      /*
       * Candidate has not supplied enough information.
       */
      if (
        !result.known
      ) {
        unknownFactors.push(
          label
        );

        /*
         * Must Have means the engine cannot verify
         * suitability without the value.
         */
        if (
          importance ===
          'Must Have'
        ) {
          hardFailures.push(
            `${label}: information unavailable`
          );
        }

        return;
      }

      knownPreferenceWeight +=
        weight;

      const raw =
        Number(
          result.score
        );

      const criterionScore =
        Number.isFinite(
          raw
        )
          ? Math.max(
              0,
              Math.min(
                1,
                raw
              )
            )
          : 0;

      matchedWeight +=
        weight *
        criterionScore;

      if (
        criterionScore >=
        0.999
      ) {
        matchedFactors.push(
          label
        );
      } else {
        unmatchedFactors.push(
          label
        );
      }

      /*
       * Must Have must be a complete match.
       *
       * Even a partial numeric-range match does not
       * satisfy a hard requirement.
       */
      if (
        importance ===
          'Must Have' &&
        criterionScore <
          0.999
      ) {
        hardFailures.push(
          label
        );
      }
    };

  /* ------------------------------------------------------------ */
  /* Age                                                          */
  /* ------------------------------------------------------------ */

  addCriterion(
    'age',
    'Preferred age range',
    rangeScore(
      calculateAge(
        person.dateOfBirth
      ),

      preference.ageMin,

      preference.ageMax,

      5
    )
  );

  /* ------------------------------------------------------------ */
  /* Height                                                       */
  /* ------------------------------------------------------------ */

  addCriterion(
    'height',
    'Preferred height',
    rangeScore(
      person.height,

      preference.heightMin,

      preference.heightMax,

      15
    )
  );

  /* ------------------------------------------------------------ */
  /* Weight                                                       */
  /* ------------------------------------------------------------ */

  addCriterion(
    'weight',
    'Preferred weight',
    rangeScore(
      person.weight,

      preference.weightMin,

      preference.weightMax,

      20
    )
  );

  /* ------------------------------------------------------------ */
  /* Marital status                                               */
  /* ------------------------------------------------------------ */

  const acceptedMaritalStatuses =
    preference
      .acceptedMaritalStatuses
      ?.length
      ? preference
          .acceptedMaritalStatuses
      : preference
          .maritalStatus;

  addCriterion(
    'maritalStatus',
    'Marital status',
    exactListScore(
      acceptedMaritalStatuses,

      person.maritalStatus ||
        person
          .maritalHistory
          ?.status
    )
  );

  /* ------------------------------------------------------------ */
  /* Native location                                              */
  /* ------------------------------------------------------------ */

  const preferredLocations = [
    ...(
      preference.locations ||
      []
    ),

    ...(
      preference.states ||
      []
    )
  ]
    .map(
      normalize
    )
    .filter(
      Boolean
    );

  if (
    preferredLocations.length >
    0
  ) {
    const candidateLocations = [
      person.location
        ?.nativePlace,

      person.location
        ?.nativeTaluka,

      person.location
        ?.nativeDistrict,

      person.location
        ?.nativeState
    ]
      .map(
        normalize
      )
      .filter(
        Boolean
      );

    const known =
      candidateLocations.length >
      0;

    const matched =
      known &&
      candidateLocations.some(
        (
          actual
        ) =>
          preferredLocations.some(
            (
              expected
            ) =>
              actual ===
                expected ||
              actual.includes(
                expected
              ) ||
              expected.includes(
                actual
              )
          )
      );

    addCriterion(
      'location',
      'Native location',
      {
        active:
          true,

        known,

        score:
          matched
            ? 1
            : 0
      }
    );
  }

  /* ------------------------------------------------------------ */
  /* Shakh / surname                                              */
  /* ------------------------------------------------------------ */

  const preferredShakhs =
    preference
      .shakhPreferences
      ?.length
      ? preference
          .shakhPreferences
      : preference
          .communityPreferences;

  addCriterion(
    'shakh',
    'Surname / Shakh',
    exactListScore(
      preferredShakhs,

      person.community
        ?.clan
    )
  );

  /* ------------------------------------------------------------ */
  /* Gotra                                                        */
  /* ------------------------------------------------------------ */

  addCriterion(
    'gotra',
    'Gotra',
    exactListScore(
      preference
        .gotraPreferences,

      person.community
        ?.gotra
    )
  );

  /* ------------------------------------------------------------ */
  /* Kul / Vansh                                                  */
  /* ------------------------------------------------------------ */

  addCriterion(
    'vansh',
    'Kul / Vansh',
    exactListScore(
      preference
        .vanshPreferences,

      person.community
        ?.vansh
    )
  );

  /* ------------------------------------------------------------ */
  /* Education                                                    */
  /* ------------------------------------------------------------ */

  addCriterion(
    'education',
    'Education',
    fuzzyListScore(
      preference
        .educationPreferences,

      person.education
        ?.highestEducation ||
        person.education
          ?.degree
    )
  );

  /* ------------------------------------------------------------ */
  /* Profession                                                   */
  /* ------------------------------------------------------------ */

  addCriterion(
    'occupation',
    'Profession',
    fuzzyListScore(
      preference
        .occupationPreferences,

      person.career
        ?.occupation ||
        person.career
          ?.occupationType ||
        person.career
          ?.designation
    )
  );

  /* ------------------------------------------------------------ */
  /* Income                                                       */
  /* ------------------------------------------------------------ */

  const incomeMin =
    preference
      .incomePreferences
      ?.min;

  const incomeMax =
    preference
      .incomePreferences
      ?.max;

  const incomeReference =
    numberOrNull(
      incomeMin
    ) ||
    numberOrNull(
      incomeMax
    ) ||
    500000;

  const incomeTolerance =
    Math.max(
      100000,
      incomeReference *
        0.5
    );

  addCriterion(
    'income',
    'Income preference',
    rangeScore(
      person.career
        ?.annualIncome,

      incomeMin,

      incomeMax,

      incomeTolerance
    )
  );

  /* ------------------------------------------------------------ */
  /* Diet                                                         */
  /* ------------------------------------------------------------ */

  addCriterion(
    'diet',
    'Diet preference',
    exactListScore(
      preference
        .dietPreferences,

      person.lifestyle
        ?.diet
    )
  );

  /* ------------------------------------------------------------ */
  /* Family type                                                  */
  /* ------------------------------------------------------------ */

  addCriterion(
    'familyType',
    'Family type',
    exactListScore(
      preference
        .familyTypePreferences,

      person.family
        ?.familyType
    )
  );

  /* ------------------------------------------------------------ */
  /* Family values                                                */
  /* ------------------------------------------------------------ */

  addCriterion(
    'familyValues',
    'Family values',
    exactListScore(
      preference
        .familyValuePreferences,

      person.family
        ?.familyValues
    )
  );

  /* ------------------------------------------------------------ */
  /* Smoking                                                      */
  /* ------------------------------------------------------------ */

  addCriterion(
    'smoking',
    'Smoking preference',
    exactListScore(
      preference
        .smokingPreferences,

      person.lifestyle
        ?.smoking
    )
  );

  /* ------------------------------------------------------------ */
  /* Drinking                                                     */
  /* ------------------------------------------------------------ */

  addCriterion(
    'drinking',
    'Drinking preference',
    exactListScore(
      preference
        .drinkingPreferences,

      person.lifestyle
        ?.drinking
    )
  );

  /* ------------------------------------------------------------ */
  /* Property                                                     */
  /* ------------------------------------------------------------ */

  const familyAssets =
    person.familyAssets;

  const assetsProvided =
    hasMeaningfulObject(
      familyAssets
    );

  const residentialProperties =
    familyAssets
      ?.residentialProperties;

  const hasResidentialProperty =
    Array.isArray(
      residentialProperties
    ) &&
    residentialProperties.length >
      0;

  addCriterion(
    'ownResidence',
    'Residential property',
    yesNoScore(
      preference
        .propertyPreferences
        ?.ownResidence,

      hasResidentialProperty,

      assetsProvided
    )
  );

  /* ------------------------------------------------------------ */
  /* Agricultural land                                           */
  /* ------------------------------------------------------------ */

  const agriculture =
    familyAssets
      ?.agricultureLand;

  const landInformationKnown =
    agriculture &&
    (
      typeof agriculture.hasLand ===
        'boolean' ||
      hasMeaningfulObject(
        agriculture
      )
    );

  addCriterion(
    'agricultureLand',
    'Agricultural land',
    yesNoScore(
      preference
        .propertyPreferences
        ?.agricultureLand,

      agriculture
        ?.hasLand ===
        true,

      !!landInformationKnown
    )
  );

  /* ------------------------------------------------------------ */
  /* Business assets                                              */
  /* ------------------------------------------------------------ */

  const businessAssets =
    familyAssets
      ?.businessAssets;

  const hasBusinessAssets =
    Array.isArray(
      businessAssets
    ) &&
    businessAssets.length >
      0;

  addCriterion(
    'businessAssets',
    'Business assets',
    yesNoScore(
      preference
        .propertyPreferences
        ?.businessAssets,

      hasBusinessAssets,

      assetsProvided
    )
  );

  /* ------------------------------------------------------------ */
  /* Marriage timeline                                            */
  /* ------------------------------------------------------------ */

  addCriterion(
    'marriageTimeline',
    'Marriage timeline',
    fuzzyListScore(
      preference
        .marriageTimeline,

      person.marriageTimeline
    )
  );

  /*
   * Percentage is calculated only from information
   * that can actually be evaluated.
   *
   * Missing candidate data is represented separately
   * through confidence.
   */
  const score =
    knownPreferenceWeight >
      0
      ? Math.round(
          (
            matchedWeight /
            knownPreferenceWeight
          ) *
            100
        )
      : null;

  /*
   * Confidence tells us how much of the viewer's
   * preference set could actually be evaluated.
   *
   * Example:
   *
   * score      = 86%
   * confidence = 72%
   *
   * means the profile matched 86% of the criteria for
   * which sufficient information was available, while
   * 28% of relevant preference data was unavailable.
   */
  const confidence =
    totalPreferenceWeight >
      0
      ? Math.round(
          (
            knownPreferenceWeight /
            totalPreferenceWeight
          ) *
            100
        )
      : 0;

  /*
   * Internal ranking score slightly penalizes low
   * confidence without changing the percentage shown
   * to the member.
   */
  const rankingScore =
    score ===
      null
      ? 0
      : Math.round(
          score *
            (
              0.75 +
              (
                confidence /
                100
              ) *
                0.25
            )
        );

  return {
    score,

    confidence,

    rankingScore,

    eligible:
      hardFailures.length ===
      0,

    hasPreferences:
      activeCriteria >
      0,

    activeCriteria,

    /*
     * These details are INTERNAL.
     *
     * Do not automatically expose them in API responses
     * because income/property criteria can reveal private
     * information indirectly.
     */
    matchedFactors,

    unmatchedFactors,

    unknownFactors,

    hardFailures
  };
}

/*
 * Harmonic mean intentionally penalizes unbalanced
 * reciprocal matches.
 *
 * Example:
 *
 * A -> B = 95
 * B -> A = 40
 *
 * mutual score is much weaker than a simple "good on
 * one side" interpretation.
 */
const harmonicMean =
  (
    left,
    right
  ) => {
    if (
      left ===
        null &&
      right ===
        null
    ) {
      return null;
    }

    if (
      left ===
        null
    ) {
      return right;
    }

    if (
      right ===
        null
    ) {
      return left;
    }

    if (
      left <=
        0 ||
      right <=
        0
    ) {
      return 0;
    }

    return Math.round(
      (
        2 *
        left *
        right
      ) /
        (
          left +
          right
        )
    );
  };

/*
 * Reciprocal matching
 * -------------------
 *
 * profileA/preferencesA = logged-in member
 * profileB/preferencesB = candidate
 *
 * preferenceFitScore:
 * A -> B
 *
 * reverseFitScore:
 * B -> A
 *
 * mutualScore:
 * reciprocal suitability
 */
export function calculateMutualMatch(
  profileA,
  preferencesA,
  profileB,
  preferencesB
) {
  const aToB =
    evaluateDirectionalMatch(
      preferencesA,
      profileB
    );

  const bToA =
    evaluateDirectionalMatch(
      preferencesB,
      profileA
    );

  const preferenceFitScore =
    aToB.score;

  const reverseFitScore =
    bToA.score;

  const mutualScore =
    harmonicMean(
      preferenceFitScore,
      reverseFitScore
    );

  /*
   * Recommendation ranking is viewer-first.
   *
   * 70% logged-in member's own preference fit.
   * 30% reciprocal suitability.
   *
   * The displayed percentage still remains A -> B.
   */
  const rankingScore =
    preferenceFitScore ===
      null
      ? 0
      : Math.round(
          (
            preferenceFitScore *
            0.7
          ) +
            (
              (
                mutualScore ??
                preferenceFitScore
              ) *
              0.3
            )
        );

  return {
    /*
     * Main displayed percentage.
     */
    score:
      preferenceFitScore,

    preferenceFitScore,

    reverseFitScore,

    mutualScore,

    confidence:
      aToB.confidence,

    reverseConfidence:
      bToA.confidence,

    rankingScore,

    /*
     * Both directions must satisfy their Must Have
     * requirements for a true reciprocal recommendation.
     */
    eligible:
      aToB.eligible &&
      bToA.eligible,

    viewerEligible:
      aToB.eligible,

    candidateEligible:
      bToA.eligible,

    viewerHasPreferences:
      aToB.hasPreferences,

    candidateHasPreferences:
      bToA.hasPreferences,

    /*
     * Internal debugging/explanation object.
     *
     * Never send this entire object directly to clients.
     */
    internal: {
      aToB,

      bToA
    }
  };
}