import test, {
  after,
  afterEach,
  before
} from 'node:test';

import assert from 'node:assert/strict';

import mongoose from 'mongoose';

import {
  MongoMemoryServer
} from 'mongodb-memory-server';

import User from '../src/models/User.js';

import {
  Payment,
  Plan,
  RefundRequest,
  Subscription
} from '../src/models/Platform.js';

import {
  reconcileRefund
} from '../src/services/refundService.js';

let database;

before(
  async () => {
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

test(
  'manual reconciliation applies a processed full refund exactly once',
  async () => {
    const member =
      await User.create({
        email:
          'sync-member@example.com',

        password:
          'Password123!'
      });

    const admin =
      await User.create({
        email:
          'sync-admin@example.com',

        password:
          'Password123!',

        role:
          'admin'
      });

    const plan =
      await Plan.create({
        name:
          'Assisted',

        slug:
          'sync-assisted',

        price:
          749,

        durationDays:
          30
      });

    const subscription =
      await Subscription.create({
        user:
          member._id,

        plan:
          plan._id,

        planNameSnapshot:
          plan.name,

        priceSnapshot:
          749,

        entitlementSnapshot:
          {},

        status:
          'Active',

        startsAt:
          new Date(),

        endsAt:
          new Date(
            Date.now() +
              30 *
                864e5
          )
      });

    const payment =
      await Payment.create({
        user:
          member._id,

        plan:
          plan._id,

        subscription:
          subscription._id,

        provider:
          'razorpay',

        providerOrderId:
          'order_sync_test',

        providerPaymentId:
          'pay_sync_test',

        amount:
          749,

        status:
          'Paid',

        refundPendingPaise:
          74900
      });

    const refund =
      await RefundRequest.create({
        payment:
          payment._id,

        user:
          member._id,

        requestedBy:
          admin._id,

        type:
          'Full',

        reasonCode:
          'technical_failure',

        reason:
          'Verified technical issue requiring a complete refund.',

        amountPaise:
          74900,

        providerRefundId:
          'rfnd_sync_test',

        status:
          'Submitted'
      });

    const providerRefund = {
      id:
        'rfnd_sync_test',

      payment_id:
        'pay_sync_test',

      amount:
        74900,

      currency:
        'INR',

      status:
        'processed'
    };

    const first =
      await reconcileRefund({
        providerRefund,

        actor:
          admin._id
      });

    assert.equal(
      first.changed,
      true
    );

    let savedPayment =
      await Payment.findById(
        payment._id
      );

    let savedRefund =
      await RefundRequest.findById(
        refund._id
      );

    let savedSubscription =
      await Subscription.findById(
        subscription._id
      );

    assert.equal(
      savedPayment.status,
      'Refunded'
    );

    assert.equal(
      savedPayment.refundedAmountPaise,
      74900
    );

    assert.equal(
      savedPayment.refundPendingPaise,
      0
    );

    assert.equal(
      savedRefund.status,
      'Processed'
    );

    assert.ok(
      savedRefund.processedAt
    );

    assert.equal(
      savedSubscription.status,
      'Cancelled'
    );

    /*
     * Retry the exact same reconciliation.
     * Amount must NOT double.
     */
    const second =
      await reconcileRefund({
        providerRefund,

        actor:
          admin._id
      });

    assert.equal(
      second.changed,
      false
    );

    savedPayment =
      await Payment.findById(
        payment._id
      );

    assert.equal(
      savedPayment.refundedAmountPaise,
      74900
    );
  }
);

test(
  'pending provider refund remains pending locally',
  async () => {
    const member =
      await User.create({
        email:
          'pending-member@example.com',

        password:
          'Password123!'
      });

    const admin =
      await User.create({
        email:
          'pending-admin@example.com',

        password:
          'Password123!',

        role:
          'admin'
      });

    const plan =
      await Plan.create({
        name:
          'Premium',

        slug:
          'sync-premium',

        price:
          549,

        durationDays:
          30
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
          'order_pending_test',

        providerPaymentId:
          'pay_pending_test',

        amount:
          549,

        status:
          'Paid',

        refundPendingPaise:
          20000
      });

    const refund =
      await RefundRequest.create({
        payment:
          payment._id,

        user:
          member._id,

        requestedBy:
          admin._id,

        type:
          'Partial',

        reasonCode:
          'admin_exception',

        reason:
          'Approved partial refund while provider processing continues.',

        amountPaise:
          20000,

        providerRefundId:
          'rfnd_pending_test',

        status:
          'Submitted'
      });

    const result =
      await reconcileRefund({
        providerRefund: {
          id:
            'rfnd_pending_test',

          payment_id:
            'pay_pending_test',

          amount:
            20000,

          status:
            'pending'
        },

        actor:
          admin._id
      });

    assert.equal(
      result.changed,
      false
    );

    assert.equal(
      result.terminal,
      false
    );

    const savedPayment =
      await Payment.findById(
        payment._id
      );

    const savedRefund =
      await RefundRequest.findById(
        refund._id
      );

    assert.equal(
      savedPayment.refundPendingPaise,
      20000
    );

    assert.equal(
      savedPayment.status,
      'Paid'
    );

    assert.equal(
      savedRefund.status,
      'Submitted'
    );
  }
);