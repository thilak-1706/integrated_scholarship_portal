import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Building2,
  LogIn,
  UserPlus
} from 'lucide-react';
import api from '../../services/api';

const StudentLogin = ({ initialMode }) => {
  const location = useLocation();
  const isRegisterRoute = initialMode === 'signup' || location.pathname.includes('register');
  const [activeTab, setActiveTab] = useState(isRegisterRoute ? 'signup' : 'signin');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up State
  const [institutions, setInstitutions] = useState([]);
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    institutionId: '',
    course: 'B.Tech in Computer Science',
    gender: 'Male',
    category: 'General'
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, registerStudent } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await api.get('/auth/institutions');
        if (res.data.success && res.data.institutions.length > 0) {
          setInstitutions(res.data.institutions);
          setSignupData((prev) => ({ ...prev, institutionId: res.data.institutions[0]._id }));
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchInstitutions();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await login(email, password, 'STUDENT');
    setLoading(false);

    if (res.success) {
      navigate('/student/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const res = await registerStudent(signupData);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between" style={{ backgroundColor: '#061a12', color: '#f8fafc' }}>
      {/* Main Content */}
      <main className="container my-auto py-4 py-md-5 px-3 px-sm-4">
        {activeTab === 'signin' ? (
          /* ==================== SIGN IN SPLIT VIEW ==================== */
          <div className="row justify-content-center align-items-center g-4">
            {/* Left Hero Box (Visible on both mobile & desktop) */}
            <div className="col-12 col-lg-6 text-light pe-lg-5 mb-4 mb-lg-0">
              <div className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill mb-3 fw-semibold">
                🎓 Student Direct Benefits Portal
              </div>
              <h1 className="fw-extrabold display-5 mb-3 text-white">
                Unlock Your Academic <span className="text-success">Potential</span>
              </h1>
              <p className="lead text-secondary mb-4 fs-6">
                Apply for government, corporate, and institutional scholarships. Track your application verification status in real time and receive direct DBT bank transfers.
              </p>

              <div className="d-flex flex-column gap-3 mb-0">
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

            {/* Right Card: Sign In with Tabs */}
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="custom-card p-3 p-sm-4 p-md-5 bg-white shadow-2xl border-0 rounded-4 text-dark">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 bg-success text-white shadow-sm flex-shrink-0">
                    <GraduationCap size={28} />
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark mb-0 fs-5 fs-sm-4">Student Sign In</h4>
                    <span className="text-muted small">Applicant & Beneficiary Account</span>
                  </div>
                </div>

                {/* Sign In / Sign Up Tabs */}
                <div className="d-flex p-1 bg-light rounded-3 mb-4 border">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); setError(''); }}
                    className="btn btn-sm w-50 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2 btn-success shadow-sm text-white"
                  >
                    <LogIn size={15} />
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signup'); setError(''); }}
                    className="btn btn-sm w-50 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2 text-muted border-0 bg-transparent"
                  >
                    <UserPlus size={15} />
                    Sign Up
                  </button>
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
                    className="btn btn-success w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm text-white"
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Student Portal'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="mt-4 pt-3 border-top text-center">
                  <span className="text-muted small">New Applicant? </span>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signup'); setError(''); }}
                    className="btn btn-link p-0 small text-success fw-bold text-decoration-none"
                  >
                    Register for Student Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==================== SIGN UP CENTERED VIEW (Picture 2) ==================== */
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8" style={{ maxWidth: '780px' }}>
              <div className="custom-card p-3 p-sm-4 p-md-5 bg-white shadow-lg border-0 rounded-4 text-dark">
                {/* Centered Circular Icon */}
                <div className="text-center mb-3">
                  <div className="d-inline-flex p-3 rounded-circle bg-success text-white shadow-sm mb-2">
                    <GraduationCap size={32} />
                  </div>
                  <h4 className="fw-bold text-dark mb-1 fs-5 fs-sm-4">Student Portal Registration</h4>
                  <p className="text-muted small mb-0">Create your national scholarship account to apply and track grants</p>
                </div>

                {/* Sign In / Sign Up Tabs */}
                <div className="d-flex p-1 bg-light rounded-3 mb-4 border mx-auto" style={{ maxWidth: '340px' }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); setError(''); }}
                    className="btn btn-sm w-50 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2 text-muted border-0 bg-transparent"
                  >
                    <LogIn size={15} />
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signup'); setError(''); }}
                    className="btn btn-sm w-50 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2 btn-success shadow-sm text-white"
                  >
                    <UserPlus size={15} />
                    Sign Up
                  </button>
                </div>

                {error && (
                  <div className="alert alert-danger py-2 small mb-4 d-flex align-items-center gap-2">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="alert alert-success py-2 small mb-4 d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSignupSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Full Name (as per Aadhaar)</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><User size={16} /></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your full name"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Mail size={16} /></span>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="e.g. student@college.edu"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Phone size={16} /></span>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="e.g. 9876543210"
                          value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Enrolled Institution / College</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Building2 size={16} /></span>
                        <select
                          className="form-select"
                          value={signupData.institutionId}
                          onChange={(e) => setSignupData({ ...signupData, institutionId: e.target.value })}
                        >
                          {institutions.length > 0 ? (
                            institutions.map((inst) => (
                              <option key={inst._id} value={inst._id}>
                                {inst.name} ({inst.code})
                              </option>
                            ))
                          ) : (
                            <option value="">National Institute of Technology (NIT Delhi)</option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Current Course / Degree</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. B.Tech in Computer Science"
                        value={signupData.course}
                        onChange={(e) => setSignupData({ ...signupData, course: e.target.value })}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small fw-semibold">Gender</label>
                      <select
                        className="form-select"
                        value={signupData.gender}
                        onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        className="form-select"
                        value={signupData.category}
                        onChange={(e) => setSignupData({ ...signupData, category: e.target.value })}
                      >
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Lock size={16} /></span>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Min 6 characters"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Confirm Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Lock size={16} /></span>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Re-enter password"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm text-white mt-4"
                  >
                    {loading ? 'Registering...' : 'Complete Student Registration'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="mt-4 pt-3 border-top text-center">
                  <span className="text-muted small">Already registered? </span>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); setError(''); }}
                    className="btn btn-link p-0 small text-success fw-bold text-decoration-none"
                  >
                    Sign in here
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-3 text-center text-secondary small border-top border-secondary-subtle">
        National Scholarship Portal &bull; Student Services Division &bull; Ministry of Electronics and IT
      </footer>
    </div>
  );
};

export default StudentLogin;
