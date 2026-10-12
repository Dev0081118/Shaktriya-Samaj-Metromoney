import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateAge,
  evaluatePreferences,
  calculateCompatibility
} from '../src/utils/profile.js';

import MatrimonialProfile from '../src/models/MatrimonialProfile.js';

test(
  'calculateAge handles a valid adult date',
  () => {
    const year =
      new Date().getFullYear() -
      30;

    const age =
      calculateAge(
        new Date(
          year,
          0,
          1
        )
      );

    assert.ok(
      age ===
        29 ||
      age ===
        30
    );
  }
);

test(
  'preferences reject incompatible age and native location attributes',
  () => {
    const result =
      evaluatePreferences(
        {
          ageMin:
            25,

          ageMax:
            30,

          states: [
            'Gujarat'
          ]
        },

        {
          dateOfBirth:
            new Date(
              new Date()
                .getFullYear() -
                40,
              0,
              1
            ),

          location: {
            /*
             * Current residential state is deliberately
             * irrelevant to matching.
             */
            state:
              'Gujarat',

            nativeState:
              'Rajasthan'
          }
        }
      );

    assert.ok(
      result.unmatchedFactors.includes(
        'Preferred age range'
      )
    );

    assert.ok(
      result.unmatchedFactors.includes(
        'Native location'
      )
    );
  }
);

test(
  'compatibility is directional and also returns reciprocal mutual score',
  () => {
    const a = {
      dateOfBirth:
        new Date(
          1995,
          0,
          1
        ),

      height:
        170,

      location: {
        nativeState:
          'Gujarat'
      }
    };

    const b = {
      dateOfBirth:
        new Date(
          1997,
          0,
          1
        ),

      height:
        165,

      location: {
        nativeState:
          'Gujarat'
      }
    };

    const result =
      calculateCompatibility(
        a,

        {
          states: [
            'Gujarat'
          ],

          heightMin:
            160,

          heightMax:
            175
        },

        b,

        {
          states: [
            'Gujarat'
          ],

          heightMin:
            175,

          heightMax:
            185
        }
      );

    /*
     * B fully satisfies A's configured preferences.
     */
    assert.equal(
      result.score,
      100
    );

    assert.equal(
      result.preferenceFitScore,
      100
    );

    /*
     * A does not fully satisfy B's height preference,
     * proving directional scoring is independent.
     */
    assert.ok(
      result.reverseFitScore <
      result.preferenceFitScore
    );

    assert.ok(
      result.mutualScore <
      result.preferenceFitScore
    );

    assert.ok(
      Number.isFinite(
        result.rankingScore
      )
    );

    assert.equal(
      result.viewerEligible,
      true
    );

    assert.equal(
      result.candidateEligible,
      true
    );
  }
);

test(
  'remarriage compatibility respects accepted marital statuses',
  () => {
    const accepted =
      evaluatePreferences(
        {
          acceptedMaritalStatuses: [
            'Divorced',
            'Widowed'
          ]
        },

        {
          maritalStatus:
            'Divorced'
        }
      );

    const excluded =
      evaluatePreferences(
        {
          acceptedMaritalStatuses: [
            'Never Married'
          ]
        },

        {
          maritalStatus:
            'Divorced'
        }
      );

    assert.ok(
      accepted.matchedFactors.includes(
        'Marital status'
      )
    );

    assert.ok(
      excluded.unmatchedFactors.includes(
        'Marital status'
      )
    );
  }
);

test(
  'profile schema validates bounded structured family data',
  async () => {
    const valid =
      new MatrimonialProfile({
        profileId:
          'KSM999999',

        userId:
          '507f1f77bcf86cd799439011',

        profileFor:
          'Self',

        firstName:
          'A',

        maritalStatus:
          'Widowed',

        maritalHistory: {
          status:
            'Widowed',

          childrenCount:
            1
        },

        family: {
          siblingDetails: [
            {
              relation:
                'Sister',

              gender:
                'Female',

              maritalStatus:
                'Married'
            }
          ]
        },

        familyAssets: {
          agricultureLand: {
            hasLand:
              true,

            approximateArea:
              4,

            unit:
              'Acre'
          }
        }
      });

    await valid.validate();

    valid.familyAssets
      .agricultureLand
      .unit =
      'Square Feet';

    await assert.rejects(
      () =>
        valid.validate(),

      (
        error
      ) => {
        assert.ok(
          error.errors[
            'familyAssets.agricultureLand.unit'
          ]
        );

        return true;
      }
    );
  }
);