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

let database;

before(
  async () => {
    process.env.JWT_SECRET =
      'family-assets-test-secret';

    process.env.NODE_ENV =
      'test';

    const res = await setupTestDatabase(mongoose, {
      defaultDbPrefix: 'ksm_family_assets'
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
          user.id
      },
      process.env.JWT_SECRET
    );

test(
  'structured family assets persist while retired asset summary is ignored',
  async () => {
    const user =
      await User.create({
        email:
          'assets@example.com',

        phone:
          '+919876543210',

        password:
          'Password123!',

        role:
          'member'
      });

    await MatrimonialProfile.create({
      profileId:
        'KSMASSET01',

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
          '1998-05-14T00:00:00.000Z'
        ),

      visibility:
        'active',

      lifecycleStatus:
        'Active'
    });

    const response =
      await request(app)
        .patch(
          '/api/profiles/me'
        )
        .set(
          'Authorization',
          `Bearer ${tokenFor(
            user
          )}`
        )
        .send({
          privacy: {
            assetVisibility:
              'MutualMatches'
          },

          familyAssets: {
            agricultureLand: {
              hasLand:
                true,

              approximateArea:
                25,

              unit:
                'Vigha',

              village:
                'Khirasara',

              taluka:
                'Lodhika',

              district:
                'Rajkot',

              state:
                'Gujarat',

              landType:
                'Irrigated',

              ownershipType:
                'Ancestral'
            },

            residentialProperties: [
              {
                propertyName:
                  'Rana House',

                propertyType:
                  'Bungalow',

                ownershipType:
                  'Family Owned',

                cityVillage:
                  'Rajkot',

                district:
                  'Rajkot',

                state:
                  'Gujarat',

                approximateArea:
                  3500,

                areaUnit:
                  'Sq Ft',

                isPrimaryResidence:
                  true
              }
            ],

            otherProperties: [
              {
                propertyName:
                  'Family Plot',

                propertyType:
                  'Plot',

                ownershipType:
                  'Joint Family',

                cityVillage:
                  'Gondal',

                district:
                  'Rajkot',

                state:
                  'Gujarat',

                approximateArea:
                  1200,

                areaUnit:
                  'Sq Yard'
              }
            ],

            businessAssets: [
              {
                assetName:
                  'Rana Agro',

                assetType:
                  'Trading Business',

                ownershipType:
                  'Family Owned',

                location:
                  'Rajkot, Gujarat',

                description:
                  'Agricultural trading business'
              }
            ],

            /*
             * Retired legacy field.
             *
             * Controller must ignore this on new writes.
             */
            assetSummary:
              '25 Vigha land, bungalow and business assets.'
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
      saved.privacy
        .assetVisibility,
      'MutualMatches'
    );

    assert.equal(
      saved.familyAssets
        .agricultureLand
        .approximateArea,
      25
    );

    assert.equal(
      saved.familyAssets
        .agricultureLand
        .village,
      'Khirasara'
    );

    assert.equal(
      saved.familyAssets
        .agricultureLand
        .unit,
      'Vigha'
    );

    assert.equal(
      saved.familyAssets
        .agricultureLand
        .hasLand,
      true
    );

    assert.equal(
      saved.familyAssets
        .residentialProperties[0]
        .propertyName,
      'Rana House'
    );

    assert.equal(
      saved.familyAssets
        .residentialProperties[0]
        .isPrimaryResidence,
      true
    );

    assert.equal(
      saved.familyAssets
        .otherProperties[0]
        .propertyName,
      'Family Plot'
    );

    assert.equal(
      saved.familyAssets
        .businessAssets[0]
        .assetName,
      'Rana Agro'
    );

    /*
     * Overall Asset Summary is no longer part of
     * the current profile-edit flow.
     *
     * New requests must not re-introduce it.
     */
    assert.equal(
      saved.familyAssets
        .assetSummary,
      undefined
    );
  }
);