import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import StatsCard from '../../components/common/StatsCard';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';
import {
  Users,
  Building2,
  Building,
  GraduationCap,
  FileText,
  CheckCircle2,
  XCircle,
  Banknote,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/dashboard-analytics');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout pageTitle="National Portal Administration">
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </PortalLayout>
    );
  }

  const { metrics, charts, recentApplications } = data || {
    metrics: {},
    charts: {},
    recentApplications: []
  };

  return (
    <PortalLayout
      pageTitle="National Scholarship System Administration & Analytics"
      breadcrumbs={[{ label: 'Admin Portal', link: '/admin/dashboard' }, { label: 'Platform Analytics' }]}
    >
      {/* Platform Header Banner */}
      <div className="custom-card p-4 mb-4 border-0 text-white" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <ShieldCheck size={26} className="text-warning" />
              <h4 className="fw-bold mb-0 text-white">Central Scholarship Monitoring Authority</h4>
            </div>
            <span className="text-white-50 small">
              Real-time multi-tenant monitoring across Colleges, Government Departments & Beneficiary Students
            </span>
          </div>

          <div className="d-flex gap-2">
            <Link to="/admin/scholarships" className="btn btn-warning btn-sm fw-bold">
              Manage Schemes
            </Link>
            <Link to="/admin/audit-logs" className="btn btn-light btn-sm fw-bold">
              View Audit Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Row 1: System KPI Stat Counters */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Total Students"
            value={metrics.totalStudents || 0}
            subtitle="Registered Applicants"
            icon={<Users size={22} />}
            iconBg="#e0f2fe"
            iconColor="#0369a1"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Institutions / Colleges"
            value={metrics.totalInstitutions || 0}
            subtitle="AISHE Certified Institutes"
            icon={<Building2 size={22} />}
            iconBg="#fae8ff"
            iconColor="#86198f"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Departments & Trusts"
            value={metrics.totalDepartments || 0}
            subtitle="Govt & Private Bodies"
            icon={<Building size={22} />}
            iconBg="#fef3c7"
            iconColor="#b45309"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Active Scholarships"
            value={metrics.totalScholarships || 0}
            subtitle="Central & State Schemes"
            icon={<GraduationCap size={22} />}
            iconBg="#dcfce7"
            iconColor="#15803d"
          />
        </div>
      </div>

      {/* Row 2: Secondary Application & Disbursement KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Total Applications"
            value={metrics.totalApplications || 0}
            subtitle="Submitted across schemes"
            icon={<FileText size={20} />}
            iconBg="#f1f5f9"
            iconColor="#334155"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Pending Scrutiny"
            value={metrics.pendingApplications || 0}
            subtitle="In Verification Pipeline"
            icon={<TrendingUp size={20} />}
            iconBg="#fff7ed"
            iconColor="#c2410c"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Approved & Sanctioned"
            value={metrics.approvedApplications || 0}
            subtitle="Cleared Department Level"
            icon={<CheckCircle2 size={20} />}
            iconBg="#eff6ff"
            iconColor="#1d4ed8"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Total Disbursed (DBT)"
            value={`₹${(metrics.totalDisbursedAmount || 0).toLocaleString('en-IN')}`}
            subtitle={`${metrics.disbursedApplications || 0} Payments Credited`}
            icon={<Banknote size={20} />}
            iconBg="#ecfdf5"
            iconColor="#047857"
          />
        </div>
      </div>

      {/* Recharts Row 1: Status Pie Chart & Monthly Bar Chart */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-5">
          <div className="custom-card p-4 h-100">
            <h5 className="fw-bold text-dark mb-3">Application Status Distribution</h5>
            <div style={{ height: '270px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.statusPieChart || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts?.statusPieChart || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="custom-card p-4 h-100">
            <h5 className="fw-bold text-dark mb-3">Monthly Applications & Approvals Trend</h5>
            <div style={{ height: '270px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.monthlyBarChart || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="applications" name="Applications Received" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approvals" name="Department Approvals" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="disbursements" name="Disbursements (DBT)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Row 2: Provider Types & Department Distribution */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-5">
          <div className="custom-card p-4 h-100">
            <h5 className="fw-bold text-dark mb-3">Scholarships: Government vs Private / Corporate</h5>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.providerTypeChart || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    label
                  >
                    {(charts?.providerTypeChart || []).map((entry, index) => (
                      <Cell key={`cell-p-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="custom-card p-4 h-100">
            <h5 className="fw-bold text-dark mb-3">Department-wise Applications Volume</h5>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.departmentChart || []} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={140} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* System Monitoring Table */}
      <div className="custom-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">Platform Live Application Stream</h5>
          <Link to="/admin/applications" className="small text-primary fw-semibold text-decoration-none">
            Open Global Application Monitor &rarr;
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr style={{ fontSize: '0.8rem' }}>
                <th>Application #</th>
                <th>Student</th>
                <th>College</th>
                <th>Department</th>
                <th>Status</th>
                <th>Amount</th>
                <th className="text-end">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => (
                <tr key={app._id} style={{ fontSize: '0.85rem' }}>
                  <td className="fw-bold text-primary">{app.applicationNumber}</td>
                  <td className="fw-semibold text-dark">{app.studentName}</td>
                  <td className="text-muted small text-truncate" style={{ maxWidth: '160px' }}>{app.institutionName}</td>
                  <td className="text-muted small text-truncate" style={{ maxWidth: '160px' }}>{app.departmentName}</td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="fw-bold text-success">
                    ₹{(app.approvedAmount || app.requestedAmount)?.toLocaleString('en-IN')}
                  </td>
                  <td className="text-muted small text-end">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AdminDashboard;
