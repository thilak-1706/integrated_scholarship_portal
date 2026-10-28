require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Student = require('./models/Student');
const Application = require('./models/Application');
const Payment = require('./models/Payment');
const Sanction = require('./models/Sanction');
const SLPTracking = require('./models/SLPTracking');
const AuditLog = require('./models/AuditLog');
const Notification = require('./models/Notification');
const EmailLog = require('./models/EmailLog');
const Feedback = require('./models/Feedback');
const Institution = require('./models/Institution');
const Department = require('./models/Department');
const Scholarship = require('./models/Scholarship');

async function cleanDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/national_scholarship_details';
    console.log(`Connecting to: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // 1. Wipe ALL users and students (ZERO users left for fresh user testing)
    console.log('\n--- 1. Clearing All Users & Students ---');
    const userRes = await User.deleteMany({});
    console.log(`✓ Deleted Users: ${userRes.deletedCount} (Current Users Count: 0)`);

    const studentRes = await Student.deleteMany({});
    console.log(`✓ Deleted Students: ${studentRes.deletedCount} (Current Students Count: 0)`);

    // 2. Wipe ALL transactional and runtime data
    console.log('\n--- 2. Clearing All Transactional & Runtime Records ---');
    const appRes = await Application.deleteMany({});
    console.log(`✓ Deleted Applications: ${appRes.deletedCount}`);

    const payRes = await Payment.deleteMany({});
    console.log(`✓ Deleted Payments: ${payRes.deletedCount}`);

    const sancRes = await Sanction.deleteMany({});
    console.log(`✓ Deleted Sanctions: ${sancRes.deletedCount}`);

    const slpRes = await SLPTracking.deleteMany({});
    console.log(`✓ Deleted SLP Trackings: ${slpRes.deletedCount}`);

    const auditRes = await AuditLog.deleteMany({});
    console.log(`✓ Deleted Audit Logs: ${auditRes.deletedCount}`);

    const notifRes = await Notification.deleteMany({});
    console.log(`✓ Deleted Notifications: ${notifRes.deletedCount}`);

    const emailRes = await EmailLog.deleteMany({});
    console.log(`✓ Deleted Email Logs: ${emailRes.deletedCount}`);

    const fbRes = await Feedback.deleteMany({});
    console.log(`✓ Deleted Feedbacks: ${fbRes.deletedCount}`);

    // 3. Setup standard master Institutions (with no assigned officers)
    console.log('\n--- 3. Setting Up Clean Master Institutions ---');
    await Institution.deleteMany({});

    const institutions = await Institution.insertMany([
      {
        name: 'National Institute of Technology (NIT Delhi)',
        code: 'NITD-101',
        district: 'North Delhi',
        state: 'Delhi',
        contactEmail: 'nodal@nitdelhi.ac.in',
        phone: '011-27787500',
        assignedOfficer: null,
        assignedOfficerName: '',
        status: 'Active'
      },
      {
        name: 'Indian Institute of Technology (IIT Delhi)',
        code: 'IITD-202',
        district: 'South Delhi',
        state: 'Delhi',
        contactEmail: 'scholarships@iitd.ac.in',
        phone: '011-26591000',
        assignedOfficer: null,
        assignedOfficerName: '',
        status: 'Active'
      },
      {
        name: 'Anna University Chennai',
        code: 'AUC-303',
        district: 'Chennai',
        state: 'Tamil Nadu',
        contactEmail: 'welfare@annauniv.edu',
        phone: '044-22357004',
        assignedOfficer: null,
        assignedOfficerName: '',
        status: 'Active'
      }
    ]);
    console.log(`✓ Master Institutions ready: ${institutions.length} (Assigned Officers: None)`);

    // 4. Setup standard master Departments (with no assigned officers and zero disbursement)
    console.log('\n--- 4. Setting Up Clean Master Departments ---');
    await Department.deleteMany({});

    const departments = await Department.insertMany([
      {
        name: 'Ministry of Higher Education & Welfare',
        code: 'MOHE-GOV',
        type: 'GOVERNMENT',
        provider: 'Department of Higher Education, Govt of India',
        contact: { email: 'officer@highered.gov.in', phone: '011-23381234' },
        budget: { allocated: 25000000, disbursed: 0 },
        assignedOfficer: null,
        assignedOfficerName: '',
        status: 'Active'
      },
      {
        name: 'Department of Science, Technology & Innovation',
        code: 'DSTI-GOV',
        type: 'GOVERNMENT',
        provider: 'Ministry of Science & Technology',
        contact: { email: 'scitech@dst.gov.in', phone: '011-26567373' },
        budget: { allocated: 15000000, disbursed: 0 },
        assignedOfficer: null,
        assignedOfficerName: '',
        status: 'Active'
      },
      {
        name: 'Tata Educational & Social Welfare Trust',
        code: 'TATA-PVT',
        type: 'PRIVATE',
        provider: 'Tata Trusts India',
        contact: { email: 'grants@tatatrusts.org', phone: '022-66658282' },
        budget: { allocated: 8000000, disbursed: 0 },
        assignedOfficer: null,
        assignedOfficerName: '',
        status: 'Active'
      },
      {
        name: 'Reliance Foundation Education Initiatives',
        code: 'RF-CORP',
        type: 'CORPORATE',
        provider: 'Reliance Foundation CSR',
        contact: { email: 'scholarships@reliancefoundation.org', phone: '022-44770000' },
        budget: { allocated: 12000000, disbursed: 0 },
        assignedOfficer: null,
        assignedOfficerName: '',
        status: 'Active'
      }
    ]);
    console.log(`✓ Master Departments ready: ${departments.length} (Assigned Officers: None, Disbursed: ₹0)`);

    // 5. Add exactly 10 Scholarship Schemes
    console.log('\n--- 5. Adding Exactly 10 Scholarship Schemes ---');
    await Scholarship.deleteMany({});

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.code] = d;
    });

    const scholarships = await Scholarship.insertMany([
      // 1. Central Sector Scheme (CSSS)
      {
        name: 'Central Sector Scheme of Scholarships for College and University Students (CSSS)',
        code: 'CSSS-2026',
        provider: 'Ministry of Education, Govt of India',
        providerType: 'GOVERNMENT',
        departmentId: deptMap['MOHE-GOV']._id,
        departmentName: deptMap['MOHE-GOV'].name,
        educationLevel: 'Undergraduate',
        eligibleCourses: ['B.Tech', 'B.E', 'B.Sc', 'B.Com', 'B.A', 'MBBS'],
        category: 'All',
        incomeLimit: 450000,
        minPercentage: 80,
        minCgpa: 7.5,
        scholarshipAmount: 20000,
        amountDisplay: '₹20,000 / Year',
        deadline: new Date('2026-12-31'),
        description: 'Financial assistance for meritorious students from low-income families pursuing higher studies in university degrees.',
        eligibilityCriteria: 'Minimum 80th percentile in Class 12 board examination. Annual family income below ₹4.5 Lakhs.',
        status: 'Active'
      },
      // 2. National Merit-cum-Means
      {
        name: 'National Merit-cum-Means Higher Education Grant',
        code: 'NMM-2026',
        provider: 'Department of Higher Education',
        providerType: 'GOVERNMENT',
        departmentId: deptMap['MOHE-GOV']._id,
        departmentName: deptMap['MOHE-GOV'].name,
        educationLevel: 'Undergraduate',
        eligibleCourses: ['All Degree Courses', 'B.Tech', 'B.Sc', 'Diploma'],
        category: 'All',
        incomeLimit: 250000,
        minPercentage: 65,
        minCgpa: 6.5,
        scholarshipAmount: 50000,
        amountDisplay: '₹50,000 / Year',
        deadline: new Date('2026-11-30'),
        description: 'Merit-cum-means financial grant for economically disadvantaged undergraduate students with consistent academic excellence.',
        eligibilityCriteria: 'Annual family income under ₹2.5 Lakhs. Enrolled in accredited degree program.',
        status: 'Active'
      },
      // 3. AICTE Pragati
      {
        name: 'AICTE Pragati Scholarship Scheme for Technical Education',
        code: 'AICTE-PRAGATI',
        provider: 'Ministry of Education & AICTE',
        providerType: 'GOVERNMENT',
        departmentId: deptMap['DSTI-GOV']._id,
        departmentName: deptMap['DSTI-GOV'].name,
        educationLevel: 'Undergraduate',
        eligibleCourses: ['B.Tech', 'B.E', 'B.Arch', 'B.Pharm', 'MCA'],
        category: 'General',
        incomeLimit: 800000,
        minPercentage: 60,
        minCgpa: 6.0,
        scholarshipAmount: 50000,
        amountDisplay: '₹50,000 / Year',
        deadline: new Date('2026-12-15'),
        description: 'Empowers girl students admitted to AICTE approved technical degree courses with dedicated financial support.',
        eligibilityCriteria: 'Female student admitted to 1st year of technical degree course. Family income ceiling ₹8 Lakhs/year.',
        status: 'Active'
      },
      // 4. AICTE Saksham for Differently Abled
      {
        name: 'AICTE Saksham Scholarship for Differently Abled Students',
        code: 'AICTE-SAKSHAM',
        provider: 'Ministry of Education & AICTE',
        providerType: 'GOVERNMENT',
        departmentId: deptMap['DSTI-GOV']._id,
        departmentName: deptMap['DSTI-GOV'].name,
        educationLevel: 'Undergraduate',
        eligibleCourses: ['B.Tech', 'B.E', 'B.Sc', 'MCA', 'Diploma'],
        category: 'PwD',
        incomeLimit: 800000,
        minPercentage: 55,
        minCgpa: 5.5,
        scholarshipAmount: 50000,
        amountDisplay: '₹50,000 / Year',
        deadline: new Date('2026-12-15'),
        description: 'Encourages and supports specially-abled learners to pursue professional technical education without financial barriers.',
        eligibilityCriteria: 'Disability level of 40% or above with valid UDID certificate. Family income under ₹8 Lakhs.',
        status: 'Active'
      },
      // 5. Post-Matric Scholarship for SC Students
      {
        name: 'Post-Matric Scholarship Scheme for Scheduled Caste (SC) Students',
        code: 'PMS-SC-2026',
        provider: 'Ministry of Social Justice & Empowerment',
        providerType: 'GOVERNMENT',
        departmentId: deptMap['MOHE-GOV']._id,
        departmentName: deptMap['MOHE-GOV'].name,
        educationLevel: 'Undergraduate',
        eligibleCourses: ['All Degree Courses', 'B.Tech', 'MBBS', 'B.Sc', 'B.Com'],
        category: 'SC',
        incomeLimit: 250000,
        minPercentage: 50,
        minCgpa: 5.0,
        scholarshipAmount: 45000,
        amountDisplay: '₹45,000 / Year',
        deadline: new Date('2026-12-31'),
        description: 'Comprehensive financial support covering tuition and maintenance allowances for SC students in post-matric studies.',
        eligibilityCriteria: 'Belonging to Scheduled Caste community with valid community certificate. Income under ₹2.5 Lakhs.',
        status: 'Active'
      },
      // 6. Post-Matric Scholarship for ST Students
      {
        name: 'Post-Matric Scholarship Scheme for Scheduled Tribe (ST) Students',
        code: 'PMS-ST-2026',
        provider: 'Ministry of Tribal Affairs',
        providerType: 'GOVERNMENT',
        departmentId: deptMap['MOHE-GOV']._id,
        departmentName: deptMap['MOHE-GOV'].name,
        educationLevel: 'Undergraduate',
        eligibleCourses: ['All Degree Courses', 'B.Tech', 'B.Sc', 'B.A', 'Diploma'],
        category: 'ST',
        incomeLimit: 250000,
        minPercentage: 50,
        minCgpa: 5.0,
        scholarshipAmount: 45000,
        amountDisplay: '₹45,000 / Year',
        deadline: new Date('2026-12-31'),
        description: 'Financial assistance for Scheduled Tribe students studying at recognized post-matriculation or post-secondary institutions.',
        eligibilityCriteria: 'Belonging to Scheduled Tribe category with income less than ₹2.5 Lakhs per year.',
        status: 'Active'
      },
      // 7. Post-Matric Merit Scholarship for Minorities
      {
        name: 'Post-Matric Merit Scholarship for Minority Communities',
        code: 'MOMA-MERIT-2026',
        provider: 'Ministry of Minority Affairs',
        providerType: 'GOVERNMENT',
        departmentId: deptMap['MOHE-GOV']._id,
        departmentName: deptMap['MOHE-GOV'].name,
        educationLevel: 'Undergraduate',
        eligibleCourses: ['B.Tech', 'B.Com', 'B.Sc', 'BCA', 'BBA', 'MBBS'],
        category: 'Minority',
        incomeLimit: 200000,
        minPercentage: 55,
        minCgpa: 5.5,
        scholarshipAmount: 30000,
        amountDisplay: '₹30,000 / Year',
        deadline: new Date('2026-11-30'),
        description: 'Scholarship scheme to empower students belonging to recognized minority communities for higher education advancement.',
        eligibilityCriteria: 'Minimum 50% marks in previous final exam. Annual family income not exceeding ₹2 Lakhs.',
        status: 'Active'
      },
      // 8. DST INSPIRE Fellowship
      {
        name: 'DST Innovation in Science Pursuit for Inspired Research (INSPIRE)',
        code: 'DSTI-INSPIRE',
        provider: 'Ministry of Science & Technology',
        providerType: 'GOVERNMENT',
        departmentId: deptMap['DSTI-GOV']._id,
        departmentName: deptMap['DSTI-GOV'].name,
        educationLevel: 'Undergraduate',
        eligibleCourses: ['B.Sc', 'Integrated M.Sc', 'B.Tech', 'BS-MS'],
        category: 'All',
        incomeLimit: 600000,
        minPercentage: 85,
        minCgpa: 8.5,
        scholarshipAmount: 80000,
        amountDisplay: '₹80,000 / Year',
        deadline: new Date('2026-12-31'),
        description: 'Prestigious national scholarship aiming to attract top scientific talent to study natural and basic sciences.',
        eligibilityCriteria: 'Top 1% rank in Class 12 board exams or rank in JEE/NEET. Studying basic/natural sciences.',
        status: 'Active'
      },
      // 9. Tata Trusts Higher Education Grant
      {
        name: 'Tata Trusts Higher Education Grant for Engineering & Medicine',
        code: 'TATA-ENG-2026',
        provider: 'Tata Trusts India',
        providerType: 'PRIVATE',
        departmentId: deptMap['TATA-PVT']._id,
        departmentName: deptMap['TATA-PVT'].name,
        educationLevel: 'Undergraduate',
        eligibleCourses: ['B.Tech', 'B.E', 'MBBS', 'B.Pharm'],
        category: 'All',
        incomeLimit: 600000,
        minPercentage: 75,
        minCgpa: 7.0,
        scholarshipAmount: 75000,
        amountDisplay: '₹75,000 / Year',
        deadline: new Date('2026-12-31'),
        description: 'Philanthropic grant covering tuition and laboratory fees for deserving students pursuing STEM and healthcare careers.',
        eligibilityCriteria: 'Enrolled in accredited engineering or medical institution. Annual family income below ₹6 Lakhs.',
        status: 'Active'
      },
      // 10. Reliance Foundation Undergraduate Scholarship
      {
        name: 'Reliance Foundation Undergraduate Scholarship',
        code: 'RF-UG-2026',
        provider: 'Reliance Foundation CSR',
        providerType: 'CORPORATE',
        departmentId: deptMap['RF-CORP']._id,
        departmentName: deptMap['RF-CORP'].name,
        educationLevel: 'Undergraduate',
        eligibleCourses: ['All First-Year Degree Courses', 'B.Tech', 'B.Sc', 'B.Com', 'B.A'],
        category: 'All',
        incomeLimit: 1500000,
        minPercentage: 70,
        minCgpa: 7.0,
        scholarshipAmount: 100000,
        amountDisplay: '₹1,00,000 / Year',
        deadline: new Date('2026-12-31'),
        description: 'Supports exceptional students from diverse socio-economic backgrounds across India throughout their undergraduate degree.',
        eligibilityCriteria: 'First year undergraduate student with min 60% in 12th Std. Mandatory aptitude assessment test.',
        status: 'Active'
      }
    ]);
    console.log(`✓ Master Scholarships initialized: Exactly ${scholarships.length} Schemes`);

    // 6. Clean leftover uploaded sanction PDF orders
    console.log('\n--- 6. Cleaning Leftover Generated Sanction PDFs ---');
    const sanctionsDir = path.join(__dirname, 'uploads', 'sanctions');
    if (fs.existsSync(sanctionsDir)) {
      const files = fs.readdirSync(sanctionsDir);
      let removedCount = 0;
      for (const file of files) {
        if (file.endsWith('.pdf')) {
          fs.unlinkSync(path.join(sanctionsDir, file));
          removedCount++;
        }
      }
      console.log(`✓ Removed ${removedCount} old generated PDF sanction files`);
    }

    console.log('\n======================================================');
    console.log('🎉 BLANK PROJECT READY FOR TESTING! SUMMARY OF DATABASE:');
    console.log('======================================================');
    const finalCounts = {
      users: await User.countDocuments(),
      students: await Student.countDocuments(),
      applications: await Application.countDocuments(),
      payments: await Payment.countDocuments(),
      sanctions: await Sanction.countDocuments(),
      slpTracking: await SLPTracking.countDocuments(),
      auditLogs: await AuditLog.countDocuments(),
      notifications: await Notification.countDocuments(),
      emailLogs: await EmailLog.countDocuments(),
      feedback: await Feedback.countDocuments(),
      institutions: await Institution.countDocuments(),
      departments: await Department.countDocuments(),
      scholarships: await Scholarship.countDocuments()
    };
    console.table(finalCounts);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Database cleanup failed:', error);
    process.exit(1);
  }
}

cleanDatabase();
