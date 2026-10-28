import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Landmark,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Briefcase,
  Building2,
  LogIn,
  UserPlus
} from 'lucide-react';
import api from '../../services/api';

const DepartmentLogin = ({ initialMode }) => {
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
  const [designation, setDesignation] = useState('Ministry Scheme Approval Officer');
  const [departmentMode, setDepartmentMode] = useState('existing'); // 'existing' | 'new'
  const [existingDepartments, setExistingDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentCode, setNewDepartmentCode] = useState('');
  const [departmentType, setDepartmentType] = useState('GOVERNMENT');
  const [provider, setProvider] = useState('Ministry of Education & Welfare, Govt of India');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, registerDepartment } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/auth/departments');
        if (res.data.success && res.data.departments.length > 0) {
          setExistingDepartments(res.data.departments);
          setSelectedDepartmentId(res.data.departments[0]._id);
        }
      } catch (err) {
        console.error('Failed to load departments list', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await login(email, password, 'DEPARTMENT_OFFICER');
    setLoading(false);

    if (res.success) {
      navigate('/department/dashboard');
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

    if (departmentMode === 'new' && (!newDepartmentName.trim() || !newDepartmentCode.trim())) {
      setError('Please provide department name and department code');
      return;
    }

    setLoading(true);

    const payload = {
      name,
      email: signupEmail,
      password: signupPassword,
      phone,
      designation,
      departmentMode,
      departmentId: departmentMode === 'existing' ? selectedDepartmentId : null,
      departmentName: departmentMode === 'new' ? newDepartmentName : '',
      departmentCode: departmentMode === 'new' ? newDepartmentCode : '',
      departmentType,
      provider
    };

    const res = await registerDepartment(payload);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Department Officer account registered successfully! Redirecting...');
      setTimeout(() => {
        navigate('/department/dashboard');
      }, 1000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between" style={{ backgroundColor: '#1a090d', color: '#f8fafc' }}>
      {/* Main Content */}
      <main className="container my-auto py-4 py-md-5 px-3 px-sm-4">
        {activeTab === 'signin' ? (
          /* ==================== SIGN IN VIEW (Equal Left Height) ==================== */
          <div className="row justify-content-center align-items-center g-4">
            {/* Left Hero Box (Visible on both mobile & desktop) */}
            <div className="col-12 col-lg-6 text-light pe-lg-5 mb-4 mb-lg-0">
              <div className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill mb-3 fw-semibold">
                🏛️ Ministry Sanction Gateway
              </div>
              <h1 className="fw-extrabold display-5 mb-3 text-white">
                Department & <span className="text-danger">Sanction</span> Portal
              </h1>
              <p className="lead text-secondary mb-4 fs-6">
                Official verification, merit list generation, budget allocation, and sanction order issuance for government welfare schemes and CSR programs.
              </p>

              <div className="d-flex flex-column gap-3 mb-0">
                <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <CheckCircle2 size={20} className="text-danger flex-shrink-0" />
                  <span className="small">State & Central Level Verification of Endorsed Candidates</span>
                </div>
                <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <CheckCircle2 size={20} className="text-danger flex-shrink-0" />
                  <span className="small">Sanction Order Generation with Digital Signatures</span>
                </div>
                <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <CheckCircle2 size={20} className="text-danger flex-shrink-0" />
                  <span className="small">PFMS / DBT Public Fund Disbursement Management</span>
                </div>
              </div>
            </div>

            {/* Right Card: Sign In with Tabs */}
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="custom-card p-3 p-sm-4 p-md-5 bg-white shadow-2xl border-0 rounded-4 text-dark">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 bg-danger text-white shadow-sm flex-shrink-0">
                    <Landmark size={28} />
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark mb-0 fs-5 fs-sm-4">Department Sign In</h4>
                    <span className="text-muted small">Ministry Approval & Sanctions Desk</span>
                  </div>
                </div>

                {/* Sign In / Sign Up Tabs */}
                <div className="d-flex p-1 bg-light rounded-3 mb-4 border">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); setError(''); }}
                    className="btn btn-sm w-50 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2 btn-danger shadow-sm text-white"
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
                    <label className="form-label small fw-semibold text-dark">Ministry / Department Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Mail size={18} />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter registered ministry email"
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
                    className="btn btn-danger w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm text-white"
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Department Portal'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="mt-4 pt-3 border-top text-center">
                  <span className="text-muted small">New Department Officer? </span>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signup'); setError(''); }}
                    className="btn btn-link p-0 small text-danger fw-bold text-decoration-none"
                  >
                    Register for Department Account
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
                  <div className="d-inline-flex p-3 rounded-circle bg-danger text-white shadow-sm mb-2">
                    <Landmark size={32} />
                  </div>
                  <h4 className="fw-bold text-dark mb-1 fs-5 fs-sm-4">Department Portal Registration</h4>
                  <p className="text-muted small mb-0">Create your department account to manage schemes and sanction grants</p>
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
                    className="btn btn-sm w-50 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2 btn-danger shadow-sm text-white"
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
                          placeholder="e.g. Dr. Sunita Verma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Official Department Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Mail size={16} /></span>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="e.g. officer.verma@ministry.gov.in"
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
                          placeholder="e.g. Under Secretary / Scheme Director"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Department Affiliation Selector */}
                    <div className="col-12">
                      <div className="p-3 rounded-3 bg-light border">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label small fw-semibold text-dark mb-0">
                            Ministry / Department Affiliation
                          </label>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              onClick={() => setDepartmentMode('existing')}
                              className={`btn btn-sm px-3 py-1 rounded-pill ${
                                departmentMode === 'existing' ? 'btn-dark text-white fw-semibold' : 'btn-outline-secondary'
                              }`}
                              style={{ fontSize: '0.75rem' }}
                            >
                              Select Existing Department
                            </button>
                            <button
                              type="button"
                              onClick={() => setDepartmentMode('new')}
                              className={`btn btn-sm px-3 py-1 rounded-pill ${
                                departmentMode === 'new' ? 'btn-dark text-white fw-semibold' : 'btn-outline-secondary'
                              }`}
                              style={{ fontSize: '0.75rem' }}
                            >
                              + Register New Department
                            </button>
                          </div>
                        </div>

                        {departmentMode === 'existing' ? (
                          <select
                            className="form-select"
                            value={selectedDepartmentId}
                            onChange={(e) => setSelectedDepartmentId(e.target.value)}
                          >
                            {existingDepartments.map((dept) => (
                              <option key={dept._id} value={dept._id}>
                                {dept.name} ({dept.code}) &bull; {dept.type}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="d-flex flex-column gap-2 mt-2">
                            <div className="input-group">
                              <span className="input-group-text bg-white"><Building2 size={16} /></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Ministry / Department Name"
                                value={newDepartmentName}
                                onChange={(e) => setNewDepartmentName(e.target.value)}
                                required={departmentMode === 'new'}
                              />
                            </div>
                            <div className="row g-2">
                              <div className="col-6">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Code (e.g. MOHE-GOV)"
                                  value={newDepartmentCode}
                                  onChange={(e) => setNewDepartmentCode(e.target.value)}
                                  required={departmentMode === 'new'}
                                />
                              </div>
                              <div className="col-6">
                                <select
                                  className="form-select"
                                  value={departmentType}
                                  onChange={(e) => setDepartmentType(e.target.value)}
                                >
                                  <option value="GOVERNMENT">Government</option>
                                  <option value="PRIVATE">Private Trust</option>
                                  <option value="CORPORATE">Corporate CSR</option>
                                  <option value="NGO">NGO Grant</option>
                                </select>
                              </div>
                            </div>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Scheme Provider (e.g. Ministry of Education, Govt of India)"
                              value={provider}
                              onChange={(e) => setProvider(e.target.value)}
                            />
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
                    className="btn btn-danger w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm text-white mt-4"
                  >
                    {loading ? 'Creating Account...' : 'Complete Department Registration'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="mt-4 pt-3 border-top text-center">
                  <span className="text-muted small">Already registered? </span>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); setError(''); }}
                    className="btn btn-link p-0 small text-danger fw-bold text-decoration-none"
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
        National Scholarship Portal &bull; Department Sanction Authority &bull; Government of India
      </footer>
    </div>
  );
};

export default DepartmentLogin;
