import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Briefcase,
  KeyRound,
  LogIn,
  UserPlus
} from 'lucide-react';

const AdminLogin = ({ initialMode }) => {
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
  const [designation, setDesignation] = useState('Central Scholarship Administrator');
  const [adminSecret, setAdminSecret] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, registerAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await login(email, password, 'ADMIN');
    setLoading(false);

    if (res.success) {
      navigate('/admin/dashboard');
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

    setLoading(true);

    const res = await registerAdmin({
      name,
      email: signupEmail,
      password: signupPassword,
      phone,
      designation,
      adminSecret
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg('Admin account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between" style={{ backgroundColor: '#180814', color: '#f8fafc' }}>
      {/* Main Content */}
      <main className="container my-auto py-4 py-md-5 px-3 px-sm-4">
        {activeTab === 'signin' ? (
          /* ==================== SIGN IN VIEW (Equal Left Height) ==================== */
          <div className="row justify-content-center align-items-center g-4">
            {/* Left Hero Box (Visible on both mobile & desktop) */}
            <div className="col-12 col-lg-6 text-light pe-lg-5 mb-4 mb-lg-0">
              <div className="badge px-3 py-2 rounded-pill mb-3 fw-semibold" style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.35)' }}>
                🔒 High-Security Administrative Gateway
              </div>
              <h1 className="fw-extrabold display-5 mb-3 text-white">
                State & Central <span style={{ color: '#ec4899' }}>Admin Console</span>
              </h1>
              <p className="lead text-secondary mb-4 fs-6">
                Complete oversight, scheme configuration, institution & department onboarding, user role provisioning, and macro financial disbursement tracking.
              </p>

              <div className="d-flex flex-column gap-3 mb-0">
                <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <CheckCircle2 size={20} style={{ color: '#ec4899' }} className="flex-shrink-0" />
                  <span className="small">Institution & Department Onboarding & Verification Desk</span>
                </div>
                <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <CheckCircle2 size={20} style={{ color: '#ec4899' }} className="flex-shrink-0" />
                  <span className="small">Scholarship Schemes Lifecycle & Quota Configuration</span>
                </div>
                <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <CheckCircle2 size={20} style={{ color: '#ec4899' }} className="flex-shrink-0" />
                  <span className="small">Immutable Audit Logging & Anti-Fraud Security Monitoring</span>
                </div>
              </div>
            </div>

            {/* Right Card: Sign In with Tabs */}
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="custom-card p-3 p-sm-4 p-md-5 bg-white shadow-2xl border-0 rounded-4 text-dark">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 shadow-sm flex-shrink-0" style={{ backgroundColor: '#ec4899', color: '#fff' }}>
                    <Shield size={28} />
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark mb-0 fs-5 fs-sm-4">Administrator Sign In</h4>
                    <span className="text-muted small">Super Admin & State Governance Desk</span>
                  </div>
                </div>

                {/* Sign In / Sign Up Tabs */}
                <div className="d-flex p-1 bg-light rounded-3 mb-4 border">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); setError(''); }}
                    style={{ backgroundColor: '#ec4899', color: '#fff', border: 'none' }}
                    className="btn btn-sm w-50 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2 shadow-sm"
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
                    <label className="form-label small fw-semibold text-dark">Administrator Official Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Mail size={18} />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        placeholder="e.g. admin@nsp.gov.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-semibold text-dark mb-0">Master Password</label>
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
                    style={{ backgroundColor: '#ec4899', borderColor: '#ec4899' }}
                    className="btn w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm text-white"
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="mt-4 pt-3 border-top text-center">
                  <span className="text-muted small">New Administrator? </span>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signup'); setError(''); }}
                    style={{ color: '#ec4899' }}
                    className="btn btn-link p-0 small fw-bold text-decoration-none"
                  >
                    Register for Admin Account
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
                  <div className="d-inline-flex p-3 rounded-circle shadow-sm mb-2" style={{ backgroundColor: '#ec4899', color: '#fff' }}>
                    <Shield size={32} />
                  </div>
                  <h4 className="fw-bold text-dark mb-1 fs-5 fs-sm-4">Administrator Portal Registration</h4>
                  <p className="text-muted small mb-0">Create your administrative governance account to oversee national scholarships</p>
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
                    style={{ backgroundColor: '#ec4899', color: '#fff', border: 'none' }}
                    className="btn btn-sm w-50 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-2 shadow-sm"
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
                      <label className="form-label small fw-semibold">Administrator Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><User size={16} /></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Dr. Ramesh Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Official Government Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Mail size={16} /></span>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="e.g. ramesh.admin@nsp.gov.in"
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
                      <label className="form-label small fw-semibold">Administrative Role</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Briefcase size={16} /></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. State Nodal Director"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                        />
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

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark mb-1 d-flex justify-content-between align-items-center">
                        <span>Admin Authorization Passkey</span>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>(Optional Security Passcode)</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><KeyRound size={16} /></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Security authorization key (optional)"
                          value={adminSecret}
                          onChange={(e) => setAdminSecret(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: '#ec4899', borderColor: '#ec4899' }}
                    className="btn w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm text-white mt-4"
                  >
                    {loading ? 'Creating Admin Account...' : 'Complete Administrator Registration'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="mt-4 pt-3 border-top text-center">
                  <span className="text-muted small">Already registered? </span>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); setError(''); }}
                    style={{ color: '#ec4899' }}
                    className="btn btn-link p-0 small fw-bold text-decoration-none"
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
        National Scholarship Portal &bull; Central Administrative Control &bull; Government of India
      </footer>
    </div>
  );
};

export default AdminLogin;
