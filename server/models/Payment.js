const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true
    },
    applicationNumber: {
      type: String,
      required: true
    },
    sanctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sanction',
      default: null
    },
    sanctionNumber: {
      type: String,
      default: ''
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    scholarshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scholarship',
      required: true
    },
    scholarshipName: {
      type: String,
      required: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    departmentName: {
      type: String,
      default: ''
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'DISBURSED', 'FAILED'],
      default: 'PAYMENT_PENDING'
    },
    utr: {
      type: String,
      default: ''
    },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' }
    },
    transactionDate: {
      type: Date,
      default: null
    },
    disbursedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    disbursedByName: {
      type: String,
      default: ''
    },
    receiptNumber: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
