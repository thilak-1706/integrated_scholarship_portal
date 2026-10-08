const EmailLog = require('../models/EmailLog');
const { retrySanctionApprovedEmail } = require('../services/emailService');
const { getSanctionOrderPdfPath, generateSanctionOrderPdf } = require('../services/pdfService');
const Sanction = require('../models/Sanction');
const fs = require('fs');

// @desc    Get All Email Dispatch Logs (Admin Monitoring)
// @route   GET /api/admin/email-logs
// @access  Private (Admin, Super Admin)
const getEmailLogs = async (req, res) => {
  try {
    const { status, emailType, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (emailType && emailType !== 'All') {
      filter.emailType = emailType;
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { recipient: searchRegex },
        { sanctionNumber: searchRegex },
        { applicationNumber: searchRegex },
        { studentName: searchRegex }
      ];
    }

    const logs = await EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Get Email Logs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve email dispatch logs',
      error: error.message
    });
  }
};

// @desc    Retry a Failed Email Dispatch
// @route   POST /api/admin/email-logs/:id/retry
// @access  Private (Admin, Super Admin)
const retryEmailDispatch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await retrySanctionApprovedEmail(id);

    return res.status(200).json({
      success: result.success,
      message: result.success ? 'Email re-sent successfully' : 'Email retry failed',
      emailLog: result.emailLog,
      error: result.error
    });
  } catch (error) {
    console.error('Retry Email Dispatch Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retry email dispatch',
      error: error.message
    });
  }
};

// @desc    Download / View Generated Sanction Order PDF
// @route   GET /api/department/sanctions/:id/pdf
// @access  Private (Authenticated Users)
const downloadSanctionPdf = async (req, res) => {
  try {
    const { id } = req.params;
    let sanction = null;

    if (id.startsWith('SAN-')) {
      sanction = await Sanction.findOne({ sanctionNumber: id });
    } else {
      sanction = await Sanction.findById(id);
      if (!sanction) {
        sanction = await Sanction.findOne({ sanctionNumber: id });
      }
    }

    if (!sanction) {
      return res.status(404).json({ success: false, message: 'Sanction record not found' });
    }

    let filePath = getSanctionOrderPdfPath(sanction.sanctionNumber);
    if (!filePath || !fs.existsSync(filePath)) {
      filePath = await generateSanctionOrderPdf(sanction);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Sanction_Order_${sanction.sanctionNumber}.pdf"`);
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Download Sanction PDF Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate or retrieve Sanction Order PDF',
      error: error.message
    });
  }
};

module.exports = {
  getEmailLogs,
  retryEmailDispatch,
  downloadSanctionPdf
};
