import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sections = [
    {
      title: 'CORE SERVICES',
      links: [
        {
          to: '/student/dashboard',
          label: 'Dashboard',
          icon: <i className="bi bi-house" style={{ fontSize: '1.25rem' }}></i>
        },
        {
          to: '/student/profile',
          label: 'Student Profile',
          icon: <i className="bi bi-person" style={{ fontSize: '1.3rem' }}></i>
        },
        {
          to: '/student/scholarships',
          label: 'Explore Schemes',
          icon: <i className="bi bi-stack" style={{ fontSize: '1.15rem' }}></i>
        }
      ]
    },
    {
      title: 'TRACKING & RECORDS',
      links: [
        {
          to: '/student/applications',
          label: 'My Applications',
          icon: <i className="bi bi-file-earmark-text" style={{ fontSize: '1.18rem' }}></i>
        },
        {
          to: '/student/payments',
          label: 'DBT Payments',
          icon: <i className="bi bi-credit-card" style={{ fontSize: '1.18rem' }}></i>
        },
        {
          to: '/student/notifications',
          label: 'Alerts & Messages',
          icon: <i className="bi bi-bell" style={{ fontSize: '1.18rem' }}></i>
        },
        {
          to: '/student/feedback',
          label: 'Feedback & Support',
          icon: <i className="bi bi-chat-square-text" style={{ fontSize: '1.15rem' }}></i>
        }
      ]
    }
  ];

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out Session',
      text: 'Are you sure you want to end your student session?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Sign Out'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/student/login');
      }
    });
  };

  return (
    <aside
      className={`sidebar-wrapper sidebar-theme-student ${isOpen ? 'show' : ''}`}
      style={{
        width: '250px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          className="d-flex align-items-center justify-content-between"
          style={{
            padding: '20px 20px 16px 20px',
            height: '72px'
          }}
        >
          <div className="d-flex align-items-center" style={{ gap: '14px' }}>
            {/* Blue Rounded Square Logo with White Outline Graduation Cap */}
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs"
              style={{
                width: '42px',
                height: '42px',
                backgroundColor: '#2563EB',
                borderRadius: '12px',
                marginRight: '14px'
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>

            <div>
              <div className="d-flex align-items-center" style={{ gap: '8px', lineHeight: '1.2' }}>
                <span
                  className="fw-bold"
                  style={{
                    fontSize: '1.12rem',
                    letterSpacing: '-0.02em',
                    color: '#0F172A',
                    fontWeight: 700,
                    marginRight: '8px'
                  }}
                >
                  NSP 2.0
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    backgroundColor: '#EEF2F6',
                    color: '#475569',
                    padding: '2px 7px',
                    borderRadius: '20px',
                    lineHeight: '1.2'
                  }}
                >
                  GOI
                </span>
              </div>
              <span
                className="d-block"
                style={{
                  fontSize: '0.78rem',
                  color: '#2563EB',
                  fontWeight: 500,
                  lineHeight: '1.2',
                  marginTop: '3px'
                }}
              >
                Applicant Portal
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            className="btn btn-link text-secondary d-lg-none p-1 rounded-circle"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <i className="bi bi-x-lg" style={{ fontSize: '1.1rem' }}></i>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="py-1">
          {sections.map((section, sIdx) => (
            <div key={sIdx} style={{ marginTop: sIdx === 0 ? '12px' : '20px' }}>
              <div
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#64748B',
                  fontWeight: 700,
                  paddingLeft: '20px',
                  marginBottom: '8px'
                }}
              >
                {section.title}
              </div>

              <nav className="nav flex-column">
                {section.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-exact-link d-flex align-items-center ${isActive ? 'active' : ''}`
                    }
                  >
                    <span className="d-flex align-items-center justify-content-center me-3" style={{ width: '22px' }}>
                      {link.icon}
                    </span>
                    <span className="text-truncate">{link.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Student Session Footer Card */}
      <div style={{ padding: '0 14px 16px 14px' }}>
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '14px 16px'
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-1.5">
            <div className="d-flex align-items-center gap-1.5">
              {/* Hexagon outline icon in green */}
              <i className="bi bi-hexagon" style={{ color: '#10B981', fontSize: '0.95rem' }}></i>
              <span
                className="fw-semibold"
                style={{ fontSize: '0.76rem', color: '#475569' }}
              >
                Current Session
              </span>
            </div>
            <span
              className="rounded-circle"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10B981',
                display: 'inline-block'
              }}
            ></span>
          </div>

          <div
            className="fw-bold text-truncate"
            style={{ fontSize: '0.95rem', color: '#0F172A', marginTop: '4px' }}
          >
            {user?.name || 'THILAK G'}
          </div>
          <div
            className="text-truncate"
            style={{ fontSize: '0.76rem', color: '#64748B', marginBottom: '12px' }}
          >
            {user?.email || 'thilakgopal1706@gmail.com'}
          </div>

          <button
            onClick={handleLogout}
            className="btn w-100 d-flex align-items-center justify-content-center gap-2 fw-bold"
            style={{
              backgroundColor: '#FEE2E2',
              color: '#EF4444',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.84rem',
              padding: '9px 12px'
            }}
          >
            <i className="bi bi-box-arrow-right" style={{ fontSize: '1rem', color: '#EF4444' }}></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
