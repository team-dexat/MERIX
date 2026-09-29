import L from 'leaflet';

/**
 * Embedded SVG Pin Generator for Leaflet Maps.
 * Guarantees 100% reliable icon rendering across all browsers, bundlers, and offline environments.
 */

// SVG Pin Template
const generateSvgPin = (color: string, label: string = '', pulse: boolean = false) => `
<div style="position: relative; width: 34px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; cursor: pointer; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
  ${pulse ? `<div style="position: absolute; top: -4px; left: -4px; width: 42px; height: 42px; border-radius: 50%; background: ${color}; opacity: 0.35; animation: pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>` : ''}
  <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 0C7.61116 0 0 7.61116 0 17C0 27.5 14.5 42.5 16.1 43.8C16.6 44.2 17.4 44.2 17.9 43.8C19.5 42.5 34 27.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="${color}"/>
    <circle cx="17" cy="16" r="10" fill="#ffffff"/>
  </svg>
  ${label ? `
    <span style="position: absolute; top: 7px; left: 0; right: 0; text-align: center; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 800; color: ${color}; line-height: 1;">
      ${label}
    </span>
  ` : `
    <span style="position: absolute; top: 12px; width: 8px; height: 8px; border-radius: 50%; background-color: ${color};"></span>
  `}
</div>
`;

// Keyframe CSS for pulse animation (injected once into DOM)
if (typeof document !== 'undefined') {
  const styleId = 'leaflet-custom-pulse-style';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.innerHTML = `
      @keyframes pulseRing {
        0% { transform: scale(0.6); opacity: 0.8; }
        50% { transform: scale(1.2); opacity: 0.3; }
        100% { transform: scale(1.6); opacity: 0; }
      }
      .custom-svg-marker {
        background: transparent !important;
        border: none !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

/**
 * Creates a custom SVG DivIcon for a map pin.
 */
export const createMapPin = (color: string = '#1e40af', label: string = '', pulse: boolean = false): L.DivIcon => {
  return L.divIcon({
    className: 'custom-svg-marker',
    html: generateSvgPin(color, label, pulse),
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -42]
  });
};

/**
 * Predefined role / status map markers
 */
export const MapIcons = {
  blue: (label: string = '', pulse: boolean = false) => createMapPin('#1e40af', label, pulse),
  green: (label: string = '', pulse: boolean = false) => createMapPin('#059669', label, pulse),
  red: (label: string = '', pulse: boolean = false) => createMapPin('#dc2626', label, pulse),
  amber: (label: string = '', pulse: boolean = false) => createMapPin('#d97706', label, pulse),
  purple: (label: string = '', pulse: boolean = false) => createMapPin('#7c3aed', label, pulse),
  selected: (label: string = '') => createMapPin('#2563eb', label, true)
};

/**
 * Configures Leaflet default icons so any unstyled `<Marker />` renders correctly.
 */
export const setupDefaultLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  const defaultSvg = `data:image/svg+xml;utf8,<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 0C5.59644 0 0 5.59644 0 12.5C0 21.875 11.25 39.5 11.875 40.45C12.1875 40.95 12.8125 40.95 13.125 40.45C13.75 39.5 25 21.875 25 12.5C25 5.59644 19.4036 0 12.5 0Z" fill="%231e40af"/><circle cx="12.5" cy="12.5" r="5.5" fill="white"/></svg>`;
  
  L.Icon.Default.mergeOptions({
    iconUrl: defaultSvg,
    iconRetinaUrl: defaultSvg,
    shadowUrl: '',
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -38]
  });
};

// Initialize globally
setupDefaultLeafletIcons();
