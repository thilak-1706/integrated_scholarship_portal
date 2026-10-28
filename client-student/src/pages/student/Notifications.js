import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import api from '../../services/api';
import { Bell, Check, ExternalLink, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/student/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/student/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  return (
    <PortalLayout
      pageTitle="Notifications & System Alerts"
      breadcrumbs={[{ label: 'Student Portal', link: '/student/dashboard' }, { label: 'Notifications' }]}
    >
      <div className="custom-card p-3 p-sm-4">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <h5 className="fw-bold text-dark mb-0">Notification Inbox</h5>
          <span className="badge bg-primary">
            {notifications.filter((n) => !n.isRead).length} Unread
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Bell size={48} className="mb-2 text-muted" />
            <p>You have no notifications at this time.</p>
          </div>
        ) : (
          <div className="row g-3">
            {notifications.map((n) => (
              <div key={n._id} className="col-12 col-md-6 col-lg-4">
                <div
                  className={`card h-100 border rounded-4 shadow-sm transition-all position-relative ${
                    n.isRead ? 'bg-white' : 'bg-light border-primary'
                  }`}
                  style={{
                    borderLeft: !n.isRead ? '4px solid #10b981' : undefined,
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-between p-3 p-sm-4">
                    <div>
                      {/* Top Bar: Icon + Badge + Mark Read */}
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="p-2 rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor:
                                n.type === 'success'
                                  ? 'rgba(22, 163, 74, 0.1)'
                                  : n.type === 'warning'
                                  ? 'rgba(234, 179, 8, 0.1)'
                                  : n.type === 'danger'
                                  ? 'rgba(220, 38, 38, 0.1)'
                                  : 'rgba(16, 185, 129, 0.15)',
                              width: '36px',
                              height: '36px'
                            }}
                          >
                            {n.type === 'success' && <CheckCircle2 size={18} className="text-success" />}
                            {n.type === 'warning' && <AlertTriangle size={18} className="text-warning" />}
                            {n.type === 'danger' && <AlertTriangle size={18} className="text-danger" />}
                            {(!n.type || n.type === 'info') && <Info size={18} className="text-success" />}
                          </div>
                          {!n.isRead && (
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                              Unread
                            </span>
                          )}
                        </div>

                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="btn btn-sm btn-outline-secondary py-1 px-2 d-flex align-items-center gap-1 rounded-pill flex-shrink-0"
                            style={{ fontSize: '0.72rem' }}
                            title="Mark as Read"
                          >
                            <Check size={12} />
                            <span>Mark Read</span>
                          </button>
                        )}
                      </div>

                      {/* Notification Title */}
                      <h6 className="fw-bold text-dark mb-2 text-break" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {n.title}
                      </h6>

                      {/* Notification Message */}
                      <p className="text-muted mb-3 text-break" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                        {n.message}
                      </p>
                    </div>

                    {/* Footer: Date & View Details Link */}
                    <div className="pt-2 border-top d-flex flex-wrap justify-content-between align-items-center gap-2 mt-auto" style={{ fontSize: '0.75rem' }}>
                      <span className="text-muted">
                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {n.link && (
                        <Link to={n.link} className="text-primary text-decoration-none fw-semibold d-inline-flex align-items-center gap-1">
                          <span>View Details</span>
                          <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default Notifications;
