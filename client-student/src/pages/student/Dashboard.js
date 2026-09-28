import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import StatsCard from '../../components/common/StatsCard';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Banknote, 
  ArrowRight,
  Sparkles,
  Calendar,
  ChevronRight
} from 'lucide-react';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/student/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <PortalLayout pageTitle="Student Dashboard">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading Dashboard...</span>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const { user, stats, recentApplications, recommendedScholarships, notifications } = data || {
    user: {},
    stats: {},
    recentApplications: [],
    recommendedScholarships: [],
    notifications: []
  };

  const completeness = user?.profileCompleteness || 85;

  return (
    <PortalLayout
      pageTitle="Student Dashboard"
      breadcrumbs={[{ label: 'Student Portal', link: '/student/dashboard' }, { label: 'Dashboard' }]}
    >
      {/* Welcome Banner */}
      <div 
        className="custom-card p-3 p-sm-4 p-md-5 mb-4 border-0 text-white position-relative overflow-hidden shadow-md" 
        style={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0284c7 100%)',
          borderRadius: '18px'
        }}
      >
        {/* Background glow effects */}
        <div 
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div className="row align-items-center position-relative g-3" style={{ zIndex: 2 }}>
          <div className="col-12 col-lg-8">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span className="badge rounded-pill bg-white bg-opacity-20 text-white border border-white border-opacity-25 px-2.5 py-1 fw-semibold small">
                Academic Year 2025–2026
              </span>
              <span className="badge rounded-pill bg-warning text-dark fw-bold px-2.5 py-1 small">
                Active Scheme Cycle
              </span>
            </div>
            <h3 className="fw-extrabold mb-1 tracking-tight text-white fs-4 fs-sm-3 fs-lg-2">
              Welcome back, {user?.name || 'Scholar'}! 🎓
            </h3>
            <p className="mb-0 text-white-50 small text-break" style={{ fontSize: '0.85rem' }}>
              Enrolled at <span className="text-white fw-bold">{user?.institutionName || 'National Institute of Technology'}</span>
            </p>
          </div>

          <div className="col-12 col-lg-4 mt-2 mt-lg-0 text-lg-end">
            <div 
              className="d-block d-lg-inline-block text-start p-3 rounded-4 w-100" 
              style={{ 
                maxWidth: '340px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-1.5">
                <span className="small text-white-50 fw-semibold" style={{ fontSize: '0.78rem' }}>
                  Profile Completeness
                </span>
                <span className="badge bg-warning text-dark fw-bold rounded-pill px-2" style={{ fontSize: '0.75rem' }}>
                  {completeness}%
                </span>
              </div>
              <div className="progress rounded-pill bg-white bg-opacity-20" style={{ height: '7px' }}>
                <div
                  className="progress-bar rounded-pill bg-warning"
                  role="progressbar"
                  style={{ width: `${completeness}%` }}
                  aria-valuenow={completeness}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
              <Link 
                to="/student/profile" 
                className="d-flex align-items-center justify-content-between text-warning small mt-2 text-decoration-none fw-bold"
                style={{ fontSize: '0.78rem' }}
              >
                <span>{completeness === 100 ? 'View Full Profile' : 'Complete Profile Requirements'}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Total Applications"
            value={stats.totalApplications || 0}
            subtitle="Submitted grants"
            icon={<FileText size={20} />}
            iconBg="#e0f2fe"
            iconColor="#0284c7"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Pending Verification"
            value={stats.pendingApplications || 0}
            subtitle="Institute / Dept Scrutiny"
            icon={<Clock size={20} />}
            iconBg="#fef3c7"
            iconColor="#d97706"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Approved & Sanctioned"
            value={stats.approvedApplications || 0}
            subtitle="Granted for disbursement"
            icon={<CheckCircle2 size={20} />}
            iconBg="#dcfce7"
            iconColor="#16a34a"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="Total Disbursed"
            value={`₹${(stats.disbursedAmount || 0).toLocaleString('en-IN')}`}
            subtitle="Direct Benefit Transfer (DBT)"
            icon={<Banknote size={20} />}
            iconBg="#ede9fe"
            iconColor="#7c3aed"
          />
        </div>
      </div>

      {/* Main Row: Recent Applications & Recommended Scholarships */}
      <div className="row g-4 mb-4">
        {/* Recent Applications Table Card */}
        <div className="col-12 col-lg-8">
          <div className="custom-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3.5 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold text-dark mb-0 tracking-tight">My Recent Applications</h5>
                <p className="text-muted mb-0 small" style={{ fontSize: '0.78rem' }}>
                  Live multi-stage verification status from your institution and nodal ministry
                </p>
              </div>
              <Link 
                to="/student/applications" 
                className="btn btn-sm btn-light border rounded-pill px-3 py-1 text-primary fw-semibold small d-flex align-items-center gap-1 hover-bg"
                style={{ fontSize: '0.78rem' }}
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div className="p-3 rounded-circle bg-light d-inline-flex mb-3">
                  <FileText size={36} className="text-secondary" />
                </div>
                <h6 className="fw-bold text-dark">No Applications Yet</h6>
                <p className="small mb-3 text-secondary" style={{ maxWidth: '360px', margin: '0 auto' }}>
                  You haven't submitted any scholarship applications yet. Explore available schemes to apply.
                </p>
                <Link to="/student/scholarships" className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-semibold">
                  Browse Open Schemes
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                      <th className="py-2.5 ps-2">Application #</th>
                      <th className="py-2.5">Scholarship Scheme</th>
                      <th className="py-2.5">Applied Date</th>
                      <th className="py-2.5">Current Status</th>
                      <th className="py-2.5 text-end pe-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => (
                      <tr key={app._id} style={{ fontSize: '0.84rem' }}>
                        <td className="ps-2">
                          <span className="badge bg-light text-primary border fw-bold font-monospace px-2.5 py-1">
                            {app.applicationNumber}
                          </span>
                        </td>
                        <td>
                          <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '220px' }}>
                            {app.scholarshipName}
                          </div>
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                            ₹{app.requestedAmount?.toLocaleString('en-IN')} Grant
                          </span>
                        </td>
                        <td className="text-secondary small">
                          <div className="d-flex align-items-center gap-1">
                            <Calendar size={13} className="text-muted" />
                            <span>{new Date(app.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="text-end pe-2">
                          <Link
                            to={`/student/applications/${app._id}`}
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <span>Track</span>
                            <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Recommended Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h6 className="fw-bold text-dark mb-0">Recent Alerts</h6>
                <Link to="/student/notifications" className="small text-primary fw-semibold text-decoration-none">
                  View All
                </Link>
              </div>

              {notifications.length === 0 ? (
                <div className="p-3 text-center text-muted small bg-light rounded-3">
                  No new notifications right now.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2.5">
                  {notifications.slice(0, 3).map((notif) => (
                    <div 
                      key={notif._id} 
                      className="p-3 rounded-3 bg-light border-start border-3 border-primary" 
                      style={{ fontSize: '0.8rem' }}
                    >
                      <div className="fw-bold text-dark mb-0.5">{notif.title}</div>
                      <div className="text-muted small text-truncate-2" style={{ lineHeight: '1.3' }}>
                        {notif.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-top">
              <div className="d-flex align-items-center gap-1.5 mb-2 text-primary fw-bold small">
                <Sparkles size={16} className="text-warning" />
                <span style={{ fontSize: '0.8rem', letterSpacing: '0.02em' }}>RECOMMENDED SCHEME</span>
              </div>
              {recommendedScholarships.length > 0 && (
                <div className="p-3 rounded-3 border bg-light bg-opacity-50">
                  <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.88rem' }}>
                    {recommendedScholarships[0].name}
                  </h6>
                  <p className="text-muted small mb-2.5" style={{ fontSize: '0.78rem' }}>
                    {recommendedScholarships[0].amountDisplay}
                  </p>
                  <Link
                    to={`/student/scholarships/${recommendedScholarships[0]._id}`}
                    className="btn btn-primary btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-1.5 py-1.5 fw-semibold"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <span>Check Eligibility & Apply</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default StudentDashboard;
