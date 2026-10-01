import crypto from 'node:crypto';
import { ApiError } from '../utils/http.js';
const signature = (value, secret) =>
  crypto.createHmac('sha256', secret).update(value).digest('hex');
const safeEqual = (a, b) => {
  const left = Buffer.from(String(a || '')),
    right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};
export const paymentService = {
  async createOrder({ amount, user, receipt }) {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const auth = Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
      ).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: 'INR',
          receipt,
          notes: { user: String(user) }
        })
      });
      const data = await response.json();
      if (!response.ok)
        throw new ApiError(502, 'Unable to create a secure payment order.');
      return {
        provider: 'razorpay',
        providerOrderId: data.id,
        amount,
        currency: data.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      };
    }
    if (process.env.NODE_ENV === 'production')
      throw new ApiError(503, 'Payment provider is not configured.');
    return {
      provider: 'mock',
      providerOrderId: `dev_${Date.now()}_${user}`,
      amount,
      currency: 'INR',
      status: 'Created',
      notice: 'Development order only; it never activates membership.'
    };
  },
  verifyCheckout({ orderId, paymentId, signature: provided }) {
    if (!process.env.RAZORPAY_KEY_SECRET)
      throw new ApiError(503, 'Payment verification is not configured.');
    if (
      !safeEqual(
        signature(`${orderId}|${paymentId}`, process.env.RAZORPAY_KEY_SECRET),
        provided
      )
    )
      throw new ApiError(400, 'Payment signature is invalid.');
    return true;
  },
  verifyWebhook(rawBody, provided) {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET)
      throw new ApiError(503, 'Payment webhook is not configured.');
    if (
      !safeEqual(
        signature(rawBody, process.env.RAZORPAY_WEBHOOK_SECRET),
        provided
      )
    )
      throw new ApiError(400, 'Webhook signature is invalid.');
    return true;
  }
};
