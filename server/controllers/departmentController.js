const mongoose = require('mongoose');
const User = require('../models/User');
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const Department = require('../models/Department');
const Sanction = require('../models/Sanction');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { recordAuditLog, createNotification } = require('../utils/auditHelper');

// Helper to get departmentId
const getOfficerDepartmentId = (req) => {
  return req.user.departmentId;
};

const getApplicationLookupQuery = (idOrNumber) => {
  if (!idOrNumber) return { _id: null };
  const str = String(idOrNumber).trim();
  if (mongoose.isValidObjectId(str)) {
    return {
      $or: [
        { _id: str },
        { applicationNumber: str }
      ]
    };
  }
  return { applicationNumber: str };
};

const buildDepartmentFilter = (req) => {
  // Primary central/national department officer has oversight across all national schemes
  if (req.user?.email === 'department@nsp.gov.in') {
    return {};
  }
  const departmentId = req.user.departmentId;
  const departmentName = req.user.departmentName;
  if (departmentId) {
    return { departmentId: departmentId };
  } else if (departmentName) {
    return { departmentName: departmentName };
  }
  return {};
};

const belongsToOfficerDepartment = (req, application) => {
  if (!application) return false;

  // Global administrative roles have full oversight
  if (['ADMIN', 'SUPER_ADMIN'].includes(req.user?.role)) {
    return true;
  }

  // Primary central/national department officer has oversight across all national schemes
  if (req.user?.email === 'department@nsp.gov.in') {
    return true;
  }

  const officerDeptId = req.user?.departmentId ? req.user.departmentId.toString() : null;
  const officerDeptName = req.user?.departmentName ? req.user.departmentName.trim().toLowerCase() : null;

  // Extract application's department ID regardless of whether populated or not
  let appDeptId = null;
  if (application.departmentId) {
    if (application.departmentId._id) {
      appDeptId = application.departmentId._id.toString();
    } else {
      appDeptId = application.departmentId.toString();
    }
  }

  // Match by Department ID
  if (officerDeptId && appDeptId && officerDeptId === appDeptId) {
    return true;
  }

  // Extract application's department Name (from field or populated doc)
  const appDeptName = (
    application.departmentName ||
    (application.departmentId && typeof application.departmentId === 'object' && application.departmentId.name)
  )?.trim()?.toLowerCase();

  // Match by Department Name
  if (officerDeptName && appDeptName && officerDeptName === appDeptName) {
    return true;
  }

  // Fallback: If officer has no specific department bound, allow access
  if (!officerDeptId && !officerDeptName) {
    return true;
  }

  return false;
};

// Statuses that are visible to the Department Officer.
// Applications MUST have passed Institute approval (ROUTED_TO_DEPARTMENT or beyond)
// before the Department can see or act on them.
const DEPARTMENT_ALLOWED_STATUSES = [
  'ROUTED_TO_DEPARTMENT',
  'DEPARTMENT_VERIFICATION',
  'PENDING_DEPARTMENT',
  'APPROVED',
  'DEPARTMENT_APPROVED',
  'SANCTIONED',
  'PAYMENT_PENDING',
  'PAYMENT_PROCESSING',
  'DISBURSED',
  'CORRECTION_REQUIRED',
  'REJECTED'
];

// @desc    Get Department Dashboard Analytics & Charts
// @route   GET /api/department/dashboard
// @access  Private (Department Officer)
const getDepartmentDashboard = async (req, res) => {
  try {
    const departmentId = getOfficerDepartmentId(req);
    const baseFilter = buildDepartmentFilter(req);

    // Only fetch applications that have passed Institute verification.
    // Applications with SUBMITTED or INSTITUTE_VERIFIED status have not yet
    // been approved by the Institute Officer and MUST NOT appear here.
    const deptFilter = Object.keys(baseFilter).length > 0
      ? { $and: [baseFilter, { status: { $in: DEPARTMENT_ALLOWED_STATUSES } }] }
      : { status: { $in: DEPARTMENT_ALLOWED_STATUSES } };

    const applications = await Application.find(deptFilter).sort({ createdAt: -1 });

    const incoming = applications.filter((app) => ['ROUTED_TO_DEPARTMENT', 'DEPARTMENT_VERIFICATION'].includes(app.status)).length;
    const approved = applications.filter((app) => app.status === 'APPROVED').length;
    const sanctioned = applications.filter((app) => app.status === 'SANCTIONED').length;
    const disbursed = applications.filter((app) => app.status === 'DISBURSED').length;
    const rejected = applications.filter((app) => app.status === 'REJECTED').length;

    // Financial Metrics
    let deptInfo = null;
    if (departmentId) {
      deptInfo = await Department.findById(departmentId);
    }
    if (!deptInfo && req.user.departmentName) {
      deptInfo = await Department.findOne({ name: req.user.departmentName });
    }

    const totalBudget = deptInfo?.budget?.allocated || 10000000;
    const paymentFilter = { status: 'DISBURSED' };
    if (departmentId && req.user.departmentName) {
      paymentFilter.$or = [
        { departmentId: departmentId },
        { departmentName: req.user.departmentName }
      ];
    } else if (departmentId) {
      paymentFilter.departmentId = departmentId;
    } else if (req.user.departmentName) {
      paymentFilter.departmentName = req.user.departmentName;
    }

    const payments = await Payment.find(paymentFilter);
    const totalDisbursedAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Monthly Application Trend
    const monthlyStats = [
      { month: 'Jan', received: 0, disbursed: 0 },
      { month: 'Feb', received: 0, disbursed: 0 },
      { month: 'Mar', received: 0, disbursed: 0 },
      { month: 'Apr', received: 0, disbursed: 0 },
      { month: 'May', received: 0, disbursed: 0 },
      { month: 'Jun', received: 0, disbursed: 0 },
      { month: 'Jul', received: 0, disbursed: 0 },
      { month: 'Aug', received: 0, disbursed: 0 }
    ];

    applications.forEach((app) => {
      const m = new Date(app.createdAt).getMonth();
      if (m >= 0 && m < 8) {
        monthlyStats[m].received += 1;
        if (app.status === 'DISBURSED') monthlyStats[m].disbursed += 1;
      }
    });

    return res.status(200).json({
      success: true,
      department: deptInfo || { name: req.user.departmentName || 'Assigned Department' },
      stats: {
        incoming,
        approved,
        sanctioned,
        disbursed,
        rejected,
        totalApplications: applications.length,
        totalBudget,
        totalDisbursedAmount,
        budgetRemaining: Math.max(0, totalBudget - totalDisbursedAmount)
      },
      statusBreakdown: [
        { name: 'Incoming Scrutiny', value: incoming, color: '#3b82f6' },
        { name: 'Approved', value: approved, color: '#10b981' },
        { name: 'Sanctioned', value: sanctioned, color: '#8b5cf6' },
        { name: 'Disbursed', value: disbursed, color: '#059669' },
        { name: 'Rejected', value: rejected, color: '#ef4444' }
      ],
      monthlyStats,
      recentApplications: applications.slice(0, 5)
    });
  } catch (error) {
    console.error('Department Dashboard Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load department dashboard',
      error: error.message
    });
  }
};

// @desc    Get Filterable Applications for Assigned Department
// @route   GET /api/department/applications
// @access  Private (Department Officer)
const getDepartmentApplications = async (req, res) => {
  try {
    const { status, scholarshipId, search, institutionId } = req.query;

    const baseFilter = buildDepartmentFilter(req);
    const andConditions = [];

    // Enforce workflow gate: Department may only see applications that have
    // already passed Institute Officer approval (ROUTED_TO_DEPARTMENT or beyond).
    // Applying a status filter from query must be a subset of DEPARTMENT_ALLOWED_STATUSES.
    if (status && status !== 'All') {
      // Honour the user's specific status filter, but only if it is a valid dept-stage status.
      if (DEPARTMENT_ALLOWED_STATUSES.includes(status)) {
        andConditions.push({ status });
      } else {
        // Requested status is not reachable by department; return empty list.
        andConditions.push({ status: 'NEVER_MATCH_SENTINEL' });
      }
    } else {
      // Default: show all department-stage statuses (not SUBMITTED / INSTITUTE_VERIFIED etc)
      andConditions.push({ status: { $in: DEPARTMENT_ALLOWED_STATUSES } });
    }

    if (Object.keys(baseFilter).length > 0) {
      if (baseFilter.$or) {
        andConditions.push({ $or: baseFilter.$or });
      } else {
        andConditions.push(baseFilter);
      }
    }

    if (scholarshipId && scholarshipId !== 'All') {
      andConditions.push({ scholarshipId });
    }
    if (institutionId && institutionId !== 'All') {
      andConditions.push({ institutionId });
    }
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      andConditions.push({
        $or: [
          { applicationNumber: searchRegex },
          { studentName: searchRegex },
          { studentEmail: searchRegex },
          { institutionName: searchRegex },
          { scholarshipName: searchRegex }
        ]
      });
    }

    const filter = andConditions.length > 0 ? { $and: andConditions } : {};

    const applications = await Application.find(filter)
      .populate('scholarshipId', 'name code category scholarshipAmount')
      .populate('institutionId', 'name code district')
      .populate('sanctionId')
      .populate('paymentId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get Department Applications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve department applications',
      error: error.message
    });
  }
};

// @desc    Get Single Application for Department Scrutiny
// @route   GET /api/department/applications/:id
// @access  Private (Department Officer)
const getDepartmentApplicationById = async (req, res) => {
  try {
    const queryCondition = getApplicationLookupQuery(req.params.id);

    const application = await Application.findOne(queryCondition)
      .populate('scholarshipId')
      .populate('institutionId')
      .populate('departmentId')
      .populate('studentId')
      .populate('sanctionId')
      .populate('paymentId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check permission
    const isOwner = belongsToOfficerDepartment(req, application);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only access applications assigned to your department.'
      });
    }

    // Workflow gate: Block access to applications that have not yet cleared Institute stage.
    // Only ROUTED_TO_DEPARTMENT and beyond are accessible to Department Officers.
    if (!DEPARTMENT_ALLOWED_STATUSES.includes(application.status)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This application (status: ${application.status}) has not yet passed Institute Officer verification and cannot be accessed by the Department.`
      });
    }

    const AuditLog = require('../models/AuditLog');
    const auditLogs = await AuditLog.find({ applicationId: application._id }).sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      application,
      auditLogs
    });
  } catch (error) {
    console.error('Get Department Application Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application scrutiny details',
      error: error.message
    });
  }
};

// @desc    Department Scrutiny Action (APPROVE with Amount, CORRECTION, REJECT)
// @route   POST /api/department/applications/:id/verify
// @access  Private (Department Officer)
const verifyDepartmentApplication = async (req, res) => {
  try {
    const { action, approvedAmount, remarks, checklist } = req.body;
    // action: 'APPROVE' | 'REQUEST_CORRECTION' | 'REJECT'

    const queryCondition = getApplicationLookupQuery(req.params.id);
    const application = await Application.findOne(queryCondition);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const isOwner = belongsToOfficerDepartment(req, application);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify applications outside your department.'
      });
    }

    // Workflow guard: Department Officer can only act on applications that have passed
    // Institute Officer approval (ROUTED_TO_DEPARTMENT). Applications in SUBMITTED or
    // INSTITUTE_VERIFIED status have not yet cleared the Institute stage.
    if (!DEPARTMENT_ALLOWED_STATUSES.includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Workflow violation: Application is currently at status "${application.status}" and has not yet been approved by the Institute Officer. Department action is not permitted at this stage.`
      });
    }

    const previousStatus = application.status;
    let newStatus = previousStatus;

    if (action === 'APPROVE') {
      const finalAmount = approvedAmount ? Number(approvedAmount) : application.requestedAmount;
      application.approvedAmount = finalAmount;
      newStatus = 'APPROVED';

      application.departmentVerification = {
        verifiedBy: req.user._id,
        officerName: req.user.name,
        verifiedAt: new Date(),
        remarks: remarks || `Department scrutiny approved for ₹${finalAmount.toLocaleString('en-IN')}.`,
        decision: 'APPROVED',
        checklist: checklist || {
          eligibilityMet: true,
          budgetAvailable: true,
          quotaVerified: true,
          bankDetailsValid: true
        }
      };

      // Notify Student
      await createNotification({
        userId: application.studentId,
        recipientRole: 'STUDENT',
        title: 'Scholarship Application Approved! 🎉',
        message: `Your scholarship application (${application.applicationNumber}) for "${application.scholarshipName}" has been approved by the Department for an amount of ₹${finalAmount.toLocaleString('en-IN')}. Sanction generation is pending.`,
        type: 'success',
        applicationNumber: application.applicationNumber,
        link: `/student/applications/${application._id}`
      });
    } else if (action === 'REQUEST_CORRECTION') {
      newStatus = 'CORRECTION_REQUIRED';
      application.correctionRemarks = remarks || 'Department officer requested document verification correction.';
      application.departmentVerification = {
        verifiedBy: req.user._id,
        officerName: req.user.name,
        verifiedAt: new Date(),
        remarks: remarks || 'Correction requested by Department Officer.',
        decision: 'CORRECTION',
        checklist: checklist || {}
      };

      await createNotification({
        userId: application.studentId,
        recipientRole: 'STUDENT',
        title: 'Department Correction Requested ⚠️',
        message: `Department officer has requested corrections for ${application.applicationNumber}: "${remarks || 'Update details'}"`,
        type: 'warning',
        applicationNumber: application.applicationNumber,
        link: `/student/applications/${application._id}`
      });
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
      application.rejectionReason = remarks || 'Department scrutiny criteria not satisfied or quota exceeded.';
      application.departmentVerification = {
        verifiedBy: req.user._id,
        officerName: req.user.name,
        verifiedAt: new Date(),
        remarks: remarks || 'Rejected by Department Officer.',
        decision: 'REJECTED',
        checklist: checklist || {}
      };

      await createNotification({
        userId: application.studentId,
        recipientRole: 'STUDENT',
        title: 'Application Rejected by Department ❌',
        message: `Your application (${application.applicationNumber}) was rejected by the Department. Reason: "${remarks || 'Criteria not met'}"`,
        type: 'danger',
        applicationNumber: application.applicationNumber,
        link: `/student/applications/${application._id}`
      });
    }

    application.status = newStatus;
    await application.save();

    // Audit Log
    await recordAuditLog({
      applicationId: application._id,
      applicationNumber: application.applicationNumber,
      previousStatus,
      newStatus,
      changedBy: req.user._id,
      officerName: req.user.name,
      officerRole: 'DEPARTMENT_OFFICER',
      remarks: remarks || (action === 'APPROVE' ? 'Department approval completed. Scrutinized and approved by Department Officer.' : `Department Officer executed ${action} (Amount: ₹${application.approvedAmount})`)
    });

    // Fetch fully populated application for frontend state sync
    const populatedApplication = await Application.findById(application._id)
      .populate('scholarshipId')
      .populate('institutionId')
      .populate('departmentId')
      .populate('studentId')
      .populate('sanctionId')
      .populate('paymentId');

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${newStatus}`,
      application: populatedApplication
    });
  } catch (error) {
    console.error('Department Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete department scrutiny',
      error: error.message
    });
  }
};

// @desc    Generate Official Sanction Order (Format: SAN-YYYY-XXXXXX)
// @route   POST /api/department/sanctions/generate
// @access  Private (Department Officer)
const generateSanctionOrder = async (req, res) => {
  try {
    const departmentId = getOfficerDepartmentId(req);
    const { applicationId, orderRemarks } = req.body;

    const queryCondition = getApplicationLookupQuery(applicationId);
    const application = await Application.findOne(queryCondition);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Only APPROVED applications can have a Sanction Order generated.'
      });
    }

    // Check if Sanction already exists for this application (Idempotency)
    const existingSanction = await Sanction.findOne({ applicationId: application._id });
    if (existingSanction) {
      return res.status(400).json({
        success: false,
        message: `Sanction Order (${existingSanction.sanctionNumber}) has already been generated for this application.`
      });
    }

    // Generate Sanction Number: SAN-2026-XXXXXX
    const currentYear = new Date().getFullYear();
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const sanctionNumber = `SAN-${currentYear}-${randomCode}`;

    const sanction = await Sanction.create({
      sanctionNumber,
      applicationId: application._id,
      applicationNumber: application.applicationNumber,
      studentId: application.studentId,
      studentName: application.studentName,
      scholarshipId: application.scholarshipId,
      scholarshipName: application.scholarshipName,
      departmentId: application.departmentId || departmentId,
      departmentName: application.departmentName || req.user.departmentName || 'Welfare Department',
      institutionName: application.institutionName,
      approvedAmount: application.approvedAmount || application.requestedAmount,
      approvalDate: new Date(),
      officerId: req.user._id,
      officerName: req.user.name,
      status: 'SANCTIONED',
      sanctionOrderText: orderRemarks || `Official Financial Sanction Order granted under ${application.scholarshipName} for Academic Year 2025-2026.`
    });

    const previousStatus = application.status;
    application.status = 'SANCTIONED';
    application.sanctionId = sanction._id;
    application.sanctionNumber = sanction.sanctionNumber;
    await application.save();

    // Create Initial Payment Queue Record if not existing
    let payment = await Payment.findOne({ applicationId: application._id });
    if (!payment) {
      const payCode = Math.floor(100000 + Math.random() * 900000);
      const paymentReference = `PAY-${currentYear}-${payCode}`;
      payment = await Payment.create({
        paymentReference,
        applicationId: application._id,
        applicationNumber: application.applicationNumber,
        sanctionId: sanction._id,
        sanctionNumber: sanction.sanctionNumber,
        studentId: application.studentId,
        studentName: application.studentName,
        scholarshipId: application.scholarshipId,
        scholarshipName: application.scholarshipName,
        departmentId: application.departmentId || departmentId,
        departmentName: application.departmentName,
        amount: application.approvedAmount,
        status: 'PAYMENT_PENDING',
        bankDetails: {
          bankName: application.bankDetails?.bankName || 'State Bank of India',
          accountNumber: application.bankDetails?.accountNumber || '38947291048',
          ifscCode: application.bankDetails?.ifscCode || 'SBIN0001234'
        }
      });
    }

    application.paymentId = payment._id;
    application.paymentReference = payment.paymentReference;
    await application.save();

    // Record Audit Log
    await recordAuditLog({
      applicationId: application._id,
      applicationNumber: application.applicationNumber,
      previousStatus,
      newStatus: 'SANCTIONED',
      changedBy: req.user._id,
      officerName: req.user.name,
      officerRole: 'DEPARTMENT_OFFICER',
      remarks: `Sanction Order generated: ${sanction.sanctionNumber} for amount ₹${sanction.approvedAmount.toLocaleString('en-IN')}`
    });

    // Notify Student
    await createNotification({
      userId: application.studentId,
      recipientRole: 'STUDENT',
      title: 'Sanction Order Generated! 📜',
      message: `Sanction order (${sanction.sanctionNumber}) for ₹${sanction.approvedAmount.toLocaleString('en-IN')} has been generated for your scholarship. Payment will be queued for direct bank transfer.`,
      type: 'success',
      applicationNumber: application.applicationNumber,
      link: `/student/applications/${application._id}`
    });

    return res.status(201).json({
      success: true,
      message: `Sanction Order ${sanction.sanctionNumber} generated successfully`,
      sanction,
      payment
    });
  } catch (error) {
    console.error('Generate Sanction Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate sanction order',
      error: error.message
    });
  }
};

// @desc    Get All Sanctions List
// @route   GET /api/department/sanctions
// @access  Private (Department Officer / Admin)
const getSanctions = async (req, res) => {
  try {
    const baseFilter = buildDepartmentFilter(req);
    let filter = {};
    if (req.user.role === 'DEPARTMENT_OFFICER') {
      filter = baseFilter;
    }

    const sanctions = await Sanction.find(filter)
      .populate('applicationId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sanctions.length,
      sanctions
    });
  } catch (error) {
    console.error('Get Sanctions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sanctions',
      error: error.message
    });
  }
};

// @desc    Get Payment / Disbursement Pipeline
// @route   GET /api/department/disbursement
// @access  Private (Department Officer / Admin)
const getDisbursements = async (req, res) => {
  try {
    const baseFilter = buildDepartmentFilter(req);
    let filter = {};
    if (req.user.role === 'DEPARTMENT_OFFICER') {
      filter = baseFilter;
    }

    const payments = await Payment.find(filter)
      .populate('applicationId')
      .populate('sanctionId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Get Disbursements Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments',
      error: error.message
    });
  }
};

// @desc    Simulate Payment Disbursement Workflow (PAYMENT_PENDING -> PAYMENT_PROCESSING -> DISBURSED)
// @route   POST /api/department/disbursement/:id/simulate
// @access  Private (Department Officer)
const simulateDisbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const { step } = req.body; // 'PROCESS' | 'COMPLETE'

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    let application = await Application.findById(payment.applicationId);
    if (!application && payment.applicationNumber) {
      application = await Application.findOne({ applicationNumber: payment.applicationNumber });
    }
    const previousStatus = application ? application.status : 'SANCTIONED';

    if (step === 'PROCESS' || payment.status === 'PAYMENT_PENDING') {
      payment.status = 'PAYMENT_PROCESSING';
      await payment.save();

      if (application) {
        application.status = 'PAYMENT_PROCESSING';
        await application.save();

        await recordAuditLog({
          applicationId: application._id,
          applicationNumber: application.applicationNumber,
          previousStatus,
          newStatus: 'PAYMENT_PROCESSING',
          changedBy: req.user._id,
          officerName: req.user.name,
          officerRole: 'DEPARTMENT_OFFICER',
          remarks: `Payment reference ${payment.paymentReference} sent to Banking Gateway for processing.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment moved to PROCESSING stage',
        payment
      });
    } else {
      // Complete Disbursement
      const randomUtr = `UTR2026${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const randomReceipt = `REC-${Math.floor(100000 + Math.random() * 900000)}`;

      payment.status = 'DISBURSED';
      payment.utr = randomUtr;
      payment.receiptNumber = randomReceipt;
      payment.transactionDate = new Date();
      payment.disbursedAt = new Date();
      payment.remarks = `DBT fund transfer completed to ${payment.bankDetails?.bankName} (A/C: ${payment.bankDetails?.accountNumber}).`;
      await payment.save();

      // Update Sanction status
      await Sanction.findByIdAndUpdate(payment.sanctionId, { status: 'DISBURSED' });

      // Update Department Budget tracking
      if (payment.departmentId) {
        await Department.findByIdAndUpdate(payment.departmentId, {
          $inc: { 'budget.disbursed': payment.amount }
        });
      }

      if (application) {
        application.status = 'DISBURSED';
        application.paymentId = payment._id;
        application.paymentReference = payment.paymentReference;
        await application.save();

        await recordAuditLog({
          applicationId: application._id,
          applicationNumber: application.applicationNumber,
          previousStatus,
          newStatus: 'DISBURSED',
          changedBy: req.user._id,
          officerName: req.user.name,
          officerRole: 'DEPARTMENT_OFFICER',
          remarks: `Disbursement completed via Direct Benefit Transfer (DBT). UTR: ${randomUtr}`
        });

        // In-App Notification for Student
        await createNotification({
          userId: application.studentId,
          recipientRole: 'STUDENT',
          title: 'Scholarship Disbursed to Bank Account! 💰',
          message: `Congratulations! Your scholarship payment of ₹${payment.amount.toLocaleString('en-IN')} (Ref: ${payment.paymentReference}) has been disbursed via DBT to your bank account. UTR: ${randomUtr}.`,
          type: 'success',
          applicationNumber: application.applicationNumber,
          link: `/student/payments`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Scholarship successfully disbursed to student',
        payment
      });
    }
  } catch (error) {
    console.error('Simulate Disbursement Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to simulate payment disbursement',
      error: error.message
    });
  }
};

// @desc    Get Department Financial Reports & Analysis
// @route   GET /api/department/reports
// @access  Private (Department Officer)
const getDepartmentReports = async (req, res) => {
  try {
    const baseFilter = buildDepartmentFilter(req);
    const applications = await Application.find(baseFilter);
    const payments = await Payment.find({ ...baseFilter, status: 'DISBURSED' });
    const sanctions = await Sanction.find(baseFilter);

    const totalDisbursed = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalSanctioned = sanctions.reduce((acc, s) => acc + (s.approvedAmount || 0), 0);

    // Scheme-wise breakdown
    const schemeMap = {};
    applications.forEach((app) => {
      const sName = app.scholarshipName || 'Other Scheme';
      if (!schemeMap[sName]) {
        schemeMap[sName] = { name: sName, applications: 0, approved: 0, disbursed: 0, totalAmount: 0 };
      }
      schemeMap[sName].applications += 1;
      if (app.status === 'APPROVED' || app.status === 'SANCTIONED' || app.status === 'DISBURSED') {
        schemeMap[sName].approved += 1;
      }
      if (app.status === 'DISBURSED') {
        schemeMap[sName].disbursed += 1;
        schemeMap[sName].totalAmount += app.approvedAmount || 0;
      }
    });

    return res.status(200).json({
      success: true,
      metrics: {
        totalApplications: applications.length,
        totalSanctioned,
        totalDisbursed,
        totalSanctionsCount: sanctions.length,
        totalDisbursedCount: payments.length
      },
      schemeBreakdown: Object.values(schemeMap)
    });
  } catch (error) {
    console.error('Department Reports Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate department reports',
      error: error.message
    });
  }
};

// @desc    Get Department Notifications
// @route   GET /api/department/notifications
// @access  Private (Department Officer)
const getDepartmentNotifications = async (req, res) => {
  try {
    const departmentId = getOfficerDepartmentId(req);
    const notifications = await Notification.find({
      $or: [
        { recipientRole: 'DEPARTMENT_OFFICER', departmentId },
        { recipientRole: 'DEPARTMENT_OFFICER', departmentId: null },
        { userId: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter((n) => !n.isRead).length,
      notifications
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

module.exports = {
  getDepartmentDashboard,
  getDepartmentApplications,
  getDepartmentApplicationById,
  verifyDepartmentApplication,
  generateSanctionOrder,
  getSanctions,
  getDisbursements,
  simulateDisbursement,
  getDepartmentReports,
  getDepartmentNotifications
};
