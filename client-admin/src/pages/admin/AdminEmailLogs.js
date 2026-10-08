import React, { useState, useEffect } from 'react';
import PortalLayout from '../../components/layout/PortalLayout';
import api from '../../services/api';
import { Mail, Search, RefreshCw, CheckCircle, AlertTriangle, FileText, ExternalLink } from 'lucide-react';

const AdminEmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [retryingId, setRetryingId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/admin/email-logs', { params });
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load email logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleRetryEmail = async (logId) => {
    setRetryingId(logId);
    setActionFeedback({ type: '', message: '' });
    try {
      const res = await api.post(`/admin/email-logs/${logId}/retry`);
      if (res.data.success) {
        setActionFeedback({
          type: 'success',
          message: 'Sanction approved email re-dispatched successfully!'
        });
        fetchLogs();
      } else {
        setActionFeedback({
          type: 'danger',
          message: res.data.message || res.data.error || 'Retry failed'
        });
      }
    } catch (err) {
      setActionFeedback({
        type: 'danger',
        message: err.response?.data?.message || err.message || 'Retry failed'
      });
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <PortalLayout
      pageTitle="Automated Sanction Email Dispatch Monitor"
      breadcrumbs={[{ label: 'Admin Portal', link: '/admin/dashboard' }, { label: 'Email Dispatches' }]}
    >
      <div className="custom-card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Sanction Order Email Dispatch Trail</h5>
            <span className="text-muted small">
              Monitors automated statutory sanction order email deliveries with attached PDF copies and provides administrative retry capability.
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search Student, App #, Sanction #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '130px' }}
            >
              <option value="All">All Statuses</option>
              <option value="SENT">SENT</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
            <button type="submit" className="btn btn-primary d-flex align-items-center gap-1">
              <Search size={16} />
              <span>Filter</span>
            </button>
          </form>
        </div>
      </div>

      {actionFeedback.message && (
        <div className={`alert alert-${actionFeedback.type} py-2.5 mb-4 d-flex align-items-center gap-2`}>
          {actionFeedback.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : logs.length === 0 ? (
        <div className="custom-card p-5 text-center text-muted">
          <Mail size={48} className="mb-2 text-muted" />
          <h5>No email dispatches recorded</h5>
          <p className="small">Automated emails are triggered when Department Officers generate Sanction Orders.</p>
        </div>
      ) : (
        <div className="custom-card p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr style={{ fontSize: '0.8rem' }}>
                  <th>Date & Time</th>
                  <th>Student</th>
                  <th>Application Number</th>
                  <th>Sanction Number</th>
                  <th>Recipient Email</th>
                  <th>Email Status</th>
                  <th>Attachment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} style={{ fontSize: '0.85rem' }}>
                    <td className="text-muted text-nowrap">
                      {new Date(log.sentAt || log.createdAt).toLocaleDateString()}{' '}
                      {new Date(log.sentAt || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="fw-semibold text-dark">{log.studentName || 'Student'}</td>
                    <td className="fw-bold text-primary">{log.applicationNumber}</td>
                    <td className="fw-bold text-dark text-nowrap">{log.sanctionNumber}</td>
                    <td className="text-secondary">{log.recipient}</td>
                    <td>
                      {log.status === 'SENT' ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold px-2 py-1">
                          SENT
                        </span>
                      ) : log.status === 'PENDING' ? (
                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle fw-bold px-2 py-1">
                          PENDING
                        </span>
                      ) : (
                        <div>
                          <span
                            className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold px-2 py-1 d-inline-block"
                            title={log.errorMessage || 'Dispatch failed'}
                          >
                            FAILED
                          </span>
                          {log.errorCode && (
                            <div className="text-danger small mt-0.5" style={{ fontSize: '0.7rem' }}>
                              {log.errorCode}
                            </div>
                          )}
                        </div>
                      )}
                      {log.retryCount > 0 && (
                        <span className="badge bg-light text-muted border ms-1" title="Retry attempts">
                          +{log.retryCount}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="d-inline-flex align-items-center gap-1 text-primary small fw-semibold">
                        <FileText size={14} />
                        <span className="text-truncate" style={{ maxWidth: '170px' }}>
                          {log.attachmentName || `Sanction_Order_${log.sanctionNumber}.pdf`}
                        </span>
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {log.status === 'FAILED' ? (
                          <button
                            onClick={() => handleRetryEmail(log._id)}
                            disabled={retryingId === log._id}
                            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 fw-bold"
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          >
                            <RefreshCw size={12} className={retryingId === log._id ? 'spin' : ''} />
                            <span>{retryingId === log._id ? 'Retrying...' : 'RETRY EMAIL'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRetryEmail(log._id)}
                            disabled={retryingId === log._id}
                            className="btn btn-light btn-sm text-secondary d-flex align-items-center gap-1"
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                            title="Resend email"
                          >
                            <RefreshCw size={11} className={retryingId === log._id ? 'spin' : ''} />
                            <span>Resend</span>
                          </button>
                        )}

                        {log.previewUrl && (
                          <a
                            href={log.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-light btn-sm text-primary"
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                            title="View Ethereal Preview"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

export default AdminEmailLogs;
