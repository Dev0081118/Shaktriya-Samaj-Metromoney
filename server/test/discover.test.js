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
  setupTestDatabase,
  safeCleanupDatabase,
  safeTeardownDatabase
} from './testDbSafety.js';

import app from '../src/app.js';

import User from '../src/models/User.js';

import MatrimonialProfile from '../src/models/MatrimonialProfile.js';

import {
  Block,
  Plan,
  Subscription
} from '../src/models/Platform.js';

import {
  Interest,
  Shortlist
} from '../src/models/Interaction.js';

let database;

before(
  async () => {
    process.env.JWT_SECRET =
      'discover-test-secret';

    process.env.NODE_ENV =
      'test';

    const res = await setupTestDatabase(mongoose, {
      defaultDbPrefix: 'ksm_discover'
    });
    database = res.database;
  }
);

afterEach(
  async () => {
    await safeCleanupDatabase(mongoose);
  }
);

after(
  async () => {
    await safeTeardownDatabase(mongoose, database);
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

const createProfile =
  async ({
    user,
    profileId,
    firstName,
    lastName = 'Test',
    gender,
    nativeDistrict,
    nativeState,
    nativePlace,
    currentCity,
    clan,
    gotra,
    vansh,
    diet = 'Vegetarian'
  }) =>
    MatrimonialProfile.create({
      profileId,

      userId:
        user._id,

      profileFor:
        'Self',

      firstName,

      lastName,

      gender,

      dateOfBirth:
        new Date(
          '1998-01-01'
        ),

      height:
        gender ===
        'Male'
          ? 175
          : 164,

      maritalStatus:
        'Never Married',

      visibility:
        'active',

      lifecycleStatus:
        'Active',

      location: {
        city:
          currentCity,

        nativePlace,

        nativeDistrict,

        nativeState
      },

      community: {
        name:
          'Rajput / Kshatriya',

        clan,

        gotra,

        vansh
      },

      education: {
        highestEducation:
          'MBA'
      },

      career: {
        occupation:
          'Engineer'
      },

      lifestyle: {
        diet
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

      contactDetails: {
        currentAddress: {
          addressLine1:
            'Private House',

          city:
            currentCity,

          district:
            'Private District',

          state:
            'Private State',

          pincode:
            '360001',

          country:
            'India'
        }
      }
    });

const enableAdvancedSearch =
  async (
    user
  ) => {
    const plan =
      await Plan.create({
        name:
          'Connect',

        slug:
          `connect-${user._id}`,

        price:
          1999,

        durationDays:
          90,

        active:
          true,

        features: {
          interestLimit:
            25,

          contactViewLimit:
            5,

          advancedSearch:
            true,

          profileBoost:
            false,

          prioritySupport:
            false,

          relationshipManager:
            false
        }
      });

    const now =
      new Date();

    await Subscription.create({
      user:
        user._id,

      plan:
        plan._id,

      planNameSnapshot:
        'Connect',

      priceSnapshot:
        1999,

      entitlementSnapshot: {
        interestLimit:
          25,

        contactViewLimit:
          5,

        messageLimit:
          0,

        advancedSearch:
          true,

        profileBoost:
          false,

        prioritySupport:
          false,

        relationshipManager:
          false
      },

      status:
        'Active',

      startsAt:
        new Date(
          now.getTime() -
            60 *
              1000
        ),

      endsAt:
        new Date(
          now.getTime() +
            90 *
              864e5
        )
    });
  };

test(
  'discover searches native location and does not search private current city',
  async () => {
    const [
      viewer,
      candidate
    ] =
      await Promise.all([
        createMember(
          'discover-viewer@example.com'
        ),

        createMember(
          'discover-candidate@example.com'
        )
      ]);

    await createProfile({
      user:
        viewer,

      profileId:
        'KSM910001',

      firstName:
        'Viewer',

      gender:
        'Male',

      nativePlace:
        'Rajkot',

      nativeDistrict:
        'Rajkot',

      nativeState:
        'Gujarat',

      currentCity:
        'Ahmedabad',

      clan:
        'Rana',

      gotra:
        'Kashyap',

      vansh:
        'Suryavanshi'
    });

    const target =
      await createProfile({
        user:
          candidate,

        profileId:
          'KSM910002',

        firstName:
          'Priya',

        gender:
          'Female',

        nativePlace:
          'Gondal',

        nativeDistrict:
          'Rajkot',

        nativeState:
          'Gujarat',

        currentCity:
          'SecretCurrentCity',

        clan:
          'Jadeja',

        gotra:
          'Vashishtha',

        vansh:
          'Suryavanshi'
      });

    const token =
      tokenFor(
        viewer
      );

    const nativeResult =
      await request(
        app
      )
        .get(
          '/api/profiles/discover?district=Rajkot&state=Gujarat'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      nativeResult.status,
      200
    );

    assert.equal(
      nativeResult.body
        .data
        .profiles
        .length,
      1
    );

    assert.equal(
      nativeResult.body
        .data
        .profiles[0]
        .profileId,
      target.profileId
    );

    const privateSearch =
      await request(
        app
      )
        .get(
          '/api/profiles/discover?search=SecretCurrentCity'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      privateSearch.status,
      200
    );

    assert.equal(
      privateSearch.body
        .data
        .profiles
        .length,
      0
    );

    assert.equal(
      privateSearch.body
        .data
        .pagination
        .total,
      0
    );
  }
);

test(
  'paid member can filter discovery by Shakh Gotra Vansh and diet',
  async () => {
    const [
      viewer,
      matchingUser,
      otherUser
    ] =
      await Promise.all([
        createMember(
          'advanced-viewer@example.com'
        ),

        createMember(
          'advanced-match@example.com'
        ),

        createMember(
          'advanced-other@example.com'
        )
      ]);

    await createProfile({
      user:
        viewer,

      profileId:
        'KSM920001',

      firstName:
        'Viewer',

      gender:
        'Male',

      nativePlace:
        'Rajkot',

      nativeDistrict:
        'Rajkot',

      nativeState:
        'Gujarat',

      currentCity:
        'Ahmedabad',

      clan:
        'Rana',

      gotra:
        'Kashyap',

      vansh:
        'Suryavanshi'
    });

    const matching =
      await createProfile({
        user:
          matchingUser,

        profileId:
          'KSM920002',

        firstName:
          'Matching',

        gender:
          'Female',

        nativePlace:
          'Gondal',

        nativeDistrict:
          'Rajkot',

        nativeState:
          'Gujarat',

        currentCity:
          'Rajkot',

        clan:
          'Jadeja',

        gotra:
          'Vashishtha',

        vansh:
          'Suryavanshi',

        diet:
          'Vegetarian'
      });

    await createProfile({
      user:
        otherUser,

      profileId:
        'KSM920003',

      firstName:
        'Other',

      gender:
        'Female',

      nativePlace:
        'Bhavnagar',

      nativeDistrict:
        'Bhavnagar',

      nativeState:
        'Gujarat',

      currentCity:
        'Bhavnagar',

      clan:
        'Gohil',

      gotra:
        'Kashyap',

      vansh:
        'Agnivanshi',

      diet:
        'Non-Vegetarian'
    });

    await enableAdvancedSearch(
      viewer
    );

    const response =
      await request(
        app
      )
        .get(
          '/api/profiles/discover?clan=Jadeja&gotra=Vashishtha&vansh=Suryavanshi&diet=Vegetarian'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            viewer
          )}`
        );

    assert.equal(
      response.status,
      200
    );

    assert.equal(
      response.body
        .data
        .profiles
        .length,
      1
    );

    assert.equal(
      response.body
        .data
        .profiles[0]
        .profileId,
      matching.profileId
    );
  }
);

test(
  'discover returns shortlist and accepted interest state',
  async () => {
    const [
      viewer,
      candidate
    ] =
      await Promise.all([
        createMember(
          'state-viewer@example.com'
        ),

        createMember(
          'state-candidate@example.com'
        )
      ]);

    const mine =
      await createProfile({
        user:
          viewer,

        profileId:
          'KSM930001',

        firstName:
          'Viewer',

        gender:
          'Male',

        nativePlace:
          'Rajkot',

        nativeDistrict:
          'Rajkot',

        nativeState:
          'Gujarat',

        currentCity:
          'Ahmedabad',

        clan:
          'Rana',

        gotra:
          'Kashyap',

        vansh:
          'Suryavanshi'
      });

    const target =
      await createProfile({
        user:
          candidate,

        profileId:
          'KSM930002',

        firstName:
          'Candidate',

        gender:
          'Female',

        nativePlace:
          'Gondal',

        nativeDistrict:
          'Rajkot',

        nativeState:
          'Gujarat',

        currentCity:
          'Rajkot',

        clan:
          'Jadeja',

        gotra:
          'Vashishtha',

        vansh:
          'Suryavanshi'
      });

    await Shortlist.create({
      userProfile:
        mine._id,

      shortlistedProfile:
        target._id
    });

    await Interest.create({
      senderProfile:
        mine._id,

      receiverProfile:
        target._id,

      status:
        'Accepted'
    });

    const response =
      await request(
        app
      )
        .get(
          '/api/profiles/discover'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            viewer
          )}`
        );

    assert.equal(
      response.status,
      200
    );

    const card =
      response.body
        .data
        .profiles
        .find(
          (
            item
          ) =>
            item.profileId ===
            target.profileId
        );

    assert.ok(
      card
    );

    assert.equal(
      card.shortlisted,
      true
    );

    assert.equal(
      card.interestSent,
      true
    );

    assert.equal(
      card.interestStatus,
      'Accepted'
    );
  }
);

test(
  'blocked profiles are excluded from discovery',
  async () => {
    const [
      viewer,
      candidate
    ] =
      await Promise.all([
        createMember(
          'blocked-viewer@example.com'
        ),

        createMember(
          'blocked-candidate@example.com'
        )
      ]);

    const mine =
      await createProfile({
        user:
          viewer,

        profileId:
          'KSM940001',

        firstName:
          'Viewer',

        gender:
          'Male',

        nativePlace:
          'Rajkot',

        nativeDistrict:
          'Rajkot',

        nativeState:
          'Gujarat',

        currentCity:
          'Ahmedabad',

        clan:
          'Rana',

        gotra:
          'Kashyap',

        vansh:
          'Suryavanshi'
      });

    const target =
      await createProfile({
        user:
          candidate,

        profileId:
          'KSM940002',

        firstName:
          'Blocked',

        gender:
          'Female',

        nativePlace:
          'Gondal',

        nativeDistrict:
          'Rajkot',

        nativeState:
          'Gujarat',

        currentCity:
          'Rajkot',

        clan:
          'Jadeja',

        gotra:
          'Vashishtha',

        vansh:
          'Suryavanshi'
      });

    await Block.create({
      user:
        viewer._id,

      blockedProfile:
        target._id
    });

    const response =
      await request(
        app
      )
        .get(
          '/api/profiles/discover'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            viewer
          )}`
        );

    assert.equal(
      response.status,
      200
    );

    assert.equal(
      response.body
        .data
        .profiles
        .some(
          (
            item
          ) =>
            item.profileId ===
            target.profileId
        ),
      false
    );

    assert.equal(
      response.body
        .data
        .pagination
        .total,
      0
    );

    assert.ok(
      mine
    );
  }
);

test(
  'same Surname or Shakh is excluded from discover and direct member profile access',
  async () => {
    const [
      viewer,
      sameSurnameUser,
      differentSurnameUser
    ] =
      await Promise.all([
        createMember(
          'surname-viewer@example.com'
        ),

        createMember(
          'surname-same@example.com'
        ),

        createMember(
          'surname-different@example.com'
        )
      ]);

    await createProfile({
      user:
        viewer,

      profileId:
        'KSM950001',

      firstName:
        'Raj',

      lastName:
        'Rana',

      gender:
        'Male',

      nativePlace:
        'Rajkot',

      nativeDistrict:
        'Rajkot',

      nativeState:
        'Gujarat',

      currentCity:
        'Ahmedabad',

      clan:
        'Rana',

      gotra:
        'Kashyap',

      vansh:
        'Suryavanshi'
    });

    const sameSurname =
      await createProfile({
        user:
          sameSurnameUser,

        profileId:
          'KSM950002',

        firstName:
          'Priya',

        lastName:
          'Rana',

        gender:
          'Female',

        nativePlace:
          'Gondal',

        nativeDistrict:
          'Rajkot',

        nativeState:
          'Gujarat',

        currentCity:
          'Rajkot',

        /*
         * Intentional case + whitespace difference.
         * This must still match viewer's "Rana".
         */
        clan:
          ' RANA ',

        gotra:
          'Vashishtha',

        vansh:
          'Suryavanshi'
      });

    const differentSurname =
      await createProfile({
        user:
          differentSurnameUser,

        profileId:
          'KSM950003',

        firstName:
          'Nisha',

        lastName:
          'Jadeja',

        gender:
          'Female',

        nativePlace:
          'Gondal',

        nativeDistrict:
          'Rajkot',

        nativeState:
          'Gujarat',

        currentCity:
          'Rajkot',

        clan:
          'Jadeja',

        gotra:
          'Vashishtha',

        vansh:
          'Suryavanshi'
      });

    const token =
      tokenFor(
        viewer
      );

    const response =
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
      response.status,
      200
    );

    const ids =
      response.body.data
        .profiles.map(
          (
            profile
          ) =>
            profile.profileId
        );

    /*
     * Same surname must never be discoverable.
     */
    assert.equal(
      ids.includes(
        sameSurname.profileId
      ),
      false
    );

    /*
     * Different surname remains discoverable.
     */
    assert.equal(
      ids.includes(
        differentSurname.profileId
      ),
      true
    );

    /*
     * Pagination must also reflect the server-side hard
     * exclusion. Hidden same-surname records must not
     * inflate result counts.
     */
    assert.equal(
      response.body.data
        .pagination.total,
      1
    );

    /*
     * Knowing a profile URL must not bypass the rule.
     */
    const directResponse =
      await request(
        app
      )
        .get(
          `/api/profiles/${sameSurname.profileId}`
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      directResponse.status,
      404
    );

    /*
     * A different-surname profile remains directly
     * accessible under normal privacy rules.
     */
    const allowedResponse =
      await request(
        app
      )
        .get(
          `/api/profiles/${differentSurname.profileId}`
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      allowedResponse.status,
      200
    );
  }
);

test(
  'missing clan does not blindly exclude a different fallback surname',
  async () => {
    const [
      viewer,
      candidate
    ] =
      await Promise.all([
        createMember(
          'surname-missing-viewer@example.com'
        ),

        createMember(
          'surname-missing-candidate@example.com'
        )
      ]);

    await createProfile({
      user:
        viewer,

      profileId:
        'KSM960001',

      firstName:
        'Raj',

      lastName:
        'Rana',

      gender:
        'Male',

      nativePlace:
        'Rajkot',

      nativeDistrict:
        'Rajkot',

      nativeState:
        'Gujarat',

      currentCity:
        'Ahmedabad',

      clan:
        'Rana',

      gotra:
        'Kashyap',

      vansh:
        'Suryavanshi'
    });

    const target =
      await createProfile({
        user:
          candidate,

        profileId:
          'KSM960002',

        firstName:
          'Priya',

        lastName:
          'Solanki',

        gender:
          'Female',

        nativePlace:
          'Gondal',

        nativeDistrict:
          'Rajkot',

        nativeState:
          'Gujarat',

        currentCity:
          'Rajkot',

        /*
         * Legacy / incomplete record:
         * no canonical community.clan.
         *
         * Fallback surname is Solanki, therefore this
         * profile must NOT be blocked for a Rana viewer.
         */
        clan:
          undefined,

        gotra:
          'Vashishtha',

        vansh:
          'Suryavanshi'
      });

    const response =
      await request(
        app
      )
        .get(
          '/api/profiles/discover'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            viewer
          )}`
        );

    assert.equal(
      response.status,
      200
    );

    assert.equal(
      response.body.data
        .profiles.some(
          (
            profile
          ) =>
            profile.profileId ===
            target.profileId
        ),
      true
    );
  }
);