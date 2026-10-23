import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PortalLayout = ({ children, pageTitle, breadcrumbs = [] }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-3 p-lg-4 flex-grow-1">
          {/* Breadcrumb & Header */}
          {(pageTitle || breadcrumbs.length > 0) && (
            <div className="mb-3.5">
              {breadcrumbs.length > 0 && (
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-1" style={{ fontSize: '0.82rem', '--bs-breadcrumb-divider': "'>'" }}>
                    {breadcrumbs.map((b, idx) => (
                      <li
                        key={idx}
                        className={`breadcrumb-item ${idx === breadcrumbs.length - 1 ? 'active fw-semibold' : ''}`}
                        style={{ color: idx === breadcrumbs.length - 1 ? '#2563EB' : '#64748B' }}
                      >
                        {b.link && idx !== breadcrumbs.length - 1 ? (
                          <a href={b.link} className="text-decoration-none" style={{ color: '#64748B' }}>
                            {b.label}
                          </a>
                        ) : (
                          b.label
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              {pageTitle && (
                <h3
                  className="fw-bold mb-0 tracking-tight"
                  style={{ color: '#0F172A', fontSize: '1.5rem', letterSpacing: '-0.02em' }}
                >
                  {pageTitle}
                </h3>
              )}
            </div>
          )}

          {/* Child Page Content */}
          <div className="w-100">
            {children}
          </div>
        </main>

        <footer className="py-3 px-3 px-sm-4 border-top bg-white text-center text-muted" style={{ fontSize: '0.75rem' }}>
          National Scholarship Verification, Approval, and Disbursement Tracking System &copy; {new Date().getFullYear()} &bull; Government of India
        </footer>
      </div>
    </div>
  );
};

export default PortalLayout;
