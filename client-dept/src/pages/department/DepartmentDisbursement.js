import React, { useState, useEffect, useCallback } from 'react';
import PortalLayout from '../../components/layout/PortalLayout';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Send, 
  RefreshCw
} from 'lucide-react';
import DeptBannerIllustration from '../../components/common/DeptBannerIllustration';

const DepartmentDisbursement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchPayments = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get('/department/disbursement');
      if (res.data.success) {
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();

    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      fetchPayments(true);
    };

    socket.on('payment_status_updated', handleUpdate);
    socket.on('sanction_generated', handleUpdate);
    socket.on('connect', handleUpdate);

    return () => {
      socket.off('payment_status_updated', handleUpdate);
      socket.off('sanction_generated', handleUpdate);
      socket.off('connect', handleUpdate);
    };
  }, [fetchPayments]);

  const handleSimulateDisbursement = async (paymentId, step) => {
    setProcessingId(paymentId);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.post(`/department/disbursement/${paymentId}/simulate`, { step });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message:
            step === 'PROCESS'
              ? `Payment moved to PROCESSING stage (${res.data.payment.paymentReference}).`
              : `Disbursement completed via Direct Benefit Transfer! UTR: ${res.data.payment.utr}`
        });
        fetchPayments();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to simulate disbursement.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingPayments = payments.filter((p) => p.status === 'PAYMENT_PENDING');
  const processingPayments = payments.filter((p) => p.status === 'PAYMENT_PROCESSING');
  const completedPayments = payments.filter((p) => p.status === 'DISBURSED');

  return (
    <PortalLayout
      pageTitle="DBT Payment & Disbursement Processing Gateway"
      breadcrumbs={[{ label: 'Department Portal', link: '/department/dashboard' }, { label: 'Disbursement Gateway' }]}
    >
      {/* Overview Banner */}
      <div
        className="p-3 p-md-4 mb-4 text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #5A0808 0%, #750A0A 25%, #991B1B 60%, #DC2626 100%)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(127, 29, 29, 0.22)'
        }}
      >
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 position-relative" style={{ zIndex: 2 }}>
          {/* Left: DBT Engine Icon & Titles */}
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#DC2626',
                border: '1.5px solid rgba(254, 202, 202, 0.45)',
                borderRadius: '13px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              <CreditCard size={24} className="text-white" />
            </div>
            <div>
              <h4 className="fw-bold mb-1 text-white responsive-title text-break" style={{ letterSpacing: '-0.01em', fontSize: '1.25rem' }}>
                Direct Benefit Transfer (DBT) Disbursement Engine
              </h4>
              <span className="small text-break" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem' }}>
                Integrated National Payment Corporation(NPCI) &amp; PFMS Bank Gateway Simulator
              </span>
            </div>
          </div>

          {/* Center-Right Background: Ministry Rotunda / Dome Graphic */}
          <div className="d-none d-xl-block position-absolute" style={{ right: '140px', bottom: '-8px', zIndex: 1, pointerEvents: 'none' }}>
            <DeptBannerIllustration />
          </div>

          {/* Right Action Button: Refresh Queue */}
          <div className="d-flex align-items-center flex-shrink-0 position-relative" style={{ zIndex: 3 }}>
            <button
              onClick={() => fetchPayments()}
              className="btn fw-bold d-inline-flex align-items-center gap-2 bg-white"
              style={{
                color: '#0F172A',
                border: '1px solid #FFFFFF',
                borderRadius: '10px',
                padding: '9px 20px',
                fontSize: '0.86rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
              }}
            >
              <RefreshCw size={15} style={{ color: '#DC2626' }} className={loading ? 'spin' : ''} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type} py-2.5 mb-4 d-flex align-items-center gap-2`} style={{ borderRadius: '12px' }}>
          <CheckCircle2 size={18} />
          <span className="text-break">{feedback.message}</span>
        </div>
      )}

      {/* 3 Pipeline Columns (Pending -> Processing -> Disbursed) */}
      <div className="row g-4 mb-4">
        {/* 1. Payment Pending (Queued for Banking) */}
        <div className="col-12 col-lg-4">
          <div 
            className="p-3 p-md-4 h-100 d-flex flex-column"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #F1F5F9',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              minHeight: '440px'
            }}
          >
            {/* Column Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2.5">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '28px', height: '28px', backgroundColor: '#FEF3C7', color: '#D97706' }}
                >
                  <Clock size={16} />
                </div>
                <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '1rem' }}>
                  1. Queued for Banking
                </h6>
              </div>
              <span 
                className="badge" 
                style={{ 
                  backgroundColor: '#FEF3C7', 
                  color: '#D97706', 
                  fontWeight: 600, 
                  fontSize: '0.78rem',
                  padding: '5px 12px',
                  borderRadius: '20px'
                }}
              >
                {pendingPayments.length} Queued
              </span>
            </div>

            {/* Content / Empty State */}
            {pendingPayments.length === 0 ? (
              <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-4 text-center">
                <div className="mb-3 position-relative d-inline-flex align-items-center justify-content-center">
                  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                    {/* Radiating Accent Lines */}
                    <line x1="18" y1="22" x2="25" y2="28" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
                    <line x1="70" y1="22" x2="63" y2="28" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
                    <line x1="18" y1="66" x2="25" y2="60" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
                    <line x1="70" y1="66" x2="63" y2="60" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
                    {/* Center Soft Blush Circle */}
                    <circle cx="44" cy="44" r="30" fill="#FFF1F2" />
                    {/* Document Icon */}
                    <path d="M37 32H47L53 38V54C53 55.1 52.1 56 51 56H37C35.9 56 35 55.1 35 54V34C35 32.9 35.9 32 37 32Z" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M47 32V38H53" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="mb-0" style={{ color: '#64748B', fontSize: '0.88rem' }}>
                  No payments currently in queued stage.
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '460px' }}>
                {pendingPayments.map((p) => (
                  <div 
                    key={p._id} 
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #F1F5F9',
                      borderRadius: '14px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.88rem' }}>{p.paymentReference}</span>
                      <span style={{ color: '#0F172A', fontWeight: 800, fontSize: '0.95rem' }}>₹{p.amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ color: '#0F172A', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
                      {p.studentName?.toUpperCase() || p.studentName}
                    </div>
                    <div style={{ color: '#64748B', fontSize: '0.82rem', marginBottom: '8px' }}>
                      {p.scholarshipName}
                    </div>
                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', color: '#64748B', marginBottom: '12px' }}>
                      Bank: {p.bankDetails?.bankName} ({p.bankDetails?.ifscCode})
                    </div>
                    <button
                      onClick={() => handleSimulateDisbursement(p._id, 'PROCESS')}
                      disabled={processingId === p._id}
                      className="btn w-100 d-flex align-items-center justify-content-center gap-1.5 text-white fw-semibold"
                      style={{
                        backgroundColor: '#DC2626',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontSize: '0.84rem'
                      }}
                    >
                      <Send size={14} />
                      <span>{processingId === p._id ? 'Sending...' : 'Dispatch to Gateway'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Gateway Processing */}
        <div className="col-12 col-lg-4">
          <div 
            className="p-3 p-md-4 h-100 d-flex flex-column"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #F1F5F9',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              minHeight: '440px'
            }}
          >
            {/* Column Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2.5">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '28px', height: '28px', backgroundColor: '#FFE4E6', color: '#E11D48' }}
                >
                  <RefreshCw size={15} />
                </div>
                <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '1rem' }}>
                  2. Gateway Processing
                </h6>
              </div>
              <span 
                className="badge" 
                style={{ 
                  backgroundColor: '#FFE4E6', 
                  color: '#E11D48', 
                  fontWeight: 600, 
                  fontSize: '0.78rem',
                  padding: '5px 12px',
                  borderRadius: '20px'
                }}
              >
                {processingPayments.length} Active
              </span>
            </div>

            {/* Content / Empty State */}
            {processingPayments.length === 0 ? (
              <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-4 text-center">
                <div className="mb-3 position-relative d-inline-flex align-items-center justify-content-center">
                  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                    {/* Radiating Accent Lines */}
                    <line x1="18" y1="22" x2="25" y2="28" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
                    <line x1="70" y1="22" x2="63" y2="28" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
                    <line x1="18" y1="66" x2="25" y2="60" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
                    <line x1="70" y1="66" x2="63" y2="60" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
                    {/* Center Soft Blush Circle */}
                    <circle cx="44" cy="44" r="30" fill="#FFF1F2" />
                    {/* Gear / Cog Icon */}
                    <path d="M44 38C40.6863 38 38 40.6863 38 44C38 47.3137 40.6863 50 44 50C47.3137 50 50 47.3137 50 44C50 40.6863 47.3137 38 44 38Z" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M49.5 35L51.2 33.2C51.6 32.8 52.3 32.8 52.7 33.2L54.8 35.3C55.2 35.7 55.2 36.4 54.8 36.8L53 38.5C53.3 39.2 53.5 40 53.5 40.8H56C56.6 40.8 57 41.2 57 41.8V44.8C57 45.4 56.6 45.8 56 45.8H53.5C53.5 46.6 53.3 47.4 53 48.1L54.8 49.8C55.2 50.2 55.2 50.9 54.8 51.3L52.7 53.4C52.3 53.8 51.6 53.8 51.2 53.4L49.5 51.7C48.8 52 48 52.2 47.2 52.2V54.7C47.2 55.3 46.8 55.7 46.2 55.7H43.2C42.6 55.7 42.2 55.3 42.2 54.7V52.2C41.4 52.2 40.6 52 39.9 51.7L38.2 53.4C37.8 53.8 37.1 53.8 36.7 53.4L34.6 51.3C34.2 50.9 34.2 50.2 34.6 49.8L36.4 48.1C36.1 47.4 35.9 46.6 35.9 45.8H33.4C32.8 45.8 32.4 45.4 32.4 44.8V41.8C32.4 41.2 32.8 40.8 33.4 40.8H35.9C35.9 40 36.1 39.2 36.4 38.5L34.6 36.8C34.2 36.4 34.2 35.7 34.6 35.3L36.7 33.2C37.1 32.8 37.8 32.8 38.2 33.2L39.9 35C40.6 34.7 41.4 34.5 42.2 34.5V32C42.2 31.4 42.6 31 43.2 31H46.2C46.8 31 47.2 31.4 47.2 32V34.5C48 34.5 48.8 34.7 49.5 35Z" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="mb-0" style={{ color: '#64748B', fontSize: '0.88rem' }}>
                  No transactions currently processing.
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '460px' }}>
                {processingPayments.map((p) => (
                  <div 
                    key={p._id} 
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #FFE4E6',
                      borderRadius: '14px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.88rem' }}>{p.paymentReference}</span>
                      <span style={{ color: '#0F172A', fontWeight: 800, fontSize: '0.95rem' }}>₹{p.amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ color: '#0F172A', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
                      {p.studentName?.toUpperCase() || p.studentName}
                    </div>
                    <div style={{ color: '#64748B', fontSize: '0.82rem', marginBottom: '8px' }}>
                      {p.scholarshipName}
                    </div>
                    <div style={{ backgroundColor: '#FFF1F2', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', color: '#E11D48', marginBottom: '12px' }}>
                      NPCI / Bank Server Verification in Progress...
                    </div>
                    <button
                      onClick={() => handleSimulateDisbursement(p._id, 'COMPLETE')}
                      disabled={processingId === p._id}
                      className="btn w-100 d-flex align-items-center justify-content-center gap-1.5 text-white fw-semibold"
                      style={{
                        backgroundColor: '#16A34A',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontSize: '0.84rem'
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>{processingId === p._id ? 'Completing...' : 'Execute DBT Credit (Disburse)'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Disbursed (Completed) */}
        <div className="col-12 col-lg-4">
          <div 
            className="p-3 p-md-4 h-100 d-flex flex-column"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #F1F5F9',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              minHeight: '440px'
            }}
          >
            {/* Column Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2.5">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '28px', height: '28px', backgroundColor: '#DCFCE7', color: '#16A34A' }}
                >
                  <CheckCircle2 size={16} />
                </div>
                <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '1rem' }}>
                  3. Disbursed (Completed)
                </h6>
              </div>
              <span 
                className="badge" 
                style={{ 
                  backgroundColor: '#FFE4E6', 
                  color: '#E11D48', 
                  fontWeight: 600, 
                  fontSize: '0.78rem',
                  padding: '5px 12px',
                  borderRadius: '20px'
                }}
              >
                {completedPayments.length} Credited
              </span>
            </div>

            {/* Content / Disbursed List */}
            {completedPayments.length === 0 ? (
              <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-4 text-center">
                <p className="mb-0" style={{ color: '#64748B', fontSize: '0.88rem' }}>
                  No completed disbursements yet.
                </p>
              </div>
            ) : (
              <div 
                className="d-flex flex-column pe-1 overflow-auto" 
                style={{ 
                  maxHeight: '460px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#CBD5E1 transparent'
                }}
              >
                {completedPayments.map((p) => (
                  <div 
                    key={p._id} 
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #F1F5F9',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      marginBottom: '14px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '-0.01em' }}>
                        {p.paymentReference}
                      </span>
                      <span style={{ color: '#0F172A', fontWeight: 800, fontSize: '0.98rem' }}>
                        ₹{p.amount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ color: '#0F172A', fontWeight: 700, fontSize: '0.92rem', marginBottom: '2px' }}>
                      {p.studentName?.toUpperCase() || p.studentName}
                    </div>
                    <div 
                      style={{ 
                        color: '#64748B', 
                        fontSize: '0.82rem', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}
                      title={p.scholarshipName}
                    >
                      {p.scholarshipName}
                    </div>
                    <div 
                      style={{
                        backgroundColor: '#FFF1F2',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        marginTop: '12px'
                      }}
                    >
                      <div style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.82rem' }}>
                        UTR: {p.utr}
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '2px' }}>
                        Credited: {p.transactionDate ? new Date(p.transactionDate).toLocaleDateString('en-GB') : '22/10/2026'}
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

export default DepartmentDisbursement;
