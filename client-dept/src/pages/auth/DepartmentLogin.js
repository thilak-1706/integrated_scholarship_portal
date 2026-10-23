import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Landmark, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

const DEPARTMENTS = [
  {
    id: 'mohe',
    name: 'Ministry of Higher Education & Welfare',
    code: 'MOHE-GOV',
    category: 'Government Welfare Scheme',
    officer: 'Dr. Sunita Verma',
    email: 'department@nsp.gov.in',
    password: 'department123',
    budget: '₹2.5 Cr'
  },
  {
    id: 'dsti',
    name: 'Dept. of Science, Technology & Innovation',
    code: 'DSTI-GOV',
    category: 'Govt Science & Tech',
    officer: 'Dr. Vikram Nair',
    email: 'department.dst@nsp.gov.in',
    password: 'department123',
    budget: '₹1.5 Cr'
  },
  {
    id: 'tata',
    name: 'Tata Educational & Social Welfare Trust',
    code: 'TATA-PVT',
    category: 'Trust Endowment Grant',
    officer: 'Dr. Priya Mehta',
    email: 'department.tata@nsp.gov.in',
    password: 'department123',
    budget: '₹80 L'
  },
  {
    id: 'rf',
    name: 'Reliance Foundation Education Initiatives',
    code: 'RF-CORP',
    category: 'Corporate CSR Initiative',
    officer: 'Dr. Arun Kapoor',
    email: 'department.rf@nsp.gov.in',
    password: 'department123',
    budget: '₹1.2 Cr'
  }
];

const DepartmentLogin = () => {
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

    const res = await login(email, password, 'DEPARTMENT_OFFICER');
    setLoading(false);

    if (res.success) {
      navigate('/department/dashboard');
    } else {
      setError(res.message);
    }
  };

  const fillDemoDepartment = (deptEmail = 'department@nsp.gov.in', deptPassword = 'department123') => {
    setError('');
    setEmail(deptEmail);
    setPassword(deptPassword);
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between" style={{ backgroundColor: '#092327', color: '#f8fafc' }}>
      {/* Main Content */}
      <main className="container my-auto py-4 py-md-5 px-3 px-sm-4">
        <div className="row justify-content-center align-items-center g-4">
          
          {/* Left Info Box (Desktop) */}
          <div className="col-12 col-lg-6 text-light d-none d-lg-block pe-lg-5">
            <div className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-25 px-3 py-2 rounded-pill mb-3 fw-semibold">
              🏛️ Ministry / State Level-2 Sanction Gateway
            </div>
            <h1 className="fw-extrabold display-5 mb-3 text-white">
              Department & <span className="text-info">Sanction</span> Portal
            </h1>
            <p className="lead text-secondary mb-4 fs-6">
              Official verification, merit list generation, budget allocation, and sanction order issuance for government welfare schemes, CSR programs, and trust funds.
            </p>

            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <CheckCircle2 size={20} className="text-info flex-shrink-0" />
                <span className="small">State & Central Level Verification of Endorsed Candidates</span>
              </div>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <CheckCircle2 size={20} className="text-info flex-shrink-0" />
                <span className="small">Sanction Order Generation with Digital Signatures</span>
              </div>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <CheckCircle2 size={20} className="text-info flex-shrink-0" />
                <span className="small">PFMS / DBT Public Fund Disbursement Management</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 text-info small">
              <ShieldCheck size={18} className="flex-shrink-0" />
              <span>Restricted to authorized Ministry & Department Nodal Officers.</span>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="custom-card p-3 p-sm-4 p-md-5 bg-white shadow-2xl border-0 rounded-4 text-dark">
              
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="p-3 rounded-3 bg-info text-dark shadow-sm flex-shrink-0">
                  <Landmark size={28} />
                </div>
                <div>
                  <h4 className="fw-bold text-dark mb-0 fs-5 fs-sm-4">Department Officer Login</h4>
                  <span className="text-muted small">Ministry Approval & Sanctions Desk</span>
                </div>
              </div>

              {/* Demo Credentials Auto-Fill Section */}
              <div className="mb-4 p-3 rounded-3 bg-info-subtle border border-info-subtle">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="fw-bold text-dark small">Select Department Officer Account:</div>
                  <span className="badge bg-info text-dark fw-semibold" style={{ fontSize: '0.7rem' }}>
                    {DEPARTMENTS.length} Departments
                  </span>
                </div>
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {DEPARTMENTS.map((dept) => {
                    const isSelected = email === dept.email;
                    return (
                      <div
                        key={dept.email}
                        className={`d-flex justify-content-between align-items-center bg-white p-2.5 rounded border transition-all ${
                          isSelected ? 'border-info shadow-sm' : ''
                        }`}
                        style={{
                          borderWidth: isSelected ? '1.5px' : '1px',
                          borderColor: isSelected ? '#0dcaf0' : '#dee2e6',
                          backgroundColor: isSelected ? '#f0fdfa' : '#ffffff'
                        }}
                      >
                        <div className="min-w-0 pe-2">
                          <div className="d-flex align-items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="fw-semibold text-dark small">{dept.name}</span>
                            <span
                              className="badge bg-light text-dark border"
                              style={{ fontSize: '0.62rem', padding: '0.12rem 0.35rem' }}
                            >
                              {dept.code}
                            </span>
                          </div>
                          <div className="text-muted text-break" style={{ fontSize: '0.73rem' }}>
                            <span className="fw-medium text-dark">{dept.email}</span> &bull; {dept.password}
                          </div>
                          <div className="text-secondary" style={{ fontSize: '0.68rem' }}>
                            {dept.officer} &bull; Budget: {dept.budget}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => fillDemoDepartment(dept.email, dept.password)}
                          className={`btn btn-sm px-2.5 py-1 fw-semibold flex-shrink-0 ${
                            isSelected ? 'btn-info text-dark' : 'btn-outline-info text-dark'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {isSelected ? 'Filled ✓' : 'Auto-Fill'}
                        </button>
                      </div>
                    );
                  })}
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
                  <label className="form-label small fw-semibold text-dark">Department Officer User ID / Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="e.g. department@nsp.gov.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-dark mb-0">Security Password</label>
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
                  className="btn btn-info text-dark w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                >
                  {loading ? 'Verifying Department Clearance...' : 'Sign In to Department Portal'}
                  <ArrowRight size={16} />
                </button>
              </form>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-3 text-center text-secondary small border-top border-secondary-subtle">
        National Scholarship Portal &bull; Department & Ministry Sanction Wing &bull; Government of India
      </footer>
    </div>
  );
};

export default DepartmentLogin;
