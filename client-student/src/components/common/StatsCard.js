import React from 'react';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = '#ECFDF5',
  iconColor = '#059669',
  topChartColor = null
}) => {
  const chartColor = topChartColor || iconColor;

  return (
    <div
      className="stats-card h-100 d-flex flex-column justify-content-between p-3.5 p-sm-4 bg-white"
      style={{
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.02)',
        transition: 'all 0.2s ease'
      }}
    >
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: iconBg,
              color: iconColor,
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              flexShrink: 0
            }}
          >
            {icon}
          </div>

          {/* Mini trend chart icon on top right matching reference image */}
          <div style={{ color: chartColor, opacity: 0.55 }} title="Metric activity">
            <i className="bi bi-bar-chart-fill" style={{ fontSize: '1.2rem' }}></i>
          </div>
        </div>

        <span
          className="fw-bold text-uppercase d-block text-truncate mb-1"
          style={{ fontSize: '0.74rem', letterSpacing: '0.06em', color: '#334155', fontWeight: 800 }}
        >
          {title}
        </span>
        <h3
          className="fw-bold mb-1"
          style={{
            color: '#0F172A',
            fontSize: '1.85rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}
        >
          {value}
        </h3>
      </div>

      {subtitle && (
        <div className="mt-2 pt-1">
          <p
            className="mb-0 fw-bold text-truncate"
            style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}
          >
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
