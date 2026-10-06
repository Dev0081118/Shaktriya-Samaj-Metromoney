import test, {
  after,
  afterEach,
  before
} from 'node:test';

import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

import app from '../src/app.js';

import User from '../src/models/User.js';
import MatrimonialProfile from '../src/models/MatrimonialProfile.js';

import {
  ContactRequest,
  PlanUsage,
  RelationshipManagerAssignment,
  SystemSetting,
  PasswordReset,
  CustomerNote
} from '../src/models/Business.js';

import {
  Match
} from '../src/models/Interaction.js';

import {
  Payment,
  Plan,
  Subscription
} from '../src/models/Platform.js';

let database;

/* -------------------------------------------------------------------------- */
/* Test database setup                                                        */
/* -------------------------------------------------------------------------- */

before(async () => {
  process.env.JWT_SECRET =
    'integration-test-secret';

  process.env.NODE_ENV =
    'test';

  process.env.OTP_PROVIDER =
    'development';

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
});

afterEach(async () => {
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
});

after(async () => {
  await mongoose.disconnect();

  await database.stop();
});

/* -------------------------------------------------------------------------- */
/* Registration + legal                                                       */
/* -------------------------------------------------------------------------- */

test(
  'registration records explicit legal consent versions',
  async () => {
    process.env.LEGAL_VERSION =
      'test-v1';

    const response =
      await request(app)
        .post(
          '/api/auth/register'
        )
        .send({
          email:
            'member@example.com',

          phone:
            '+919999999991',

          password:
            'Password123!',

          acceptTerms:
            true,

          acceptPrivacy:
            true
        });

    assert.equal(
      response.status,
      201
    );

    const user =
      await User.findOne({
        email:
          'member@example.com'
      });

    assert.equal(
      user.acceptedTermsVersion,
      'test-v1'
    );

    assert.ok(
      user.acceptedAt
    );
  }
);

test(
  'preferred language accepts supported values and persists',
  async () => {
    const user =
      await User.create({
        email:
          'language@example.com',

        password:
          'Password123!'
      });

    const token =
      jwt.sign(
        {
          sub:
            user.id
        },
        process.env.JWT_SECRET
      );

    const saved =
      await request(app)
        .patch(
          '/api/account/preferences/language'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          preferredLanguage:
            'gu'
        });

    assert.equal(
      saved.status,
      200
    );

    assert.equal(
      (
        await User.findById(
          user._id
        )
      ).preferredLanguage,
      'gu'
    );

    const rejected =
      await request(app)
        .patch(
          '/api/account/preferences/language'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          preferredLanguage:
            'fr'
        });

    assert.equal(
      rejected.status,
      400
    );
  }
);

test(
  'registration is rejected without consent',
  async () => {
    const response =
      await request(app)
        .post(
          '/api/auth/register'
        )
        .send({
          email:
            'member@example.com',

          phone:
            '+919999999991',

          password:
            'Password123!'
        });

    assert.equal(
      response.status,
      400
    );
  }
);

test(
  'registration setting is enforced by the API',
  async () => {
    await SystemSetting.create({
      _id:
        'global',

      registrationEnabled:
        false
    });

    const response =
      await request(app)
        .post(
          '/api/auth/register'
        )
        .send({
          email:
            'member@example.com',

          phone:
            '+919999999991',

          password:
            'Password123!',

          acceptTerms:
            true,

          acceptPrivacy:
            true
        });

    assert.equal(
      response.status,
      503
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Maintenance + entitlements                                                 */
/* -------------------------------------------------------------------------- */

test(
  'maintenance mode blocks members but not staff',
  async () => {
    await SystemSetting.create({
      _id:
        'global',

      maintenanceMode:
        true
    });

    const member =
      await User.create({
        email:
          'member@example.com',

        password:
          'Password123!',

        role:
          'member'
      });

    const admin =
      await User.create({
        email:
          'admin@example.com',

        password:
          'Password123!',

        role:
          'admin'
      });

    const memberToken =
      jwt.sign(
        {
          sub:
            member.id
        },
        process.env.JWT_SECRET
      );

    const adminToken =
      jwt.sign(
        {
          sub:
            admin.id
        },
        process.env.JWT_SECRET
      );

    assert.equal(
      (
        await request(app)
          .get(
            '/api/dashboard'
          )
          .set(
            'Authorization',
            `Bearer ${memberToken}`
          )
      ).status,
      503
    );

    assert.notEqual(
      (
        await request(app)
          .get(
            '/api/admin/overview'
          )
          .set(
            'Authorization',
            `Bearer ${adminToken}`
          )
      ).status,
      503
    );
  }
);

test(
  'advanced search is rejected for a free member',
  async () => {
    const member =
      await User.create({
        email:
          'member@example.com',

        password:
          'Password123!'
      });

    await MatrimonialProfile.create({
      userId:
        member._id,

      profileFor:
        'Self',

      firstName:
        'Member',

      gender:
        'Male',

      visibility:
        'active'
    });

    const token =
      jwt.sign(
        {
          sub:
            member.id
        },
        process.env.JWT_SECRET
      );

    const response =
      await request(app)
        .get(
          '/api/profiles/discover?education=MBA'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      response.status,
      403
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Contact unlock                                                             */
/* -------------------------------------------------------------------------- */

test(
  'contact details require an accepted request and consume one unlock only',
  async () => {
    const [
      viewer,
      owner
    ] =
      await User.create([
        {
          email:
            'viewer@example.com',

          password:
            'Password123!'
        },

        {
          email:
            'owner@example.com',

          phone:
            '+919999999992',

          password:
            'Password123!'
        }
      ]);

    const [
      viewerProfile,
      ownerProfile
    ] =
      await Promise.all([
        MatrimonialProfile.create({
          userId:
            viewer._id,

          profileFor:
            'Self',

          firstName:
            'Viewer',

          gender:
            'Male',

          visibility:
            'active'
        }),

        MatrimonialProfile.create({
          userId:
            owner._id,

          profileFor:
            'Self',

          firstName:
            'Owner',

          gender:
            'Female',

          visibility:
            'active'
        })
      ]);

    const plan =
      await Plan.create({
        name:
          'Connect',

        slug:
          'connect',

        price:
          1,

        durationDays:
          30,

        features: {
          contactViewLimit:
            1
        }
      });

    await Promise.all([
      Subscription.create({
        user:
          viewer._id,

        plan:
          plan._id,

        planNameSnapshot:
          'Connect',

        priceSnapshot:
          1,

        entitlementSnapshot: {
          contactViewLimit:
            1
        },

        startsAt:
          new Date(
            Date.now() -
              1000
          ),

        endsAt:
          new Date(
            Date.now() +
              864e5
          ),

        status:
          'Active'
      }),

      Match.create({
        profileA:
          viewerProfile._id,

        profileB:
          ownerProfile._id,

        pairKey: [
          String(
            viewerProfile._id
          ),
          String(
            ownerProfile._id
          )
        ]
          .sort()
          .join(
            ':'
          ),

        status:
          'Active'
      }),

      ContactRequest.create({
        requesterProfile:
          viewerProfile._id,

        receiverProfile:
          ownerProfile._id,

        status:
          'Accepted'
      })
    ]);

    const token =
      jwt.sign(
        {
          sub:
            viewer.id
        },
        process.env.JWT_SECRET
      );

    const before =
      await request(app)
        .get(
          `/api/profiles/${ownerProfile.profileId}`
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      before.body.data
        .profile.contact,
      undefined
    );

    const id =
      before.body.data
        .actionState
        .contactRequest.id;

    assert.equal(
      (
        await request(app)
          .post(
            `/api/contact-requests/${id}/unlock`
          )
          .set(
            'Authorization',
            `Bearer ${token}`
          )
      ).status,
      200
    );

    assert.equal(
      (
        await request(app)
          .post(
            `/api/contact-requests/${id}/unlock`
          )
          .set(
            'Authorization',
            `Bearer ${token}`
          )
      ).status,
      200
    );

    const afterUnlock =
      await request(app)
        .get(
          `/api/profiles/${ownerProfile.profileId}`
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    const usage =
      await PlanUsage.findOne({
        user:
          viewer._id
      });

    assert.equal(
      afterUnlock.body.data
        .profile.contact.phone,
      '+919999999992'
    );

    assert.equal(
      usage.contactViewsUsed,
      1
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Razorpay                                                                   */
/* -------------------------------------------------------------------------- */

test(
  'captured payment webhooks are idempotent and snapshot plan entitlements',
  async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET =
      'webhook-test-secret';

    const member =
      await User.create({
        email:
          'payer@example.com',

        password:
          'Password123!'
      });

    const plan =
      await Plan.create({
        name:
          'Premium',

        slug:
          'premium',

        price:
          4999,

        durationDays:
          180,

        features: {
          advancedSearch:
            true,

          contactViewLimit:
            25
        }
      });

    const payment =
      await Payment.create({
        user:
          member._id,

        plan:
          plan._id,

        provider:
          'razorpay',

        providerOrderId:
          'order_test',

        amount:
          4999,

        status:
          'Created'
      });

    const event = {
      event:
        'payment.captured',

      payload: {
        payment: {
          entity: {
            id:
              'pay_test',

            order_id:
              'order_test',

            amount:
              499900,

            currency:
              'INR'
          }
        }
      }
    };

    const body =
      JSON.stringify(
        event
      );

    const signature =
      crypto
        .createHmac(
          'sha256',
          process.env
            .RAZORPAY_WEBHOOK_SECRET
        )
        .update(
          body
        )
        .digest(
          'hex'
        );

    for (
      let index = 0;
      index < 2;
      index++
    ) {
      assert.equal(
        (
          await request(app)
            .post(
              '/api/webhooks/razorpay'
            )
            .set(
              'Content-Type',
              'application/json'
            )
            .set(
              'x-razorpay-signature',
              signature
            )
            .set(
              'x-razorpay-event-id',
              'evt_test'
            )
            .send(
              body
            )
        ).status,
        200
      );
    }

    const subscriptions =
      await Subscription.find({
        user:
          member._id
      });

    const saved =
      await Payment.findById(
        payment._id
      );

    assert.equal(
      subscriptions.length,
      1
    );

    assert.equal(
      subscriptions[0]
        .planNameSnapshot,
      'Premium'
    );

    assert.equal(
      subscriptions[0]
        .entitlementSnapshot
        .contactViewLimit,
      25
    );

    assert.equal(
      saved.processedEvents
        .length,
      1
    );

    assert.equal(
      saved.status,
      'Paid'
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Admin protection                                                           */
/* -------------------------------------------------------------------------- */

test(
  'the last active super admin cannot disable themselves',
  async () => {
    const admin =
      await User.create({
        email:
          'root@example.com',

        password:
          'Password123!',

        role:
          'super_admin'
      });

    const token =
      jwt.sign(
        {
          sub:
            admin.id
        },
        process.env.JWT_SECRET
      );

    const response =
      await request(app)
        .patch(
          `/api/admin/users/${admin.id}`
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          status:
            'Suspended'
        });

    assert.equal(
      response.status,
      409
    );
  }
);

test(
  'admin APIs enforce operational roles',
  async () => {
    const [
      member,
      moderator,
      admin
    ] =
      await User.create([
        {
          email:
            'member-role@example.com',

          password:
            'Password123!'
        },

        {
          email:
            'moderator-role@example.com',

          password:
            'Password123!',

          role:
            'moderator'
        },

        {
          email:
            'admin-role@example.com',

          password:
            'Password123!',

          role:
            'admin'
        }
      ]);

    const token = (
      user
    ) =>
      jwt.sign(
        {
          sub:
            user.id
        },
        process.env.JWT_SECRET
      );

    assert.equal(
      (
        await request(app)
          .get(
            '/api/admin/dashboard'
          )
          .set(
            'Authorization',
            `Bearer ${token(
              member
            )}`
          )
      ).status,
      403
    );

    assert.equal(
      (
        await request(app)
          .get(
            '/api/admin/customers'
          )
          .set(
            'Authorization',
            `Bearer ${token(
              moderator
            )}`
          )
      ).status,
      403
    );

    assert.equal(
      (
        await request(app)
          .get(
            '/api/admin/customers'
          )
          .set(
            'Authorization',
            `Bearer ${token(
              admin
            )}`
          )
      ).status,
      200
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Revenue                                                                    */
/* -------------------------------------------------------------------------- */

test(
  'captured revenue excludes created and failed payments',
  async () => {
    const root =
      await User.create({
        email:
          'revenue@example.com',

        password:
          'Password123!',

        role:
          'super_admin'
      });

    const member =
      await User.create({
        email:
          'revenue-member@example.com',

        password:
          'Password123!'
      });

    const plan =
      await Plan.create({
        name:
          'Premium',

        slug:
          'revenue-premium',

        price:
          1000,

        durationDays:
          30
      });

    const token =
      jwt.sign(
        {
          sub:
            root.id
        },
        process.env.JWT_SECRET
      );

    await Payment.create([
      {
        user:
          member._id,

        plan:
          plan._id,

        amount:
          1000,

        status:
          'Paid',

        verifiedAt:
          new Date()
      },

      {
        user:
          member._id,

        plan:
          plan._id,

        amount:
          5000,

        status:
          'Created'
      },

      {
        user:
          member._id,

        plan:
          plan._id,

        amount:
          3000,

        status:
          'Failed'
      },

      {
        user:
          member._id,

        plan:
          plan._id,

        amount:
          200,

        status:
          'Refunded'
      }
    ]);

    const response =
      await request(app)
        .get(
          '/api/admin/analytics/revenue?range=30d'
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
        .totalCaptured,
      1000
    );

    assert.equal(
      response.body.data
        .totalRefunded,
      200
    );

    assert.equal(
      response.body.data
        .netCaptured,
      800
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Relationship manager                                                       */
/* -------------------------------------------------------------------------- */

const assistedMember =
  async (
    email
  ) => {
    const member =
      await User.create({
        email,

        password:
          'Password123!'
      });

    await Subscription.create({
      user:
        member._id,

      planNameSnapshot:
        'Assisted',

      entitlementSnapshot: {
        relationshipManager:
          true
      },

      status:
        'Active',

      startsAt:
        new Date(
          Date.now() -
            864e5
        ),

      endsAt:
        new Date(
          Date.now() +
            30 *
              864e5
        )
    });

    return member;
  };

test(
  'an admin assigns an eligible Assisted member to an active relationship manager',
  async () => {
    const admin =
      await User.create({
        email:
          'admin@example.com',

        password:
          'Password123!',

        role:
          'admin'
      });

    const manager =
      await User.create({
        email:
          'manager@example.com',

        password:
          'Password123!',

        role:
          'relationship_manager'
      });

    const replacement =
      await User.create({
        email:
          'manager-two@example.com',

        password:
          'Password123!',

        role:
          'relationship_manager'
      });

    const member =
      await assistedMember(
        'assisted@example.com'
      );

    const token =
      jwt.sign(
        {
          sub:
            admin.id
        },
        process.env.JWT_SECRET
      );

    const assign = (
      managerId
    ) =>
      request(app)
        .put(
          '/api/admin/relationship-managers/assignment'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          user:
            member.id,

          manager:
            managerId
        });

    const first =
      await assign(
        manager.id
      );

    assert.equal(
      first.status,
      200
    );

    assert.equal(
      String(
        first.body.data
          .assignment.manager
      ),
      manager.id
    );

    const second =
      await assign(
        replacement.id
      );

    assert.equal(
      second.status,
      200
    );

    assert.equal(
      await RelationshipManagerAssignment.countDocuments({
        user:
          member._id
      }),
      1
    );

    const own =
      await request(app)
        .get(
          '/api/relationship-manager'
        )
        .set(
          'Authorization',
          `Bearer ${jwt.sign(
            {
              sub:
                member.id
            },
            process.env
              .JWT_SECRET
          )}`
        );

    assert.equal(
      own.body.data
        .included,
      true
    );

    assert.equal(
      own.body.data
        .assignment
        .manager.email,
      'manager-two@example.com'
    );

    const free =
      await User.create({
        email:
          'free@example.com',

        password:
          'Password123!'
      });

    const freeView =
      await request(app)
        .get(
          '/api/relationship-manager'
        )
        .set(
          'Authorization',
          `Bearer ${jwt.sign(
            {
              sub:
                free.id
            },
            process.env
              .JWT_SECRET
          )}`
        );

    assert.equal(
      freeView.body.data
        .included,
      false
    );

    assert.equal(
      freeView.body.data
        .assignment,
      null
    );
  }
);

test(
  'relationship manager assignment rejects ineligible members and inactive managers',
  async () => {
    const admin =
      await User.create({
        email:
          'admin@example.com',

        password:
          'Password123!',

        role:
          'admin'
      });

    const manager =
      await User.create({
        email:
          'manager@example.com',

        password:
          'Password123!',

        role:
          'relationship_manager'
      });

    const suspendedManager =
      await User.create({
        email:
          'paused@example.com',

        password:
          'Password123!',

        role:
          'relationship_manager',

        status:
          'Suspended'
      });

    const member =
      await assistedMember(
        'assisted@example.com'
      );

    const plainUser =
      await User.create({
        email:
          'plain@example.com',

        password:
          'Password123!'
      });

    const freeMember =
      await User.create({
        email:
          'free@example.com',

        password:
          'Password123!'
      });

    const token =
      jwt.sign(
        {
          sub:
            admin.id
        },
        process.env.JWT_SECRET
      );

    const assign = (
      userId,
      managerId
    ) =>
      request(app)
        .put(
          '/api/admin/relationship-managers/assignment'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          user:
            userId,

          manager:
            managerId
        });

    assert.equal(
      (
        await assign(
          member.id,
          plainUser.id
        )
      ).status,
      400
    );

    assert.equal(
      (
        await assign(
          member.id,
          suspendedManager.id
        )
      ).status,
      400
    );

    assert.equal(
      (
        await assign(
          freeMember.id,
          manager.id
        )
      ).status,
      403
    );

    assert.equal(
      (
        await assign(
          'not-an-id',
          manager.id
        )
      ).status,
      400
    );

    assert.equal(
      await RelationshipManagerAssignment.countDocuments(
        {}
      ),
      0
    );
  }
);

test(
  'relationship manager administration is limited to admins',
  async () => {
    const moderator =
      await User.create({
        email:
          'moderator@example.com',

        password:
          'Password123!',

        role:
          'moderator'
      });

    const token =
      jwt.sign(
        {
          sub:
            moderator.id
        },
        process.env.JWT_SECRET
      );

    assert.equal(
      (
        await request(app)
          .get(
            '/api/admin/relationship-managers'
          )
          .set(
            'Authorization',
            `Bearer ${token}`
          )
      ).status,
      403
    );

    assert.equal(
      (
        await request(app)
          .put(
            '/api/admin/relationship-managers/assignment'
          )
          .set(
            'Authorization',
            `Bearer ${token}`
          )
          .send(
            {}
          )
      ).status,
      403
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Password/session security                                                  */
/* -------------------------------------------------------------------------- */

test(
  'changing password revokes older sessions and returns a fresh session',
  async () => {
    const user =
      await User.create({
        email:
          'password-change@example.com',

        password:
          'Password123!'
      });

    const oldToken =
      jwt.sign(
        {
          sub:
            user.id,

          ver:
            0
        },
        process.env.JWT_SECRET
      );

    const changed =
      await request(app)
        .patch(
          '/api/auth/change-password'
        )
        .set(
          'Authorization',
          `Bearer ${oldToken}`
        )
        .send({
          currentPassword:
            'Password123!',

          newPassword:
            'DifferentPassword456!'
        });

    assert.equal(
      changed.status,
      200
    );

    assert.ok(
      changed.body.data.token
    );

    const oldSession =
      await request(app)
        .get(
          '/api/auth/me'
        )
        .set(
          'Authorization',
          `Bearer ${oldToken}`
        );

    assert.equal(
      oldSession.status,
      401
    );

    assert.equal(
      oldSession.body.code,
      'SESSION_REVOKED'
    );

    const freshSession =
      await request(app)
        .get(
          '/api/auth/me'
        )
        .set(
          'Authorization',
          `Bearer ${changed.body.data.token}`
        );

    assert.equal(
      freshSession.status,
      200
    );
  }
);

test(
  'password reset revokes every existing session',
  async () => {
    const user =
      await User.create({
        email:
          'password-reset@example.com',

        password:
          'Password123!'
      });

    const oldToken =
      jwt.sign(
        {
          sub:
            user.id,

          ver:
            0
        },
        process.env.JWT_SECRET
      );

    await PasswordReset.create({
      user:
        user._id,

      codeHash:
        await bcrypt.hash(
          '123456',
          10
        ),

      expiresAt:
        new Date(
          Date.now() +
            15 *
              60 *
              1000
        )
    });

    const reset =
      await request(app)
        .post(
          '/api/auth/reset-password'
        )
        .send({
          email:
            'password-reset@example.com',

          code:
            '123456',

          newPassword:
            'ResetPassword456!'
        });

    assert.equal(
      reset.status,
      200
    );

    const oldSession =
      await request(app)
        .get(
          '/api/auth/me'
        )
        .set(
          'Authorization',
          `Bearer ${oldToken}`
        );

    assert.equal(
      oldSession.status,
      401
    );

    assert.equal(
      oldSession.body.code,
      'SESSION_REVOKED'
    );

    const login =
      await request(app)
        .post(
          '/api/auth/login'
        )
        .send({
          email:
            'password-reset@example.com',

          password:
            'ResetPassword456!'
        });

    assert.equal(
      login.status,
      200
    );

    assert.ok(
      login.body.data.token
    );
  }
);

/* -------------------------------------------------------------------------- */
/* OTP security                                                               */
/* -------------------------------------------------------------------------- */

test(
  'OTP sending requires an authenticated member',
  async () => {
    const response =
      await request(app)
        .post(
          '/api/auth/send-otp'
        )
        .send({
          phone:
            '+919999999991'
        });

    assert.equal(
      response.status,
      401
    );
  }
);

test(
  'registration rejects an invalid mobile number',
  async () => {
    const response =
      await request(app)
        .post(
          '/api/auth/register'
        )
        .send({
          email:
            'invalid-phone@example.com',

          phone:
            '123',

          password:
            'Password123!',

          acceptTerms:
            true,

          acceptPrivacy:
            true
        });

    assert.equal(
      response.status,
      400
    );
  }
);

test(
  'OTP requests enforce a destination resend cooldown',
  async () => {
    const member =
      await User.create({
        email:
          'otp-cooldown@example.com',

        password:
          'Password123!'
      });

    const token =
      jwt.sign(
        {
          sub:
            member.id,

          ver:
            0
        },
        process.env.JWT_SECRET
      );

    const phone =
      '+919876543210';

    const first =
      await request(app)
        .post(
          '/api/auth/send-otp'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          phone
        });

    assert.equal(
      first.status,
      200
    );

    const second =
      await request(app)
        .post(
          '/api/auth/send-otp'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .send({
          phone
        });

    assert.equal(
      second.status,
      429
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Privacy                                                                    */
/* -------------------------------------------------------------------------- */

test(
  'customer administration never exposes tokenVersion',
  async () => {
    const admin =
      await User.create({
        email:
          'privacy-admin@example.com',

        password:
          'Password123!',

        role:
          'admin'
      });

    const member =
      await User.create({
        email:
          'privacy-member@example.com',

        phone:
          '+919876543211',

        password:
          'Password123!',

        tokenVersion:
          7
      });

    const token =
      jwt.sign(
        {
          sub:
            admin.id,

          ver:
            0
        },
        process.env.JWT_SECRET
      );

    const list =
      await request(app)
        .get(
          '/api/admin/customers'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      list.status,
      200
    );

    const listed =
      list.body.data.items.find(
        (
          item
        ) =>
          item._id ===
          member.id
      );

    assert.ok(
      listed
    );

    assert.equal(
      Object.hasOwn(
        listed,
        'tokenVersion'
      ),
      false
    );

    const detail =
      await request(app)
        .get(
          `/api/admin/customers/${member.id}`
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      detail.status,
      200
    );

    assert.equal(
      Object.hasOwn(
        detail.body.data.user,
        'tokenVersion'
      ),
      false
    );
  }
);

test(
  'relationship manager workspace does not expose internal customer notes',
  async () => {
    const manager =
      await User.create({
        email:
          'privacy-manager@example.com',

        password:
          'Password123!',

        role:
          'relationship_manager'
      });

    const member =
      await User.create({
        email:
          'privacy-client@example.com',

        password:
          'Password123!'
      });

    await RelationshipManagerAssignment.create({
      user:
        member._id,

      manager:
        manager._id,

      status:
        'Active'
    });

    await CustomerNote.create({
      user:
        member._id,

      author:
        manager._id,

      category:
        'Safety',

      text:
        'Sensitive internal safety note.'
    });

    const token =
      jwt.sign(
        {
          sub:
            manager.id,

          ver:
            0
        },
        process.env.JWT_SECRET
      );

    const response =
      await request(app)
        .get(
          '/api/manager'
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
        .clients.length,
      1
    );

    assert.equal(
      Object.hasOwn(
        response.body.data
          .clients[0],
        'latestNote'
      ),
      false
    );

    assert.equal(
      JSON.stringify(
        response.body
      ).includes(
        'Sensitive internal safety note.'
      ),
      false
    );
  }
);

test(
  'moderator profile APIs do not expose member phone or email',
  async () => {
    const moderator =
      await User.create({
        email:
          'privacy-moderator@example.com',

        password:
          'Password123!',

        role:
          'moderator'
      });

    const member =
      await User.create({
        email:
          'sensitive-member@example.com',

        phone:
          '+919876543212',

        password:
          'Password123!'
      });

    const profile =
      await MatrimonialProfile.create({
        userId:
          member._id,

        profileFor:
          'Self',

        firstName:
          'Private',

        gender:
          'Female',

        visibility:
          'pending_review'
      });

    const token =
      jwt.sign(
        {
          sub:
            moderator.id,

          ver:
            0
        },
        process.env.JWT_SECRET
      );

    const list =
      await request(app)
        .get(
          '/api/admin/profiles'
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      list.status,
      200
    );

    const listed =
      list.body.data.profiles.find(
        (
          item
        ) =>
          item._id ===
          String(
            profile._id
          )
      );

    assert.ok(
      listed
    );

    assert.equal(
      listed.userId.email,
      undefined
    );

    assert.equal(
      listed.userId.phone,
      undefined
    );

    const detail =
      await request(app)
        .get(
          `/api/admin/profiles/${profile.id}`
        )
        .set(
          'Authorization',
          `Bearer ${token}`
        );

    assert.equal(
      detail.status,
      200
    );

    assert.equal(
      detail.body.data
        .profile.userId.email,
      undefined
    );

    assert.equal(
      detail.body.data
        .profile.userId.phone,
      undefined
    );
  }
);
test(
  'forgot password throttles repeated reset code requests for the same account',
  async () => {
    const user =
      await User.create({
        email:
          'reset-cooldown@example.com',

        password:
          'Password123!'
      });

    const first =
      await request(app)
        .post(
          '/api/auth/forgot-password'
        )
        .send({
          email:
            user.email
        });

    assert.equal(
      first.status,
      200
    );

    const firstRecord =
      await PasswordReset.findOne({
        user:
          user._id
      });

    assert.ok(
      firstRecord
    );

    const second =
      await request(app)
        .post(
          '/api/auth/forgot-password'
        )
        .send({
          email:
            user.email
        });

    assert.equal(
      second.status,
      200
    );

    assert.equal(
      await PasswordReset.countDocuments({
        user:
          user._id
      }),
      1
    );
  }
);

test(
  'password reset locks after five invalid attempts',
  async () => {
    const user =
      await User.create({
        email:
          'reset-attempts@example.com',

        password:
          'Password123!'
      });

    await PasswordReset.create({
      user:
        user._id,

      codeHash:
        await bcrypt.hash(
          '123456',
          10
        ),

      expiresAt:
        new Date(
          Date.now() +
            15 *
              60 *
              1000
        )
    });

    for (
      let attempt = 1;
      attempt <= 4;
      attempt++
    ) {
      const response =
        await request(app)
          .post(
            '/api/auth/reset-password'
          )
          .send({
            email:
              user.email,

            code:
              '999999',

            newPassword:
              'DifferentPassword456!'
          });

      assert.equal(
        response.status,
        400
      );
    }

    const fifth =
      await request(app)
        .post(
          '/api/auth/reset-password'
        )
        .send({
          email:
            user.email,

          code:
            '999999',

          newPassword:
            'DifferentPassword456!'
        });

    assert.equal(
      fifth.status,
      429
    );

    const correctAfterLock =
      await request(app)
        .post(
          '/api/auth/reset-password'
        )
        .send({
          email:
            user.email,

          code:
            '123456',

          newPassword:
            'DifferentPassword456!'
        });

    assert.equal(
      correctAfterLock.status,
      429
    );
  }
);