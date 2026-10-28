import React, { useState, useEffect } from 'react';
import PortalLayout from '../../components/layout/PortalLayout';
import api from '../../services/api';
import { Bell, Send, CheckCircle, Info, Megaphone, User } from 'lucide-react';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRole, setBroadcastRole] = useState('ALL');
  const [targetStudentEmail, setTargetStudentEmail] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchNotifications();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      if (res.data.success) {
        setStudentsList(res.data.students || []);
      }
    } catch (err) {
      console.error('Failed to load students list:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load admin notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBroadcasting(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        recipientRole: broadcastRole,
        title: broadcastTitle,
        message: broadcastMessage,
        type: 'info'
      };

      if (broadcastRole === 'PARTICULAR_STUDENT') {
        payload.studentEmail = targetStudentEmail.trim();
      }

      const res = await api.post('/admin/notifications/broadcast', payload);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || 'Notification dispatched successfully!'
        });
        setBroadcastTitle('');
        setBroadcastMessage('');
        setTargetStudentEmail('');
        fetchNotifications();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send notification.';
      setFeedback({ type: 'danger', message: msg });
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <PortalLayout
      pageTitle="System Alerts & Broadcast Notifications"
      breadcrumbs={[{ label: 'Admin Portal', link: '/admin/dashboard' }, { label: 'Notifications' }]}
    >
      <div className="row g-4">
        {/* Left: Broadcast Form */}
        <div className="col-12 col-lg-5 col-xl-4">
          <div className="custom-card p-4 h-100">
            <h5 className="fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center gap-2">
              <Megaphone size={18} style={{ color: '#ec4899' }} />
              <span>Send Notification</span>
            </h5>

            {feedback.message && (
              <div className={`alert alert-${feedback.type} py-2 small d-flex align-items-center gap-2 mb-3`}>
                <CheckCircle size={16} />
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Target Audience</label>
                <select
                  className="form-select"
                  value={broadcastRole}
                  onChange={(e) => setBroadcastRole(e.target.value)}
                >
                  <option value="ALL">All Users (Students & Officers)</option>
                  <option value="STUDENT">All Students (Public Announcement)</option>
                  <option value="PARTICULAR_STUDENT">Particular Student (Individual Notice)</option>
                  <option value="INSTITUTE_OFFICER">Institute Officers Only</option>
                  <option value="DEPARTMENT_OFFICER">Department Officers Only</option>
                </select>
              </div>

              {broadcastRole === 'PARTICULAR_STUDENT' && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-danger">Target Student (Email or App No) *</label>
                  <input
                    type="text"
                    className="form-control"
                    list="registered-students-list"
                    placeholder="e.g. student@gmail.com or APP-2026-..."
                    value={targetStudentEmail}
                    onChange={(e) => setTargetStudentEmail(e.target.value)}
                    required
                  />
                  <datalist id="registered-students-list">
                    {studentsList.map((s) => (
                      <option key={s._id} value={s.email}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </datalist>
                  <div className="form-text small" style={{ fontSize: '0.75rem' }}>
                    This notification will be delivered <strong>strictly to this student only</strong>.
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold">Notification Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Scheme Application Deadline Extended"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Message Body</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter detailed notification message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                style={{ backgroundColor: '#ec4899', borderColor: '#ec4899' }}
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm text-white py-2"
              >
                <Send size={15} />
                <span>{broadcasting ? 'Dispatching...' : 'Dispatch Notification'}</span>
              </button>
            </form>
          </div>
        </div>


        {/* Right: Notification Feed (1 line contains 2 cards) */}
        <div className="col-12 col-lg-7 col-xl-8">
          <div className="custom-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4">
              <h5 className="fw-bold text-dark mb-0">Admin Notification Feed</h5>
              <span className="badge" style={{ backgroundColor: '#ec4899', color: '#fff' }}>
                {notifications.length} Total
              </span>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-muted small py-4 text-center">No notifications at this time.</p>
            ) : (
              <div className="row g-3">
                {notifications.map((n) => (
                  <div key={n._id} className="col-12 col-md-6">
                    <div className="card h-100 border rounded-4 shadow-sm bg-white transition-all">
                      <div className="card-body d-flex flex-column justify-content-between p-3 p-sm-4">
                        <div>
                          <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="p-2 rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                                style={{
                                  backgroundColor: 'rgba(236, 72, 153, 0.15)',
                                  width: '36px',
                                  height: '36px'
                                }}
                              >
                                <Megaphone size={18} style={{ color: '#ec4899' }} />
                              </div>
                              {n.studentEmail || n.studentName || n.userId ? (
                                <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                  Target: {n.studentName || n.studentEmail || 'Particular Student'}
                                </span>
                              ) : (
                                <span className="badge bg-secondary bg-opacity-25 text-dark rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                  Audience: {n.recipientRole || 'ALL'}
                                </span>
                              )}
                            </div>
                          </div>

                          <h6 className="fw-bold text-dark mb-2 text-break" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                            {n.title}
                          </h6>

                          <p className="text-muted mb-3 text-break" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                            {n.message}
                          </p>
                        </div>

                        <div className="pt-2 border-top d-flex justify-content-between align-items-center gap-2 mt-auto" style={{ fontSize: '0.75rem' }}>
                          <span className="text-muted">
                            {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AdminNotifications;
