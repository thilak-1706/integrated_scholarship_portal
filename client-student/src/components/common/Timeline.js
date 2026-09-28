import React from 'react';
import { Check, Clock, AlertTriangle, X } from 'lucide-react';

const STAGES = [
  { key: 'SUBMITTED', label: '1. Application Submitted', desc: 'Online application submitted by student' },
  { key: 'INSTITUTE_VERIFIED', label: '2. Institute Verification', desc: 'College verification of enrollment, marks & attendance' },
  { key: 'ROUTED_TO_DEPARTMENT', label: '3. Routed to Department', desc: 'Auto-routed to Welfare / Education Department' },
  { key: 'DEPARTMENT_VERIFICATION', label: '4. Department Scrutiny', desc: 'Eligibility scrutiny & quota allocation' },
  { key: 'APPROVED', label: '5. Department Approved', desc: 'Approved for scholarship grant' },
  { key: 'SANCTIONED', label: '6. Sanction Order Generated', desc: 'Official Sanction Order SAN-YYYY-XXXXXX generated' },
  { key: 'PAYMENT_PROCESSING', label: '7. Payment Processing', desc: 'DBT Bank gateway dispatch' },
  { key: 'DISBURSED', label: '8. Payment Disbursed', desc: 'Funds credited to student bank account (DBT)' }
];

const getStageIndex = (status, applicationDetails) => {
  const isDisbursed =
    ['DISBURSED', 'PAYMENT_DISBURSED'].includes(status) ||
    applicationDetails?.paymentId?.status === 'DISBURSED' ||
    Boolean(applicationDetails?.paymentId?.utr) ||
    applicationDetails?.status === 'DISBURSED' ||
    applicationDetails?.status === 'PAYMENT_DISBURSED' ||
    applicationDetails?.paymentStatus === 'DISBURSED';

  if (isDisbursed) return 7;

  if (['PAYMENT_PENDING', 'PAYMENT_PROCESSING'].includes(status) || applicationDetails?.paymentId?.status === 'PAYMENT_PROCESSING') return 6;
  if (status === 'SANCTIONED' || applicationDetails?.sanctionNumber) return 5;

  const isDeptApproved =
    ['APPROVED', 'DEPARTMENT_APPROVED'].includes(status) ||
    applicationDetails?.departmentVerification?.decision === 'APPROVED';

  if (isDeptApproved) return 4;
  if (status === 'DEPARTMENT_VERIFICATION') return 3;
  if (status === 'ROUTED_TO_DEPARTMENT') return 2;
  if (status === 'INSTITUTE_VERIFIED') return 1;
  if (status === 'SUBMITTED') return 0;
  if (status === 'CORRECTION_REQUIRED') return 1;
  if (status === 'REJECTED') return -1;
  return 0;
};

const Timeline = ({ currentStatus, auditLogs = [], applicationDetails }) => {
  const currentIndex = getStageIndex(currentStatus, applicationDetails);
  const isRejected = currentStatus === 'REJECTED' || applicationDetails?.departmentVerification?.decision === 'REJECTED';
  const isCorrection = currentStatus === 'CORRECTION_REQUIRED';

  return (
    <div className="tracking-timeline py-3">
      {STAGES.map((stage, idx) => {
        let nodeClass = '';
        let icon = <span className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1 }}>○</span>;

        if (isRejected) {
          const rejectStageIdx = applicationDetails?.departmentVerification?.decision === 'REJECTED' ? 3 : 1;
          if (idx < rejectStageIdx) {
            nodeClass = 'completed';
            icon = <Check size={12} />;
          } else if (idx === rejectStageIdx) {
            nodeClass = 'danger';
            icon = <X size={12} />;
          } else {
            nodeClass = '';
            icon = <span className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1 }}>○</span>;
          }
        } else if (isCorrection && idx === 1) {
          nodeClass = 'warning';
          icon = <AlertTriangle size={12} />;
        } else {
          if (idx < currentIndex) {
            nodeClass = 'completed';
            icon = <Check size={12} />;
          } else if (idx === currentIndex) {
            if (currentIndex === 7) {
              nodeClass = 'completed';
              icon = <Check size={12} />;
            } else if (currentIndex === 4) {
              nodeClass = 'completed current';
              icon = <Check size={12} />;
            } else {
              nodeClass = 'current';
              icon = <Clock size={12} />;
            }
          } else {
            nodeClass = '';
            icon = <span className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1 }}>○</span>;
          }
        }

        // Find relevant audit log entry matching this transition
        const logEntry = auditLogs.find((l) => {
          if (stage.key === 'SUBMITTED' && l.newStatus === 'SUBMITTED') return true;
          if (stage.key === 'INSTITUTE_VERIFIED' && (l.newStatus === 'INSTITUTE_VERIFIED' || (l.previousStatus === 'SUBMITTED' && l.officerRole === 'INSTITUTE_OFFICER'))) return true;
          if (stage.key === 'ROUTED_TO_DEPARTMENT' && (l.newStatus === 'ROUTED_TO_DEPARTMENT' || (l.newStatus === 'INSTITUTE_VERIFIED' && l.remarks?.toLowerCase().includes('routed')))) return true;
          if (stage.key === 'DEPARTMENT_VERIFICATION' && l.newStatus === 'DEPARTMENT_VERIFICATION') return true;
          if (stage.key === 'APPROVED' && (['APPROVED', 'DEPARTMENT_APPROVED'].includes(l.newStatus) || (l.officerRole === 'DEPARTMENT_OFFICER' && (l.newStatus === 'APPROVED' || l.action === 'APPROVE')))) return true;
          if (stage.key === 'SANCTIONED' && (l.newStatus === 'SANCTIONED' || l.action === 'GENERATE_SANCTION')) return true;
          if (stage.key === 'PAYMENT_PROCESSING' && (['PAYMENT_PROCESSING', 'PAYMENT_PENDING'].includes(l.newStatus) || l.action === 'PROCESS_PAYMENT')) return true;
          if (stage.key === 'DISBURSED' && (['DISBURSED', 'PAYMENT_DISBURSED'].includes(l.newStatus) || l.action === 'DISBURSE')) return true;
          return false;
        });

        return (
          <div key={stage.key} className={`timeline-node ${nodeClass}`}>
            <div className="timeline-dot">{icon}</div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-1.5">
              <div className="min-w-0">
                <h6
                  className="fw-bold mb-1"
                  style={{
                    color: nodeClass.includes('current') ? '#2563eb' : (nodeClass.includes('completed') ? '#0f172a' : '#64748b')
                  }}
                >
                  {stage.label}
                </h6>
                <p className="text-muted mb-1" style={{ fontSize: '0.82rem' }}>
                  {stage.desc}
                </p>

                {logEntry && (
                  <div className="bg-light p-2 rounded small text-secondary mt-1 border">
                    <span className="fw-semibold text-dark">{logEntry.officerName} ({logEntry.officerRole}): </span>
                    {logEntry.remarks}
                    <span className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                      {new Date(logEntry.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}

                {stage.key === 'APPROVED' && !logEntry && applicationDetails?.departmentVerification?.verifiedAt && (
                  <div className="bg-light p-2 rounded small text-secondary mt-1 border">
                    <span className="fw-semibold text-dark">
                      {applicationDetails.departmentVerification.officerName || 'Department Officer'} (DEPARTMENT_OFFICER):{' '}
                    </span>
                    {applicationDetails.departmentVerification.remarks || 'Department approval completed. Scrutinized and approved by Department Officer.'}
                    <span className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                      {new Date(applicationDetails.departmentVerification.verifiedAt).toLocaleString()}
                    </span>
                  </div>
                )}

                {stage.key === 'DEPARTMENT_VERIFICATION' && idx < currentIndex && !logEntry && applicationDetails?.departmentVerification?.verifiedAt && (
                  <div className="bg-light p-2 rounded small text-secondary mt-1 border">
                    <span className="fw-semibold text-dark">
                      {applicationDetails.departmentVerification.officerName || 'Department Officer'} (DEPARTMENT_OFFICER):{' '}
                    </span>
                    Eligibility scrutiny and quota verification completed.
                    <span className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                      {new Date(applicationDetails.departmentVerification.verifiedAt).toLocaleString()}
                    </span>
                  </div>
                )}

                {stage.key === 'ROUTED_TO_DEPARTMENT' && idx < currentIndex && !logEntry && (
                  <div className="bg-light p-2 rounded small text-secondary mt-1 border">
                    <span className="fw-semibold text-dark">System (WORKFLOW_ROUTER): </span>
                    Application automatically routed to Department queue following institute verification.
                  </div>
                )}

                {stage.key === 'SANCTIONED' && (idx <= currentIndex && currentIndex >= 5) && !logEntry && applicationDetails?.sanctionNumber && (
                  <div className="bg-light p-2 rounded small text-secondary mt-1 border">
                    <span className="fw-semibold text-dark">Ministry / Department Sanction Authority: </span>
                    Sanction Order issued: {applicationDetails.sanctionNumber} (Grant: ₹{applicationDetails.approvedAmount?.toLocaleString('en-IN')})
                  </div>
                )}

                {stage.key === 'PAYMENT_PROCESSING' && (idx <= currentIndex && currentIndex >= 6) && !logEntry && (
                  <div className="bg-light p-2 rounded small text-secondary mt-1 border">
                    <span className="fw-semibold text-dark">Banking Gateway (NPCI / PFMS): </span>
                    Payment reference {applicationDetails?.paymentReference || applicationDetails?.paymentId?.paymentReference || ''} dispatched for Direct Benefit Transfer processing.
                  </div>
                )}

                {stage.key === 'DISBURSED' && currentIndex === 7 && !logEntry && (
                  <div className="bg-light p-2 rounded small text-secondary mt-1 border">
                    <span className="fw-semibold text-dark">DBT Banking Gateway: </span>
                    Disbursement completed via Direct Benefit Transfer to bank account. UTR: {applicationDetails?.paymentId?.utr || 'Confirmed'}
                    <span className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                      {applicationDetails?.paymentId?.transactionDate ? new Date(applicationDetails.paymentId.transactionDate).toLocaleString() : new Date().toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-1 mt-sm-0 flex-shrink-0">
                {nodeClass === 'completed' && <span className="badge bg-success-subtle text-success">Completed</span>}
                {nodeClass === 'completed current' && <span className="badge bg-success-subtle text-success">Current / Completed</span>}
                {nodeClass === 'current' && <span className="badge bg-primary-subtle text-primary">In Progress</span>}
                {nodeClass === 'warning' && <span className="badge bg-warning-subtle text-warning">Action Required</span>}
                {nodeClass === 'danger' && <span className="badge bg-danger-subtle text-danger">Rejected</span>}
                {!nodeClass && <span className="badge bg-light text-secondary border">Pending</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
