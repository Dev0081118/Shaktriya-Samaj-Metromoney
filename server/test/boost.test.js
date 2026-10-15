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

import {
  Plan,
  Subscription
} from '../src/models/Platform.js';

import {
  BoostActivation,
  BoostCreditGrant,
  BoostOrder,
  BoostPack,
  BoostPlanConfig
} from '../src/models/Boost.js';

import {
  getBoostWallet
} from '../src/services/boostService.js';

import {
  clearExpiredProfileBoosts
} from '../src/services/boostExposureService.js';

let database;

before(
  async () => {
    process.env.JWT_SECRET =
      'boost-test-secret';

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

const createMember =
  async (
    email
  ) =>
    User.create({
      email,

      password:
        'Password123!',

      role:
        'member'
    });

const createSuperAdmin =
  async (
    email =
      'boost-admin@example.com'
  ) =>
    User.create({
      email,

      password:
        'Password123!',

      role:
        'super_admin'
    });

const createMemberProfile =
  async (
    user,
    overrides = {}
  ) =>
    MatrimonialProfile.create({
      userId:
        user._id,

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

      privacy: {
        fullNameVisibility:
          'RegisteredMembers',

        photoVisibility:
          'RegisteredMembers',

        incomeVisibility:
          'Private',

        familyOverviewVisibility:
          'AcceptedInterests',

        maternalFamilyVisibility:
          'AcceptedInterests',

        siblingDetailsVisibility:
          'AcceptedInterests',

        assetVisibility:
          'Private',

        astrologyVisibility:
          'RegisteredMembers',

        contactAddressVisibility:
          'Private'
      },

      ...overrides
    });

const createPlan =
  async ({
    name =
      'Premium',

    slug =
      'boost-premium',

    price =
      4999,

    durationDays =
      180
  } = {}) =>
    Plan.create({
      name,

      slug,

      price,

      durationDays,

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

const createActiveSubscription =
  async (
    user,
    plan,
    {
      startsAt =
        new Date(
          Date.now() -
            864e5
        ),

      endsAt =
        new Date(
          Date.now() +
            30 *
              864e5
        )
    } = {}
  ) =>
    Subscription.create({
      user:
        user._id,

      plan:
        plan._id,

      planNameSnapshot:
        plan.name,

      priceSnapshot:
        plan.price,

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

      status:
        'Active',

      startsAt,

      endsAt
    });

const configurePlanBoost =
  async (
    plan,
    {
      includedCredits =
        10,

      durationHours =
        12
    } = {}
  ) =>
    BoostPlanConfig.create({
      plan:
        plan._id,

      includedCredits,

      durationHours,

      active:
        true
    });

test(
  'active subscription automatically grants configured boost credits exactly once',
  async () => {
    const member =
      await createMember(
        'boost-subscription@example.com'
      );

    await createMemberProfile(
      member
    );

    const plan =
      await createPlan();

    await configurePlanBoost(
      plan,
      {
        includedCredits:
          10,

        durationHours:
          12
      }
    );

    const subscription =
      await createActiveSubscription(
        member,
        plan
      );

    const token =
      tokenFor(
        member
      );

    const first =
      await request(
        app
      )
        .get(
          '/api/profile-boost'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      first.status,
      200
    );

    assert.equal(
      first.body.data
        .wallet
        .availableCredits,
      10
    );

    assert.equal(
      first.body.data
        .wallet
        .grants.length,
      1
    );

    assert.equal(
      first.body.data
        .wallet
        .grants[0]
        .sourceType,
      'Subscription'
    );

    assert.equal(
      first.body.data
        .wallet
        .grants[0]
        .durationHours,
      12
    );

    /*
     * Calling status again must not create another
     * subscription grant.
     */
    const second =
      await request(
        app
      )
        .get(
          '/api/profile-boost'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      second.status,
      200
    );

    assert.equal(
      second.body.data
        .wallet
        .availableCredits,
      10
    );

    const grants =
      await BoostCreditGrant.find({
        user:
          member._id,

        sourceType:
          'Subscription'
      });

    assert.equal(
      grants.length,
      1
    );

    assert.equal(
      grants[0]
        .sourceKey,
      `subscription:${subscription._id}`
    );

    assert.equal(
      grants[0]
        .creditsGranted,
      10
    );

    assert.equal(
      grants[0]
        .creditsRemaining,
      10
    );
  }
);

test(
  'activating one boost consumes exactly one credit and activates profile for configured duration',
  async () => {
    const member =
      await createMember(
        'boost-activate@example.com'
      );

    const profile =
      await createMemberProfile(
        member
      );

    const plan =
      await createPlan({
        slug:
          'boost-activate-plan'
      });

    await configurePlanBoost(
      plan,
      {
        includedCredits:
          10,

        durationHours:
          12
      }
    );

    await createActiveSubscription(
      member,
      plan
    );

    const before =
      await getBoostWallet(
        member._id
      );

    assert.equal(
      before.availableCredits,
      10
    );

    const requestStartedAt =
      new Date();

    const response =
      await request(
        app
      )
        .post(
          '/api/profile-boost'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            member
          )}`
        );

    const requestEndedAt =
      new Date();

    assert.equal(
      response.status,
      201
    );

    assert.equal(
      response.body.data
        .wallet
        .availableCredits,
      9
    );

    assert.equal(
      response.body.data
        .wallet
        .active,
      true
    );

    assert.ok(
      response.body.data
        .wallet
        .activeUntil
    );

    const savedProfile =
      await MatrimonialProfile.findById(
        profile._id
      );

    assert.ok(
      savedProfile.boostedUntil
    );

    assert.ok(
      savedProfile.lastBoostAt
    );

    const minimumExpected =
      requestStartedAt.getTime() +
      12 *
        60 *
        60 *
        1000 -
      5000;

    const maximumExpected =
      requestEndedAt.getTime() +
      12 *
        60 *
        60 *
        1000 +
      5000;

    const actualEnd =
      new Date(
        savedProfile.boostedUntil
      ).getTime();

    assert.ok(
      actualEnd >=
        minimumExpected
    );

    assert.ok(
      actualEnd <=
        maximumExpected
    );

    const grant =
      await BoostCreditGrant.findOne({
        user:
          member._id
      });

    assert.equal(
      grant.creditsRemaining,
      9
    );

    const activations =
      await BoostActivation.find({
        user:
          member._id
      });

    assert.equal(
      activations.length,
      1
    );

    assert.equal(
      activations[0]
        .durationHours,
      12
    );

    assert.equal(
      String(
        activations[0]
          .creditGrant
      ),
      String(
        grant._id
      )
    );
  }
);

test(
  'boost activation and expiry do not change the organic profile updatedAt timestamp',
  async () => {
    const member =
      await createMember(
        'boost-timestamp@example.com'
      );

    const profile =
      await createMemberProfile(
        member,
        {
          profileId:
            'KSMBOOST001'
        }
      );

    /*
     * Give the profile an intentionally old organic
     * update time.
     *
     * Boost activity must never replace this timestamp.
     */
    const organicUpdatedAt =
      new Date(
        Date.now() -
          14 *
            864e5
      );

    await MatrimonialProfile.updateOne(
      {
        _id:
          profile._id
      },

      {
        $set: {
          updatedAt:
            organicUpdatedAt
        }
      },

      {
        timestamps:
          false
      }
    );

    const plan =
      await createPlan({
        slug:
          'boost-timestamp-plan'
      });

    await configurePlanBoost(
      plan,
      {
        includedCredits:
          2,

        durationHours:
          12
      }
    );

    await createActiveSubscription(
      member,
      plan
    );

    const response =
      await request(
        app
      )
        .post(
          '/api/profile-boost'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            member
          )}`
        );

    assert.equal(
      response.status,
      201
    );

    const afterActivation =
      await MatrimonialProfile.findById(
        profile._id
      );

    assert.ok(
      afterActivation
        .boostedUntil
    );

    /*
     * Activation is visibility bookkeeping,
     * not an organic profile update.
     */
    assert.equal(
      afterActivation
        .updatedAt
        .getTime(),
      organicUpdatedAt.getTime()
    );

    /*
     * Simulate the configured boost period having ended.
     *
     * We move only boostedUntil into the past.
     * This is equivalent to reaching the real expiry time.
     */
    await MatrimonialProfile.updateOne(
      {
        _id:
          profile._id
      },

      {
        $set: {
          boostedUntil:
            new Date(
              Date.now() -
                1000
            )
        }
      },

      {
        timestamps:
          false
      }
    );

    await clearExpiredProfileBoosts();

    const afterExpiry =
      await MatrimonialProfile.findById(
        profile._id
      );

    assert.equal(
      afterExpiry
        .boostedUntil ??
        null,
      null
    );

    /*
     * Expiry cleanup must also preserve the original
     * organic profile timestamp.
     */
    assert.equal(
      afterExpiry
        .updatedAt
        .getTime(),
      organicUpdatedAt.getTime()
    );
  }
);

test(
  'expired boost returns a profile to its normal organic Discover position',
  async () => {
    const [
      viewerUser,
      organicUser,
      boostedUser
    ] =
      await Promise.all([
        createMember(
          'boost-order-viewer@example.com'
        ),

        createMember(
          'boost-order-organic@example.com'
        ),

        createMember(
          'boost-order-target@example.com'
        )
      ]);

    await createMemberProfile(
      viewerUser,
      {
        profileId:
          'KSMBOOST100',

        firstName:
          'Viewer',

        lastName:
          'Rana',

        gender:
          'Male',

        community: {
          name:
            'Rajput / Kshatriya',

          clan:
            'Rana',

          gotra:
            'Kashyap',

          vansh:
            'Suryavanshi'
        }
      }
    );

    /*
     * This profile should naturally rank first because
     * it was active more recently.
     */
    const organicProfile =
      await createMemberProfile(
        organicUser,
        {
          profileId:
            'KSMBOOST101',

          firstName:
            'Organic',

          lastName:
            'Gohil',

          gender:
            'Female',

          lastActiveAt:
            new Date(),

          community: {
            name:
              'Rajput / Kshatriya',

            clan:
              'Gohil',

            gotra:
              'Vashishtha',

            vansh:
              'Suryavanshi'
          }
        }
      );

    /*
     * This profile is naturally lower because its
     * lastActiveAt is older.
     *
     * While boosted, however, it should temporarily
     * move above the organic profile.
     */
    const boostedProfile =
      await createMemberProfile(
        boostedUser,
        {
          profileId:
            'KSMBOOST102',

          firstName:
            'Boosted',

          lastName:
            'Jadeja',

          gender:
            'Female',

          lastActiveAt:
            new Date(
              Date.now() -
                10 *
                  864e5
            ),

          boostedUntil:
            new Date(
              Date.now() +
                12 *
                  60 *
                  60 *
                  1000
            ),

          community: {
            name:
              'Rajput / Kshatriya',

            clan:
              'Jadeja',

            gotra:
              'Vashishtha',

            vansh:
              'Suryavanshi'
          }
        }
      );

    const token =
      tokenFor(
        viewerUser
      );

    /*
     * During the active boost, the boosted profile
     * should receive temporary visibility priority.
     */
    const duringBoost =
      await request(
        app
      )
        .get(
          '/api/profiles/discover'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      duringBoost.status,
      200
    );

    const duringIds =
      duringBoost.body
        .data
        .profiles.map(
          (
            item
          ) =>
            item.profileId
        );

    assert.equal(
      duringIds[0],
      boostedProfile.profileId
    );

    assert.equal(
      duringBoost.body
        .data
        .profiles[0]
        .boostActive,
      true
    );

    /*
     * Simulate the 12-hour boost ending.
     *
     * timestamps:false is intentional: expiry itself
     * must never become an organic profile edit.
     */
    await MatrimonialProfile.updateOne(
      {
        _id:
          boostedProfile._id
      },

      {
        $set: {
          boostedUntil:
            new Date(
              Date.now() -
                1000
            )
        }
      },

      {
        timestamps:
          false
      }
    );

    /*
     * Discover itself calls clearExpiredProfileBoosts().
     *
     * Therefore this request verifies the real endpoint
     * behavior instead of only testing a helper.
     */
    const afterBoost =
      await request(
        app
      )
        .get(
          '/api/profiles/discover'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      afterBoost.status,
      200
    );

    const afterIds =
      afterBoost.body
        .data
        .profiles.map(
          (
            item
          ) =>
            item.profileId
        );

    /*
     * The naturally more recently active profile must
     * return above the expired boosted profile.
     */
    assert.equal(
      afterIds[0],
      organicProfile.profileId
    );

    assert.equal(
      afterIds[1],
      boostedProfile.profileId
    );

    const expiredCard =
      afterBoost.body
        .data
        .profiles.find(
          (
            item
          ) =>
            item.profileId ===
            boostedProfile.profileId
        );

    assert.ok(
      expiredCard
    );

    assert.equal(
      expiredCard
        .boostActive,
      false
    );

    const savedBoostedProfile =
      await MatrimonialProfile.findById(
        boostedProfile._id
      );

    /*
     * Discover cleanup should physically clear the
     * expired boost timestamp as well.
     */
    assert.equal(
      savedBoostedProfile
        .boostedUntil ??
        null,
      null
    );
  }
);

test(
  'a second activation while boost is active is rejected without consuming another credit',
  async () => {
    const member =
      await createMember(
        'boost-double@example.com'
      );

    await createMemberProfile(
      member
    );

    const plan =
      await createPlan({
        slug:
          'boost-double-plan'
      });

    await configurePlanBoost(
      plan,
      {
        includedCredits:
          10,

        durationHours:
          12
      }
    );

    await createActiveSubscription(
      member,
      plan
    );

    const token =
      tokenFor(
        member
      );

    const first =
      await request(
        app
      )
        .post(
          '/api/profile-boost'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      first.status,
      201
    );

    assert.equal(
      first.body.data
        .wallet
        .availableCredits,
      9
    );

    const second =
      await request(
        app
      )
        .post(
          '/api/profile-boost'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      second.status,
      409
    );

    const grant =
      await BoostCreditGrant.findOne({
        user:
          member._id
      });

    assert.equal(
      grant.creditsRemaining,
      9
    );

    assert.equal(
      await BoostActivation.countDocuments({
        user:
          member._id
      }),
      1
    );
  }
);

test(
  'simultaneous activation requests cannot permanently consume two credits',
  async () => {
    const member =
      await createMember(
        'boost-concurrent@example.com'
      );

    await createMemberProfile(
      member
    );

    const plan =
      await createPlan({
        slug:
          'boost-concurrent-plan'
      });

    await configurePlanBoost(
      plan,
      {
        includedCredits:
          10,

        durationHours:
          12
      }
    );

    await createActiveSubscription(
      member,
      plan
    );

    await getBoostWallet(
      member._id
    );

    const token =
      tokenFor(
        member
      );

    const [
      first,
      second
    ] =
      await Promise.all([
        request(
          app
        )
          .post(
            '/api/profile-boost'
          )
          .set(
            'Authorization',
            `Bearer ${token}`
          ),

        request(
          app
        )
          .post(
            '/api/profile-boost'
          )
          .set(
            'Authorization',
            `Bearer ${token}`
          )
      ]);

    const statuses = [
      first.status,
      second.status
    ].sort(
      (
        left,
        right
      ) =>
        left -
        right
    );

    assert.deepEqual(
      statuses,
      [
        201,
        409
      ]
    );

    const grant =
      await BoostCreditGrant.findOne({
        user:
          member._id
      });

    assert.equal(
      grant.creditsRemaining,
      9
    );

    assert.equal(
      await BoostActivation.countDocuments({
        user:
          member._id
      }),
      1
    );
  }
);

test(
  'member without boost credits cannot activate a boost',
  async () => {
    const member =
      await createMember(
        'boost-empty@example.com'
      );

    const profile =
      await createMemberProfile(
        member
      );

    const response =
      await request(
        app
      )
        .post(
          '/api/profile-boost'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            member
          )}`
        );

    assert.equal(
      response.status,
      402
    );

    const saved =
      await MatrimonialProfile.findById(
        profile._id
      );

    assert.equal(
      saved.boostedUntil ??
        null,
      null
    );

    assert.equal(
      await BoostActivation.countDocuments({
        user:
          member._id
      }),
      0
    );
  }
);

test(
  'expired subscription boost credits are marked expired and cannot be used',
  async () => {
    const member =
      await createMember(
        'boost-expired@example.com'
      );

    await createMemberProfile(
      member
    );

    const expiredAt =
      new Date(
        Date.now() -
          60 *
            60 *
            1000
      );

    const grant =
      await BoostCreditGrant.create({
        user:
          member._id,

        sourceKey:
          `subscription:${new mongoose.Types.ObjectId()}`,

        sourceType:
          'Subscription',

        sourceId:
          new mongoose.Types.ObjectId(),

        creditsGranted:
          5,

        creditsRemaining:
          5,

        durationHours:
          12,

        expiresAt:
          expiredAt,

        status:
          'Active'
      });

    const wallet =
      await getBoostWallet(
        member._id
      );

    assert.equal(
      wallet.availableCredits,
      0
    );

    const updatedGrant =
      await BoostCreditGrant.findById(
        grant._id
      );

    assert.equal(
      updatedGrant.status,
      'Expired'
    );

    assert.equal(
      updatedGrant.creditsRemaining,
      5
    );

    const response =
      await request(
        app
      )
        .post(
          '/api/profile-boost'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            member
          )}`
        );

    assert.equal(
      response.status,
      402
    );
  }
);

test(
  'a paid boost-pack order grants purchased credits exactly once',
  async () => {
    const member =
      await createMember(
        'boost-pack@example.com'
      );

    await createMemberProfile(
      member
    );

    const pack =
      await BoostPack.create({
        name:
          'Visibility 10',

        slug:
          'visibility-10',

        price:
          499,

        credits:
          10,

        durationHours:
          12,

        active:
          true,

        sortOrder:
          1
      });

    const order =
      await BoostOrder.create({
        user:
          member._id,

        pack:
          pack._id,

        packNameSnapshot:
          pack.name,

        creditsSnapshot:
          10,

        durationHoursSnapshot:
          12,

        amount:
          499,

        currency:
          'INR',

        provider:
          'razorpay',

        providerOrderId:
          'order_boost_test_001',

        providerPaymentId:
          'pay_boost_test_001',

        status:
          'Paid',

        verifiedAt:
          new Date()
      });

    const firstWallet =
      await getBoostWallet(
        member._id
      );

    assert.equal(
      firstWallet.availableCredits,
      10
    );

    const secondWallet =
      await getBoostWallet(
        member._id
      );

    assert.equal(
      secondWallet.availableCredits,
      10
    );

    const grants =
      await BoostCreditGrant.find({
        user:
          member._id,

        sourceType:
          'BoostPack'
      });

    assert.equal(
      grants.length,
      1
    );

    assert.equal(
      grants[0]
        .sourceKey,
      `pack-order:${order._id}`
    );

    assert.equal(
      grants[0]
        .creditsGranted,
      10
    );

    assert.equal(
      grants[0]
        .creditsRemaining,
      10
    );

    assert.equal(
      grants[0]
        .expiresAt,
      null
    );
  }
);

test(
  'subscription credits are consumed before purchased non-expiring credits',
  async () => {
    const member =
      await createMember(
        'boost-priority@example.com'
      );

    await createMemberProfile(
      member
    );

    const subscriptionGrant =
      await BoostCreditGrant.create({
        user:
          member._id,

        sourceKey:
          `subscription:${new mongoose.Types.ObjectId()}`,

        sourceType:
          'Subscription',

        sourceId:
          new mongoose.Types.ObjectId(),

        creditsGranted:
          2,

        creditsRemaining:
          2,

        durationHours:
          12,

        expiresAt:
          new Date(
            Date.now() +
              7 *
                864e5
          ),

        status:
          'Active'
      });

    const purchasedGrant =
      await BoostCreditGrant.create({
        user:
          member._id,

        sourceKey:
          `pack-order:${new mongoose.Types.ObjectId()}`,

        sourceType:
          'BoostPack',

        sourceId:
          new mongoose.Types.ObjectId(),

        creditsGranted:
          10,

        creditsRemaining:
          10,

        durationHours:
          24,

        expiresAt:
          null,

        status:
          'Active'
      });

    const response =
      await request(
        app
      )
        .post(
          '/api/profile-boost'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            member
          )}`
        );

    assert.equal(
      response.status,
      201
    );

    const updatedSubscriptionGrant =
      await BoostCreditGrant.findById(
        subscriptionGrant._id
      );

    const updatedPurchasedGrant =
      await BoostCreditGrant.findById(
        purchasedGrant._id
      );

    assert.equal(
      updatedSubscriptionGrant
        .creditsRemaining,
      1
    );

    assert.equal(
      updatedPurchasedGrant
        .creditsRemaining,
      10
    );

    const activation =
      await BoostActivation.findOne({
        user:
          member._id
      });

    assert.equal(
      activation.sourceType,
      'Subscription'
    );

    assert.equal(
      activation.durationHours,
      12
    );
  }
);

test(
  'purchased credits remain usable without an active subscription',
  async () => {
    const member =
      await createMember(
        'boost-pack-only@example.com'
      );

    await createMemberProfile(
      member
    );

    const grant =
      await BoostCreditGrant.create({
        user:
          member._id,

        sourceKey:
          `pack-order:${new mongoose.Types.ObjectId()}`,

        sourceType:
          'BoostPack',

        sourceId:
          new mongoose.Types.ObjectId(),

        creditsGranted:
          3,

        creditsRemaining:
          3,

        durationHours:
          24,

        expiresAt:
          null,

        status:
          'Active'
      });

    const response =
      await request(
        app
      )
        .post(
          '/api/profile-boost'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            member
          )}`
        );

    assert.equal(
      response.status,
      201
    );

    assert.equal(
      response.body.data
        .wallet
        .availableCredits,
      2
    );

    const updatedGrant =
      await BoostCreditGrant.findById(
        grant._id
      );

    assert.equal(
      updatedGrant.creditsRemaining,
      2
    );

    const activation =
      await BoostActivation.findOne({
        user:
          member._id
      });

    assert.equal(
      activation.sourceType,
      'BoostPack'
    );

    assert.equal(
      activation.durationHours,
      24
    );
  }
);

test(
  'super admin can configure membership boost credits and duration',
  async () => {
    const admin =
      await createSuperAdmin();

    const plan =
      await createPlan({
        name:
          'Assisted',

        slug:
          'boost-assisted',

        price:
          7999
      });

    const response =
      await request(
        app
      )
        .put(
          `/api/admin/boost-plan-configs/${plan._id}`
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            admin
          )}`
        )
        .send({
          includedCredits:
            10,

          durationHours:
            12,

          active:
            true
        });

    assert.equal(
      response.status,
      200
    );

    const config =
      await BoostPlanConfig.findOne({
        plan:
          plan._id
      });

    assert.ok(
      config
    );

    assert.equal(
      config.includedCredits,
      10
    );

    assert.equal(
      config.durationHours,
      12
    );

    assert.equal(
      config.active,
      true
    );
  }
);

test(
  'super admin can create and update an individual boost pack',
  async () => {
    const admin =
      await createSuperAdmin(
        'boost-pack-admin@example.com'
      );

    const token =
      tokenFor(
        admin
      );

    const createResponse =
      await request(
        app
      )
        .post(
          '/api/admin/boost-packs'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          name:
            'Power Boost 20',

          slug:
            'power-boost-20',

          price:
            799,

          credits:
            20,

          durationHours:
            12,

          active:
            true,

          sortOrder:
            2
        });

    assert.equal(
      createResponse.status,
      201
    );

    const createdPack =
      createResponse.body
        .data
        .pack;

    assert.equal(
      createdPack.name,
      'Power Boost 20'
    );

    assert.equal(
      createdPack.credits,
      20
    );

    assert.equal(
      createdPack.durationHours,
      12
    );

    const updateResponse =
      await request(
        app
      )
        .patch(
          `/api/admin/boost-packs/${createdPack._id}`
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          name:
            'Power Boost 20',

          slug:
            'power-boost-20',

          price:
            899,

          credits:
            20,

          durationHours:
            24,

          active:
            true,

          sortOrder:
            2
        });

    assert.equal(
      updateResponse.status,
      200
    );

    assert.equal(
      updateResponse.body
        .data
        .pack
        .price,
      899
    );

    assert.equal(
      updateResponse.body
        .data
        .pack
        .durationHours,
      24
    );

    const savedPack =
      await BoostPack.findById(
        createdPack._id
      );

    assert.equal(
      savedPack.price,
      899
    );

    assert.equal(
      savedPack.durationHours,
      24
    );
  }
);

test(
  'normal member cannot access super-admin boost management endpoints',
  async () => {
    const member =
      await createMember(
        'boost-no-admin@example.com'
      );

    const response =
      await request(
        app
      )
        .get(
          '/api/admin/boost-management'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            member
          )}`
        );

    assert.equal(
      response.status,
      403
    );
  }
);