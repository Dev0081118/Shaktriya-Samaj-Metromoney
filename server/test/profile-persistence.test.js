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
  MongoMemoryServer
} from 'mongodb-memory-server';

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
      const collection
      of Object.values(
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

const authToken =
  (user) =>
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

        bloodGroup:
          'B+',

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

          familyLocation:
            'Rajkot',

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
                'Brother-in-law',

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
            'Jadeja'
        },

        maternalLineage: {
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
  'owner profile response retains exact DOB and master biodata fields',
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
      profile.birthDetails
        .timeOfBirth,
      '10:45'
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

    /*
     * Requested changes are applied.
     */
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
     * Sibling fields inside the same
     * nested objects remain intact.
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
     * Completely unrelated profile
     * sections must never disappear.
     */
    assert.equal(
      saved.location
        .nativePlace,
      'Khirasara'
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
      saved.paternalFamily
        .gotra,
      'Kashyap'
    );

    assert.equal(
      saved
        .maternalLineage
        .fathersMosal
        .familySurname,
      'Gohil'
    );

    assert.equal(
      saved.familyAssets
        .agricultureLand
        .approximateArea,
      12
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
     * A normal edit must also preserve
     * the moderation/visibility state.
     */
    assert.equal(
      saved.visibility,
      'active'
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

    assert.equal(
      visible.dateOfBirth,
      undefined
    );

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
     * Astrology is intentionally available
     * because this profile allows it for
     * registered members.
     */
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
     * Assets remain hidden because their
     * privacy rule is Private.
     */
    assert.equal(
      visible.familyAssets,
      undefined
    );

    /*
     * Maternal lineage is also hidden until
     * the configured relationship threshold
     * is met.
     */
    assert.equal(
      visible.maternalLineage,
      undefined
    );
  }
);