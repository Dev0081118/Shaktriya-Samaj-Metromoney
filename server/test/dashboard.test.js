import test, {
  after,
  afterEach,
  before
} from 'node:test';

import assert from 'node:assert/strict';

import jwt from 'jsonwebtoken';

import mongoose from 'mongoose';

import request from 'supertest';

import {
  MongoMemoryServer
} from 'mongodb-memory-server';

import app from '../src/app.js';

import User from '../src/models/User.js';

import MatrimonialProfile from '../src/models/MatrimonialProfile.js';

import PartnerPreference from '../src/models/PartnerPreference.js';

import {
  Interest,
  Shortlist
} from '../src/models/Interaction.js';

import {
  Plan,
  Subscription
} from '../src/models/Platform.js';

import {
  PlanUsage
} from '../src/models/Business.js';

let database;

before(
  async () => {
    process.env.JWT_SECRET =
      'dashboard-test-secret';

    process.env.NODE_ENV =
      'test';

    if (process.env.TEST_MONGO_URI) {
      await mongoose.connect(process.env.TEST_MONGO_URI);
    } else {
      database =
        await MongoMemoryServer.create({
          instance: {
            ip:
              '127.0.0.1'
          }
        });

      await mongoose.connect(
        database.getUri()
      );
    }
  }
);

afterEach(
  async () => {
    for (
      const collection of Object.values(
        mongoose.connection
          .collections
      )
    ) {
      await collection.deleteMany(
        {}
      );
    }
  }
);

after(
  async () => {
    await mongoose.disconnect();

    if (database) {
      await database.stop();
    }
  }
);

const tokenFor =
  (
    user
  ) =>
    jwt.sign(
      {
        sub:
          user.id,

        ver:
          user.tokenVersion ||
          0
      },
      process.env.JWT_SECRET
    );

test(
  'dashboard returns membership usage and preserves existing recommendation actions',
  async () => {
    const [
      member,
      candidateUser
    ] =
      await User.create([
        {
          email:
            'dashboard-member@example.com',

          password:
            'Password123!',

          role:
            'member'
        },

        {
          email:
            'dashboard-candidate@example.com',

          password:
            'Password123!',

          role:
            'member'
        }
      ]);

    const memberProfile =
      await MatrimonialProfile.create({
        userId:
          member._id,

        profileFor:
          'Self',

        firstName:
          'Raj',

        lastName:
          'Rana',

        gender:
          'Male',

        dateOfBirth:
          new Date(
            '1998-05-14'
          ),

        visibility:
          'active',

        lifecycleStatus:
          'Active',

        community: {
          name:
            'Rajput / Kshatriya',

          clan:
            'Rana',

          gotra:
            'Kashyap',

          vansh:
            'Suryavanshi'
        },

        location: {
          nativePlace:
            'Khirasara',

          nativeDistrict:
            'Rajkot',

          nativeState:
            'Gujarat'
        }
      });

    const candidateProfile =
      await MatrimonialProfile.create({
        userId:
          candidateUser._id,

        profileFor:
          'Self',

        firstName:
          'Priya',

        lastName:
          'Jadeja',

        gender:
          'Female',

        dateOfBirth:
          new Date(
            '2000-03-10'
          ),

        height:
          165,

        visibility:
          'active',

        lifecycleStatus:
          'Active',

        community: {
          name:
            'Rajput / Kshatriya',

          clan:
            'Jadeja',

          gotra:
            'Vashishtha',

          vansh:
            'Suryavanshi'
        },

        location: {
          nativePlace:
            'Gondal',

          nativeDistrict:
            'Rajkot',

          nativeState:
            'Gujarat'
        },

        education: {
          highestEducation:
            'MBA'
        },

        career: {
          occupation:
            'Consultant'
        },

        privacy: {
          fullNameVisibility:
            'RegisteredMembers',

          photoVisibility:
            'RegisteredMembers',

          astrologyVisibility:
            'RegisteredMembers',

          familyOverviewVisibility:
            'AcceptedInterests',

          maternalFamilyVisibility:
            'AcceptedInterests',

          siblingDetailsVisibility:
            'AcceptedInterests',

          assetVisibility:
            'Private',

          incomeVisibility:
            'Private',

          contactAddressVisibility:
            'Private'
        }
      });

    await PartnerPreference.create({
      profileId:
        memberProfile._id,

      preferredGender:
        'Female',

      ageMin:
        22,

      ageMax:
        30,

      states: [
        'Gujarat'
      ]
    });

    await PartnerPreference.create({
      profileId:
        candidateProfile._id,

      preferredGender:
        'Male',

      ageMin:
        25,

      ageMax:
        35,

      states: [
        'Gujarat'
      ]
    });

    await Interest.create({
      senderProfile:
        memberProfile._id,

      receiverProfile:
        candidateProfile._id,

      status:
        'Pending'
    });

    await Shortlist.create({
      userProfile:
        memberProfile._id,

      shortlistedProfile:
        candidateProfile._id
    });

    const plan =
      await Plan.create({
        name:
          'Premium',

        slug:
          'dashboard-premium',

        price:
          4999,

        durationDays:
          180,

        active:
          true,

        features: {
          interestLimit:
            30,

          contactViewLimit:
            10,

          advancedSearch:
            true,

          profileBoost:
            true,

          prioritySupport:
            false,

          relationshipManager:
            false
        }
      });

    const startsAt =
      new Date(
        Date.now() -
          864e5
      );

    const endsAt =
      new Date(
        Date.now() +
          30 *
            864e5
      );

    const subscription =
      await Subscription.create({
        user:
          member._id,

        plan:
          plan._id,

        planNameSnapshot:
          'Premium',

        priceSnapshot:
          4999,

        entitlementSnapshot: {
          interestLimit:
            30,

          contactViewLimit:
            10,

          advancedSearch:
            true,

          profileBoost:
            true,

          prioritySupport:
            false,

          relationshipManager:
            false
        },

        startsAt,

        endsAt,

        status:
          'Active'
      });

    await PlanUsage.create({
      user:
        member._id,

      subscription:
        subscription._id,

      periodStart:
        subscription.startsAt,

      periodEnd:
        subscription.endsAt,

      interestsUsed:
        6,

      contactViewsUsed:
        2
    });

    const response =
      await request(
        app
      )
        .get(
          '/api/dashboard'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            member
          )}`
        );

    assert.equal(
      response.status,
      200
    );

    assert.equal(
      response.body.data
        .membership.plan.name,
      'Premium'
    );

    assert.equal(
      response.body.data
        .membership.usage
        .interestsUsed,
      6
    );

    assert.equal(
      response.body.data
        .membership.usage
        .interestsRemaining,
      24
    );

    assert.equal(
      response.body.data
        .membership.usage
        .contactViewsUsed,
      2
    );

    assert.equal(
      response.body.data
        .membership.usage
        .contactViewsRemaining,
      8
    );

    assert.equal(
      response.body.data
        .membership.features
        .advancedSearch,
      true
    );

    assert.equal(
      response.body.data
        .membership.features
        .profileBoost,
      true
    );

    const recommendation =
      response.body.data
        .recommendedProfiles.find(
          (
            item
          ) =>
            item.profileId ===
            candidateProfile.profileId
        );

    assert.ok(
      recommendation
    );

    assert.equal(
      recommendation.interestSent,
      true
    );

    assert.equal(
      recommendation.interestStatus,
      'Pending'
    );

    assert.equal(
      recommendation.shortlisted,
      true
    );
  }
);

test(
  'dashboard still returns membership context before profile creation',
  async () => {
    const member =
      await User.create({
        email:
          'dashboard-new@example.com',

        password:
          'Password123!',

        role:
          'member'
      });

    const response =
      await request(
        app
      )
        .get(
          '/api/dashboard'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            member
          )}`
        );

    assert.equal(
      response.status,
      200
    );

    assert.equal(
      response.body.data
        .profile,
      null
    );

    assert.equal(
      response.body.data
        .profileCompletion,
      0
    );

    assert.ok(
      response.body.data
        .membership
    );

    assert.equal(
      response.body.data
        .membership.plan.name,
      'Free'
    );
  }
);

test(
  'same Surname or Shakh is never recommended even when that profile is boosted',
  async () => {
    const [
      member,
      sameSurnameUser,
      differentSurnameUser
    ] =
      await User.create([
        {
          email:
            'recommendation-viewer@example.com',

          password:
            'Password123!',

          role:
            'member'
        },

        {
          email:
            'recommendation-same-surname@example.com',

          password:
            'Password123!',

          role:
            'member'
        },

        {
          email:
            'recommendation-allowed@example.com',

          password:
            'Password123!',

          role:
            'member'
        }
      ]);

    const memberProfile =
      await MatrimonialProfile.create({
        userId:
          member._id,

        profileFor:
          'Self',

        firstName:
          'Raj',

        lastName:
          'Rana',

        gender:
          'Male',

        dateOfBirth:
          new Date(
            '1998-05-14'
          ),

        height:
          178,

        weight:
          72,

        maritalStatus:
          'Never Married',

        visibility:
          'active',

        lifecycleStatus:
          'Active',

        community: {
          name:
            'Rajput / Kshatriya',

          clan:
            'Rana',

          gotra:
            'Kashyap',

          vansh:
            'Suryavanshi'
        },

        location: {
          nativePlace:
            'Khirasara',

          nativeDistrict:
            'Rajkot',

          nativeState:
            'Gujarat'
        },

        lifestyle: {
          diet:
            'Vegetarian'
        }
      });

    const sameSurnameProfile =
      await MatrimonialProfile.create({
        userId:
          sameSurnameUser._id,

        profileFor:
          'Self',

        firstName:
          'Priya',

        lastName:
          'Rana',

        gender:
          'Female',

        dateOfBirth:
          new Date(
            '2000-03-10'
          ),

        height:
          165,

        weight:
          55,

        maritalStatus:
          'Never Married',

        visibility:
          'active',

        lifecycleStatus:
          'Active',

        /*
         * Active boost intentionally set far into future.
         *
         * The hard surname rule must run before boost
         * ordering and prevent this profile completely.
         */
        boostedUntil:
          new Date(
            Date.now() +
              24 *
                60 *
                60 *
                1000
          ),

        community: {
          name:
            'Rajput / Kshatriya',

          /*
           * Intentional case/whitespace variant.
           */
          clan:
            ' RANA ',

          gotra:
            'Vashishtha',

          vansh:
            'Suryavanshi'
        },

        location: {
          nativePlace:
            'Gondal',

          nativeDistrict:
            'Rajkot',

          nativeState:
            'Gujarat'
        },

        lifestyle: {
          diet:
            'Vegetarian'
        }
      });

    const allowedProfile =
      await MatrimonialProfile.create({
        userId:
          differentSurnameUser._id,

        profileFor:
          'Self',

        firstName:
          'Nisha',

        lastName:
          'Jadeja',

        gender:
          'Female',

        dateOfBirth:
          new Date(
            '2000-06-15'
          ),

        height:
          164,

        weight:
          54,

        maritalStatus:
          'Never Married',

        visibility:
          'active',

        lifecycleStatus:
          'Active',

        community: {
          name:
            'Rajput / Kshatriya',

          clan:
            'Jadeja',

          gotra:
            'Vashishtha',

          vansh:
            'Suryavanshi'
        },

        location: {
          nativePlace:
            'Gondal',

          nativeDistrict:
            'Rajkot',

          nativeState:
            'Gujarat'
        },

        lifestyle: {
          diet:
            'Vegetarian'
        }
      });

    await PartnerPreference.create({
      profileId:
        memberProfile._id,

      preferredGender:
        'Female',

      ageMin:
        22,

      ageMax:
        30,

      heightMin:
        150,

      heightMax:
        180,

      weightMin:
        45,

      weightMax:
        70,

      states: [
        'Gujarat'
      ],

      dietPreferences: [
        'Vegetarian'
      ]
    });

    /*
     * Both candidates are otherwise reciprocal matches.
     * Surname alone must be enough to remove the first.
     */
    await PartnerPreference.create({
      profileId:
        sameSurnameProfile._id,

      preferredGender:
        'Male',

      ageMin:
        24,

      ageMax:
        35,

      states: [
        'Gujarat'
      ]
    });

    await PartnerPreference.create({
      profileId:
        allowedProfile._id,

      preferredGender:
        'Male',

      ageMin:
        24,

      ageMax:
        35,

      states: [
        'Gujarat'
      ]
    });

    const response =
      await request(
        app
      )
        .get(
          '/api/dashboard'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            member
          )}`
        );

    assert.equal(
      response.status,
      200
    );

    const recommendationIds =
      response.body.data
        .recommendedProfiles.map(
          (
            profile
          ) =>
            profile.profileId
        );

    /*
     * Boost must never bypass family/surname safety.
     */
    assert.equal(
      recommendationIds.includes(
        sameSurnameProfile.profileId
      ),
      false
    );

    /*
     * Normal different-surname candidate still works.
     */
    assert.equal(
      recommendationIds.includes(
        allowedProfile.profileId
      ),
      true
    );

    assert.equal(
      response.body.data
        .recommendationState
        .totalQualified,
      1
    );
  }
);

test(
  'clearing numeric preferences persists and changes dashboard recommendations',
  async () => {
    const [member, candidateUser] = await User.create([
      { email: 'clear-pref-viewer@example.com', password: 'Password123!', role: 'member' },
      { email: 'clear-pref-candidate@example.com', password: 'Password123!', role: 'member' }
    ]);

    const viewer = await MatrimonialProfile.create({
      userId: member._id, profileFor: 'Self', firstName: 'Raj', lastName: 'Rana',
      gender: 'Male', dateOfBirth: new Date('1997-01-01'), height: 178,
      weight: 76, maritalStatus: 'Never Married', visibility: 'active',
      lifecycleStatus: 'Active',
      community: { clan: 'Rana', gotra: 'Kashyap', vansh: 'Suryavanshi' },
      location: { nativePlace: 'Rajkot', nativeDistrict: 'Rajkot', nativeState: 'Gujarat' }
    });
    const candidate = await MatrimonialProfile.create({
      userId: candidateUser._id, profileFor: 'Self', firstName: 'Priya',
      lastName: 'Jadeja', gender: 'Female', dateOfBirth: new Date('1999-01-01'),
      height: 163, weight: 55, maritalStatus: 'Never Married',
      visibility: 'active', lifecycleStatus: 'Active',
      community: { clan: 'Jadeja', gotra: 'Vashishtha', vansh: 'Suryavanshi' },
      location: { nativePlace: 'Ahmedabad', nativeDistrict: 'Ahmedabad', nativeState: 'Gujarat' }
    });
    await PartnerPreference.create({
      profileId: viewer._id, preferredGender: 'Female', ageMin: 35, ageMax: 40,
      states: ['Gujarat'], importance: { age: 'Must Have' }
    });
    await PartnerPreference.create({
      profileId: candidate._id, preferredGender: 'Male', ageMin: 25, ageMax: 35,
      states: ['Gujarat']
    });
    const token = tokenFor(member);
    const before = await request(app).get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(before.status, 200);
    assert.equal(before.body.data.recommendedProfiles.some(
      (item) => item.profileId === candidate.profileId
    ), false);

    const update = await request(app).put('/api/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ preferredGender: 'Female', ageMin: null, ageMax: null,
        states: ['Gujarat'], importance: { age: 'Medium', location: 'Medium' } });
    assert.equal(update.status, 200);
    const stored = await PartnerPreference.findOne({ profileId: viewer._id }).lean();
    assert.equal(stored.ageMin, undefined);
    assert.equal(stored.ageMax, undefined);

    const after = await request(app).get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(after.status, 200);
    assert.equal(after.body.data.recommendedProfiles.some(
      (item) => item.profileId === candidate.profileId
    ), true);
  }
);
