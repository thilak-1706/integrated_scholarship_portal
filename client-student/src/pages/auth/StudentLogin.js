import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';


const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password, 'STUDENT');
    setLoading(false);

    if (res.success) {
      navigate('/student/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between" style={{ backgroundColor: '#0b1329', color: '#f8fafc' }}>
      {/* Main Content */}
      <main className="container my-auto py-4 py-md-5 px-3 px-sm-4">
        <div className="row justify-content-center align-items-center g-4">

          {/* Left Hero Box (Desktop) */}
          <div className="col-12 col-lg-6 text-light d-none d-lg-block pe-lg-5">
            <div className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill mb-3 fw-semibold">
              🎓 Student Direct Benefits Portal
            </div>
            <h1 className="fw-extrabold display-5 mb-3 text-white">
              Unlock Your Academic <span className="text-primary">Potential</span>
            </h1>
            <p className="lead text-secondary mb-4 fs-6">
              Apply for government, corporate, and institutional scholarships. Track your application verification status in real time and receive direct DBT bank transfers.
            </p>

            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <CheckCircle2 size={20} className="text-success flex-shrink-0" />
                <span className="small">Unified Multi-Scheme Application via Single Form</span>
              </div>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <CheckCircle2 size={20} className="text-success flex-shrink-0" />
                <span className="small">Direct Benefit Transfer (DBT) Directly to Bank Account</span>
              </div>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <CheckCircle2 size={20} className="text-success flex-shrink-0" />
                <span className="small">Transparent Institutional & Departmental Verification Status</span>
              </div>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="custom-card p-3 p-sm-4 p-md-5 bg-white shadow-2xl border-0 rounded-4 text-dark">

              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="p-3 rounded-3 bg-primary text-white shadow-sm flex-shrink-0">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h4 className="fw-bold text-dark mb-0 fs-5 fs-sm-4">Student Sign In</h4>
                  <span className="text-muted small">Applicant & Beneficiary Account</span>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Student Email ID</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="Enter registered student email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-dark mb-0">Password</label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0 ps-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Student Portal'}
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-4 pt-3 border-top text-center">
                <span className="text-muted small">New Applicant? </span>
                <Link to="/register" className="small text-primary fw-bold text-decoration-none">
                  Register for Student Account
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-3 text-center text-secondary small border-top border-secondary-subtle">
        National Scholarship Portal &bull; Student Services Division &bull; Ministry of Electronics and IT
      </footer>
    </div>
  );
};

export default StudentLogin;
