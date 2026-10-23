const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Application = require('../models/Application');

let ioInstance = null;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003'
];

/**
 * Initialize Socket.IO with HTTP Server, JWT Auth Middleware and Room Handlers
 */
const initSocketIO = (httpServer) => {
  if (ioInstance) return ioInstance;

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true); // Fallback to support all standard local origins
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 15000
  });

  // Strict JWT Authentication Middleware for all Socket connections
  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      if (token && typeof token === 'string' && token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }

      if (!token) {
        return next(new Error('Authentication error: No bearer token provided'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'national_scholarship_secret_key_2026_jwt'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User account not found'));
      }

      if (user.status !== 'Active') {
        return next(new Error('Authentication error: User account is deactivated or suspended'));
      }

      socket.user = user;
      return next();
    } catch (err) {
      return next(new Error(`Authentication error: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    // Automatically join role and user scoped rooms verified from server database
    const userRoom = `user:${user._id.toString()}`;
    const roleRoom = `role:${user.role}`;
    socket.join(userRoom);
    socket.join(roleRoom);

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      socket.join('role:ADMIN');
      socket.join('admin');
    }

    if (user.role === 'INSTITUTE_OFFICER' && user.institutionId) {
      socket.join(`institution:${user.institutionId.toString()}`);
    }

    if (user.role === 'DEPARTMENT_OFFICER' && user.departmentId) {
      socket.join(`department:${user.departmentId.toString()}`);
    }

    // Role-verified join_room handler (prevents unauthorized snooping across institutions/departments)
    socket.on('join_room', (roomName) => {
      if (!roomName || typeof roomName !== 'string') return;

      const [prefix, targetId] = roomName.split(':');

      if (prefix === 'institution') {
        if (
          user.role === 'ADMIN' ||
          user.role === 'SUPER_ADMIN' ||
          (user.role === 'INSTITUTE_OFFICER' && String(user.institutionId) === String(targetId))
        ) {
          socket.join(roomName);
        } else {
          socket.emit('error', { message: 'Access denied: Unauthorized institution room subscription' });
        }
      } else if (prefix === 'department') {
        if (
          user.role === 'ADMIN' ||
          user.role === 'SUPER_ADMIN' ||
          (user.role === 'DEPARTMENT_OFFICER' && String(user.departmentId) === String(targetId))
        ) {
          socket.join(roomName);
        } else {
          socket.emit('error', { message: 'Access denied: Unauthorized department room subscription' });
        }
      } else if (prefix === 'admin' || roomName === 'admin' || roomName === 'role:ADMIN') {
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          socket.join(roomName);
        } else {
          socket.emit('error', { message: 'Access denied: Unauthorized admin room subscription' });
        }
      } else if (prefix === 'user') {
        if (
          user.role === 'ADMIN' ||
          user.role === 'SUPER_ADMIN' ||
          String(user._id) === String(targetId)
        ) {
          socket.join(roomName);
        } else {
          socket.emit('error', { message: 'Access denied: Unauthorized user room subscription' });
        }
      } else {
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          socket.join(roomName);
        } else {
          socket.emit('error', { message: 'Access denied: Unauthorized room subscription' });
        }
      }
    });

    // Application specific subscription with authorization check
    socket.on('subscribe_application', async (applicationNumber) => {
      if (!applicationNumber) return;

      try {
        const app = await Application.findOne({ applicationNumber });
        if (!app) {
          socket.emit('error', { message: 'Application not found' });
          return;
        }

        const isAuthorized =
          user.role === 'ADMIN' ||
          user.role === 'SUPER_ADMIN' ||
          (user.role === 'STUDENT' && String(app.studentId) === String(user._id)) ||
          (user.role === 'INSTITUTE_OFFICER' && String(app.institutionId) === String(user.institutionId)) ||
          (user.role === 'DEPARTMENT_OFFICER' &&
            String(app.departmentId) === String(user.departmentId) &&
            app.status !== 'SUBMITTED');

        if (isAuthorized) {
          socket.join(`app:${applicationNumber}`);
        } else {
          socket.emit('error', { message: 'Access denied: Unauthorized application subscription' });
        }
      } catch (err) {
        socket.emit('error', { message: 'Subscription failed' });
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  ioInstance = io;
  return io;
};

const getIO = () => {
  return ioInstance;
};

/**
 * Sanitize application payload before broadcasting so sensitive fields are never leaked
 */
const sanitizeApplication = (app) => {
  if (!app) return null;
  return {
    applicationId: app._id,
    applicationNumber: app.applicationNumber,
    studentId: app.studentId,
    studentName: app.studentName,
    scholarshipId: app.scholarshipId,
    scholarshipName: app.scholarshipName,
    scholarshipCode: app.scholarshipCode,
    institutionId: app.institutionId,
    institutionName: app.institutionName,
    departmentId: app.departmentId,
    departmentName: app.departmentName,
    requestedAmount: app.requestedAmount,
    approvedAmount: app.approvedAmount,
    submissionType: app.submissionType,
    status: app.status,
    academicDetails: {
      course: app.academicDetails?.course,
      year: app.academicDetails?.year,
      department: app.academicDetails?.department,
      enrollmentNumber: app.academicDetails?.enrollmentNumber,
      cgpa: app.academicDetails?.cgpa,
      previousClassPercentage: app.academicDetails?.previousClassPercentage
    },
    instituteVerification: app.instituteVerification,
    departmentVerification: app.departmentVerification,
    sanctionId: app.sanctionId,
    paymentId: app.paymentId,
    paymentReference: app.paymentReference,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt
  };
};

/**
 * Emit event when a new scholarship application is created by a student
 */
const emitApplicationCreated = (application) => {
  if (!ioInstance || !application) return;
  try {
    const payload = sanitizeApplication(application);

    // 1. Notify Assigned Institute Officer
    if (application.institutionId) {
      ioInstance.to(`institution:${application.institutionId.toString()}`).emit('application_created', payload);
    }

    // 2. Notify Admin Portal
    ioInstance.to('role:ADMIN').emit('application_created', payload);
    ioInstance.to('admin').emit('application_created', payload);

    // 3. Notify Student
    if (application.studentId) {
      ioInstance.to(`user:${application.studentId.toString()}`).emit('application_created', payload);
    }

    // 4. Application Room
    if (application.applicationNumber) {
      ioInstance.to(`app:${application.applicationNumber}`).emit('application_created', payload);
    }
  } catch (err) {
    console.error('[Socket.IO] Error emitting application_created:', err.message);
  }
};

/**
 * Emit event when application status transitions
 */
const emitApplicationStatusUpdated = (application, updateMeta = {}) => {
  if (!ioInstance || !application) return;
  try {
    const sanitized = sanitizeApplication(application);
    const payload = {
      ...sanitized,
      previousStatus: updateMeta.previousStatus,
      action: updateMeta.action,
      remarks: updateMeta.remarks,
      officerName: updateMeta.officerName,
      officerRole: updateMeta.officerRole
    };

    // 1. Notify Student
    if (application.studentId) {
      ioInstance.to(`user:${application.studentId.toString()}`).emit('application_status_updated', payload);
    }

    // 2. Notify Institute Officer
    if (application.institutionId) {
      ioInstance.to(`institution:${application.institutionId.toString()}`).emit('application_status_updated', payload);
    }

    // 3. Notify Department Officer when application enters or moves through department stage
    const deptStatuses = [
      'ROUTED_TO_DEPARTMENT',
      'DEPARTMENT_VERIFICATION',
      'APPROVED',
      'SANCTIONED',
      'PAYMENT_PENDING',
      'PAYMENT_PROCESSING',
      'DISBURSED'
    ];
    if (
      application.departmentId &&
      (deptStatuses.includes(application.status) || deptStatuses.includes(updateMeta.previousStatus))
    ) {
      ioInstance.to(`department:${application.departmentId.toString()}`).emit('application_status_updated', payload);
    }

    // 4. Notify Central Admin Portal
    ioInstance.to('role:ADMIN').emit('application_status_updated', payload);
    ioInstance.to('admin').emit('application_status_updated', payload);

    // 5. Application Room
    if (application.applicationNumber) {
      ioInstance.to(`app:${application.applicationNumber}`).emit('application_status_updated', payload);
    }
  } catch (err) {
    console.error('[Socket.IO] Error emitting application_status_updated:', err.message);
  }
};

/**
 * Emit event when sanction order is generated
 */
const emitSanctionGenerated = (sanction, application) => {
  if (!ioInstance || !sanction) return;
  try {
    const payload = {
      sanctionId: sanction._id,
      sanctionNumber: sanction.sanctionNumber,
      applicationId: application?._id || sanction.applicationId,
      applicationNumber: application?.applicationNumber || sanction.applicationNumber,
      studentId: application?.studentId || sanction.studentId,
      studentName: application?.studentName || sanction.studentName,
      scholarshipName: application?.scholarshipName || sanction.schemeName,
      approvedAmount: sanction.approvedAmount,
      academicYear: sanction.academicYear,
      status: sanction.status || 'SANCTIONED',
      approvalDate: sanction.approvalDate,
      officerName: sanction.officerName,
      departmentId: sanction.departmentId || application?.departmentId,
      departmentName: sanction.departmentName || application?.departmentName,
      createdAt: sanction.createdAt
    };

    if (payload.studentId) {
      ioInstance.to(`user:${payload.studentId.toString()}`).emit('sanction_generated', payload);
    }
    if (payload.departmentId) {
      ioInstance.to(`department:${payload.departmentId.toString()}`).emit('sanction_generated', payload);
    }
    if (application?.institutionId) {
      ioInstance.to(`institution:${application.institutionId.toString()}`).emit('sanction_generated', payload);
    }
    ioInstance.to('role:ADMIN').emit('sanction_generated', payload);
    ioInstance.to('admin').emit('sanction_generated', payload);
    if (payload.applicationNumber) {
      ioInstance.to(`app:${payload.applicationNumber}`).emit('sanction_generated', payload);
    }
  } catch (err) {
    console.error('[Socket.IO] Error emitting sanction_generated:', err.message);
  }
};

/**
 * Emit event when payment or DBT disbursement status updates
 */
const emitPaymentStatusUpdated = (payment, application) => {
  if (!ioInstance || !payment) return;
  try {
    const payload = {
      paymentId: payment._id,
      paymentReference: payment.paymentReference,
      applicationId: application?._id || payment.applicationId,
      applicationNumber: payment.applicationNumber,
      studentId: application?.studentId || payment.studentId,
      departmentId: payment.departmentId,
      departmentName: payment.departmentName,
      status: payment.status,
      amount: payment.amount,
      utr: payment.utr,
      transactionDate: payment.transactionDate,
      disbursedAt: payment.disbursedAt,
      remarks: payment.remarks
    };

    if (payload.studentId) {
      ioInstance.to(`user:${payload.studentId.toString()}`).emit('payment_status_updated', payload);
    }
    if (payment.departmentId) {
      ioInstance.to(`department:${payment.departmentId.toString()}`).emit('payment_status_updated', payload);
    }
    if (application?.institutionId) {
      ioInstance.to(`institution:${application.institutionId.toString()}`).emit('payment_status_updated', payload);
    }
    ioInstance.to('role:ADMIN').emit('payment_status_updated', payload);
    ioInstance.to('admin').emit('payment_status_updated', payload);
    if (payment.applicationNumber) {
      ioInstance.to(`app:${payment.applicationNumber}`).emit('payment_status_updated', payload);
    }
  } catch (err) {
    console.error('[Socket.IO] Error emitting payment_status_updated:', err.message);
  }
};

/**
 * Broadcast SLP engine and SLA events
 */
const broadcastSlpEvent = (eventName, data) => {
  if (!ioInstance) return;
  try {
    ioInstance.to('role:ADMIN').emit(eventName, data);
    ioInstance.to('admin').emit(eventName, data);

    if (data?.institutionId) {
      ioInstance.to(`institution:${data.institutionId.toString()}`).emit(eventName, data);
    }
    if (data?.departmentId) {
      ioInstance.to(`department:${data.departmentId.toString()}`).emit(eventName, data);
    }
    if (data?.applicationNumber) {
      ioInstance.to(`app:${data.applicationNumber}`).emit(eventName, data);
    }
  } catch (err) {
    console.error(`[Socket.IO] Error emitting ${eventName}:`, err.message);
  }
};

module.exports = {
  initSocketIO,
  getIO,
  emitApplicationCreated,
  emitApplicationStatusUpdated,
  emitSanctionGenerated,
  emitPaymentStatusUpdated,
  broadcastSlpEvent
};
