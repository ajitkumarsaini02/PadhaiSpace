const Razorpay = require('razorpay');
const crypto = require('crypto');

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKeyId';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummySecretKey';
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummyWebhookSecret';

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
} catch (err) {
  console.warn('[Razorpay Init Warning]', err.message);
}

/**
 * Verify Razorpay payment signature
 * HMAC-SHA256 of (razorpay_order_id + "|" + razorpay_payment_id) using key_secret
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  if (!orderId || !paymentId || !signature) return false;
  try {
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return generatedSignature === signature;
  } catch (err) {
    console.error('[Razorpay Signature Error]', err.message);
    return false;
  }
};

/**
 * Verify Razorpay webhook signature
 * HMAC-SHA256 of raw body using webhook_secret
 */
const verifyWebhookSignature = (rawBody, signature) => {
  if (!rawBody || !signature) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhook_secret)
      .update(rawBody)
      .digest('hex');
    return expectedSignature === signature;
  } catch (err) {
    console.error('[Webhook Signature Error]', err.message);
    return false;
  }
};

module.exports = {
  razorpayInstance,
  key_id,
  key_secret,
  webhook_secret,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
