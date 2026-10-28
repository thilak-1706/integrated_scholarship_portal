const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

/**
 * Record an immutable audit log entry
 */
const recordAuditLog = async ({
  applicationId,
  applicationNumber,
  previousStatus,
  newStatus,
  changedBy,
  officerName,
  officerRole,
  remarks,
  metadata
}) => {
  try {
    const log = await AuditLog.create({
      applicationId,
      applicationNumber,
      previousStatus: previousStatus || 'UNKNOWN',
      newStatus,
      changedBy: changedBy || null,
      officerName: officerName || 'System Automated',
      officerRole: officerRole || 'SYSTEM',
      remarks: remarks || '',
      metadata: metadata || {},
      timestamp: new Date()
    });
    return log;
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};

/**
 * Create a notification for a user or role
 */
const createNotification = async ({
  userId,
  studentId,
  studentEmail = '',
  studentName = '',
  recipientRole,
  institutionId,
  departmentId,
  title,
  message,
  type = 'info',
  applicationNumber = '',
  refNo = '',
  schemeId = '',
  schemeTitle = '',
  remarks = '',
  link = ''
}) => {
  try {
    const finalUserId = userId || studentId || null;
    return await Notification.create({
      userId: finalUserId,
      studentId: finalUserId,
      studentEmail,
      studentName,
      recipientRole: recipientRole || 'STUDENT',
      institutionId: institutionId || null,
      departmentId: departmentId || null,
      title,
      message,
      type,
      applicationNumber,
      refNo: refNo || applicationNumber,
      schemeId,
      schemeTitle,
      remarks,
      link,
      isRead: false,
      read: false
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

module.exports = {
  recordAuditLog,
  createNotification
};
