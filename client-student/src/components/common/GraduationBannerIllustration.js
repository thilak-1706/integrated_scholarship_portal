import React from 'react';

/**
 * 3D Graduation Cap on Books with Diploma Scroll Illustration
 * Matching the exact visual aesthetic in the reference image.
 */
const GraduationBannerIllustration = ({ className = '', style = {} }) => {
  return (
    <div
      className={`d-none d-md-flex align-items-center justify-content-center ${className}`}
      style={{
        width: '180px',
        height: '140px',
        flexShrink: 0,
        ...style
      }}
    >
      <svg
        viewBox="0 0 240 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(0 12px 24px rgba(37, 99, 235, 0.15))' }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="bookBottomGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="bookMidGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="bookTopGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="tasselGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Soft background glow & cloud base */}
        <ellipse cx="120" cy="175" rx="85" ry="18" fill="rgba(37, 99, 235, 0.08)" />
        <ellipse cx="60" cy="165" rx="40" ry="12" fill="url(#cloudGrad)" />
        <ellipse cx="180" cy="168" rx="45" ry="13" fill="url(#cloudGrad)" />

        {/* --- BOOK 1 (Bottom: Blue Book) --- */}
        <g id="bottomBook">
          {/* Pages block */}
          <path d="M 40 162 L 185 162 L 195 152 L 50 152 Z" fill="#F8FAFC" />
          <path d="M 185 162 L 195 152 L 195 162 L 185 172 Z" fill="#E2E8F0" />
          {/* Cover bottom */}
          <path d="M 35 168 L 190 168 L 202 156 L 47 156 Z" fill="url(#bookBottomGrad)" />
          <rect x="35" y="165" width="10" height="9" rx="2" fill="#1E40AF" />
        </g>

        {/* --- BOOK 2 (Middle: Crimson Red Book) --- */}
        <g id="middleBook">
          {/* Pages block */}
          <path d="M 52 147 L 175 147 L 186 138 L 63 138 Z" fill="#F8FAFC" />
          <path d="M 175 147 L 186 138 L 186 148 L 175 157 Z" fill="#E2E8F0" />
          {/* Cover */}
          <path d="M 48 152 L 180 152 L 192 142 L 60 142 Z" fill="url(#bookMidGrad)" />
          <rect x="48" y="149" width="9" height="8" rx="2" fill="#991B1B" />
          {/* Bookmark ribbon hanging down */}
          <path d="M 125 152 L 125 174 L 131 168 L 137 174 L 137 152 Z" fill="#F59E0B" />
        </g>

        {/* --- DIPLOMA SCROLL (Resting in front of books) --- */}
        <g id="diplomaScroll">
          <rect x="30" y="152" width="65" height="15" rx="7.5" fill="#FFFBEB" stroke="#FEF08A" strokeWidth="1.5" transform="rotate(-15 30 152)" />
          {/* Gold ribbon ring */}
          <rect x="52" y="142" width="10" height="16" rx="2" fill="url(#ribbonGrad)" transform="rotate(-15 52 142)" />
        </g>

        {/* --- GRADUATION MORTARBOARD CAP (Top) --- */}
        <g id="gradCap">
          {/* Cap skull cap base */}
          <path d="M 85 95 C 85 118 155 118 155 95 Z" fill="#0F172A" />
          <ellipse cx="120" cy="95" rx="35" ry="10" fill="#1E293B" />

          {/* Diamond Cap Top (Isometric angled) */}
          <polygon points="120,40 195,68 120,95 45,68" fill="url(#capGrad)" stroke="#334155" strokeWidth="1.5" />
          
          {/* Top diamond highlight facet */}
          <polygon points="120,43 190,68 120,92 50,68" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />

          {/* Center Button */}
          <ellipse cx="120" cy="68" rx="5" ry="3.5" fill="#FBBF24" />

          {/* Tassel Ribbon & Hanging Brush */}
          <path
            d="M 120 68 C 145 68 175 75 178 95 C 180 115 176 130 176 142"
            fill="none"
            stroke="url(#tasselGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Tassel brush */}
          <polygon points="172,138 180,138 183,158 169,158" fill="url(#tasselGrad)" />
          <ellipse cx="176" cy="138" rx="4" ry="2" fill="#D97706" />
        </g>

        {/* Floating golden spark elements */}
        <g id="sparkles">
          <circle cx="36" cy="55" r="2.5" fill="#FBBF24" opacity="0.8" />
          <polygon points="45,40 47,44 51,45 47,46 45,50 43,46 39,45 43,44" fill="#FBBF24" opacity="0.9" />
          <circle cx="205" cy="45" r="2" fill="#60A5FA" opacity="0.8" />
          <polygon points="200,90 202,94 206,95 202,96 200,100 198,96 194,95 198,94" fill="#FBBF24" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
};

export default GraduationBannerIllustration;
