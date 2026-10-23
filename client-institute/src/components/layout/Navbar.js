import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

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
      const res = await api.get('/institute/notifications');
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
      await api.put('/institute/notifications/read-all');
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
      text: 'Are you sure you want to end your institute officer session?',
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
          {/* Mortarboard Icon with Tassel */}
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
                className="badge rounded-pill fw-semibold"
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  padding: '2.5px 9px',
                  borderRadius: '20px'
                }}
              >
                Institute
              </span>
            </div>
            <div
              className="d-none d-md-block"
              style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: '1.2', marginTop: '2px' }}
            >
              Level-1 Nodal Verification & Scrutiny Management
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Time Pill, Notifications, User Menu */}
      <div className="d-flex align-items-center gap-3">
        {/* System Time Pill */}
        <div
          className="d-none d-xl-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border"
          style={{
            backgroundColor: '#F0F6FF',
            borderColor: '#E2E8F0',
            fontSize: '0.78rem',
            color: '#334155',
            fontWeight: 600
          }}
        >
          <i className="bi bi-calendar-event text-primary" style={{ fontSize: '0.9rem' }}></i>
          <span>
            {formattedDate} &bull; {formattedTime}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="position-relative" ref={notifRef}>
          <button
            className={`btn p-0 rounded-circle d-flex align-items-center justify-content-center transition-all ${
              showNotifDropdown ? 'border-primary' : ''
            }`}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#475569'
            }}
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            aria-label="Notifications"
          >
            <i className="bi bi-bell" style={{ fontSize: '1.15rem' }}></i>
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{
                  fontSize: '0.65rem',
                  minWidth: '18px',
                  height: '18px',
                  padding: '2px 5px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  border: '2px solid #FFFFFF',
                  fontWeight: 700
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div
              className="position-absolute end-0 mt-2 bg-white shadow-lg border rounded-3 p-0"
              style={{
                width: '340px',
                maxWidth: 'calc(100vw - 24px)',
                zIndex: 1060,
                borderColor: '#E2E8F0',
                borderRadius: '14px',
                overflow: 'hidden'
              }}
            >
              <div
                className="p-3 border-bottom d-flex justify-content-between align-items-center"
                style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold small text-dark">Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        fontSize: '0.68rem'
                      }}
                    >
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
                    <i className="bi bi-check2-all"></i> Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted small">
                    <i className="bi bi-bell opacity-25 mb-2 d-block mx-auto" style={{ fontSize: '1.5rem' }}></i>
                    No notifications right now
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 border-bottom notification-item ${!n.read ? 'unread' : ''}`}
                      style={{ fontSize: '0.8rem', borderColor: '#F1F5F9' }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }}>
                          {n.title}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-secondary text-truncate-2" style={{ lineHeight: '1.3' }}>
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                className="p-2.5 text-center border-top"
                style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
              >
                <Link
                  to="/institute/notifications"
                  className="small text-primary text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                  onClick={() => setShowNotifDropdown(false)}
                >
                  <span>View All Notifications</span>
                  <i className="bi bi-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu Pill */}
        <div className="position-relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="btn d-flex align-items-center transition-all"
            style={{
              height: '42px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '28px',
              padding: '4px 14px 4px 5px'
            }}
          >
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold me-2"
              style={{
                width: '34px',
                height: '34px',
                fontSize: '0.95rem',
                backgroundColor: '#2563EB',
                flexShrink: 0
              }}
            >
              {user?.institutionName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'I'}
            </div>
            <div className="d-none d-md-block text-start me-1" style={{ lineHeight: '1.2' }}>
              <div
                className="fw-bold text-truncate"
                style={{ fontSize: '0.84rem', maxWidth: '140px', color: '#0F172A' }}
              >
                {user?.institutionName || user?.name || 'Institute Desk'}
              </div>
              <div className="text-truncate" style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 500 }}>
                Institute Officer
              </div>
            </div>
            <i className="bi bi-chevron-down text-secondary ms-1.5" style={{ fontSize: '0.72rem' }}></i>
          </button>

          {showUserDropdown && (
            <div
              className="position-absolute end-0 mt-2 bg-white shadow-lg border rounded-3 p-0"
              style={{
                width: '260px',
                zIndex: 1060,
                borderColor: '#E2E8F0',
                borderRadius: '14px',
                overflow: 'hidden'
              }}
            >
              <div
                className="p-3 border-bottom"
                style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
              >
                <div className="fw-bold text-dark text-truncate">{user?.institutionName || user?.name}</div>
                <div className="text-muted text-truncate small mb-2" style={{ fontSize: '0.75rem' }}>
                  {user?.email}
                </div>
                <div>
                  <span
                    className="badge rounded-pill fw-semibold"
                    style={{
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      border: '1px solid #BFDBFE',
                      padding: '4px 8px',
                      fontSize: '0.7rem'
                    }}
                  >
                    Level-1 Officer
                  </span>
                </div>
              </div>

              <div className="p-1.5">
                <Link
                  to="/institute/notifications"
                  className="dropdown-item py-2 px-3 rounded-2 d-flex align-items-center gap-2 text-dark small fw-semibold"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <i className="bi bi-bell text-warning" style={{ fontSize: '1rem' }}></i>
                  <span>Notification Center</span>
                </Link>
                <Link
                  to="/institute/feedback"
                  className="dropdown-item py-2 px-3 rounded-2 d-flex align-items-center gap-2 text-dark small fw-semibold"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <i className="bi bi-chat-square-text text-primary" style={{ fontSize: '1rem' }}></i>
                  <span>Feedback Desk</span>
                </Link>
              </div>

              <div className="border-top p-1.5" style={{ borderColor: '#E2E8F0' }}>
                <button
                  onClick={handleLogout}
                  className="dropdown-item py-2 px-3 rounded-2 d-flex align-items-center gap-2 text-danger small fw-semibold"
                >
                  <i className="bi bi-box-arrow-right" style={{ fontSize: '1rem' }}></i>
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
