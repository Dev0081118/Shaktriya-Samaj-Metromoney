import {
  calculateAge as engineCalculateAge,
  calculateMutualMatch,
  evaluateDirectionalMatch
} from '../services/matchingEngine.js';

const present =
  (
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

export const calculateAge =
  engineCalculateAge;

/*
 * Canonical profile-completion calculation.
 *
 * Only fields belonging to the CURRENT profile flow
 * should affect completion.
 *
 * Current residential city/state fields are not used
 * as general profile location.
 *
 * Exact residential address remains private, but its
 * minimum required fields are still part of the user's
 * own profile-completion calculation.
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
      residentialAddress
        .addressLine1,

      residentialAddress
        .city,

      residentialAddress
        .district,

      residentialAddress
        .state,

      residentialAddress
        .pincode
    ].every(
      present
    );

  const fathersMosalComplete =
    [
      fathersMosal
        .familySurname,

      fathersMosal
        .nativeVillage,

      fathersMosal
        .district,

      fathersMosal
        .state
    ].every(
      present
    );

  const mothersMosalComplete =
    [
      mothersMosal
        .familySurname,

      mothersMosal
        .nativeVillage,

      mothersMosal
        .district,

      mothersMosal
        .state
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

    /*
     * Body weight is now a core profile field.
     */
    profile.weight,

    profile.maritalStatus ||
      profile
        .maritalHistory
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
      profile
        .maternalFamily
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

/*
 * Directional preference evaluation.
 *
 * Example:
 *
 * evaluatePreferences(
 *   Raj's preferences,
 *   Priya
 * )
 *
 * means:
 *
 * "How well does Priya satisfy Raj's preferences?"
 *
 * This is not reciprocal by itself.
 */
export function evaluatePreferences(
  preferences,
  candidate
) {
  const result =
    evaluateDirectionalMatch(
      preferences,
      candidate
    );

  return {
    score:
      result.score,

    confidence:
      result.confidence,

    rankingScore:
      result.rankingScore,

    eligible:
      result.eligible,

    hasPreferences:
      result.hasPreferences,

    activeCriteria:
      result.activeCriteria,

    matchedFactors:
      result.matchedFactors,

    unmatchedFactors:
      result.unmatchedFactors,

    unknownFactors:
      result.unknownFactors,

    hardFailures:
      result.hardFailures
  };
}

/*
 * Full reciprocal compatibility.
 *
 * profileA/preferencesA = logged-in viewer
 * profileB/preferencesB = candidate
 *
 * Important:
 *
 * score
 * -----
 * directional viewer -> candidate percentage
 *
 * preferenceFitScore
 * ------------------
 * same as score, explicitly named
 *
 * reverseFitScore
 * ---------------
 * candidate -> viewer percentage
 *
 * mutualScore
 * -----------
 * balanced reciprocal compatibility
 *
 * rankingScore
 * ------------
 * internal recommendation-order score
 *
 * Private matched-factor details are intentionally not
 * returned from here.
 */
export function calculateCompatibility(
  profileA,
  preferencesA,
  profileB,
  preferencesB
) {
  const result =
    calculateMutualMatch(
      profileA,
      preferencesA,
      profileB,
      preferencesB
    );

  return {
    score:
      result.score,

    preferenceFitScore:
      result.preferenceFitScore,

    reverseFitScore:
      result.reverseFitScore,

    mutualScore:
      result.mutualScore,

    confidence:
      result.confidence,

    reverseConfidence:
      result.reverseConfidence,

    rankingScore:
      result.rankingScore,

    eligible:
      result.eligible,

    viewerEligible:
      result.viewerEligible,

    candidateEligible:
      result.candidateEligible,

    viewerHasPreferences:
      result.viewerHasPreferences,

    candidateHasPreferences:
      result.candidateHasPreferences
  };
}

/*
 * Small profile-card serializer.
 *
 * Do not put sensitive fields such as income,
 * residential address or family assets here.
 */
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

    /*
     * Weight is now part of the standard profile card
     * payload so profile/detail UI can display it.
     */
    weight:
      p.weight,

    /*
     * Serialized profile privacy rules decide which
     * location fields are present.
     *
     * Public UI should use native location only.
     */
    location:
      p.location,

    community: {
      clan:
        p.community
          ?.clan,

      gotra:
        p.community
          ?.gotra,

      vansh:
        p.community
          ?.vansh
    },

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

    lifestyle: {
      diet:
        p.lifestyle
          ?.diet
    },

    maritalStatus:
      p.maritalStatus,

    profilePhoto:
      p.profilePhoto,

    verification:
      p.verification,

    visibility:
      p.visibility,

    compatibility
  };
}