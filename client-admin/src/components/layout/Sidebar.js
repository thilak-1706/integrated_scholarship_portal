import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Bell,
  Building2,
  Users,
  BarChart3,
  Building,
  History,
  MessageSquare,
  X,
  Shield,
  Zap,
  Mail
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sections = [
    {
      title: 'CENTRAL GOVERNANCE',
      links: [
        { to: '/admin/dashboard', label: 'Command Center', icon: <LayoutDashboard size={18} /> },
        { to: '/admin/slp', label: 'SLP SLA Monitor', icon: <Zap size={18} /> },
        { to: '/admin/scholarships', label: 'Scheme Portfolio', icon: <GraduationCap size={18} /> },
        { to: '/admin/applications', label: 'Global Applications', icon: <FileText size={18} /> },
      ]
    },
    {
      title: 'ENTITIES & ACCESS',
      links: [
        { to: '/admin/institutions', label: 'Colleges & Universities', icon: <Building2 size={18} /> },
        { to: '/admin/departments', label: 'State Ministries', icon: <Building size={18} /> },
        { to: '/admin/users', label: 'User Directory', icon: <Users size={18} /> },
      ]
    },
    {
      title: 'AUDITING & SYSTEM',
      links: [
        { to: '/admin/reports', label: 'Analytics & Insights', icon: <BarChart3 size={18} /> },
        { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: <History size={18} /> },
        { to: '/admin/email-logs', label: 'Email Dispatches', icon: <Mail size={18} /> },
        { to: '/admin/notifications', label: 'System Dispatches', icon: <Bell size={18} /> },
        { to: '/admin/feedback', label: 'Feedback Desk', icon: <MessageSquare size={18} /> }
      ]
    }
  ];

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out Session',
      text: 'Are you sure you want to end your administrator session?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Sign Out'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  return (
    <aside
      className={`sidebar-wrapper sidebar-theme-admin ${isOpen ? 'show' : ''}`}
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
            {/* Pink Rounded Square Logo with White Outline Shield */}
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs"
              style={{
                width: '42px',
                height: '42px',
                backgroundColor: '#DB2777',
                borderRadius: '12px',
                marginRight: '14px'
              }}
            >
              <Shield size={24} color="#FFFFFF" strokeWidth={2.1} />
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
                  color: '#DB2777',
                  fontWeight: 600,
                  lineHeight: '1.2',
                  marginTop: '3px'
                }}
              >
                Admin Portal
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            className="btn btn-link text-secondary d-lg-none p-1 rounded-circle"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <X size={20} />
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

      {/* Admin Session Footer Card */}
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
            {user?.name || 'ADMINISTRATOR'}
          </div>
          <div
            className="text-truncate"
            style={{ fontSize: '0.76rem', color: '#64748B', marginBottom: '12px' }}
          >
            {user?.email || 'admin@nsp.gov.in'}
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
