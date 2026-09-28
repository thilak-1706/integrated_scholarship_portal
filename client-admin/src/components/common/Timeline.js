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

const getStageIndex = (status) => {
  switch (status) {
    case 'SUBMITTED':
      return 0;
    case 'INSTITUTE_VERIFIED':
      return 1;
    case 'ROUTED_TO_DEPARTMENT':
      return 2;
    case 'DEPARTMENT_VERIFICATION':
      return 3;
    case 'APPROVED':
      return 4;
    case 'SANCTIONED':
      return 5;
    case 'PAYMENT_PENDING':
    case 'PAYMENT_PROCESSING':
      return 6;
    case 'DISBURSED':
      return 7;
    case 'CORRECTION_REQUIRED':
      return 1; // Stuck at verification
    case 'REJECTED':
      return -1;
    default:
      return 0;
  }
};

const Timeline = ({ currentStatus, auditLogs = [], applicationDetails }) => {
  const currentIndex = getStageIndex(currentStatus);
  const isRejected = currentStatus === 'REJECTED';
  const isCorrection = currentStatus === 'CORRECTION_REQUIRED';

  return (
    <div className="tracking-timeline py-3">
      {STAGES.map((stage, idx) => {
        let nodeClass = '';
        let icon = <Clock size={12} />;

        if (isRejected) {
          if (idx <= (applicationDetails?.departmentVerification?.decision === 'REJECTED' ? 3 : 1)) {
            nodeClass = idx === (applicationDetails?.departmentVerification?.decision === 'REJECTED' ? 3 : 1) ? 'danger' : 'completed';
            icon = idx === (applicationDetails?.departmentVerification?.decision === 'REJECTED' ? 3 : 1) ? <X size={12} /> : <Check size={12} />;
          }
        } else if (isCorrection && idx === 1) {
          nodeClass = 'warning';
          icon = <AlertTriangle size={12} />;
        } else {
          if (idx < currentIndex) {
            nodeClass = 'completed';
            icon = <Check size={12} />;
          } else if (idx === currentIndex) {
            nodeClass = 'current';
            icon = <Clock size={12} />;
          }
        }

        // Find relevant audit log entry matching this transition
        const logEntry = auditLogs.find((l) => {
          if (stage.key === 'SUBMITTED' && l.newStatus === 'SUBMITTED') return true;
          if (stage.key === 'ROUTED_TO_DEPARTMENT' && l.newStatus === 'ROUTED_TO_DEPARTMENT') return true;
          if (stage.key === 'APPROVED' && l.newStatus === 'APPROVED') return true;
          if (stage.key === 'SANCTIONED' && l.newStatus === 'SANCTIONED') return true;
          if (stage.key === 'DISBURSED' && l.newStatus === 'DISBURSED') return true;
          return false;
        });

        return (
          <div key={stage.key} className={`timeline-node ${nodeClass}`}>
            <div className="timeline-dot">{icon}</div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-1.5">
              <div className="min-w-0">
                <h6 className="fw-bold mb-1" style={{ color: nodeClass === 'current' ? '#2563eb' : '#0f172a' }}>
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
              </div>
              <div className="mt-1 mt-sm-0 flex-shrink-0">
                {nodeClass === 'completed' && <span className="badge bg-success-subtle text-success">Completed</span>}
                {nodeClass === 'current' && <span className="badge bg-primary-subtle text-primary">In Progress</span>}
                {nodeClass === 'warning' && <span className="badge bg-warning-subtle text-warning">Action Required</span>}
                {nodeClass === 'danger' && <span className="badge bg-danger-subtle text-danger">Rejected</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
