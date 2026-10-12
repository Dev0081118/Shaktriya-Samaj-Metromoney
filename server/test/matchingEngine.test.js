import test from 'node:test';

import assert from 'node:assert/strict';

import {
  calculateMutualMatch,
  evaluateDirectionalMatch
} from '../src/services/matchingEngine.js';

test(
  'weight preference contributes to directional match score',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          weightMin:
            50,

          weightMax:
            65,

          importance: {
            weight:
              'High'
          }
        },

        {
          weight:
            58
        }
      );

    assert.equal(
      result.score,
      100
    );

    assert.equal(
      result.eligible,
      true
    );

    assert.equal(
      result.hasPreferences,
      true
    );

    assert.ok(
      result.matchedFactors.includes(
        'Preferred weight'
      )
    );
  }
);

test(
  'must-have weight excludes an incompatible candidate',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          weightMin:
            50,

          weightMax:
            60,

          importance: {
            weight:
              'Must Have'
          }
        },

        {
          weight:
            80
        }
      );

    assert.equal(
      result.eligible,
      false
    );

    assert.ok(
      result.hardFailures.includes(
        'Preferred weight'
      )
    );
  }
);

test(
  'must-have unknown weight excludes candidate because requirement cannot be verified',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          weightMin:
            50,

          weightMax:
            60,

          importance: {
            weight:
              'Must Have'
          }
        },

        {
          height:
            170
        }
      );

    assert.equal(
      result.eligible,
      false
    );

    assert.ok(
      result.unknownFactors.includes(
        'Preferred weight'
      )
    );

    assert.ok(
      result.hardFailures.some(
        (
          factor
        ) =>
          factor.includes(
            'Preferred weight'
          )
      )
    );
  }
);

test(
  'soft unknown information does not automatically fail candidate',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          incomePreferences: {
            min:
              1000000
          },

          importance: {
            income:
              'High'
          }
        },

        {
          career: {
            occupation:
              'Engineer'
          }
        }
      );

    assert.equal(
      result.eligible,
      true
    );

    assert.equal(
      result.score,
      null
    );

    assert.equal(
      result.confidence,
      0
    );

    assert.ok(
      result.unknownFactors.includes(
        'Income preference'
      )
    );
  }
);

test(
  'must-have unknown income information is not considered eligible',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          incomePreferences: {
            min:
              1000000
          },

          importance: {
            income:
              'Must Have'
          }
        },

        {
          career: {
            occupation:
              'Engineer'
          }
        }
      );

    assert.equal(
      result.eligible,
      false
    );

    assert.ok(
      result.unknownFactors.includes(
        'Income preference'
      )
    );

    assert.ok(
      result.hardFailures.some(
        (
          factor
        ) =>
          factor.includes(
            'Income preference'
          )
      )
    );
  }
);

test(
  'same pair can have different directional percentages',
  () => {
    const profileA = {
      dateOfBirth:
        '1998-01-01',

      height:
        175,

      weight:
        72,

      community: {
        clan:
          'Jadeja'
      },

      lifestyle: {
        diet:
          'Vegetarian'
      }
    };

    const profileB = {
      dateOfBirth:
        '2000-01-01',

      height:
        162,

      weight:
        55,

      community: {
        clan:
          'Gohil'
      },

      lifestyle: {
        diet:
          'Vegetarian'
      }
    };

    const preferenceA = {
      weightMin:
        50,

      weightMax:
        60,

      dietPreferences: [
        'Vegetarian'
      ],

      shakhPreferences: [
        'Gohil'
      ]
    };

    const preferenceB = {
      heightMin:
        178,

      shakhPreferences: [
        'Jhala'
      ]
    };

    const result =
      calculateMutualMatch(
        profileA,
        preferenceA,
        profileB,
        preferenceB
      );

    assert.equal(
      result.preferenceFitScore,
      100
    );

    assert.ok(
      result.reverseFitScore <
      result.preferenceFitScore
    );

    assert.equal(
      result.score,
      result.preferenceFitScore
    );
  }
);

test(
  'mutual score uses reciprocal balance instead of arithmetic average',
  () => {
    const result =
      calculateMutualMatch(
        {
          height:
            170
        },

        {
          heightMin:
            160,

          heightMax:
            190
        },

        {
          height:
            165
        },

        {
          heightMin:
            175,

          heightMax:
            185
        }
      );

    /*
     * B satisfies A completely.
     */
    assert.equal(
      result.preferenceFitScore,
      100
    );

    /*
     * A is below B's preferred minimum height,
     * therefore reverse fit must be lower.
     */
    assert.ok(
      result.reverseFitScore <
      100
    );

    assert.ok(
      result.reverseFitScore >
      0
    );

    const arithmeticAverage =
      Math.round(
        (
          result.preferenceFitScore +
          result.reverseFitScore
        ) /
          2
      );

    /*
     * Harmonic mean penalizes an unbalanced pair more
     * than a simple arithmetic average.
     */
    assert.ok(
      result.mutualScore <
      arithmeticAverage
    );

    assert.ok(
      result.mutualScore >
      result.reverseFitScore
    );
  }
);
test(
  'recommendation ranking is viewer-first but includes mutual compatibility',
  () => {
    const result =
      calculateMutualMatch(
        {
          height:
            180,

          lifestyle: {
            diet:
              'Vegetarian'
          }
        },

        {
          heightMin:
            160,

          heightMax:
            190,

          dietPreferences: [
            'Vegetarian'
          ]
        },

        {
          height:
            165,

          lifestyle: {
            diet:
              'Vegetarian'
          }
        },

        {
          heightMin:
            178,

          dietPreferences: [
            'Vegetarian'
          ]
        }
      );

    assert.equal(
      result.preferenceFitScore,
      100
    );

    assert.ok(
      result.mutualScore <=
      result.preferenceFitScore
    );

    assert.ok(
      result.rankingScore <=
      result.preferenceFitScore
    );

    assert.ok(
      result.rankingScore >=
      result.mutualScore
    );
  }
);

test(
  'multiple shakh preferences accept any configured option',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          shakhPreferences: [
            'Jadeja',
            'Gohil',
            'Jhala'
          ],

          importance: {
            shakh:
              'High'
          }
        },

        {
          community: {
            clan:
              'Gohil'
          }
        }
      );

    assert.equal(
      result.score,
      100
    );

    assert.equal(
      result.eligible,
      true
    );

    assert.ok(
      result.matchedFactors.includes(
        'Surname / Shakh'
      )
    );
  }
);

test(
  'legacy community preferences still behave as shakh preferences',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          communityPreferences: [
            'Jadeja'
          ]
        },

        {
          community: {
            clan:
              'Jadeja'
          }
        }
      );

    assert.equal(
      result.score,
      100
    );
  }
);

test(
  'gotra preference is evaluated independently from shakh',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          shakhPreferences: [
            'Jadeja'
          ],

          gotraPreferences: [
            'Kashyap'
          ]
        },

        {
          community: {
            clan:
              'Jadeja',

            gotra:
              'Vashishtha'
          }
        }
      );

    assert.ok(
      result.score <
      100
    );

    assert.ok(
      result.matchedFactors.includes(
        'Surname / Shakh'
      )
    );

    assert.ok(
      result.unmatchedFactors.includes(
        'Gotra'
      )
    );
  }
);

test(
  'vansh preference is matched using community vansh',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          vanshPreferences: [
            'Suryavanshi'
          ]
        },

        {
          community: {
            vansh:
              'Suryavanshi'
          }
        }
      );

    assert.equal(
      result.score,
      100
    );
  }
);

test(
  'matching uses native location rather than current residential location',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          states: [
            'Gujarat'
          ]
        },

        {
          location: {
            state:
              'Gujarat',

            city:
              'Ahmedabad',

            nativeState:
              'Rajasthan',

            nativeDistrict:
              'Udaipur'
          }
        }
      );

    assert.equal(
      result.score,
      0
    );
  }
);

test(
  'native district can satisfy location preference',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          locations: [
            'Rajkot'
          ]
        },

        {
          location: {
            city:
              'Ahmedabad',

            state:
              'Gujarat',

            nativeDistrict:
              'Rajkot',

            nativeState:
              'Gujarat'
          }
        }
      );

    assert.equal(
      result.score,
      100
    );
  }
);

test(
  'education preference supports meaningful text matching',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          educationPreferences: [
            'Engineering'
          ]
        },

        {
          education: {
            highestEducation:
              'Bachelor of Engineering'
          }
        }
      );

    assert.equal(
      result.score,
      100
    );
  }
);

test(
  'occupation preference supports profession text matching',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          occupationPreferences: [
            'Engineer'
          ]
        },

        {
          career: {
            occupation:
              'Software Engineer'
          }
        }
      );

    assert.equal(
      result.score,
      100
    );
  }
);

test(
  'diet must-have rejects incompatible lifestyle',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          dietPreferences: [
            'Vegetarian'
          ],

          importance: {
            diet:
              'Must Have'
          }
        },

        {
          lifestyle: {
            diet:
              'Non-Vegetarian'
          }
        }
      );

    assert.equal(
      result.eligible,
      false
    );

    assert.ok(
      result.hardFailures.includes(
        'Diet preference'
      )
    );
  }
);

test(
  'family type preference contributes to matching',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          familyTypePreferences: [
            'Joint'
          ]
        },

        {
          family: {
            familyType:
              'Joint'
          }
        }
      );

    assert.equal(
      result.score,
      100
    );
  }
);

test(
  'family values preference contributes to matching',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          familyValuePreferences: [
            'Traditional'
          ],

          importance: {
            familyValues:
              'High'
          }
        },

        {
          family: {
            familyValues:
              'Traditional'
          }
        }
      );

    assert.equal(
      result.score,
      100
    );
  }
);

test(
  'smoking and drinking preferences are evaluated separately',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          smokingPreferences: [
            'Never'
          ],

          drinkingPreferences: [
            'Never'
          ]
        },

        {
          lifestyle: {
            smoking:
              'Never',

            drinking:
              'Occasionally'
          }
        }
      );

    assert.ok(
      result.score <
      100
    );

    assert.ok(
      result.matchedFactors.includes(
        'Smoking preference'
      )
    );

    assert.ok(
      result.unmatchedFactors.includes(
        'Drinking preference'
      )
    );
  }
);

test(
  'income preference can be evaluated server-side',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          incomePreferences: {
            min:
              1000000,

            max:
              2000000
          }
        },

        {
          career: {
            annualIncome:
              1500000
          }
        }
      );

    assert.equal(
      result.score,
      100
    );

    assert.equal(
      result.eligible,
      true
    );
  }
);

test(
  'residential property preference uses structured family assets',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          propertyPreferences: {
            ownResidence:
              'Yes'
          }
        },

        {
          familyAssets: {
            residentialProperties: [
              {
                propertyName:
                  'Family Home',

                isPrimaryResidence:
                  true
              }
            ]
          }
        }
      );

    assert.equal(
      result.score,
      100
    );
  }
);

test(
  'agricultural land preference uses hasLand boolean',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          propertyPreferences: {
            agricultureLand:
              'Yes'
          }
        },

        {
          familyAssets: {
            agricultureLand: {
              hasLand:
                true,

              approximateArea:
                5,

              unit:
                'Acre'
            }
          }
        }
      );

    assert.equal(
      result.score,
      100
    );
  }
);

test(
  'business assets preference uses structured business asset list',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          propertyPreferences: {
            businessAssets:
              'Yes'
          }
        },

        {
          familyAssets: {
            businessAssets: [
              {
                assetName:
                  'Factory'
              }
            ]
          }
        }
      );

    assert.equal(
      result.score,
      100
    );
  }
);

test(
  'property preference Any does not activate scoring criterion',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          propertyPreferences: {
            ownResidence:
              'Any',

            agricultureLand:
              'Any',

            businessAssets:
              'Any'
          }
        },

        {}
      );

    assert.equal(
      result.score,
      null
    );

    assert.equal(
      result.hasPreferences,
      false
    );
  }
);

test(
  'marriage timeline contributes to compatibility',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          marriageTimeline: [
            'Within 1 year'
          ]
        },

        {
          marriageTimeline:
            'Within 1 year'
        }
      );

    assert.equal(
      result.score,
      100
    );
  }
);

test(
  'candidate can partially match a soft numeric range',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          heightMin:
            170,

          heightMax:
            180,

          importance: {
            height:
              'Medium'
          }
        },

        {
          height:
            165
        }
      );

    assert.equal(
      result.eligible,
      true
    );

    assert.ok(
      result.score >
      0
    );

    assert.ok(
      result.score <
      100
    );
  }
);

test(
  'must-have numeric range does not accept partial score',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          heightMin:
            170,

          heightMax:
            180,

          importance: {
            height:
              'Must Have'
          }
        },

        {
          height:
            165
        }
      );

    assert.equal(
      result.eligible,
      false
    );

    assert.ok(
      result.hardFailures.includes(
        'Preferred height'
      )
    );
  }
);

test(
  'confidence decreases when some active preference data is unavailable',
  () => {
    const result =
      evaluateDirectionalMatch(
        {
          weightMin:
            50,

          weightMax:
            65,

          dietPreferences: [
            'Vegetarian'
          ]
        },

        {
          weight:
            55
        }
      );

    assert.equal(
      result.score,
      100
    );

    assert.ok(
      result.confidence <
      100
    );

    assert.ok(
      result.confidence >
      0
    );

    assert.ok(
      result.unknownFactors.includes(
        'Diet preference'
      )
    );
  }
);

test(
  'no configured preferences returns null score instead of fake percentage',
  () => {
    const result =
      evaluateDirectionalMatch(
        {},
        {
          height:
            170,

          weight:
            60
        }
      );

    assert.equal(
      result.score,
      null
    );

    assert.equal(
      result.hasPreferences,
      false
    );

    assert.equal(
      result.confidence,
      0
    );

    assert.equal(
      result.eligible,
      true
    );
  }
);

test(
  'mutual eligibility fails when reverse must-have requirement fails',
  () => {
    const profileA = {
      community: {
        clan:
          'Jadeja'
      }
    };

    const profileB = {
      community: {
        clan:
          'Gohil'
      }
    };

    const result =
      calculateMutualMatch(
        profileA,

        {
          shakhPreferences: [
            'Gohil'
          ]
        },

        profileB,

        {
          shakhPreferences: [
            'Jhala'
          ],

          importance: {
            shakh:
              'Must Have'
          }
        }
      );

    assert.equal(
      result.viewerEligible,
      true
    );

    assert.equal(
      result.candidateEligible,
      false
    );

    assert.equal(
      result.eligible,
      false
    );
  }
);