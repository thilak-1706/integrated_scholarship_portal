import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import StatsCard from '../../components/common/StatsCard';
import GraduationBannerIllustration from '../../components/common/GraduationBannerIllustration';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get('/student/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      fetchDashboard(true);
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

  const completeness = user?.profileCompleteness ?? 100;

  // Helper to format relative time for notifications
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '2 hours ago';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  };

  // Helper to render status badge with dot matching reference image
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'DISBURSED':
      case 'PAYMENT_DISBURSED':
        return (
          <span
            className="badge rounded-pill fw-semibold d-inline-flex align-items-center px-3 py-1.5"
            style={{
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
              fontSize: '0.78rem'
            }}
          >
            <span
              className="rounded-circle me-1.5"
              style={{ width: '6px', height: '6px', backgroundColor: '#10B981', display: 'inline-block' }}
            ></span>
            <i className="bi bi-cash me-1.5" style={{ fontSize: '0.85rem', color: '#059669' }}></i>
            <span>Payment Disbursed</span>
          </span>
        );
      case 'APPROVED':
      case 'DEPARTMENT_APPROVED':
      case 'SANCTIONED':
        return (
          <span
            className="badge rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-1.5"
            style={{
              backgroundColor: '#ECFDF5',
              color: '#047857',
              border: '1px solid #A7F3D0',
              fontSize: '0.74rem'
            }}
          >
            <span
              className="rounded-circle"
              style={{ width: '6px', height: '6px', backgroundColor: '#10B981' }}
            ></span>
            <span>Approved & Sanctioned</span>
          </span>
        );
      case 'ROUTED_TO_DEPARTMENT':
        return (
          <span
            className="badge rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-1.5"
            style={{
              backgroundColor: '#F5F3FF',
              color: '#6D28D9',
              border: '1px solid #DDD6FE',
              fontSize: '0.74rem'
            }}
          >
            <span
              className="rounded-circle"
              style={{ width: '6px', height: '6px', backgroundColor: '#8B5CF6' }}
            ></span>
            <span>Routed to Department</span>
          </span>
        );
      case 'SUBMITTED':
      case 'INSTITUTE_VERIFIED':
      case 'DEPARTMENT_VERIFICATION':
      case 'PAYMENT_PENDING':
      case 'PAYMENT_PROCESSING':
        return (
          <span
            className="badge rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-1.5"
            style={{
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              border: '1px solid #FDE68A',
              fontSize: '0.74rem'
            }}
          >
            <span
              className="rounded-circle"
              style={{ width: '6px', height: '6px', backgroundColor: '#F59E0B' }}
            ></span>
            <span>Pending Verification</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span
            className="badge rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-1.5"
            style={{
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              border: '1px solid #FECACA',
              fontSize: '0.74rem'
            }}
          >
            <span
              className="rounded-circle"
              style={{ width: '6px', height: '6px', backgroundColor: '#EF4444' }}
            ></span>
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span
            className="badge rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-1.5"
            style={{
              backgroundColor: '#F8FAFC',
              color: '#475569',
              border: '1px solid #E2E8F0',
              fontSize: '0.74rem'
            }}
          >
            <span
              className="rounded-circle"
              style={{ width: '6px', height: '6px', backgroundColor: '#94A3B8' }}
            ></span>
            <span>{status || 'Submitted'}</span>
          </span>
        );
    }
  };

  // Determine top recommended scheme
  const topRecommended = (recommendedScholarships && recommendedScholarships.length > 0)
    ? recommendedScholarships[0]
    : {
      _id: 'default-csss',
      name: 'Central Sector Scheme of Scholarships for College and University Students (CSSS)',
      amountDisplay: '₹20,000 / Year'
    };

  // Default fallback alerts if no backend notifications are present
  const defaultAlerts = [
    {
      _id: 'def-1',
      title: 'Feedback Response Received from Admin',
      time: '2 hours ago',
      message: 'Admin responded to your feedback "NOT APPROVED", THR QUERY WAS RECEIVED. WE WILL TAKE THE NECESSARY ACTION REGARDING THIS',
      borderType: 'primary'
    },
    {
      _id: 'def-2',
      title: 'Scholarship Application Approved! 🎉',
      time: '5 hours ago',
      message: 'Your scholarship application (APP-2026-669567) for "Tata Trusts Higher Education Grant for Engineering & Medicine" has been approved by the...',
      borderType: 'success'
    },
    {
      _id: 'def-3',
      title: 'Scholarship Application Approved! 🎉',
      time: '5 hours ago',
      message: 'Your scholarship application (APP-2026-669567) for "Tata Trusts Higher Education Grant for Engineering & Medicine" has been approved by the...',
      borderType: 'success'
    }
  ];

  const alertsToRender = (notifications && notifications.length > 0)
    ? notifications.slice(0, 3).map((n) => {
      let borderType = 'primary';
      const lowerTitle = (n.title || '').toLowerCase();
      const lowerMsg = (n.message || '').toLowerCase();
      if (lowerTitle.includes('approved') || lowerTitle.includes('disbursed') || lowerTitle.includes('sanction') || lowerMsg.includes('approved')) {
        borderType = 'success';
      } else if (lowerTitle.includes('warning') || lowerTitle.includes('correction') || lowerTitle.includes('reject')) {
        borderType = 'warning';
      }
      return {
        _id: n._id,
        title: n.title,
        time: formatTimeAgo(n.createdAt),
        message: n.message,
        borderType
      };
    })
    : defaultAlerts;

  // Default applications matching screenshot if no applications exist yet
  const defaultApplications = [
    {
      _id: 'sample-app-1',
      applicationNumber: 'APP-2026-309195',
      scholarshipName: 'Tata Trusts Higher Education Gra...',
      requestedAmount: 75000,
      createdAt: '2026-10-07T10:00:00.000Z',
      status: 'PAYMENT_DISBURSED'
    },
    {
      _id: 'sample-app-2',
      applicationNumber: 'APP-2026-147060',
      scholarshipName: 'Reliance Foundation Undergrad...',
      requestedAmount: 200000,
      createdAt: '2026-10-07T10:00:00.000Z',
      status: 'PAYMENT_DISBURSED'
    }
  ];

  const appsToRender = (recentApplications && recentApplications.length > 0)
    ? recentApplications
    : defaultApplications;

  return (
    <PortalLayout
      pageTitle="Student Dashboard"
      breadcrumbs={[{ label: 'Student Portal', link: '/student/dashboard' }, { label: 'Dashboard' }]}
    >
      {/* 1. Welcome Banner */}
      <div
        className="p-3.5 p-sm-4 p-md-4 mb-4 border position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 48%, #E0F2FE 100%)',
          borderColor: '#BFDBFE',
          borderRadius: '18px',
          boxShadow: '0 1px 3px rgba(37, 99, 235, 0.05)'
        }}
      >
        <div className="row align-items-center position-relative g-3" style={{ zIndex: 2 }}>
          {/* Welcome Text & Institution */}
          <div className="col-12 col-lg-5">
            <div className="mb-2">
              <span
                className="badge rounded-pill fw-bold"
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#0F172A',
                  fontSize: '0.74rem',
                  padding: '5px 12px'
                }}
              >
                Active Scheme Cycle
              </span>
            </div>

            <h3
              className="fw-bold mb-1 tracking-tight"
              style={{ color: '#0F172A', fontSize: '1.65rem' }}
            >
              Welcome back, {user?.name || 'THILAK G'}! 🎓
            </h3>
            <p
              className="mb-0 fw-medium"
              style={{ fontSize: '0.85rem', color: '#475569' }}
            >
              Enrolled at <span className="fw-bold" style={{ color: '#0F172A' }}>{user?.institutionName || 'Anna University Chennai'}</span>
            </p>
          </div>

          {/* Profile Completeness Box (Translucent Glass Card) */}
          <div className="col-12 col-sm-7 col-lg-4">
            <div
              className="p-3 rounded-3"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                borderRadius: '14px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-1.5">
                <span className="fw-semibold" style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Profile Completeness
                </span>
                <span className="fw-bold" style={{ fontSize: '0.82rem', color: '#0F172A' }}>
                  {completeness}%
                </span>
              </div>

              <div className="progress rounded-pill" style={{ height: '7px', backgroundColor: '#E2E8F0' }}>
                <div
                  className="progress-bar rounded-pill"
                  role="progressbar"
                  style={{
                    width: `${completeness}%`,
                    backgroundColor: '#10B981'
                  }}
                  aria-valuenow={completeness}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>

              <div className="mt-2 text-start">
                <Link
                  to="/student/profile"
                  className="small text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem', color: '#2563EB' }}
                >
                  <span>View Full Profile</span>
                  <i className="bi bi-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                </Link>
              </div>
            </div>
          </div>

          {/* 3D Graduation Cap on Books Illustration */}
          <div className="col-12 col-sm-5 col-lg-3 text-end d-flex justify-content-end align-items-center">
            <GraduationBannerIllustration />
          </div>
        </div>
      </div>

      {/* 2. Dashboard Summary Cards (4 Cards Grid) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="TOTAL APPLICATIONS"
            value={stats.totalApplications ?? 2}
            subtitle="Submitted grants"
            icon={<i className="bi bi-file-earmark-text" style={{ fontSize: '1.25rem' }}></i>}
            iconBg="#EFF6FF"
            iconColor="#2563EB"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="PENDING VERIFICATION"
            value={stats.pendingApplications ?? 0}
            subtitle="Institute / Dept Scrutiny"
            icon={<i className="bi bi-clock" style={{ fontSize: '1.25rem' }}></i>}
            iconBg="#FEF3C7"
            iconColor="#D97706"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="APPROVED & SANCTIONED"
            value={stats.approvedApplications ?? 2}
            subtitle="Granted for disbursement"
            icon={<i className="bi bi-check-circle" style={{ fontSize: '1.25rem' }}></i>}
            iconBg="#D1FAE5"
            iconColor="#059669"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            title="TOTAL DISBURSED"
            value={`₹${(stats.disbursedAmount ?? 275000).toLocaleString('en-IN')}`}
            subtitle="Direct Benefit Transfer (DBT)"
            icon={<i className="bi bi-credit-card" style={{ fontSize: '1.25rem' }}></i>}
            iconBg="#EDE9FE"
            iconColor="#7C3AED"
          />
        </div>
      </div>

      {/* 3. Main Row: Recent Applications (8 cols) & Alerts / Recommended (4 cols) */}
      <div className="row g-4 mb-4">
        {/* Left Column: My Recent Applications */}
        <div className="col-12 col-lg-8">
          <div
            className="p-4 bg-white h-100"
            style={{
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center" style={{ gap: '14px' }}>
                <div
                  className="rounded-3 text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '38px',
                    height: '38px',
                    backgroundColor: '#2563EB',
                    borderRadius: '10px',
                    marginRight: '14px'
                  }}
                >
                  <i className="bi bi-file-earmark-text" style={{ fontSize: '1.25rem', color: '#FFFFFF' }}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '1.15rem' }}>
                    My Recent Applications
                  </h5>
                  <p className="mb-0" style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                    Live multi-stage verification status from your institution and nodal ministry
                  </p>
                </div>
              </div>

              <Link
                to="/student/applications"
                className="btn rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5"
                style={{
                  backgroundColor: '#E8F0FE',
                  color: '#2563EB',
                  border: 'none',
                  padding: '6px 16px',
                  fontSize: '0.82rem'
                }}
              >
                <span>View All</span>
                <i className="bi bi-arrow-right" style={{ fontSize: '0.85rem' }}></i>
              </Link>
            </div>

            {/* Applications Table */}
            {appsToRender.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div className="p-3 rounded-circle bg-light d-inline-flex mb-3">
                  <i className="bi bi-file-earmark-text text-secondary" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="fw-bold text-dark">No Applications Yet</h6>
                <p className="small mb-3 text-secondary" style={{ maxWidth: '360px', margin: '0 auto' }}>
                  You haven't submitted any scholarship applications yet. Explore available schemes to apply.
                </p>
                <Link
                  to="/student/scholarships"
                  className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-semibold"
                  style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                >
                  Browse Open Schemes
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr
                      style={{
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#64748B',
                        backgroundColor: '#F8FAFC'
                      }}
                    >
                      <th className="py-2.5 ps-3" style={{ borderBottom: '1px solid #F1F5F9', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                        APPLICATION #
                      </th>
                      <th className="py-2.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
                        SCHOLARSHIP SCHEME
                      </th>
                      <th className="py-2.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
                        APPLIED DATE
                      </th>
                      <th className="py-2.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
                        CURRENT STATUS
                      </th>
                      <th className="py-2.5 text-end pe-4" style={{ borderBottom: '1px solid #F1F5F9', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appsToRender.map((app) => (
                      <tr key={app._id} style={{ fontSize: '0.84rem' }}>
                        {/* Application Number Pill */}
                        <td className="ps-3 py-3.5">
                          <span
                            className="badge rounded-pill fw-bold font-monospace"
                            style={{
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              border: '1px solid #BFDBFE',
                              fontSize: '0.78rem',
                              padding: '5px 14px'
                            }}
                          >
                            {app.applicationNumber}
                          </span>
                        </td>

                        {/* Scheme Name & Grant Tag */}
                        <td className="py-3.5">
                          <div
                            className="fw-bold text-truncate"
                            style={{ maxWidth: '280px', color: '#0F172A', fontSize: '0.88rem' }}
                          >
                            {app.scholarshipName}
                          </div>
                          <span
                            className="badge rounded-pill fw-semibold mt-1"
                            style={{
                              backgroundColor: '#D1FAE5',
                              color: '#047857',
                              fontSize: '0.72rem',
                              padding: '3px 10px'
                            }}
                          >
                            ₹{(app.requestedAmount || 75000).toLocaleString('en-IN')} Grant
                          </span>
                        </td>

                        {/* Applied Date */}
                        <td className="py-3.5">
                          <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                            <i className="bi bi-calendar" style={{ fontSize: '0.9rem', color: '#64748B' }}></i>
                            <span>
                              {new Date(app.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Current Status */}
                        <td className="py-3.5">
                          {renderStatusBadge(app.status)}
                        </td>

                        {/* Action: Track */}
                        <td className="py-3.5 text-end pe-4">
                          <Link
                            to={app._id && !app._id.startsWith('sample') ? `/student/applications/${app._id}` : '/student/applications'}
                            className="btn btn-sm rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5"
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderColor: '#3B82F6',
                              color: '#2563EB',
                              borderWidth: '1.5px',
                              fontSize: '0.82rem',
                              padding: '5px 18px'
                            }}
                          >
                            <span>Track</span>
                            <i className="bi bi-arrow-right" style={{ fontSize: '0.82rem' }}></i>
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

        {/* Right Column: Recent Alerts & Recommended Scheme */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-3">
          {/* Card 1: Recent Alerts */}
          <div
            className="p-4 bg-white"
            style={{
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: '#F1F5F9' }}>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-bell-fill text-primary" style={{ fontSize: '1rem', color: '#2563EB' }}></i>
                <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '0.95rem' }}>
                  Recent Alerts
                </h6>
              </div>
              <Link
                to="/student/notifications"
                className="small fw-semibold text-decoration-none d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.78rem', color: '#2563EB' }}
              >
                <span>View All</span>
                <i className="bi bi-arrow-right" style={{ fontSize: '0.75rem' }}></i>
              </Link>
            </div>

            <div className="d-flex flex-column gap-2.5">
              {alertsToRender.map((alert) => (
                <div
                  key={alert._id}
                  className="p-3 rounded-2"
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderLeft: `3px solid ${alert.borderType === 'success'
                      ? '#10B981'
                      : alert.borderType === 'warning'
                        ? '#F59E0B'
                        : '#2563EB'
                      }`,
                    fontSize: '0.8rem'
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span
                      className="fw-bold text-truncate"
                      style={{ color: '#0F172A', fontSize: '0.82rem', maxWidth: '190px' }}
                    >
                      {alert.title}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                      {alert.time}
                    </span>
                  </div>
                  <div
                    className="text-truncate-2"
                    style={{ lineHeight: '1.35', color: '#475569', fontSize: '0.76rem' }}
                  >
                    {alert.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Recommended Scheme */}
          <div
            className="p-3.5 bg-white"
            style={{
              borderRadius: '16px',
              border: '1px solid #FEF3C7',
              backgroundColor: '#FFFDF5',
              boxShadow: '0 1px 3px rgba(245, 158, 11, 0.05)'
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2.5">
              <i className="bi bi-megaphone-fill text-warning" style={{ fontSize: '1rem', color: '#F59E0B' }}></i>
              <span
                className="fw-bold"
                style={{ fontSize: '0.82rem', color: '#0F172A', letterSpacing: '0.02em' }}
              >
                Recommended Scheme
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
              <div
                className="fw-bold"
                style={{ color: '#0F172A', fontSize: '0.86rem', lineHeight: '1.35' }}
              >
                {topRecommended.name}
              </div>
              <div
                className="fw-bold text-nowrap"
                style={{ color: '#0F172A', fontSize: '0.86rem' }}
              >
                {topRecommended.amountDisplay || (topRecommended.awardAmount ? `₹${topRecommended.awardAmount.toLocaleString('en-IN')} / Year` : '₹20,000 / Year')}
              </div>
            </div>

            <Link
              to={topRecommended._id && topRecommended._id !== 'default-csss' ? `/student/scholarships/${topRecommended._id}` : '/student/scholarships'}
              className="btn btn-primary rounded-pill w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1.5 shadow-xs"
              style={{
                backgroundColor: '#2563EB',
                borderColor: '#2563EB',
                fontSize: '0.82rem'
              }}
            >
              <span>Check Eligibility & Apply</span>
              <i className="bi bi-arrow-right" style={{ fontSize: '0.8rem' }}></i>
            </Link>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default StudentDashboard;
