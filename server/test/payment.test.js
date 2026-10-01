import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { paymentService } from '../src/services/paymentService.js';
test('checkout verification accepts a valid server signature', () => {
  process.env.RAZORPAY_KEY_SECRET = 'test-secret';
  const orderId = 'order_123',
    paymentId = 'pay_123';
  const signature = crypto
    .createHmac('sha256', 'test-secret')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  assert.equal(
    paymentService.verifyCheckout({ orderId, paymentId, signature }),
    true
  );
});
test('checkout verification rejects a forged signature', () => {
  process.env.RAZORPAY_KEY_SECRET = 'test-secret';
  assert.throws(
    () =>
      paymentService.verifyCheckout({
        orderId: 'order_123',
        paymentId: 'pay_123',
        signature: 'forged'
      }),
    /invalid/
  );
});
