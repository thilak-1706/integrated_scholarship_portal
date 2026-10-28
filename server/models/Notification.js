const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    studentEmail: {
      type: String,
      default: ''
    },
    studentName: {
      type: String,
      default: ''
    },
    recipientRole: {
      type: String,
      enum: ['STUDENT', 'INSTITUTE_OFFICER', 'DEPARTMENT_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'ALL'],
      default: 'STUDENT'
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      default: null
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'danger'],
      default: 'info'
    },
    applicationNumber: {
      type: String,
      default: ''
    },
    refNo: {
      type: String,
      default: ''
    },
    schemeId: {
      type: String,
      default: ''
    },
    schemeTitle: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Sync userId & studentId, isRead & read
notificationSchema.pre('save', function (next) {
  if (this.userId && !this.studentId) {
    this.studentId = this.userId;
  }
  if (this.studentId && !this.userId) {
    this.userId = this.studentId;
  }
  if (this.isRead !== undefined && this.read !== this.isRead) {
    this.read = this.isRead;
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);

