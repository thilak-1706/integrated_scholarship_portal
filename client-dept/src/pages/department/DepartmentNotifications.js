import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import api from '../../services/api';
import { Bell, Info, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';

const DepartmentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/department/notifications');
        if (res.data.success) {
          setNotifications(res.data.notifications || []);
        }
      } catch (err) {
        console.error('Failed to load department notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <PortalLayout
      pageTitle="Department Officer Notifications"
      breadcrumbs={[{ label: 'Department Portal', link: '/department/dashboard' }, { label: 'Notifications' }]}
    >
      <div className="custom-card p-3 p-sm-4">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <h5 className="fw-bold text-dark mb-0">Department Officer Alerts</h5>
          <span className="badge bg-danger">
            {notifications.length} Alerts
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Bell size={48} className="mb-2 text-muted" />
            <p>No department alerts at this time.</p>
          </div>
        ) : (
          <div className="row g-3">
            {notifications.map((n) => (
              <div key={n._id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border rounded-4 shadow-sm bg-white transition-all">
                  <div className="card-body d-flex flex-column justify-content-between p-3 p-sm-4">
                    <div>
                      {/* Top Bar: Icon */}
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <div
                          className="p-2 rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor:
                              n.type === 'success'
                                ? 'rgba(22, 163, 74, 0.1)'
                                : n.type === 'danger'
                                ? 'rgba(220, 38, 38, 0.1)'
                                : 'rgba(220, 38, 38, 0.1)',
                            width: '36px',
                            height: '36px'
                          }}
                        >
                          {n.type === 'success' ? (
                            <CheckCircle2 size={18} className="text-success" />
                          ) : (
                            <AlertTriangle size={18} className="text-danger" />
                          )}
                        </div>
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                          Ministry Alert
                        </span>
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

                    {/* Footer: Date & Link */}
                    <div className="pt-2 border-top d-flex flex-wrap justify-content-between align-items-center gap-2 mt-auto" style={{ fontSize: '0.75rem' }}>
                      <span className="text-muted">
                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {n.link && (
                        <Link to={n.link} className="text-danger fw-bold text-decoration-none d-inline-flex align-items-center gap-1">
                          <span>Inspect</span>
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

export default DepartmentNotifications;
