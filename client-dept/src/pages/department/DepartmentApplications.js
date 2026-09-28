import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';
import { FileText, Search, ShieldCheck, Eye, Award } from 'lucide-react';

const DepartmentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/department/applications', { params });
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to fetch department applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  return (
    <PortalLayout
      pageTitle="Department Scrutiny & Approval Applications"
      breadcrumbs={[{ label: 'Department Portal', link: '/department/dashboard' }, { label: 'Applications' }]}
    >
      <div className="custom-card p-3 p-sm-4 mb-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-5 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search application number, student, college..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4 col-lg-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Department Statuses</option>
                <option value="ROUTED_TO_DEPARTMENT">Incoming Scrutiny (ROUTED_TO_DEPARTMENT)</option>
                <option value="APPROVED">Approved (Pending Sanction)</option>
                <option value="SANCTIONED">Sanctioned (Pending DBT)</option>
                <option value="DISBURSED">Disbursed (Completed)</option>
                <option value="CORRECTION_REQUIRED">Correction Requested</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="col-12 col-md-3 col-lg-3">
              <button type="submit" className="btn btn-primary w-100">
                Filter Queue
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : applications.length === 0 ? (
        <div className="custom-card p-4 p-sm-5 text-center text-muted">
          <FileText size={48} className="mb-2 text-muted" />
          <h5>No applications found</h5>
          <p className="small">No applications match your status filter criteria.</p>
        </div>
      ) : (
        <div className="custom-card p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: '720px' }}>
              <thead className="table-light">
                <tr style={{ fontSize: '0.8rem' }}>
                  <th>Application Number</th>
                  <th>Student Name</th>
                  <th>Scholarship Scheme</th>
                  <th>Institution / College</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Grant Amount</th>
                  <th className="text-end pe-4">Scrutiny Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} style={{ fontSize: '0.88rem' }}>
                    <td className="fw-bold text-primary text-break">{app.applicationNumber}</td>
                    <td>
                      <div className="fw-semibold text-dark">{app.studentName}</div>
                      <span className="text-muted small text-break">{app.studentEmail}</span>
                    </td>
                    <td className="text-dark text-truncate" style={{ maxWidth: '200px' }}>{app.scholarshipName}</td>
                    <td className="text-muted small text-truncate" style={{ maxWidth: '180px' }}>{app.institutionName}</td>
                    <td className="text-muted">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      {app.approvedAmount > 0 ? (
                        <span className="fw-bold text-success">₹{app.approvedAmount.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-muted">₹{app.requestedAmount?.toLocaleString('en-IN')} (Req)</span>
                      )}
                    </td>
                    <td className="text-end pe-4">
                      {['ROUTED_TO_DEPARTMENT', 'DEPARTMENT_VERIFICATION'].includes(app.status) ? (
                        <Link
                          to={`/department/applications/${app._id}`}
                          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm fw-semibold"
                        >
                          <ShieldCheck size={15} />
                          <span>Scrutinize</span>
                        </Link>
                      ) : app.status === 'APPROVED' ? (
                        <Link
                          to="/department/sanctions"
                          className="btn btn-sm btn-warning d-inline-flex align-items-center gap-1 fw-semibold"
                        >
                          <Award size={15} />
                          <span>Sanction</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/department/applications/${app._id}`}
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                        >
                          <Eye size={15} />
                          <span>View</span>
                        </Link>
                      )}
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

export default DepartmentApplications;
