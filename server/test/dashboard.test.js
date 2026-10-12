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

    await database.stop();
  }
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

    const token =
      jwt.sign(
        {
          sub:
            member.id,

          ver:
            member.tokenVersion ||
            0
        },
        process.env.JWT_SECRET
      );

    const response =
      await request(
        app
      )
        .get(
          '/api/dashboard'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
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

    const token =
      jwt.sign(
        {
          sub:
            member.id,

          ver:
            member.tokenVersion ||
            0
        },
        process.env.JWT_SECRET
      );

    const response =
      await request(
        app
      )
        .get(
          '/api/dashboard'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
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
