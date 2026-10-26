import test, {
  after,
  afterEach,
  before
} from 'node:test';

import assert from 'node:assert/strict';

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import {
  setupTestDatabase,
  safeCleanupDatabase,
  safeTeardownDatabase
} from './testDbSafety.js';

import app from '../src/app.js';

import User from '../src/models/User.js';

import MatrimonialProfile from '../src/models/MatrimonialProfile.js';

let database;

before(
  async () => {
    process.env.JWT_SECRET =
      'profile-persistence-test-secret';

    process.env.NODE_ENV =
      'test';

    const res = await setupTestDatabase(mongoose, {
      defaultDbPrefix: 'ksm_profile_persist'
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

const authToken =
  (
    user
  ) =>
    jwt.sign(
      {
        sub:
          user.id
      },
      process.env
        .JWT_SECRET
    );

const createMemberWithProfile =
  async () => {
    const user =
      await User.create({
        email:
          'profile-owner@example.com',

        phone:
          '+919876543210',

        password:
          'Password123!',

        role:
          'member'
      });

    const profile =
      await MatrimonialProfile.create({
        profileId:
          'KSM990001',

        userId:
          user._id,

        profileFor:
          'Self',

        firstName:
          'Raj',

        middleName:
          'V',

        lastName:
          'Rana',

        gender:
          'Male',

        dateOfBirth:
          new Date(
            '1998-05-14T00:00:00.000Z'
          ),

        height:
          178,

        weight:
          72,

        bloodGroup:
          'B+',

        /*
         * Legacy generic field retained
         * in an existing database record.
         */
        complexion:
          'Wheatish',

        maritalStatus:
          'Never Married',

        birthDetails: {
          timeOfBirth:
            '10:45',

          city:
            'Rajkot',

          district:
            'Rajkot',

          state:
            'Gujarat',

          country:
            'India'
        },

        /*
         * Current city/state are legacy values.
         *
         * They remain here intentionally so the tests
         * verify that old records stay readable while
         * new writes use native location + exact private
         * contact address.
         */
        location: {
          city:
            'Rajkot',

          taluka:
            'Rajkot',

          district:
            'Rajkot',

          state:
            'Gujarat',

          country:
            'India',

          nativePlace:
            'Khirasara',

          nativeTaluka:
            'Lodhika',

          nativeDistrict:
            'Rajkot',

          nativeState:
            'Gujarat'
        },

        community: {
          religion:
            'Hinduism',

          caste:
            'Rajput',

          name:
            'Kshatriya',

          /*
           * Legacy field intentionally remains
           * in old records.
           */
          subCommunity:
            'Rajput',

          clan:
            'Rana',

          gotra:
            'Kashyap',

          vansh:
            'Suryavanshi',

          kulaDevi:
            'Ashapura Mata',

          /*
           * Legacy-only fields retained to confirm
           * backward-compatible reads.
           */
          ishtaDevta:
            'Mahadev',

          familyOrigin:
            'Traditional Rajput family from Saurashtra.'
        },

        education: {
          highestEducation:
            'Bachelor of Engineering',

          degree:
            'B.E.',

          specialization:
            'Information Technology',

          college:
            'VVP Engineering College',

          university:
            'GTU',

          educationDetails:
            'Engineering graduate.'
        },

        career: {
          occupationType:
            'Job',

          occupation:
            'Software Developer',

          designation:
            'Full Stack Developer',

          companyName:
            'Savvy Infotech',

          workLocation: {
            city:
              'Rajkot',

            state:
              'Gujarat',

            country:
              'India'
          },

          annualIncome:
            900000
        },

        lifestyle: {
          diet:
            'Vegetarian',

          smoking:
            'No',

          drinking:
            'No',

          interests: [
            'Technology',
            'Travel'
          ]
        },

        family: {
          fatherName:
            'Father Rana',

          fatherOccupation:
            'Business',

          motherName:
            'Mother Rana',

          motherOccupation:
            'Homemaker',

          familyType:
            'Joint',

          familyValues:
            'Traditional',

          /*
           * Legacy-only field retained so the test can
           * verify a modern PATCH does not overwrite it.
           */
          familyLocation:
            'Gujarat',

          familyDescription:
            'Traditional family.',

          siblingDetails: [
            {
              relation:
                'Sister',

              name:
                'Sister Rana',

              education:
                'MBA',

              occupation:
                'Manager',

              maritalStatus:
                'Married',

              spouseName:
                'Jay Jadeja',

              spouseClan:
                'Jadeja',

              spouseFamilySurname:
                'Jadeja',

              spouseVillage:
                'Gondal',

              spouseTaluka:
                'Gondal',

              spouseDistrict:
                'Rajkot',

              spouseState:
                'Gujarat'
            }
          ]
        },

        paternalFamily: {
          ancestralVillage:
            'Khirasara',

          nativePlace:
            'Khirasara',

          taluka:
            'Lodhika',

          district:
            'Rajkot',

          state:
            'Gujarat',

          familySurname:
            'Rana',

          clan:
            'Rana',

          gotra:
            'Kashyap'
        },

        maternalFamily: {
          maternalGrandfatherName:
            'Maternal Grandfather',

          /*
           * Legacy fields retained for read compatibility.
           */
          maternalFamilySurname:
            'Jadeja',

          maternalNativePlace:
            'Gondal',

          maternalVillage:
            'Gondal',

          maternalTaluka:
            'Gondal',

          maternalDistrict:
            'Rajkot',

          maternalState:
            'Gujarat',

          maternalClan:
            'Jadeja',

          maternalGotra:
            'Vashishtha'
        },

        maternalLineage: {
          /*
           * Legacy existing selfMosal record.
           *
           * New PATCH requests do not write this branch,
           * but an existing record remains readable.
           */
          selfMosal: {
            mamaName:
              'Mama Jadeja',

            familySurname:
              'Jadeja',

            clanSurname:
              'Jadeja',

            nativeVillage:
              'Gondal',

            taluka:
              'Gondal',

            district:
              'Rajkot',

            state:
              'Gujarat'
          },

          fathersMosal: {
            grandmotherName:
              'Paternal Grandmother',

            familySurname:
              'Gohil',

            clanSurname:
              'Gohil',

            nativeVillage:
              'Bhavnagar',

            district:
              'Bhavnagar',

            state:
              'Gujarat'
          },

          mothersMosal: {
            grandmotherName:
              'Maternal Grandmother',

            familySurname:
              'Chudasama',

            clanSurname:
              'Chudasama',

            nativeVillage:
              'Junagadh',

            district:
              'Junagadh',

            state:
              'Gujarat'
          }
        },

        astrology: {
          rashi:
            'Mesh',

          nakshatra:
            'Ashwini',

          manglik:
            'No'
        },

        contactDetails: {
          currentAddress: {
            addressLine1:
              'Kalawad Road',

            addressLine2:
              'Near University Road',

            city:
              'Rajkot',

            taluka:
              'Rajkot',

            district:
              'Rajkot',

            state:
              'Gujarat',

            pincode:
              '360005',

            country:
              'India'
          },

          guardianName:
            'Father Rana',

          guardianRelation:
            'Father',

          guardianPhone:
            '+919999999999',

          selfPhone:
            '+919876543210',

          email:
            'profile-owner@example.com'
        },

        familyAssets: {
          agricultureLand: {
            hasLand:
              true,

            approximateArea:
              12,

            unit:
              'Vigha'
          },

          propertySummary:
            'Family residential property in Rajkot.',

          primaryResidenceType:
            'Owned House',

          businessAssetsSummary:
            'Family business assets.'
        },

        privacy: {
          photoVisibility:
            'RegisteredMembers',

          contactVisibility:
            'MutualMatches',

          incomeVisibility:
            'Private',

          familyVisibility:
            'RegisteredMembers',

          familyOverviewVisibility:
            'AcceptedInterests',

          maternalFamilyVisibility:
            'AcceptedInterests',

          siblingDetailsVisibility:
            'AcceptedInterests',

          assetVisibility:
            'Private',

          fullNameVisibility:
            'RegisteredMembers',

          astrologyVisibility:
            'RegisteredMembers',

          contactAddressVisibility:
            'Private'
        },

        biodataPrivacy: {
          includeSensitiveFamilyDetailsInBiodata:
            true,

          includeContactDetailsInBiodata:
            false,

          includeAstrologyInBiodata:
            true,

          includeAssetsInBiodata:
            false
        },

        aboutMe:
          'Family-oriented software professional.',

        visibility:
          'active',

        lifecycleStatus:
          'Active'
      });

    return {
      user,
      profile,

      token:
        authToken(
          user
        )
    };
  };

test(
  'owner profile response retains exact DOB and current Rajput biodata fields',
  async () => {
    const {
      token
    } =
      await createMemberWithProfile();

    const response =
      await request(app)
        .get(
          '/api/profiles/me'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      response.status,
      200
    );

    const profile =
      response.body.data
        .profile;

    assert.ok(
      profile.dateOfBirth
    );

    assert.equal(
      profile.dateOfBirth.slice(
        0,
        10
      ),
      '1998-05-14'
    );

    assert.equal(
      profile.height,
      178
    );

    assert.equal(
      profile.weight,
      72
    );

    assert.equal(
      profile.maritalStatus,
      'Never Married'
    );

    assert.equal(
      profile.birthDetails
        .timeOfBirth,
      '10:45'
    );

    assert.equal(
      profile.community
        .clan,
      'Rana'
    );

    assert.equal(
      profile.community
        .gotra,
      'Kashyap'
    );

    assert.equal(
      profile.community
        .vansh,
      'Suryavanshi'
    );

    assert.equal(
      profile.family
        .familyValues,
      'Traditional'
    );

    /*
     * Existing legacy fields remain readable by owner.
     */
    assert.equal(
      profile.family
        .familyLocation,
      'Gujarat'
    );

    assert.equal(
      profile.maternalFamily
        .maternalGotra,
      'Vashishtha'
    );

    assert.equal(
      profile.education
        .university,
      'GTU'
    );

    assert.equal(
      profile.career
        .workLocation.city,
      'Rajkot'
    );

    assert.equal(
      profile
        .maternalLineage
        .selfMosal
        .familySurname,
      'Jadeja'
    );

    assert.equal(
      profile
        .maternalLineage
        .fathersMosal
        .familySurname,
      'Gohil'
    );

    assert.equal(
      profile
        .maternalLineage
        .mothersMosal
        .familySurname,
      'Chudasama'
    );

    assert.equal(
      profile.family
        .siblingDetails[0]
        .spouseName,
      'Jay Jadeja'
    );

    assert.equal(
      profile.family
        .siblingDetails[0]
        .spouseFamilySurname,
      'Jadeja'
    );

    assert.equal(
      profile.astrology
        .rashi,
      'Mesh'
    );

    assert.equal(
      profile
        .contactDetails
        .currentAddress
        .pincode,
      '360005'
    );

    assert.equal(
      profile
        .biodataPrivacy
        .includeSensitiveFamilyDetailsInBiodata,
      true
    );
  }
);

test(
  'profile edit persists current family siblings and Mosal fields while preserving retired legacy values',
  async () => {
    const {
      user,
      token
    } =
      await createMemberWithProfile();

    const response =
      await request(app)
        .patch(
          '/api/profiles/me'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          family: {
            familyValues:
              'Moderate',

            /*
             * Retired field.
             * New writes must ignore this.
             */
            familyLocation:
              'Rajasthan',

            siblingDetails: [
              {
                relation:
                  'Brother',

                name:
                  'Brother Rana',

                occupation:
                  'Business',

                maritalStatus:
                  'Married',

                spouseName:
                  'Priya Rathore',

                spouseFamilySurname:
                  'Rathore',

                spouseVillage:
                  'Udaipur'
              }
            ]
          },

          maternalFamily: {
            /*
             * Retired field.
             * Existing value must survive but this
             * request may not replace it.
             */
            maternalGotra:
              'Bharadwaj'
          },

          maternalLineage: {
            fathersMosal: {
              familySurname:
                'Solanki',

              nativeVillage:
                'Bhavnagar',

              state:
                'Gujarat'
            },

            mothersMosal: {
              familySurname:
                'Parmar',

              nativeVillage:
                'Junagadh',

              state:
                'Gujarat'
            }
          }
        });

    assert.equal(
      response.status,
      201
    );

    const saved =
      await MatrimonialProfile.findOne({
        userId:
          user._id
      }).lean();

    assert.equal(
      saved.family
        .familyValues,
      'Moderate'
    );

    /*
     * Existing legacy familyLocation survives.
     * Incoming modern PATCH cannot overwrite it.
     */
    assert.equal(
      saved.family
        .familyLocation,
      'Gujarat'
    );

    /*
     * Existing legacy Maternal Gotra also survives.
     */
    assert.equal(
      saved.maternalFamily
        .maternalGotra,
      'Vashishtha'
    );

    assert.equal(
      saved.family
        .siblingDetails[0]
        .relation,
      'Brother'
    );

    assert.equal(
      saved.family
        .siblingDetails[0]
        .name,
      'Brother Rana'
    );

    assert.equal(
      saved.family
        .siblingDetails[0]
        .spouseName,
      'Priya Rathore'
    );

    assert.equal(
      saved.family
        .siblingDetails[0]
        .spouseFamilySurname,
      'Rathore'
    );

    assert.equal(
      saved.family
        .siblingDetails[0]
        .spouseVillage,
      'Udaipur'
    );

    assert.equal(
      saved
        .maternalLineage
        .fathersMosal
        .familySurname,
      'Solanki'
    );

    assert.equal(
      saved
        .maternalLineage
        .fathersMosal
        .nativeVillage,
      'Bhavnagar'
    );

    assert.equal(
      saved
        .maternalLineage
        .mothersMosal
        .familySurname,
      'Parmar'
    );

    assert.equal(
      saved
        .maternalLineage
        .mothersMosal
        .nativeVillage,
      'Junagadh'
    );

    /*
     * Existing legacy selfMosal branch must not be
     * destroyed by editing the current Mosal branches.
     */
    assert.equal(
      saved
        .maternalLineage
        .selfMosal
        .familySurname,
      'Jadeja'
    );

    /*
     * Main candidate marital status must never be
     * affected by sibling/family edits.
     */
    assert.equal(
      saved.maritalStatus,
      'Never Married'
    );
  }
);

test(
  'new profile updates ignore legacy Sub-Samaj input while preserving an existing legacy record',
  async () => {
    const {
      user,
      token
    } =
      await createMemberWithProfile();

    const response =
      await request(app)
        .patch(
          '/api/profiles/me'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          community: {
            clan:
              'Jadeja',

            gotra:
              'Vashishtha',

            /*
             * Controller must ignore this new legacy write.
             */
            subCommunity:
              'Should Not Replace Legacy'
          }
        });

    assert.equal(
      response.status,
      201
    );

    const saved =
      await MatrimonialProfile.findOne({
        userId:
          user._id
      }).lean();

    assert.equal(
      saved.community
        .clan,
      'Jadeja'
    );

    assert.equal(
      saved.community
        .gotra,
      'Vashishtha'
    );

    /*
     * Existing old value remains for backwards
     * compatibility.
     */
    assert.equal(
      saved.community
        .subCommunity,
      'Rajput'
    );
  }
);

test(
  'new profile updates ignore other retired Rajput fields while preserving existing legacy data',
  async () => {
    const {
      user,
      token
    } =
      await createMemberWithProfile();

    const response =
      await request(app)
        .patch(
          '/api/profiles/me'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          community: {
            clan:
              'Jhala',

            ishtaDevta:
              'Should Not Replace Mahadev',

            familyOrigin:
              'Should Not Replace Existing Origin'
          },

          maternalFamily: {
            maternalClan:
              'Gohil',

            maternalFamilySurname:
              'Should Not Replace Jadeja',

            maternalGotra:
              'Should Not Replace Vashishtha'
          },

          maternalLineage: {
            selfMosal: {
              familySurname:
                'Should Not Replace Jadeja'
            }
          },

          familyAssets: {
            assetSummary:
              'Should Not Be Newly Written'
          }
        });

    assert.equal(
      response.status,
      201
    );

    const saved =
      await MatrimonialProfile.findOne({
        userId:
          user._id
      }).lean();

    assert.equal(
      saved.community
        .clan,
      'Jhala'
    );

    /*
     * Legacy values are preserved.
     */
    assert.equal(
      saved.community
        .ishtaDevta,
      'Mahadev'
    );

    assert.equal(
      saved.community
        .familyOrigin,
      'Traditional Rajput family from Saurashtra.'
    );

    assert.equal(
      saved.maternalFamily
        .maternalClan,
      'Gohil'
    );

    assert.equal(
      saved.maternalFamily
        .maternalFamilySurname,
      'Jadeja'
    );

    assert.equal(
      saved.maternalFamily
        .maternalGotra,
      'Vashishtha'
    );

    assert.equal(
      saved
        .maternalLineage
        .selfMosal
        .familySurname,
      'Jadeja'
    );

    /*
     * Existing profile did not have assetSummary,
     * and new writes may not create it.
     */
    assert.equal(
      saved.familyAssets
        .assetSummary,
      undefined
    );
  }
);

test(
  'partial nested profile edit preserves unrelated existing profile data',
  async () => {
    const {
      user,
      token
    } =
      await createMemberWithProfile();

    const response =
      await request(app)
        .patch(
          '/api/profiles/me'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          career: {
            workLocation: {
              city:
                'Ahmedabad'
            }
          },

          community: {
            gotra:
              'Vashishtha'
          },

          contactDetails: {
            currentAddress: {
              city:
                'Ahmedabad'
            }
          }
        });

    assert.equal(
      response.status,
      201
    );

    const saved =
      await MatrimonialProfile.findOne({
        userId:
          user._id
      }).lean();

    assert.equal(
      saved.career
        .workLocation.city,
      'Ahmedabad'
    );

    assert.equal(
      saved.community
        .gotra,
      'Vashishtha'
    );

    assert.equal(
      saved.contactDetails
        .currentAddress.city,
      'Ahmedabad'
    );

    /*
     * Nested career values remain intact.
     */
    assert.equal(
      saved.career
        .workLocation.state,
      'Gujarat'
    );

    assert.equal(
      saved.career
        .workLocation.country,
      'India'
    );

    assert.equal(
      saved.career
        .occupation,
      'Software Developer'
    );

    assert.equal(
      saved.career
        .designation,
      'Full Stack Developer'
    );

    assert.equal(
      saved.career
        .annualIncome,
      900000
    );

    /*
     * Community values not edited by this PATCH survive.
     */
    assert.equal(
      saved.community
        .clan,
      'Rana'
    );

    assert.equal(
      saved.community
        .vansh,
      'Suryavanshi'
    );

    /*
     * Exact residential address is deep-merged rather
     * than replaced.
     */
    assert.equal(
      saved.contactDetails
        .currentAddress
        .addressLine1,
      'Kalawad Road'
    );

    assert.equal(
      saved.contactDetails
        .currentAddress.state,
      'Gujarat'
    );

    assert.equal(
      saved.contactDetails
        .currentAddress.pincode,
      '360005'
    );

    /*
     * Native matrimonial location is unaffected by an
     * exact residential address edit.
     */
    assert.equal(
      saved.location
        .nativePlace,
      'Khirasara'
    );

    assert.equal(
      saved.location
        .nativeDistrict,
      'Rajkot'
    );

    assert.equal(
      saved.location
        .nativeState,
      'Gujarat'
    );

    assert.equal(
      saved.education
        .university,
      'GTU'
    );

    assert.equal(
      saved.family
        .fatherName,
      'Father Rana'
    );

    assert.equal(
      saved.family
        .familyValues,
      'Traditional'
    );

    assert.equal(
      saved.paternalFamily
        .gotra,
      'Kashyap'
    );

    /*
     * Legacy fields remain preserved during unrelated
     * edits.
     */
    assert.equal(
      saved.maternalFamily
        .maternalGotra,
      'Vashishtha'
    );

    assert.equal(
      saved
        .maternalLineage
        .fathersMosal
        .familySurname,
      'Gohil'
    );

    assert.equal(
      saved
        .maternalLineage
        .mothersMosal
        .familySurname,
      'Chudasama'
    );

    assert.equal(
      saved.familyAssets
        .agricultureLand
        .approximateArea,
      12
    );

    assert.equal(
      saved.height,
      178
    );

    assert.equal(
      saved.weight,
      72
    );

    assert.equal(
      saved.dateOfBirth
        .toISOString()
        .slice(
          0,
          10
        ),
      '1998-05-14'
    );

    /*
     * A normal edit must preserve moderation state.
     */
    assert.equal(
      saved.visibility,
      'active'
    );

    assert.equal(
      saved.lifecycleStatus,
      'Active'
    );
  }
);

test(
  'profile edit persists current weight and native location',
  async () => {
    const {
      user,
      token
    } =
      await createMemberWithProfile();

    const response =
      await request(app)
        .patch(
          '/api/profiles/me'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          weight:
            76,

          location: {
            nativePlace:
              'Gondal',

            nativeTaluka:
              'Gondal',

            nativeDistrict:
              'Rajkot',

            nativeState:
              'Gujarat',

            /*
             * These are retired general-current-location
             * inputs and must not become the matching
             * location.
             */
            city:
              'Ahmedabad',

            district:
              'Ahmedabad',

            state:
              'Gujarat'
          }
        });

    assert.equal(
      response.status,
      201
    );

    const saved =
      await MatrimonialProfile.findOne({
        userId:
          user._id
      }).lean();

    assert.equal(
      saved.weight,
      76
    );

    assert.equal(
      saved.location
        .nativePlace,
      'Gondal'
    );

    assert.equal(
      saved.location
        .nativeTaluka,
      'Gondal'
    );

    assert.equal(
      saved.location
        .nativeDistrict,
      'Rajkot'
    );

    assert.equal(
      saved.location
        .nativeState,
      'Gujarat'
    );

    /*
     * Current residential location is not persisted as
     * general matching location by new profile writes.
     */
    assert.ok(
      !saved.location.city
    );

    assert.ok(
      !saved.location.district
    );

    assert.ok(
      !saved.location.state
    );
  }
);

test(
  'another member sees age but not exact DOB or private address',
  async () => {
    const {
      profile
    } =
      await createMemberWithProfile();

    const viewer =
      await User.create({
        email:
          'viewer-profile@example.com',

        password:
          'Password123!',

        role:
          'member'
      });

    await MatrimonialProfile.create({
      profileId:
        'KSM990002',

      userId:
        viewer._id,

      profileFor:
        'Self',

      firstName:
        'Viewer',

      gender:
        'Female',

      visibility:
        'active',

      lifecycleStatus:
        'Active'
    });

    const response =
      await request(app)
        .get(
          `/api/profiles/${profile.profileId}`
        )
        .set(
          'Authorization',
          `Bearer ${authToken(
            viewer
          )}`
        );

    assert.equal(
      response.status,
      200
    );

    const visible =
      response.body.data
        .profile;

    /*
     * Exact DOB is protected.
     */
    assert.equal(
      visible.dateOfBirth,
      undefined
    );

    /*
     * Exact residential address, phone and email remain
     * locked until explicit contact unlock.
     */
    assert.equal(
      visible.contactDetails,
      undefined
    );

    assert.ok(
      Number.isInteger(
        visible.age
      )
    );

    /*
     * Non-sensitive standard physical profile field.
     */
    assert.equal(
      visible.height,
      178
    );

    assert.equal(
      visible.weight,
      72
    );

    assert.equal(
      visible.astrology
        .rashi,
      'Mesh'
    );

    assert.equal(
      visible.birthDetails
        .city,
      'Rajkot'
    );

    /*
     * Family assets stay private.
     */
    assert.equal(
      visible.familyAssets,
      undefined
    );

    /*
     * Detailed Mosal stays protected until relationship
     * privacy rules allow it.
     */
    assert.equal(
      visible.maternalLineage,
      undefined
    );
  }
);