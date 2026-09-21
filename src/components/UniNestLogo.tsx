import React from 'react';
import { useTheme } from '../context/ThemeContext';

// Standard 3D Icon SVG (for light backgrounds)
export const UNINEST_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <filter id="softDepthShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#08182d" flood-opacity="0.22" />
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#08182d" flood-opacity="0.15" />
    </filter>

    <filter id="orangeShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#c2410c" flood-opacity="0.28" />
    </filter>

    <linearGradient id="navyMainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#143c72" />
      <stop offset="35%" stop-color="#0c254b" />
      <stop offset="70%" stop-color="#091c38" />
      <stop offset="100%" stop-color="#051226" />
    </linearGradient>

    <linearGradient id="navySheen" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75" />
      <stop offset="25%" stop-color="#7da8df" stop-opacity="0.5" />
      <stop offset="60%" stop-color="#1d4ed8" stop-opacity="0" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.4" />
    </linearGradient>

    <linearGradient id="orangeBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff9248" />
      <stop offset="22%" stop-color="#ff6a00" />
      <stop offset="55%" stop-color="#f05300" />
      <stop offset="85%" stop-color="#d03b00" />
      <stop offset="100%" stop-color="#9a2900" />
    </linearGradient>

    <linearGradient id="orangeGlossHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#ffedd5" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#ff9800" stop-opacity="0" />
    </linearGradient>
  </defs>

  <g filter="url(#softDepthShadow)">
    <path 
      d="M 124,210 L 256,92 L 388,210 L 388,210 L 360,210 L 360,358 C 360,378 344,394 324,394 L 188,394 C 168,394 152,378 152,358 L 152,210 Z" 
      fill="none" 
      stroke="url(#navyMainGrad)" 
      stroke-width="36" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <path 
      d="M 126,206 L 256,90 L 386,206" 
      fill="none" 
      stroke="url(#navySheen)" 
      stroke-width="7" 
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.85"
    />
    <!-- 3 Orange Arches -->
    <g filter="url(#orangeShadow)">
      <path d="M 180,236 Q 256,198 332,236" fill="none" stroke="url(#orangeBarGrad)" stroke-width="32" stroke-linecap="round" />
      <path d="M 184,230 Q 256,192 328,230" fill="none" stroke="url(#orangeGlossHighlight)" stroke-width="6.5" stroke-linecap="round" />
    </g>
    <g filter="url(#orangeShadow)">
      <path d="M 180,286 Q 256,248 332,286" fill="none" stroke="url(#orangeBarGrad)" stroke-width="32" stroke-linecap="round" />
      <path d="M 184,280 Q 256,242 328,280" fill="none" stroke="url(#orangeGlossHighlight)" stroke-width="6.5" stroke-linecap="round" />
    </g>
    <g filter="url(#orangeShadow)">
      <path d="M 180,336 Q 256,298 332,336" fill="none" stroke="url(#orangeBarGrad)" stroke-width="32" stroke-linecap="round" />
      <path d="M 184,330 Q 256,292 328,330" fill="none" stroke="url(#orangeGlossHighlight)" stroke-width="6.5" stroke-linecap="round" />
    </g>
  </g>
</svg>
`)}`;

// Inverted 3D Icon SVG (High-contrast pure white house frame + orange nest, visible on dark headers and dark mode)
export const UNINEST_ICON_INVERTED_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <filter id="whiteGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#ffffff" flood-opacity="0.25" />
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#ff6a00" flood-opacity="0.3" />
    </filter>

    <linearGradient id="whiteFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>

    <linearGradient id="orangeBarGradInv" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff9248" />
      <stop offset="30%" stop-color="#ff6a00" />
      <stop offset="75%" stop-color="#f05300" />
      <stop offset="100%" stop-color="#c2410c" />
    </linearGradient>

    <linearGradient id="orangeGlossInv" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#ffedd5" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#ff9800" stop-opacity="0" />
    </linearGradient>
  </defs>

  <g filter="url(#whiteGlow)">
    <!-- Crisp Pure White Tubular House Frame -->
    <path 
      d="M 124,210 L 256,92 L 388,210 L 388,210 L 360,210 L 360,358 C 360,378 344,394 324,394 L 188,394 C 168,394 152,378 152,358 L 152,210 Z" 
      fill="none" 
      stroke="url(#whiteFrameGrad)" 
      stroke-width="38" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <!-- Specular White Ridge -->
    <path 
      d="M 126,206 L 256,90 L 386,206" 
      fill="none" 
      stroke="#ffffff" 
      stroke-width="8" 
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- 3 Glossy Orange Arches -->
    <g>
      <path d="M 180,236 Q 256,198 332,236" fill="none" stroke="url(#orangeBarGradInv)" stroke-width="32" stroke-linecap="round" />
      <path d="M 184,230 Q 256,192 328,230" fill="none" stroke="url(#orangeGlossInv)" stroke-width="6.5" stroke-linecap="round" />
    </g>
    <g>
      <path d="M 180,286 Q 256,248 332,286" fill="none" stroke="url(#orangeBarGradInv)" stroke-width="32" stroke-linecap="round" />
      <path d="M 184,280 Q 256,242 328,280" fill="none" stroke="url(#orangeGlossInv)" stroke-width="6.5" stroke-linecap="round" />
    </g>
    <g>
      <path d="M 180,336 Q 256,298 332,336" fill="none" stroke="url(#orangeBarGradInv)" stroke-width="32" stroke-linecap="round" />
      <path d="M 184,330 Q 256,292 328,330" fill="none" stroke="url(#orangeGlossInv)" stroke-width="6.5" stroke-linecap="round" />
    </g>
  </g>
</svg>
`)}`;

// Full Logo SVG (For Light Backgrounds: Navy house + Navy "Uni" + Orange "Nest")
export const UNINEST_FULL_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 6 325 88" width="100%" height="100%">
  <defs>
    <linearGradient id="navyMainGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#143c72" />
      <stop offset="40%" stop-color="#0c254b" />
      <stop offset="100%" stop-color="#051226" />
    </linearGradient>

    <linearGradient id="orangeBarGradLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff9248" />
      <stop offset="30%" stop-color="#ff6a00" />
      <stop offset="70%" stop-color="#f05300" />
      <stop offset="100%" stop-color="#9a2900" />
    </linearGradient>

    <linearGradient id="orangeGlossLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="60%" stop-color="#ffedd5" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#ff9800" stop-opacity="0" />
    </linearGradient>
  </defs>

  <g transform="translate(10, 8) scale(0.18)">
    <path 
      d="M 124,210 L 256,92 L 388,210 L 388,210 L 360,210 L 360,358 C 360,378 344,394 324,394 L 188,394 C 168,394 152,378 152,358 L 152,210 Z" 
      fill="none" 
      stroke="url(#navyMainGradLight)" 
      stroke-width="38" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <path d="M 180,236 Q 256,198 332,236" fill="none" stroke="url(#orangeBarGradLight)" stroke-width="32" stroke-linecap="round" />
    <path d="M 184,230 Q 256,192 328,230" fill="none" stroke="url(#orangeGlossLight)" stroke-width="6.5" stroke-linecap="round" />
    <path d="M 180,286 Q 256,248 332,286" fill="none" stroke="url(#orangeBarGradLight)" stroke-width="32" stroke-linecap="round" />
    <path d="M 184,280 Q 256,242 328,280" fill="none" stroke="url(#orangeGlossLight)" stroke-width="6.5" stroke-linecap="round" />
    <path d="M 180,336 Q 256,298 332,336" fill="none" stroke="url(#orangeBarGradLight)" stroke-width="32" stroke-linecap="round" />
    <path d="M 184,330 Q 256,292 328,330" fill="none" stroke="url(#orangeGlossLight)" stroke-width="6.5" stroke-linecap="round" />
  </g>

  <!-- Typography: Uni (Dark Navy) + Nest (Vibrant Orange) -->
  <g transform="translate(112, 68)" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="800">
    <text x="0" y="0" font-size="52" fill="#0A1931" letter-spacing="-1.5">Uni</text>
    <text x="86" y="0" font-size="52" fill="#FF6A00" letter-spacing="-1.5">Nest</text>
  </g>
</svg>
`)}`;

// High-Contrast Inverted Full Logo SVG (For Dark Navy headers #0A1931 and Dark Mode: White Frame + White "Uni" + Orange "Nest")
export const UNINEST_FULL_LOGO_INVERTED_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 6 325 88" width="100%" height="100%">
  <defs>
    <linearGradient id="whiteFrameGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>

    <linearGradient id="orangeBarGradFullInv" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff9248" />
      <stop offset="25%" stop-color="#ff6a00" />
      <stop offset="70%" stop-color="#f05300" />
      <stop offset="100%" stop-color="#c2410c" />
    </linearGradient>

    <linearGradient id="orangeGlossFullInv" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#ffedd5" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#ff9800" stop-opacity="0" />
    </linearGradient>

    <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- 3D Icon with Crisp Pure White Frame -->
  <g transform="translate(10, 8) scale(0.18)" filter="url(#logoGlow)">
    <path 
      d="M 124,210 L 256,92 L 388,210 L 388,210 L 360,210 L 360,358 C 360,378 344,394 324,394 L 188,394 C 168,394 152,378 152,358 L 152,210 Z" 
      fill="none" 
      stroke="url(#whiteFrameGradFull)" 
      stroke-width="38" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <path 
      d="M 126,206 L 256,90 L 386,206" 
      fill="none" 
      stroke="#ffffff" 
      stroke-width="8" 
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- 3 Glossy Orange Arches -->
    <path d="M 180,236 Q 256,198 332,236" fill="none" stroke="url(#orangeBarGradFullInv)" stroke-width="32" stroke-linecap="round" />
    <path d="M 184,230 Q 256,192 328,230" fill="none" stroke="url(#orangeGlossFullInv)" stroke-width="6.5" stroke-linecap="round" />
    <path d="M 180,286 Q 256,248 332,286" fill="none" stroke="url(#orangeBarGradFullInv)" stroke-width="32" stroke-linecap="round" />
    <path d="M 184,280 Q 256,242 328,280" fill="none" stroke="url(#orangeGlossFullInv)" stroke-width="6.5" stroke-linecap="round" />
    <path d="M 180,336 Q 256,298 332,336" fill="none" stroke="url(#orangeBarGradFullInv)" stroke-width="32" stroke-linecap="round" />
    <path d="M 184,330 Q 256,292 328,330" fill="none" stroke="url(#orangeGlossFullInv)" stroke-width="6.5" stroke-linecap="round" />
  </g>

  <!-- High-Contrast Typography: Pure White 'Uni' + Brilliant Orange 'Nest' -->
  <g transform="translate(112, 68)" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="800">
    <text x="0" y="0" font-size="52" fill="#FFFFFF" letter-spacing="-1.5">Uni</text>
    <text x="86" y="0" font-size="52" fill="#FF6A00" letter-spacing="-1.5">Nest</text>
  </g>
</svg>
`)}`;

interface UniNestLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'icon';
  showTagline?: boolean;
  className?: string;
  inverted?: boolean;
}

export const UniNestLogo: React.FC<UniNestLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = false,
  className = '',
  inverted,
}) => {
  let isDarkTheme = false;
  try {
    const themeContext = useTheme();
    isDarkTheme = themeContext?.isDark ?? false;
  } catch {
    // If rendered outside ThemeProvider, fallback to DOM check
    if (typeof document !== 'undefined') {
      isDarkTheme = document.documentElement.classList.contains('dark');
    }
  }

  // Use inverted high-contrast logo if explicitly requested or if dark theme is active
  const shouldUseInverted = inverted !== undefined ? inverted : isDarkTheme;

  const iconHeights = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-11 w-11',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
    hero: 'h-24 w-24'
  };

  const fullHeights = {
    xs: 'h-6 sm:h-7',
    sm: 'h-7 sm:h-9',
    md: 'h-8 sm:h-11',
    lg: 'h-11 sm:h-14',
    xl: 'h-14 sm:h-16',
    hero: 'h-16 sm:h-20'
  };

  if (variant === 'icon') {
    return (
      <div className={`inline-flex flex-col items-center select-none shrink-0 ${className}`}>
        <img
          src={shouldUseInverted ? UNINEST_ICON_INVERTED_SVG : UNINEST_ICON_SVG}
          alt="UniNest 3D Icon"
          className={`${iconHeights[size]} object-contain shrink-0 drop-shadow-sm transition-transform duration-200 hover:scale-105`}
        />
        {showTagline && (
          <span className={`text-[13px] font-medium tracking-normal mt-1 ${shouldUseInverted ? 'text-white/80' : 'text-gray-500'}`}>
            making Nigeria student comfortable
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center select-none shrink-0 ${className}`}>
      <img
        src={shouldUseInverted ? UNINEST_FULL_LOGO_INVERTED_SVG : UNINEST_FULL_LOGO_SVG}
        alt="UniNest Logo"
        className={`${fullHeights[size]} w-auto object-contain shrink-0 transition-transform duration-200 hover:scale-102`}
      />
      {showTagline && (
        <span className={`text-[13px] font-medium tracking-normal mt-0.5 ${shouldUseInverted ? 'text-white/80' : 'text-gray-500'}`}>
          making Nigeria student comfortable
        </span>
      )}
    </div>
  );
};
