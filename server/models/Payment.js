const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true, // Amount in paise (e.g., 900 paise = ₹9)
    },
    currency: {
      type: String,
      default: 'INR',
    },
    provider: {
      type: String,
      default: 'razorpay',
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      default: '',
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      index: true,
    },
    receipt: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PaymentSchema.virtual('amountInRupees').get(function () {
  return this.amount ? this.amount / 100 : 0;
});

module.exports = mongoose.model('Payment', PaymentSchema);
