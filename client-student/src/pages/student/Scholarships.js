import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import api from '../../services/api';
import { 
  Search, 
  GraduationCap, 
  Calendar, 
  ArrowRight
} from 'lucide-react';

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [providerType, setProviderType] = useState('All');
  const [educationLevel, setEducationLevel] = useState('All');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchScholarships();
  }, [providerType, educationLevel, category]);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (providerType !== 'All') params.providerType = providerType;
      if (educationLevel !== 'All') params.educationLevel = educationLevel;
      if (category !== 'All') params.category = category;

      const res = await api.get('/student/scholarships', { params });
      if (res.data.success) {
        setScholarships(res.data.scholarships || []);
      }
    } catch (err) {
      console.error('Failed to fetch scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchScholarships();
  };

  return (
    <PortalLayout
      pageTitle="Explore National Scholarships"
      breadcrumbs={[{ label: 'Student Portal', link: '/student/dashboard' }, { label: 'Scholarships' }]}
    >
      {/* Search & Filter Bar */}
      <div className="custom-card p-3 p-sm-4 mb-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-3">
            <div className="col-12 col-lg-5">
              <label className="form-label small fw-semibold text-muted">Search by Scheme or Keyword</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="e.g. Central Sector, Merit, AICTE, Tata..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label small fw-semibold text-muted">Provider Type</label>
              <select
                className="form-select"
                value={providerType}
                onChange={(e) => setProviderType(e.target.value)}
              >
                <option value="All">All Providers</option>
                <option value="GOVERNMENT">Government</option>
                <option value="PRIVATE">Private Trust</option>
                <option value="CORPORATE">Corporate CSR</option>
                <option value="NGO">NGO Scheme</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label small fw-semibold text-muted">Education Level</label>
              <select
                className="form-select"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
              >
                <option value="All">All Levels</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Class 11-12">Class 11-12</option>
                <option value="Doctorate / Ph.D">Doctorate / Ph.D</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label small fw-semibold text-muted">Category Quota</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-1 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-1">
                <Search size={18} />
                <span className="d-lg-none small">Search</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Scholarship Catalog Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="custom-card p-5 text-center text-muted">
          <GraduationCap size={48} className="mb-2 text-muted" />
          <h5>No scholarships match your filter criteria</h5>
          <p className="small">Try resetting your filters or search keyword.</p>
          <button
            onClick={() => {
              setSearch('');
              setProviderType('All');
              setEducationLevel('All');
              setCategory('All');
            }}
            className="btn btn-outline-primary btn-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {scholarships.map((sch) => (
            <div key={sch._id} className="col-12 col-md-6 col-xl-4">
              <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span
                      className={`badge ${
                        sch.providerType === 'GOVERNMENT'
                          ? 'bg-primary-subtle text-primary border border-primary-subtle'
                          : sch.providerType === 'PRIVATE'
                          ? 'bg-purple-subtle text-purple border'
                          : 'bg-success-subtle text-success border border-success-subtle'
                      }`}
                      style={sch.providerType === 'PRIVATE' ? { backgroundColor: '#ede9fe', color: '#6d28d9' } : {}}
                    >
                      {sch.providerType}
                    </span>
                    <span className="badge bg-light text-secondary border">
                      Code: {sch.code}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2 line-clamp-2" style={{ minHeight: '48px' }}>
                    {sch.name}
                  </h5>

                  <p className="text-muted small mb-3 line-clamp-2" style={{ minHeight: '38px' }}>
                    {sch.description || 'Provides financial grant support for deserving students.'}
                  </p>

                  <div className="bg-light p-2.5 rounded-3 mb-3" style={{ fontSize: '0.8rem' }}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Grant Amount:</span>
                      <span className="fw-bold text-success">{sch.amountDisplay || `₹${sch.scholarshipAmount?.toLocaleString('en-IN')}`}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Education Level:</span>
                      <span className="fw-semibold text-dark">{sch.educationLevel}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Department:</span>
                      <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: '140px' }}>
                        {sch.departmentName || sch.departmentId?.name || 'Department'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="d-flex align-items-center gap-1 text-danger small fw-semibold mb-3">
                    <Calendar size={14} />
                    <span>Deadline: {new Date(sch.deadline).toLocaleDateString()}</span>
                  </div>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/student/scholarships/${sch._id}`}
                      className="btn btn-outline-secondary btn-sm flex-grow-1"
                    >
                      View Scheme
                    </Link>
                    <Link
                      to={`/student/apply/${sch._id}`}
                      className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                    >
                      <span>Apply Now</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
};

export default Scholarships;
