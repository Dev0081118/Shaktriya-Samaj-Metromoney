import test, { after, afterEach, before } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import app from '../src/app.js';
import User from '../src/models/User.js';
import MatrimonialProfile from '../src/models/MatrimonialProfile.js';
import {
  ContactRequest,
  PlanUsage,
  SystemSetting
} from '../src/models/Business.js';
import { Match } from '../src/models/Interaction.js';
import { Payment, Plan, Subscription } from '../src/models/Platform.js';
let database;
before(async () => {
  process.env.JWT_SECRET = 'integration-test-secret';
  process.env.NODE_ENV = 'test';
  database = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
  await mongoose.connect(database.getUri());
});
afterEach(async () => {
  for (const collection of Object.values(mongoose.connection.collections))
    await collection.deleteMany({});
});
after(async () => {
  await mongoose.disconnect();
  await database.stop();
});
test('registration records explicit legal consent versions', async () => {
  process.env.LEGAL_VERSION = 'test-v1';
  const response = await request(app).post('/api/auth/register').send({
    email: 'member@example.com',
    phone: '+919999999991',
    password: 'Password123!',
    acceptTerms: true,
    acceptPrivacy: true
  });
  assert.equal(response.status, 201);
  const user = await User.findOne({ email: 'member@example.com' });
  assert.equal(user.acceptedTermsVersion, 'test-v1');
  assert.ok(user.acceptedAt);
});
test('registration is rejected without consent', async () => {
  const response = await request(app).post('/api/auth/register').send({
    email: 'member@example.com',
    phone: '+919999999991',
    password: 'Password123!'
  });
  assert.equal(response.status, 400);
});
test('registration setting is enforced by the API', async () => {
  await SystemSetting.create({ _id: 'global', registrationEnabled: false });
  const response = await request(app).post('/api/auth/register').send({
    email: 'member@example.com',
    phone: '+919999999991',
    password: 'Password123!',
    acceptTerms: true,
    acceptPrivacy: true
  });
  assert.equal(response.status, 503);
});
test('maintenance mode blocks members but not staff', async () => {
  await SystemSetting.create({ _id: 'global', maintenanceMode: true });
  const member = await User.create({
      email: 'member@example.com',
      password: 'Password123!',
      role: 'member'
    }),
    admin = await User.create({
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin'
    }),
    memberToken = jwt.sign({ sub: member.id }, process.env.JWT_SECRET),
    adminToken = jwt.sign({ sub: admin.id }, process.env.JWT_SECRET);
  assert.equal(
    (
      await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${memberToken}`)
    ).status,
    503
  );
  assert.notEqual(
    (
      await request(app)
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`)
    ).status,
    503
  );
});
test('advanced search is rejected for a free member', async () => {
  const member = await User.create({
    email: 'member@example.com',
    password: 'Password123!'
  });
  await MatrimonialProfile.create({
    userId: member._id,
    profileFor: 'Self',
    firstName: 'Member',
    gender: 'Male',
    visibility: 'active'
  });
  const token = jwt.sign({ sub: member.id }, process.env.JWT_SECRET),
    response = await request(app)
      .get('/api/profiles/discover?education=MBA')
      .set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 403);
});
test('contact details require an accepted request and consume one unlock only', async () => {
  const [viewer, owner] = await User.create([
      { email: 'viewer@example.com', password: 'Password123!' },
      {
        email: 'owner@example.com',
        phone: '+919999999992',
        password: 'Password123!'
      }
    ]),
    [viewerProfile, ownerProfile] = await Promise.all([
      MatrimonialProfile.create({
        userId: viewer._id,
        profileFor: 'Self',
        firstName: 'Viewer',
        gender: 'Male',
        visibility: 'active'
      }),
      MatrimonialProfile.create({
        userId: owner._id,
        profileFor: 'Self',
        firstName: 'Owner',
        gender: 'Female',
        visibility: 'active'
      })
    ]),
    plan = await Plan.create({
      name: 'Connect',
      slug: 'connect',
      price: 1,
      durationDays: 30,
      features: { contactViewLimit: 1 }
    });
  await Promise.all([
    Subscription.create({
      user: viewer._id,
      plan: plan._id,
      planNameSnapshot: 'Connect',
      priceSnapshot: 1,
      entitlementSnapshot: { contactViewLimit: 1 },
      startsAt: new Date(Date.now() - 1000),
      endsAt: new Date(Date.now() + 864e5),
      status: 'Active'
    }),
    Match.create({
      profileA: viewerProfile._id,
      profileB: ownerProfile._id,
      pairKey: [String(viewerProfile._id), String(ownerProfile._id)]
        .sort()
        .join(':'),
      status: 'Active'
    }),
    ContactRequest.create({
      requesterProfile: viewerProfile._id,
      receiverProfile: ownerProfile._id,
      status: 'Accepted'
    })
  ]);
  const token = jwt.sign({ sub: viewer.id }, process.env.JWT_SECRET),
    before = await request(app)
      .get(`/api/profiles/${ownerProfile.profileId}`)
      .set('Authorization', `Bearer ${token}`);
  assert.equal(before.body.data.profile.contact, undefined);
  const id = before.body.data.actionState.contactRequest.id;
  assert.equal(
    (
      await request(app)
        .post(`/api/contact-requests/${id}/unlock`)
        .set('Authorization', `Bearer ${token}`)
    ).status,
    200
  );
  assert.equal(
    (
      await request(app)
        .post(`/api/contact-requests/${id}/unlock`)
        .set('Authorization', `Bearer ${token}`)
    ).status,
    200
  );
  const afterUnlock = await request(app)
      .get(`/api/profiles/${ownerProfile.profileId}`)
      .set('Authorization', `Bearer ${token}`),
    usage = await PlanUsage.findOne({ user: viewer._id });
  assert.equal(afterUnlock.body.data.profile.contact.phone, '+919999999992');
  assert.equal(usage.contactViewsUsed, 1);
});
test('captured payment webhooks are idempotent and snapshot plan entitlements', async () => {
  process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook-test-secret';
  const member = await User.create({
      email: 'payer@example.com',
      password: 'Password123!'
    }),
    plan = await Plan.create({
      name: 'Premium',
      slug: 'premium',
      price: 4999,
      durationDays: 180,
      features: { advancedSearch: true, contactViewLimit: 25 }
    }),
    payment = await Payment.create({
      user: member._id,
      plan: plan._id,
      provider: 'razorpay',
      providerOrderId: 'order_test',
      amount: 4999,
      status: 'Created'
    }),
    event = {
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay_test', order_id: 'order_test' } }
      }
    },
    body = JSON.stringify(event),
    signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
  for (let index = 0; index < 2; index++)
    assert.equal(
      (
        await request(app)
          .post('/api/webhooks/razorpay')
          .set('Content-Type', 'application/json')
          .set('x-razorpay-signature', signature)
          .set('x-razorpay-event-id', 'evt_test')
          .send(body)
      ).status,
      200
    );
  const subscriptions = await Subscription.find({ user: member._id }),
    saved = await Payment.findById(payment._id);
  assert.equal(subscriptions.length, 1);
  assert.equal(subscriptions[0].planNameSnapshot, 'Premium');
  assert.equal(subscriptions[0].entitlementSnapshot.contactViewLimit, 25);
  assert.equal(saved.processedEvents.length, 1);
  assert.equal(saved.status, 'Paid');
});
test('the last active super admin cannot disable themselves', async () => {
  const admin = await User.create({
      email: 'root@example.com',
      password: 'Password123!',
      role: 'super_admin'
    }),
    token = jwt.sign({ sub: admin.id }, process.env.JWT_SECRET),
    response = await request(app)
      .patch(`/api/admin/users/${admin.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Suspended' });
  assert.equal(response.status, 409);
});
