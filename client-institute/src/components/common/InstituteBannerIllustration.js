import React from 'react';

/**
 * Neoclassical Institute Building Illustration with Columns and Green Trees
 * Exactly matching the design in the Institute Dashboard banner reference.
 */
const InstituteBannerIllustration = ({ className = '', style = {} }) => {
  return (
    <div
      className={`d-flex align-items-center justify-content-center ${className}`}
      style={{
        width: '170px',
        height: '110px',
        flexShrink: 0,
        ...style
      }}
    >
      <svg
        viewBox="0 0 240 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
          filter: 'drop-shadow(0 8px 16px rgba(37, 99, 235, 0.08))'
        }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="domeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="pedimentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id="wallRecessGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="treeFrontGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
          <linearGradient id="treeBackGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
          <linearGradient id="pillarGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
        </defs>

        {/* Soft ground shadow */}
        <ellipse cx="120" cy="138" rx="105" ry="8" fill="rgba(15, 23, 42, 0.08)" />

        {/* --- LEFT TREE --- */}
        <g id="leftTree">
          {/* Trunk */}
          <rect x="25" y="105" width="7" height="25" rx="3" fill="#854D0E" />
          {/* Back foliage circle */}
          <circle cx="21" cy="98" r="18" fill="url(#treeBackGrad)" />
          {/* Front foliage circle */}
          <circle cx="34" cy="104" r="16" fill="url(#treeFrontGrad)" />
        </g>

        {/* --- RIGHT TREE --- */}
        <g id="rightTree">
          {/* Trunk */}
          <rect x="208" y="105" width="7" height="25" rx="3" fill="#854D0E" />
          {/* Back foliage circle */}
          <circle cx="219" cy="98" r="18" fill="url(#treeBackGrad)" />
          {/* Front foliage circle */}
          <circle cx="206" cy="104" r="16" fill="url(#treeFrontGrad)" />
        </g>

        {/* --- MAIN BUILDING --- */}
        <g id="instituteBuilding">
          {/* Top Cupola / Dome Spire */}
          {/* Finial / Spire */}
          <rect x="118.5" y="12" width="3" height="12" rx="1.5" fill="#F59E0B" />
          <circle cx="120" cy="10" r="3.5" fill="#FBBF24" />

          {/* Dome */}
          <path d="M 110 32 C 110 20 130 20 130 32 Z" fill="url(#domeGrad)" stroke="#0284C7" strokeWidth="1" />
          {/* Cupola base */}
          <rect x="108" y="32" width="24" height="6" rx="1.5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />

          {/* Triangular Pediment (Roof) */}
          <polygon
            points="120,38 186,64 54,64"
            fill="url(#pedimentGrad)"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          {/* Pediment Tympanum Inset */}
          <polygon
            points="120,44 176,62 64,62"
            fill="#F1F5F9"
          />
          {/* Pediment Central Oculus / Round Window */}
          <circle cx="120" cy="54" r="5" fill="#0284C7" opacity="0.85" />
          <circle cx="120" cy="54" r="3" fill="#38BDF8" opacity="0.6" />

          {/* Cornice / Entablature (Horizontal beams below pediment) */}
          <rect x="50" y="64" width="140" height="6" rx="1" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <rect x="53" y="70" width="134" height="4" fill="#E2E8F0" />

          {/* Recessed Porch & Wall Behind Columns */}
          <rect x="56" y="74" width="128" height="42" fill="url(#wallRecessGrad)" />

          {/* Windows on left and right inside recessed porch */}
          {/* Left Windows */}
          <rect x="68" y="82" width="10" height="18" rx="1.5" fill="#38BDF8" opacity="0.3" stroke="#64748B" strokeWidth="0.8" />
          <rect x="85" y="82" width="10" height="18" rx="1.5" fill="#38BDF8" opacity="0.3" stroke="#64748B" strokeWidth="0.8" />
          {/* Right Windows */}
          <rect x="145" y="82" width="10" height="18" rx="1.5" fill="#38BDF8" opacity="0.3" stroke="#64748B" strokeWidth="0.8" />
          <rect x="162" y="82" width="10" height="18" rx="1.5" fill="#38BDF8" opacity="0.3" stroke="#64748B" strokeWidth="0.8" />

          {/* Central Entrance Door */}
          <rect x="112" y="80" width="16" height="36" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="1" />
          {/* Fanlight Arch over Door */}
          <path d="M 112 85 C 112 79 128 79 128 85 Z" fill="#38BDF8" opacity="0.4" stroke="#475569" strokeWidth="0.8" />

          {/* Classical White Columns (8 Columns) */}
          {/* Col 1 */}
          <rect x="58" y="74" width="6" height="42" rx="1" fill="url(#pillarGrad)" stroke="#CBD5E1" strokeWidth="0.75" />
          {/* Col 2 */}
          <rect x="74" y="74" width="6" height="42" rx="1" fill="url(#pillarGrad)" stroke="#CBD5E1" strokeWidth="0.75" />
          {/* Col 3 */}
          <rect x="91" y="74" width="6" height="42" rx="1" fill="url(#pillarGrad)" stroke="#CBD5E1" strokeWidth="0.75" />
          {/* Col 4 */}
          <rect x="104" y="74" width="6" height="42" rx="1" fill="url(#pillarGrad)" stroke="#CBD5E1" strokeWidth="0.75" />
          {/* Col 5 */}
          <rect x="130" y="74" width="6" height="42" rx="1" fill="url(#pillarGrad)" stroke="#CBD5E1" strokeWidth="0.75" />
          {/* Col 6 */}
          <rect x="143" y="74" width="6" height="42" rx="1" fill="url(#pillarGrad)" stroke="#CBD5E1" strokeWidth="0.75" />
          {/* Col 7 */}
          <rect x="160" y="74" width="6" height="42" rx="1" fill="url(#pillarGrad)" stroke="#CBD5E1" strokeWidth="0.75" />
          {/* Col 8 */}
          <rect x="176" y="74" width="6" height="42" rx="1" fill="url(#pillarGrad)" stroke="#CBD5E1" strokeWidth="0.75" />

          {/* Column Capitals (Top Details) */}
          <rect x="56" y="73" width="10" height="3" rx="0.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <rect x="72" y="73" width="10" height="3" rx="0.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <rect x="89" y="73" width="10" height="3" rx="0.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <rect x="102" y="73" width="10" height="3" rx="0.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <rect x="128" y="73" width="10" height="3" rx="0.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <rect x="141" y="73" width="10" height="3" rx="0.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <rect x="158" y="73" width="10" height="3" rx="0.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <rect x="174" y="73" width="10" height="3" rx="0.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />

          {/* Column Bases */}
          <rect x="56" y="114" width="10" height="2.5" rx="0.5" fill="#E2E8F0" />
          <rect x="72" y="114" width="10" height="2.5" rx="0.5" fill="#E2E8F0" />
          <rect x="89" y="114" width="10" height="2.5" rx="0.5" fill="#E2E8F0" />
          <rect x="102" y="114" width="10" height="2.5" rx="0.5" fill="#E2E8F0" />
          <rect x="128" y="114" width="10" height="2.5" rx="0.5" fill="#E2E8F0" />
          <rect x="141" y="114" width="10" height="2.5" rx="0.5" fill="#E2E8F0" />
          <rect x="158" y="114" width="10" height="2.5" rx="0.5" fill="#E2E8F0" />
          <rect x="174" y="114" width="10" height="2.5" rx="0.5" fill="#E2E8F0" />

          {/* Foundation & Steps (Base of building) */}
          {/* Top Step */}
          <rect x="50" y="116" width="140" height="6" rx="1" fill="url(#stepGrad)" stroke="#CBD5E1" strokeWidth="1" />
          {/* Middle Step */}
          <rect x="46" y="122" width="148" height="6" rx="1" fill="url(#stepGrad)" stroke="#CBD5E1" strokeWidth="1" />
          {/* Bottom Step */}
          <rect x="42" y="128" width="156" height="6" rx="1" fill="url(#stepGrad)" stroke="#CBD5E1" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};

export default InstituteBannerIllustration;
