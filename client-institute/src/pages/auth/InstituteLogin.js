import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  School,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Briefcase,
  Building,
  LogIn,
  UserPlus
} from 'lucide-react';
import api from '../../services/api';

const InstituteLogin = ({ initialMode }) => {
  const location = useLocation();
  const isRegisterRoute = initialMode === 'signup' || location.pathname.includes('register');
  const [activeTab, setActiveTab] = useState(isRegisterRoute ? 'signup' : 'signin');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up State
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Institutional Nodal Officer');
  const [institutionMode, setInstitutionMode] = useState('existing'); // 'existing' | 'new'
  const [existingInstitutions, setExistingInstitutions] = useState([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const [newInstitutionName, setNewInstitutionName] = useState('');
  const [newInstitutionCode, setNewInstitutionCode] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Chennai');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, registerInstitute } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await api.get('/auth/institutions');
        if (res.data.success && res.data.institutions.length > 0) {
          setExistingInstitutions(res.data.institutions);
          setSelectedInstitutionId(res.data.institutions[0]._id);
        }
      } catch (err) {
        console.error('Failed to load institutions list', err);
      }
    };
    fetchInstitutions();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await login(email, password, 'INSTITUTE_OFFICER');
    setLoading(false);

    if (res.success) {
      navigate('/institute/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (institutionMode === 'new' && (!newInstitutionName.trim() || !newInstitutionCode.trim())) {
      setError('Please provide institution name and AISHE/DISE code');
      return;
    }

    setLoading(true);

    const payload = {
      name,
      email: signupEmail,
      password: signupPassword,
      phone,
      designation,
      institutionMode,
      institutionId: institutionMode === 'existing' ? selectedInstitutionId : null,
      institutionName: institutionMode === 'new' ? newInstitutionName : '',
      institutionCode: institutionMode === 'new' ? newInstitutionCode : '',
      state,
      district
    };

    const res = await registerInstitute(payload);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Institute Officer account registered successfully! Redirecting...');
      setTimeout(() => {
        navigate('/institute/dashboard');
      }, 1000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between" style={{ backgroundColor: '#161307', color: '#f8fafc' }}>
      {/* Main Content */}
      <main className="container my-auto py-4 py-md-5 px-3 px-sm-4">
        {activeTab === 'signin' ? (
          /* ==================== SIGN IN VIEW (Equal Left Height) ==================== */
          <div className="row justify-content-center align-items-center g-4">
            {/* Left Hero Box (Visible on both mobile & desktop) */}
            <div className="col-12 col-lg-6 text-light pe-lg-5 mb-4 mb-lg-0">
              <div className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25 px-3 py-2 rounded-pill mb-3 fw-semibold">
                🏫 Institutional Verification Gateway
              </div>
              <h1 className="fw-extrabold display-5 mb-3 text-white">
                Institutional <span className="text-warning">Verification</span> Portal
              </h1>
              <p className="lead text-secondary mb-4 fs-6">
                Designated nodal officer desk for verifying applicant enrollment, academic records, and bona fide certification before forwarding to State/Central Departments.
              </p>

              <div className="d-flex flex-column gap-3 mb-0">
                <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <CheckCircle2 size={20} className="text-warning flex-shrink-0" />
                  <span className="small">Verify Student Enrollment & Marksheets Digitally</span>
                </div>
                <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <CheckCircle2 size={20} className="text-warning flex-shrink-0" />
                  <span className="small">One-Click Application Endorsement & Defect Rejection</span>
                </div>
                <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <CheckCircle2 size={20} className="text-warning flex-shrink-0" />
                  <span className="small">Real-time Institutional Application Roster & Analytics</span>
                </div>
              </div>
            </div>

            {/* Right Card: Sign In with Tabs */}
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="custom-card p-3 p-sm-4 p-md-5 bg-white shadow-2xl border-0 rounded-4 text-dark">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 bg-warning text-dark shadow-sm flex-shrink-0">
                    <School size={28} />
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark mb-0 fs-5 fs-sm-4">Institute Sign In</h4>
                    <span className="text-muted small">College / University Verification Desk</span>
                  </div>
                </div>

                {/* Sign In / Sign Up Tabs */}
                <div className="d-flex p-1 bg-light rounded-3 mb-4 border">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); setError(''); }}
                    className="btn btn-sm w-50 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2 btn-warning shadow-sm text-dark"
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
                    <label className="form-label small fw-semibold text-dark">Institutional Official Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Mail size={18} />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter registered institutional email"
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
                    className="btn btn-warning w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm text-dark"
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Institute Portal'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="mt-4 pt-3 border-top text-center">
                  <span className="text-muted small">New Institutional Officer? </span>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signup'); setError(''); }}
                    className="btn btn-link p-0 small text-warning-emphasis fw-bold text-decoration-none"
                  >
                    Register for Institute Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==================== SIGN UP VIEW (Centered Blank Form Like Student Portal) ==================== */
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8" style={{ maxWidth: '780px' }}>
              <div className="custom-card p-3 p-sm-4 p-md-5 bg-white shadow-lg border-0 rounded-4 text-dark">
                {/* Centered Circular Icon */}
                <div className="text-center mb-3">
                  <div className="d-inline-flex p-3 rounded-circle bg-warning text-dark shadow-sm mb-2">
                    <School size={32} />
                  </div>
                  <h4 className="fw-bold text-dark mb-1 fs-5 fs-sm-4">Institute Portal Registration</h4>
                  <p className="text-muted small mb-0">Create your institute verification account to verify student grants</p>
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
                    className="btn btn-sm w-50 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2 btn-warning shadow-sm text-dark"
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

                {/* 2-Column Form Like Student Portal Picture 2 */}
                <form onSubmit={handleSignupSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Officer Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><User size={16} /></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Dr. S. Ramanathan"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Official Institutional Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Mail size={16} /></span>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="e.g. nodal.officer@institution.edu.in"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
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
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Official Designation</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Briefcase size={16} /></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Nodal Verification Officer"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Institution Affiliation Selector */}
                    <div className="col-12">
                      <div className="p-3 rounded-3 bg-light border">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label small fw-semibold text-dark mb-0">
                            Institution Affiliation
                          </label>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              onClick={() => setInstitutionMode('existing')}
                              className={`btn btn-sm px-3 py-1 rounded-pill ${
                                institutionMode === 'existing' ? 'btn-dark text-white fw-semibold' : 'btn-outline-secondary'
                              }`}
                              style={{ fontSize: '0.75rem' }}
                            >
                              Select Existing College
                            </button>
                            <button
                              type="button"
                              onClick={() => setInstitutionMode('new')}
                              className={`btn btn-sm px-3 py-1 rounded-pill ${
                                institutionMode === 'new' ? 'btn-dark text-white fw-semibold' : 'btn-outline-secondary'
                              }`}
                              style={{ fontSize: '0.75rem' }}
                            >
                              + Register New College
                            </button>
                          </div>
                        </div>

                        {institutionMode === 'existing' ? (
                          <select
                            className="form-select"
                            value={selectedInstitutionId}
                            onChange={(e) => setSelectedInstitutionId(e.target.value)}
                          >
                            {existingInstitutions.map((inst) => (
                              <option key={inst._id} value={inst._id}>
                                {inst.name} ({inst.code}) - {inst.state}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="d-flex flex-column gap-2 mt-2">
                            <div className="input-group">
                              <span className="input-group-text bg-white"><Building size={16} /></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="College / University Name"
                                value={newInstitutionName}
                                onChange={(e) => setNewInstitutionName(e.target.value)}
                                required={institutionMode === 'new'}
                              />
                            </div>
                            <div className="row g-2">
                              <div className="col-6">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="AISHE Code (e.g. C-12345)"
                                  value={newInstitutionCode}
                                  onChange={(e) => setNewInstitutionCode(e.target.value)}
                                  required={institutionMode === 'new'}
                                />
                              </div>
                              <div className="col-6">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="District / City"
                                  value={district}
                                  onChange={(e) => setDistrict(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Lock size={16} /></span>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Min 6 characters"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
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
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-warning w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm text-dark mt-4"
                  >
                    {loading ? 'Creating Account...' : 'Complete Institute Registration'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="mt-4 pt-3 border-top text-center">
                  <span className="text-muted small">Already registered? </span>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); setError(''); }}
                    className="btn btn-link p-0 small text-warning-emphasis fw-bold text-decoration-none"
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
        National Scholarship Portal &bull; Institutional Verification Division &bull; Ministry of Education
      </footer>
    </div>
  );
};

export default InstituteLogin;
