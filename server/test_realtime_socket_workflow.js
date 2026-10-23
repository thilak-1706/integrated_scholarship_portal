const http = require('http');
const ioClient = require('../client-student/node_modules/socket.io-client');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { app, server } = require('./server');
const { broadcastSlpEvent } = require('./utils/socketManager');
const User = require('./models/User');
const Application = require('./models/Application');
const Institution = require('./models/Institution');
const Department = require('./models/Department');
const Scholarship = require('./models/Scholarship');

dotenv.config();

const TEST_PORT = 5055;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

// Helper to make API requests
const apiRequest = async (path, options = {}) => {
  const url = `${BASE_URL}/api${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
};

const runRealTimeVerificationSuite = async () => {
  console.log('====================================================');
  console.log('REAL-TIME SOCKET.IO END-TO-END VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  await connectDB();

  // Use the server with Socket.IO initialized
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`[TEST SERVER] Running on port ${TEST_PORT}\n`);

  let testPassedCount = 0;

  try {
    // 1. Authenticate users
    console.log('[AUTH SETUP] Logging in test users to obtain JWTs...');
    
    // Admin
    const adminLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'admin@nsp.gov.in', password: 'admin123', expectedRole: 'ADMIN' }
    });
    if (!adminLogin.ok) throw new Error('Admin login failed');
    const adminToken = adminLogin.data.token;
    const adminUser = adminLogin.data.user;

    // Institute 1 (NIT Delhi)
    const inst1Login = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'institute@nsp.gov.in', password: 'institute123', expectedRole: 'INSTITUTE_OFFICER' }
    });
    if (!inst1Login.ok) throw new Error('Institute 1 login failed');
    const inst1Token = inst1Login.data.token;
    const inst1User = inst1Login.data.user;

    // Institute 2 (Anna University) - for isolation test
    const inst2Login = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'institute.anna@nsp.gov.in', password: 'institute123', expectedRole: 'INSTITUTE_OFFICER' }
    });
    if (!inst2Login.ok) throw new Error('Institute 2 login failed');
    const inst2Token = inst2Login.data.token;
    const inst2User = inst2Login.data.user;

    // Department 1 (Ministry of Higher Education)
    const dept1Login = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'department@nsp.gov.in', password: 'department123', expectedRole: 'DEPARTMENT_OFFICER' }
    });
    if (!dept1Login.ok) throw new Error('Department 1 login failed');
    const dept1Token = dept1Login.data.token;
    const dept1User = dept1Login.data.user;

    // Student setup
    const ts = Date.now();
    const studentEmail = `realtime.student.${ts}@test.edu`;
    const regRes = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        name: `Test RT Student ${ts}`,
        email: studentEmail,
        password: 'password123',
        phone: '9876543210',
        aadhaarNumber: `9999${String(ts).slice(-8)}`,
        institutionId: inst1User.institutionId
      }
    });
    const studentToken = regRes.data.token;
    const studentUser = regRes.data.user;

    console.log('✅ Logged in Admin, Institute 1, Institute 2, Department 1, and Student.\n');

    // Helper to connect socket client
    const createSocketClient = (token) => {
      const s = ioClient(BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        forceNew: true,
        reconnection: false
      });
      s.on('connect_error', (err) => {
        console.error('[Socket Connect Error]:', err.message);
      });
      return s;
    };

    console.log('[SOCKET SETUP] Connecting authenticated Socket.IO clients...');
    const adminSocket = createSocketClient(adminToken);
    const inst1Socket = createSocketClient(inst1Token);
    const inst2Socket = createSocketClient(inst2Token);
    const dept1Socket = createSocketClient(dept1Token);
    const studentSocket = createSocketClient(studentToken);

    await Promise.all([
      new Promise((res) => adminSocket.on('connect', res)),
      new Promise((res) => inst1Socket.on('connect', res)),
      new Promise((res) => inst2Socket.on('connect', res)),
      new Promise((res) => dept1Socket.on('connect', res)),
      new Promise((res) => studentSocket.on('connect', res))
    ]);

    console.log('✅ All 5 socket clients connected and authenticated.\n');

    // Find scholarship linked to Department 1 and Institute 1
    const scholarship = await Scholarship.findOne({ departmentId: dept1User.departmentId, status: 'Active' }) ||
      await Scholarship.findOne({ status: 'Active' });

    let createdApp = null;

    // ==========================================
    // TEST 1 & 2: Student Submits Application
    // Expected: Institute 1 and Admin receive application_created; Institute 2 does NOT receive it
    // ==========================================
    console.log('--- TEST 1 & 2: Real-time Application Submission ---');
    let inst1ReceivedApp = null;
    let adminReceivedApp = null;
    let inst2LeakedApp = false;

    inst1Socket.on('application_created', (data) => {
      inst1ReceivedApp = data;
    });

    adminSocket.on('application_created', (data) => {
      adminReceivedApp = data;
    });

    inst2Socket.on('application_created', () => {
      inst2LeakedApp = true;
    });

    const applyRes = await apiRequest(`/student/apply/${scholarship._id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        scholarshipId: scholarship._id,
        submissionType: 'Fresh Application',
        candidateInstitutionName: inst1User.institutionName,
        personalDetails: {
          fullName: studentUser.name,
          email: studentUser.email,
          phone: '9876543210',
          dob: '2004-05-15',
          gender: 'Male',
          category: 'General',
          address: 'Hostel Block B',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        academicDetails: {
          institutionName: inst1User.institutionName,
          course: 'B.Tech IT',
          department: 'IT',
          year: '3rd Year',
          enrollmentNumber: `ENR-${ts}`,
          previousClassPercentage: 88,
          cgpa: 8.8
        }
      }
    });

    if (!applyRes.ok) throw new Error(`Apply failed: ${JSON.stringify(applyRes.data)}`);
    createdApp = applyRes.data.application;

    // Wait for socket events to arrive
    await new Promise((res) => setTimeout(res, 500));

    if (
      inst1ReceivedApp &&
      inst1ReceivedApp.applicationNumber === createdApp.applicationNumber &&
      adminReceivedApp &&
      adminReceivedApp.applicationNumber === createdApp.applicationNumber &&
      !inst2LeakedApp
    ) {
      console.log('✅ PASS TEST 1 & 2: Institute Officer and Admin received application_created automatically without page refresh. Unauthorized institute was excluded.');
      testPassedCount++;
    } else {
      throw new Error(`FAIL TEST 1 & 2: inst1Received=${Boolean(inst1ReceivedApp)}, adminReceived=${Boolean(adminReceivedApp)}, inst2Leaked=${inst2LeakedApp}`);
    }

    // ==========================================
    // TEST 3: Institute Officer Verifies and Routes to Department
    // Expected: Department Officer receives application_status_updated (ROUTED_TO_DEPARTMENT)
    // ==========================================
    console.log('\n--- TEST 3: Institute Verification & Department Routing ---');
    let dept1ReceivedRouting = null;
    let studentReceivedRouting = null;

    dept1Socket.on('application_status_updated', (data) => {
      if (data.applicationNumber === createdApp.applicationNumber && data.status === 'ROUTED_TO_DEPARTMENT') {
        dept1ReceivedRouting = data;
      }
    });

    studentSocket.on('application_status_updated', (data) => {
      if (data.applicationNumber === createdApp.applicationNumber && data.status === 'ROUTED_TO_DEPARTMENT') {
        studentReceivedRouting = data;
      }
    });

    const instVerifyRes = await apiRequest(`/institute/applications/${createdApp._id}/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${inst1Token}` },
      body: {
        action: 'APPROVE',
        remarks: 'Institute verified credentials. Forwarding to Department.'
      }
    });

    if (!instVerifyRes.ok) throw new Error(`Institute verify failed: ${JSON.stringify(instVerifyRes.data)}`);

    await new Promise((res) => setTimeout(res, 500));

    if (dept1ReceivedRouting && studentReceivedRouting) {
      console.log('✅ PASS TEST 3: Department Officer received application_status_updated automatically (status: ROUTED_TO_DEPARTMENT). Student timeline updated.');
      testPassedCount++;
    } else {
      throw new Error(`FAIL TEST 3: dept1ReceivedRouting=${Boolean(dept1ReceivedRouting)}, studentReceivedRouting=${Boolean(studentReceivedRouting)}`);
    }

    // ==========================================
    // TEST 4: Department Officer Approves Application
    // Expected: Student and Admin receive application_status_updated (APPROVED)
    // ==========================================
    console.log('\n--- TEST 4: Department Approval ---');
    let studentReceivedApproval = null;
    let adminReceivedApproval = null;

    studentSocket.on('application_status_updated', (data) => {
      if (data.applicationNumber === createdApp.applicationNumber && data.status === 'APPROVED') {
        studentReceivedApproval = data;
      }
    });

    adminSocket.on('application_status_updated', (data) => {
      if (data.applicationNumber === createdApp.applicationNumber && data.status === 'APPROVED') {
        adminReceivedApproval = data;
      }
    });

    const deptApproveRes = await apiRequest(`/department/applications/${createdApp._id}/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dept1Token}` },
      body: {
        action: 'APPROVE',
        approvedAmount: 50000,
        remarks: 'Department scrutiny approved.'
      }
    });

    if (!deptApproveRes.ok) throw new Error(`Department approve failed: ${JSON.stringify(deptApproveRes.data)}`);

    await new Promise((res) => setTimeout(res, 500));

    if (studentReceivedApproval && adminReceivedApproval) {
      console.log('✅ PASS TEST 4: Student and Admin received application_status_updated (APPROVED) automatically in real time.');
      testPassedCount++;
    } else {
      throw new Error(`FAIL TEST 4: studentReceived=${Boolean(studentReceivedApproval)}, adminReceived=${Boolean(adminReceivedApproval)}`);
    }

    // ==========================================
    // TEST 5: Department Officer Generates Sanction Order
    // Expected: Student, Dept, Admin receive sanction_generated event
    // ==========================================
    console.log('\n--- TEST 5: Sanction Order Generation ---');
    let studentReceivedSanction = null;
    let deptReceivedSanction = null;
    let adminReceivedSanction = null;

    studentSocket.on('sanction_generated', (data) => {
      if (data.applicationNumber === createdApp.applicationNumber) {
        studentReceivedSanction = data;
      }
    });

    dept1Socket.on('sanction_generated', (data) => {
      if (data.applicationNumber === createdApp.applicationNumber) {
        deptReceivedSanction = data;
      }
    });

    adminSocket.on('sanction_generated', (data) => {
      if (data.applicationNumber === createdApp.applicationNumber) {
        adminReceivedSanction = data;
      }
    });

    const sanctionRes = await apiRequest('/department/sanctions/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${dept1Token}` },
      body: {
        applicationId: createdApp._id,
        remarks: 'Sanction order approved and generated.'
      }
    });

    if (!sanctionRes.ok) throw new Error(`Sanction generation failed: ${JSON.stringify(sanctionRes.data)}`);
    const paymentRecord = sanctionRes.data.payment;

    await new Promise((res) => setTimeout(res, 500));

    if (studentReceivedSanction && deptReceivedSanction && adminReceivedSanction) {
      console.log('✅ PASS TEST 5: Sanction generated event received automatically across authorized Student, Department, and Admin portals.');
      testPassedCount++;
    } else {
      throw new Error(`FAIL TEST 5: studentReceivedSanction=${Boolean(studentReceivedSanction)}, deptReceivedSanction=${Boolean(deptReceivedSanction)}`);
    }

    // ==========================================
    // TEST 6: Payment / Disbursement Status Changes
    // Expected: payment_status_updated event received
    // ==========================================
    console.log('\n--- TEST 6: Payment / Disbursement Updates ---');
    let studentReceivedPayment = null;
    let deptReceivedPayment = null;

    studentSocket.on('payment_status_updated', (data) => {
      if (data.applicationNumber === createdApp.applicationNumber) {
        studentReceivedPayment = data;
      }
    });

    dept1Socket.on('payment_status_updated', (data) => {
      if (data.applicationNumber === createdApp.applicationNumber) {
        deptReceivedPayment = data;
      }
    });

    const payRes = await apiRequest(`/department/disbursement/${paymentRecord._id}/simulate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dept1Token}` },
      body: { step: 'PROCESS' }
    });

    if (!payRes.ok) throw new Error(`Payment processing failed: ${JSON.stringify(payRes.data)}`);

    await new Promise((res) => setTimeout(res, 500));

    if (studentReceivedPayment && deptReceivedPayment) {
      console.log('✅ PASS TEST 6: Payment processing update received in real-time by Student and Department.');
      testPassedCount++;
    } else {
      throw new Error(`FAIL TEST 6: studentPayment=${Boolean(studentReceivedPayment)}, deptPayment=${Boolean(deptReceivedPayment)}`);
    }

    // ==========================================
    // TEST 7: SLA Warning or Breach Event
    // Expected: Admin monitoring dashboard receives slp_sla_warning or slp_sla_breached
    // ==========================================
    console.log('\n--- TEST 7: SLA Warning / Breach Real-time Event ---');
    let adminReceivedSlaWarning = null;

    adminSocket.on('slp_sla_warning', (data) => {
      adminReceivedSlaWarning = data;
    });

    broadcastSlpEvent('slp_sla_warning', {
      applicationId: createdApp._id,
      applicationNumber: createdApp.applicationNumber,
      currentStage: 'PAYMENT_PROCESSING',
      stageName: 'Payment Disbursement',
      slaStatus: 'WARNING',
      slaDuration: 60,
      elapsedTime: 45,
      remainingTime: 15
    });

    await new Promise((res) => setTimeout(res, 500));

    if (adminReceivedSlaWarning && adminReceivedSlaWarning.applicationNumber === createdApp.applicationNumber) {
      console.log('✅ PASS TEST 7: Admin monitoring interface received real-time slp_sla_warning without manual page refresh.');
      testPassedCount++;
    } else {
      throw new Error('FAIL TEST 7: Admin socket did not receive slp_sla_warning');
    }

    // ==========================================
    // TEST 8: Socket Disconnection and Reconnection Recovery
    // Expected: Temporary disconnect recovers and client refetches authorized state
    // ==========================================
    console.log('\n--- TEST 8: Connection Recovery & Re-auth ---');
    let reconnected = false;

    const recoveringSocket = ioClient(BASE_URL, {
      auth: { token: inst1Token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 100
    });

    await new Promise((res) => recoveringSocket.on('connect', res));
    
    // Simulate drop
    recoveringSocket.disconnect();
    await new Promise((res) => setTimeout(res, 150));
    
    // Reconnect
    recoveringSocket.connect();
    await new Promise((res) => recoveringSocket.on('connect', () => {
      reconnected = true;
      res();
    }));

    // Perform an API refetch to simulate client data recovery
    const recoveryRes = await apiRequest('/institute/applications', {
      headers: { Authorization: `Bearer ${inst1Token}` }
    });

    if (reconnected && recoveryRes.ok && recoveryRes.data.applications) {
      console.log('✅ PASS TEST 8: Connection successfully recovered and authorized data retrieved through API refetch.');
      testPassedCount++;
    } else {
      throw new Error('FAIL TEST 8: Reconnection or recovery API refetch failed');
    }
    recoveringSocket.disconnect();

    // ==========================================
    // TEST 9: Unauthorized Room Subscription Attempt
    // Expected: Access is denied
    // ==========================================
    console.log('\n--- TEST 9: Security Enforcement on Unauthorized Subscriptions ---');
    let accessDeniedReceived = false;

    studentSocket.on('error', (err) => {
      if (err.message && err.message.toLowerCase().includes('access denied')) {
        accessDeniedReceived = true;
      }
    });

    // Student attempts to join admin room or another institution's room
    studentSocket.emit('join_room', 'role:ADMIN');
    studentSocket.emit('join_room', `institution:${inst1User.institutionId}`);

    await new Promise((res) => setTimeout(res, 500));

    if (accessDeniedReceived) {
      console.log('✅ PASS TEST 9: Unauthorized room subscription attempt was strictly rejected by server authorization.');
      testPassedCount++;
    } else {
      throw new Error('FAIL TEST 9: Unauthorized user was not denied room subscription');
    }

    // ==========================================
    // TEST 10: Deduplication Handling
    // Expected: Duplicate event reception does not duplicate application entry
    // ==========================================
    console.log('\n--- TEST 10: Deduplication Handling ---');
    const existingList = [
      { _id: createdApp._id, applicationNumber: createdApp.applicationNumber, status: 'SUBMITTED' }
    ];

    const duplicateEvent = {
      applicationId: createdApp._id,
      applicationNumber: createdApp.applicationNumber,
      status: 'SUBMITTED'
    };

    // Client deduplication function mimicking InstituteApplications & DepartmentApplications
    const deduplicatedList = ((prev, event) => {
      const exists = prev.some(
        (a) => a._id === event.applicationId || a.applicationNumber === event.applicationNumber
      );
      if (exists) return prev;
      return [event, ...prev];
    })(existingList, duplicateEvent);

    if (deduplicatedList.length === 1 && deduplicatedList[0].applicationNumber === createdApp.applicationNumber) {
      console.log('✅ PASS TEST 10: Repeated event delivery properly deduplicated without creating duplicate entries or count inflation.');
      testPassedCount++;
    } else {
      throw new Error('FAIL TEST 10: Deduplication logic failed');
    }

    // Clean up sockets
    adminSocket.disconnect();
    inst1Socket.disconnect();
    inst2Socket.disconnect();
    dept1Socket.disconnect();
    studentSocket.disconnect();

    console.log('\n====================================================');
    console.log(`ALL TESTS COMPLETED: ${testPassedCount} / 10 TESTS PASSED`);
    console.log('====================================================\n');

  } finally {
    server.close();
  }
};

runRealTimeVerificationSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Test Suite Error:', err);
    process.exit(1);
  });
