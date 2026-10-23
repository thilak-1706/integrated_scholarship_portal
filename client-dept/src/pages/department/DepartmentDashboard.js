import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import StatsCard from '../../components/common/StatsCard';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  Clock,
  CheckCircle2,
  Award,
  Building2,
  Banknote,
  Settings,
  FileText
} from 'lucide-react';
import DeptBannerIllustration from '../../components/common/DeptBannerIllustration';
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
  Legend
} from 'recharts';

const DepartmentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/department/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load department dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      fetchDashboard();
    };

    socket.on('application_status_updated', handleUpdate);
    socket.on('sanction_generated', handleUpdate);
    socket.on('payment_status_updated', handleUpdate);
    socket.on('connect', handleUpdate);

    return () => {
      socket.off('application_status_updated', handleUpdate);
      socket.off('sanction_generated', handleUpdate);
      socket.off('payment_status_updated', handleUpdate);
      socket.off('connect', handleUpdate);
    };
  }, [fetchDashboard]);

  if (loading) {
    return (
      <PortalLayout pageTitle="Department Officer Portal">
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </PortalLayout>
    );
  }

  const { department, stats, statusBreakdown, monthlyStats, recentApplications } = data || {
    department: {},
    stats: {},
    statusBreakdown: [],
    monthlyStats: [],
    recentApplications: []
  };

  return (
    <PortalLayout
      pageTitle="Department Officer & Scrutiny Dashboard"
      breadcrumbs={[{ label: 'Department Portal', link: '/department/dashboard' }, { label: 'Dashboard' }]}
    >
      {/* Department Banner */}
      <div
        className="p-3 p-md-4 mb-4 text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #5A0808 0%, #750A0A 25%, #991B1B 60%, #DC2626 100%)',
          borderRadius: '18px',
          boxShadow: '0 4px 20px rgba(127, 29, 29, 0.25)'
        }}
      >
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 position-relative" style={{ zIndex: 2 }}>
          {/* Left: Department Icon & Titles */}
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#DC2626',
                border: '1.5px solid rgba(254, 202, 202, 0.4)',
                borderRadius: '13px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h4 className="fw-bold mb-1 text-white responsive-title text-break" style={{ letterSpacing: '-0.01em' }}>
                {department?.name || 'Ministry of Higher Education & Welfare'}
              </h4>
              <span className="small text-break" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem' }}>
                Provider: {department?.provider || 'Department of Higher Education, Govt of India'} &bull; Type: {department?.type || 'GOVERNMENT'} &bull; Department Code: {department?.code || 'MOHE-GOV'}
              </span>
            </div>
          </div>

          {/* Center Background: Ministry Rotunda / Dome Graphic */}
          <div className="d-none d-xl-block position-absolute" style={{ left: '60%', transform: 'translateX(-50%)', bottom: '-8px', zIndex: 1 }}>
            <DeptBannerIllustration />
          </div>

          {/* Right Action Buttons */}
          <div className="d-flex align-items-center gap-2.5 flex-wrap flex-shrink-0 position-relative" style={{ zIndex: 3 }}>
            <Link
              to="/department/sanctions"
              className="btn fw-bold d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: '#DC2626',
                border: '1px solid #EF4444',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '9px 20px',
                fontSize: '0.86rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Settings size={16} />
              <span>Generate Sanctions</span>
            </Link>
            <Link
              to="/department/disbursement"
              className="btn fw-bold d-inline-flex align-items-center gap-2 bg-white"
              style={{
                color: '#0F172A',
                border: '1px solid #FFFFFF',
                borderRadius: '10px',
                padding: '9px 20px',
                fontSize: '0.86rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              <FileText size={16} style={{ color: '#DC2626' }} />
              <span>Disbursement Gateway</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Incoming Scrutiny"
            value={stats.incoming || 0}
            subtitle="Routed by Institutes"
            icon={<Clock size={22} />}
            iconBg="#e0f2fe"
            iconColor="#0369a1"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Approved Schemes"
            value={stats.approved || 0}
            subtitle="Ready for Sanction"
            icon={<CheckCircle2 size={22} />}
            iconBg="#dcfce7"
            iconColor="#15803d"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Sanctions Generated"
            value={stats.sanctioned || 0}
            subtitle="SAN Orders Issued"
            icon={<Award size={22} />}
            iconBg="#fae8ff"
            iconColor="#86198f"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Total Disbursed (DBT)"
            value={`₹${(stats.totalDisbursedAmount || 0).toLocaleString('en-IN')}`}
            subtitle={`Of ₹${(stats.totalBudget || 0).toLocaleString('en-IN')} Budget`}
            icon={<Banknote size={22} />}
            iconBg="#ecfdf5"
            iconColor="#047857"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-5">
          <div className="custom-card p-3 p-sm-4 h-100">
            <h5 className="fw-bold text-dark mb-3">Department Application Distribution</h5>
            <div style={{ height: '260px', width: '100%', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusBreakdown.map((entry, index) => (
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
          <div className="custom-card p-3 p-sm-4 h-100">
            <h5 className="fw-bold text-dark mb-3">Monthly Received vs Disbursed Trend</h5>
            <div style={{ height: '260px', width: '100%', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="received" name="Incoming Routed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="disbursed" name="Disbursed (DBT)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Inbox */}
      <div className="custom-card p-3 p-sm-4">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
          <h5 className="fw-bold text-dark mb-0">Department Application Scrutiny Queue</h5>
          <Link to="/department/applications" className="small text-primary fw-semibold text-decoration-none">
            View All &rarr;
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <p className="text-muted small py-4 text-center">No applications currently routed to this department.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: '700px' }}>
              <thead className="table-light">
                <tr style={{ fontSize: '0.8rem' }}>
                  <th>Application Number</th>
                  <th>Student Name</th>
                  <th>Institution</th>
                  <th>Scholarship Scheme</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app._id} style={{ fontSize: '0.85rem' }}>
                    <td className="fw-bold text-primary text-break">{app.applicationNumber}</td>
                    <td className="fw-semibold text-dark">{app.studentName}</td>
                    <td className="text-muted small text-truncate" style={{ maxWidth: '180px' }}>{app.institutionName}</td>
                    <td className="text-dark text-truncate" style={{ maxWidth: '200px' }}>{app.scholarshipName}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="fw-bold text-dark">
                      ₹{(app.approvedAmount || app.requestedAmount)?.toLocaleString('en-IN')}
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/department/applications/${app._id}`}
                        className="btn btn-sm btn-primary py-1 px-3"
                      >
                        Scrutinize
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default DepartmentDashboard;
