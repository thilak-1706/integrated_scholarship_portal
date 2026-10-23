import React from 'react';

/**
 * Ministry / Department Rotunda Building Illustration
 * Matches the background illustration in the Department Dashboard banner.
 */
const DeptBannerIllustration = ({ className = '', style = {} }) => {
  return (
    <div
      className={`d-none d-lg-flex align-items-center justify-content-center ${className}`}
      style={{
        height: '110px',
        width: '260px',
        flexShrink: 0,
        pointerEvents: 'none',
        ...style
      }}
    >
      <svg
        viewBox="0 0 320 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
          opacity: 0.92
        }}
      >
        <defs>
          <linearGradient id="deptDomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FEE2E2" />
            <stop offset="100%" stopColor="#FCA5A5" />
          </linearGradient>
          <linearGradient id="deptPillarGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FEF2F2" />
            <stop offset="100%" stopColor="#FECACA" />
          </linearGradient>
          <linearGradient id="deptWingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FEE2E2" />
          </linearGradient>
          <linearGradient id="deptTreeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7F1D1D" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#450A0A" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Trees in background */}
        {/* Left trees */}
        <ellipse cx="45" cy="118" rx="22" ry="14" fill="url(#deptTreeGrad)" />
        <ellipse cx="65" cy="115" rx="18" ry="12" fill="url(#deptTreeGrad)" />
        {/* Right trees */}
        <ellipse cx="275" cy="118" rx="22" ry="14" fill="url(#deptTreeGrad)" />
        <ellipse cx="255" cy="115" rx="18" ry="12" fill="url(#deptTreeGrad)" />

        {/* Central Dome Structure */}
        {/* Spire / Finial */}
        <rect x="159" y="8" width="2" height="10" rx="1" fill="#FFFFFF" />
        <circle cx="160" cy="7" r="2.5" fill="#FEE2E2" />

        {/* Lantern / Cupola */}
        <rect x="153" y="18" width="14" height="10" rx="1" fill="#FFFFFF" opacity="0.95" />
        <rect x="155" y="20" width="2" height="6" fill="#7F1D1D" opacity="0.6" />
        <rect x="159" y="20" width="2" height="6" fill="#7F1D1D" opacity="0.6" />
        <rect x="163" y="20" width="2" height="6" fill="#7F1D1D" opacity="0.6" />
        <path d="M 151 18 C 151 12 169 12 169 18 Z" fill="#FFFFFF" opacity="0.9" />

        {/* Main Dome */}
        <path
          d="M 134 52 C 134 26 186 26 186 52 Z"
          fill="url(#deptDomeGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />
        {/* Dome Rib Lines */}
        <path d="M 160 26 L 160 52" stroke="#FCA5A5" strokeWidth="0.8" />
        <path d="M 160 26 C 150 32 144 42 143 52" stroke="#FCA5A5" strokeWidth="0.8" />
        <path d="M 160 26 C 170 32 176 42 177 52" stroke="#FCA5A5" strokeWidth="0.8" />

        {/* Drum (Rotunda base below dome with columns) */}
        <rect x="130" y="52" width="60" height="14" fill="#FFFFFF" opacity="0.95" />
        <rect x="128" y="50" width="64" height="3" fill="#FEF2F2" />
        <rect x="128" y="65" width="64" height="3" fill="#FEF2F2" />
        {/* Drum Windows/Pillars */}
        <rect x="134" y="54" width="3" height="10" fill="#7F1D1D" opacity="0.5" />
        <rect x="142" y="54" width="3" height="10" fill="#7F1D1D" opacity="0.5" />
        <rect x="150" y="54" width="3" height="10" fill="#7F1D1D" opacity="0.5" />
        <rect x="158" y="54" width="3" height="10" fill="#7F1D1D" opacity="0.5" />
        <rect x="166" y="54" width="3" height="10" fill="#7F1D1D" opacity="0.5" />
        <rect x="174" y="54" width="3" height="10" fill="#7F1D1D" opacity="0.5" />
        <rect x="182" y="54" width="3" height="10" fill="#7F1D1D" opacity="0.5" />

        {/* Building Wings Left & Right */}
        {/* Left Wing */}
        <rect x="50" y="82" width="80" height="36" fill="url(#deptWingGrad)" opacity="0.9" />
        {/* Left Wing Windows */}
        <rect x="58" y="88" width="8" height="12" rx="1" fill="#7F1D1D" opacity="0.5" />
        <rect x="72" y="88" width="8" height="12" rx="1" fill="#7F1D1D" opacity="0.5" />
        <rect x="86" y="88" width="8" height="12" rx="1" fill="#7F1D1D" opacity="0.5" />
        <rect x="100" y="88" width="8" height="12" rx="1" fill="#7F1D1D" opacity="0.5" />
        <rect x="114" y="88" width="8" height="12" rx="1" fill="#7F1D1D" opacity="0.5" />
        {/* Left Wing Upper Balustrade */}
        <rect x="48" y="80" width="82" height="3" fill="#FFFFFF" />

        {/* Right Wing */}
        <rect x="190" y="82" width="80" height="36" fill="url(#deptWingGrad)" opacity="0.9" />
        {/* Right Wing Windows */}
        <rect x="198" y="88" width="8" height="12" rx="1" fill="#7F1D1D" opacity="0.5" />
        <rect x="212" y="88" width="8" height="12" rx="1" fill="#7F1D1D" opacity="0.5" />
        <rect x="226" y="88" width="8" height="12" rx="1" fill="#7F1D1D" opacity="0.5" />
        <rect x="240" y="88" width="8" height="12" rx="1" fill="#7F1D1D" opacity="0.5" />
        <rect x="254" y="88" width="8" height="12" rx="1" fill="#7F1D1D" opacity="0.5" />
        {/* Right Wing Upper Balustrade */}
        <rect x="190" y="80" width="82" height="3" fill="#FFFFFF" />

        {/* Center Classical Portico (Pediment & Colonnade) */}
        {/* Triangular Pediment */}
        <polygon points="160,67 200,82 120,82" fill="#FFFFFF" stroke="#FECACA" strokeWidth="0.8" />
        <polygon points="160,70 192,81 128,81" fill="#FEF2F2" />
        <circle cx="160" cy="76" r="3" fill="#FCA5A5" />

        {/* Portico Cornice */}
        <rect x="116" y="82" width="88" height="4" fill="#FFFFFF" />

        {/* Recessed Porch Wall */}
        <rect x="122" y="86" width="76" height="32" fill="#7F1D1D" opacity="0.3" />
        {/* Center Entrance Door */}
        <rect x="153" y="94" width="14" height="24" rx="2" fill="#450A0A" opacity="0.75" />

        {/* Classical Columns (8 White Pillars) */}
        <rect x="124" y="86" width="4.5" height="32" fill="url(#deptPillarGrad)" rx="0.5" />
        <rect x="134" y="86" width="4.5" height="32" fill="url(#deptPillarGrad)" rx="0.5" />
        <rect x="144" y="86" width="4.5" height="32" fill="url(#deptPillarGrad)" rx="0.5" />
        <rect x="150" y="86" width="4.5" height="32" fill="url(#deptPillarGrad)" rx="0.5" />
        <rect x="165" y="86" width="4.5" height="32" fill="url(#deptPillarGrad)" rx="0.5" />
        <rect x="171" y="86" width="4.5" height="32" fill="url(#deptPillarGrad)" rx="0.5" />
        <rect x="181" y="86" width="4.5" height="32" fill="url(#deptPillarGrad)" rx="0.5" />
        <rect x="191" y="86" width="4.5" height="32" fill="url(#deptPillarGrad)" rx="0.5" />

        {/* Steps Base Plinth */}
        <rect x="42" y="118" width="236" height="4" fill="#FFFFFF" />
        <rect x="36" y="122" width="248" height="4" fill="#FEF2F2" />
        <rect x="30" y="126" width="260" height="4" fill="#FEE2E2" />
      </svg>
    </div>
  );
};

export default DeptBannerIllustration;
