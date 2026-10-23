import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Bell,
  LogOut,
  ExternalLink,
  ChevronDown,
  CheckCheck
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/admin/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Silently ignore in poll
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/admin/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
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

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toLowerCase();

  return (
    <header
      className="portal-navbar px-3 px-lg-4 d-flex align-items-center justify-content-between"
      style={{
        height: '72px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky',
        top: 0,
        zIndex: 1030
      }}
    >
      {/* Left side: Hamburger, Logo Icon & Portal Identification */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn p-0 d-flex align-items-center justify-content-center"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Drawer"
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <i className="bi bi-list" style={{ fontSize: '1.35rem', color: '#1E293B' }}></i>
        </button>

        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
          {/* Graduation Cap Mortarboard Icon with Tassel matching reference */}
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '30px', height: '30px', marginRight: '12px' }}
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17.5C9 21.5 13.5 24 16 24C18.5 24 23 21.5 23 17.5V14.5L16 18L9 14.5V17.5Z" fill="#1E293B" />
              <polygon points="16,5 29,12 16,19 3,12" fill="#1E293B" />
              <polygon points="16,6.2 27.2,12 16,17.8 4.8,12" fill="#2B394E" />
              <ellipse cx="16" cy="12" rx="1.6" ry="1.2" fill="#F59E0B" />
              <path d="M16 12C20 12 24.5 13.5 25 16C25.3 17.5 25 19.5 25 21.5" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
              <polygon points="23.5,21 26.5,21 26,24.5 24,24.5" fill="#F59E0B" />
            </svg>
          </div>

          <div>
            <div className="d-flex align-items-center gap-2">
              <span
                className="fw-bold"
                style={{
                  fontSize: '0.96rem',
                  letterSpacing: '-0.01em',
                  color: '#0F172A',
                  lineHeight: '1.2'
                }}
              >
                <span className="d-none d-sm-inline">National Scholarship Portal</span>
                <span className="d-sm-none">NSP 2.0</span>
              </span>
              <span
                style={{
                  backgroundColor: '#DB2777',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 9px',
                  borderRadius: '20px',
                  lineHeight: '1.2'
                }}
              >
                Admin
              </span>
            </div>
            <div
              className="text-truncate d-none d-md-block"
              style={{
                fontSize: '0.72rem',
                color: '#64748B',
                marginTop: '2px'
              }}
            >
              Central Administration, Scheme Governance & Security Control
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Time Pill, Notifications, User Menu */}
      <div className="d-flex align-items-center" style={{ gap: '12px' }}>
        {/* System Time Pill */}
        <div
          className="d-none d-xl-flex align-items-center gap-2 px-3 py-1.5"
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            fontSize: '0.78rem',
            color: '#334155',
            fontWeight: 500
          }}
        >
          <i className="bi bi-calendar3" style={{ color: '#2563EB', fontSize: '0.85rem' }}></i>
          <span>
            {formattedDate} &bull; {formattedTime}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="position-relative" ref={notifRef}>
          <button
            className="btn p-0 position-relative d-flex align-items-center justify-content-center"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: showNotifDropdown ? '#EFF6FF' : '#FFFFFF',
              border: showNotifDropdown ? '1px solid #2563EB' : '1px solid #E2E8F0',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            aria-label="Notifications"
          >
            <Bell size={18} color="#475569" />
            {unreadCount > 0 && (
              <span
                className="position-absolute d-flex align-items-center justify-content-center fw-bold"
                style={{
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  borderRadius: '10px',
                  border: '2px solid #FFFFFF'
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div
              className="position-absolute end-0 mt-2 bg-white shadow-lg p-0"
              style={{
                width: '340px',
                maxWidth: 'calc(100vw - 24px)',
                zIndex: 1060,
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden'
              }}
            >
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold small text-dark">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="badge rounded-pill bg-primary" style={{ fontSize: '0.68rem' }}>
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="btn btn-link p-0 text-decoration-none small text-primary d-flex align-items-center gap-1"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted small">
                    <Bell size={24} className="opacity-25 mb-2 d-block mx-auto" />
                    No notifications right now
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 border-bottom notification-item ${!n.read ? 'unread' : ''}`}
                      style={{ fontSize: '0.8rem', backgroundColor: !n.read ? '#F8FAFC' : '#FFFFFF' }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }}>
                          {n.title}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-secondary text-truncate" style={{ lineHeight: '1.3' }}>
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 text-center border-top bg-light">
                <Link
                  to="/admin/notifications"
                  className="small text-primary text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                  onClick={() => setShowNotifDropdown(false)}
                >
                  <span>View All Notifications</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Menu */}
        <div className="position-relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="btn p-1 pe-3 d-flex align-items-center gap-2"
            style={{
              height: '42px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '30px',
              cursor: 'pointer'
            }}
          >
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
              style={{
                width: '32px',
                height: '32px',
                fontSize: '0.88rem',
                backgroundColor: '#2563EB'
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="d-none d-md-block text-start" style={{ lineHeight: '1.2' }}>
              <div
                className="fw-bold text-truncate"
                style={{ fontSize: '0.82rem', maxWidth: '140px', color: '#0F172A' }}
              >
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                System Admin
              </div>
            </div>
            <ChevronDown size={14} color="#64748B" className="d-none d-sm-block ms-1" />
          </button>

          {showUserDropdown && (
            <div
              className="position-absolute end-0 mt-2 bg-white shadow-lg p-0"
              style={{
                width: '260px',
                zIndex: 1060,
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden'
              }}
            >
              <div className="p-3 border-bottom bg-light">
                <div className="fw-bold text-dark text-truncate">{user?.name || 'Administrator'}</div>
                <div className="text-muted text-truncate small mb-2" style={{ fontSize: '0.75rem' }}>
                  {user?.email || 'admin@nsp.gov.in'}
                </div>
                <div>
                  <span
                    className="badge rounded-pill"
                    style={{ backgroundColor: '#E8F0FF', color: '#2563EB', padding: '4px 10px', fontSize: '0.7rem' }}
                  >
                    System Administrator
                  </span>
                </div>
              </div>

              <div className="p-1.5">
                <Link
                  to="/admin/notifications"
                  className="dropdown-item py-2 px-3 rounded-3 d-flex align-items-center gap-2 text-dark small fw-semibold"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <Bell size={16} className="text-primary" />
                  <span>Notification Center</span>
                </Link>
              </div>

              <div className="border-top p-1.5">
                <button
                  onClick={handleLogout}
                  className="dropdown-item py-2 px-3 rounded-3 d-flex align-items-center gap-2 text-danger small fw-semibold"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
