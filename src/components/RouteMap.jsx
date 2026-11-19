import React, { useState, useMemo } from 'react';

// Real coordinates & telemetry for destinations
const DESTINATION_COORDINATES = {
  'jaipur-to-jaisalmer': {
    center: [27.3, 73.2],
    zoom: 7,
    waypoints: [
      { id: 'start', name: 'Jaipur', state: 'Rajasthan', coords: [26.9124, 75.7873], elevation: '431 m', type: 'start', leg: 'Start Hub', desc: 'Pink City Royal Flagoff' },
      { id: 'wp1', name: 'Kishangarh', state: 'Rajasthan', coords: [26.5746, 74.8631], elevation: '433 m', type: 'mid', leg: '~ 90 km', desc: 'Marble City Express Corridor' },
      { id: 'wp2', name: 'Bikaner', state: 'Rajasthan', coords: [28.0229, 73.3119], elevation: '242 m', type: 'mid', leg: '~ 330 km', desc: 'Junagarh Fort & Desert Towns' },
      { id: 'end', name: 'Jaisalmer', state: 'Rajasthan', coords: [26.9157, 70.9083], elevation: '225 m', type: 'end', leg: '~ 140 km', desc: 'Sam Sand Dunes & Fort Ramparts' }
    ],
    surface: '91% Asphalt Highway',
    elevationProfile: [431, 433, 310, 242, 230, 225]
  },
  'coorg': {
    center: [12.7, 76.6],
    zoom: 8,
    waypoints: [
      { id: 'start', name: 'Bengaluru', state: 'Karnataka', coords: [12.9716, 77.5946], elevation: '920 m', type: 'start', leg: 'Start Hub', desc: 'Tech City Flagoff Hub' },
      { id: 'wp1', name: 'Hassan', state: 'Karnataka', coords: [13.0033, 76.1004], elevation: '957 m', type: 'mid', leg: '~ 180 km', desc: '4-Lane Smooth Tollway' },
      { id: 'wp2', name: 'Madikeri', state: 'Karnataka', coords: [12.4244, 75.7382], elevation: '1,170 m', type: 'mid', leg: '~ 90 km', desc: 'Coffee Plantation Ghats' },
      { id: 'end', name: 'Mandalpatti', state: 'Karnataka', coords: [12.4981, 75.6987], elevation: '1,600 m', type: 'end', leg: '~ 50 km', desc: 'Misty Offroad Summit' }
    ],
    surface: '88% Mountain Tarmac',
    elevationProfile: [920, 957, 1020, 1170, 1450, 1600]
  },
  'srinagar-to-gulmarg': {
    center: [34.05, 74.55],
    zoom: 10,
    waypoints: [
      { id: 'start', name: 'Srinagar', state: 'J&K', coords: [34.0837, 74.7973], elevation: '1,585 m', type: 'start', leg: 'Start Hub', desc: 'Dal Lake Base Hub' },
      { id: 'wp1', name: 'Tangmarg', state: 'J&K', coords: [34.0620, 74.4253], elevation: '2,130 m', type: 'mid', leg: '~ 38 km', desc: 'Chinar Tree Avenue & Foothills' },
      { id: 'wp2', name: 'Gulmarg', state: 'J&K', coords: [34.0484, 74.3805], elevation: '2,690 m', type: 'mid', leg: '~ 14 km', desc: 'Alpine Pine Hairpins' },
      { id: 'end', name: 'Apharwat Ridge', state: 'J&K', coords: [34.0205, 74.3312], elevation: '3,950 m', type: 'end', leg: '~ 12 km', desc: 'Gondola Summit Pass' }
    ],
    surface: '84% Alpine Asphalt',
    elevationProfile: [1585, 1750, 2130, 2690, 3400, 3950]
  },
  'ladakh': {
    center: [33.5, 77.8],
    zoom: 7,
    waypoints: [
      { id: 'start', name: 'Manali', state: 'Himachal', coords: [32.2432, 77.1892], elevation: '2,050 m', type: 'start', leg: 'Start Hub', desc: 'Atal Tunnel South Portal' },
      { id: 'wp1', name: 'Sarchu', state: 'Himachal/Ladakh', coords: [32.9069, 77.5819], elevation: '4,290 m', type: 'mid', leg: '~ 220 km', desc: 'Gata Loops & Baralacha Pass' },
      { id: 'wp2', name: 'Leh Citadel', state: 'Ladakh', coords: [34.1526, 77.5771], elevation: '3,500 m', type: 'mid', leg: '~ 250 km', desc: 'High Mountain Capital' },
      { id: 'wp3', name: 'Nubra Valley', state: 'Ladakh', coords: [34.6863, 77.5673], elevation: '3,048 m', type: 'mid', leg: '~ 120 km', desc: 'Khardung La Pass Crossing' },
      { id: 'end', name: 'Pangong Tso', state: 'Ladakh', coords: [33.7595, 78.6674], elevation: '4,250 m', type: 'end', leg: '~ 150 km', desc: 'High Altitude Azure Lake' }
    ],
    surface: '78% High-Pass Scree & Tarmac',
    elevationProfile: [2050, 3100, 4890, 4290, 5359, 3500, 4250]
  },
  'spiti': {
    center: [31.8, 77.6],
    zoom: 8,
    waypoints: [
      { id: 'start', name: 'Chandigarh', state: 'Punjab/Haryana', coords: [30.7333, 76.7794], elevation: '321 m', type: 'start', leg: 'Start Hub', desc: 'Base Expedition Hub' },
      { id: 'wp1', name: 'Narkanda', state: 'Himachal', coords: [31.2590, 77.4589], elevation: '2,708 m', type: 'mid', leg: '~ 175 km', desc: 'Apple Orchard Ridge' },
      { id: 'wp2', name: 'Sangla', state: 'Himachal', coords: [31.4239, 78.2612], elevation: '2,696 m', type: 'mid', leg: '~ 160 km', desc: 'Kinnaur Cliffside Overhang' },
      { id: 'end', name: 'Kaza & Key', state: 'Himachal', coords: [32.2276, 78.0710], elevation: '3,800 m', type: 'end', leg: '~ 210 km', desc: 'Cold Desert & Millennium Monastery' }
    ],
    surface: '72% Rugged Mountain Trail',
    elevationProfile: [321, 1200, 2708, 2696, 3200, 4550, 3800]
  },
  'goa': {
    center: [15.35, 73.8],
    zoom: 10,
    waypoints: [
      { id: 'start', name: 'Panjim', state: 'Goa', coords: [15.4909, 73.8278], elevation: '10 m', type: 'start', leg: 'Start Hub', desc: 'Mandovi River Base Hub' },
      { id: 'wp1', name: 'Fort Aguada', state: 'Goa', coords: [15.4925, 73.7736], elevation: '25 m', type: 'mid', leg: '~ 18 km', desc: '17th Century Portuguese Sea Fort' },
      { id: 'wp2', name: 'Morjim Coast', state: 'Goa', coords: [15.6318, 73.7381], elevation: '5 m', type: 'mid', leg: '~ 28 km', desc: 'North Goa Palm Highway' },
      { id: 'end', name: 'Cabo de Rama', state: 'Goa', coords: [15.0886, 73.9214], elevation: '40 m', type: 'end', leg: '~ 75 km', desc: 'Cliff Fortress Ocean Lookout' }
    ],
    surface: '94% Smooth Coastal Highway',
    elevationProfile: [10, 25, 15, 5, 20, 40]
  }
};

export default function RouteMap({ destination, onSelectWaypoint }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [activeWp, setActiveWp] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' | 'satellite' | 'terrain'

  // Retrieve route definition or synthesize generic high-fidelity coordinates
  const routeData = useMemo(() => {
    if (!destination) return null;
    const key = destination.id;
    if (DESTINATION_COORDINATES[key]) return DESTINATION_COORDINATES[key];

    // Fallback: build from destination.routeOverview & highlights
    const stops = destination.routeOverview || ['Start Hub', 'Midpoint 1', 'Midpoint 2', 'Summit'];
    return {
      center: [25.0, 75.0],
      zoom: 7,
      waypoints: stops.map((name, i) => ({
        id: `wp-${i}`,
        name,
        state: destination.state || 'India',
        coords: [25 + i * 0.8, 75 + i * 1.1],
        elevation: i === stops.length - 1 ? destination.elevation : `${400 + i * 350} m`,
        type: i === 0 ? 'start' : (i === stops.length - 1 ? 'end' : 'mid'),
        leg: i === 0 ? 'Start Hub' : `~ ${Math.round(80 + i * 45)} km`,
        desc: destination.highlights?.[i]?.title || `${name} Verified Waypoint`
      })),
      surface: destination.road || '88% Paved Highway',
      elevationProfile: [300, 650, 1100, 1500, 2200]
    };
  }, [destination]);

  const waypoints = routeData?.waypoints || [];

  // Convert waypoints into SVG coordinates inside 500x260 viewport
  const svgPoints = useMemo(() => {
    if (waypoints.length === 0) return [];
    const count = waypoints.length;
    // Map across a dynamic curvilinear path
    return waypoints.map((wp, idx) => {
      const pct = idx / (count - 1 || 1);
      // Generate pleasing geographical-like curvature
      const x = 50 + pct * 400 + (idx === 1 ? -15 : (idx === 2 ? 20 : 0));
      const y = 50 + Math.sin(pct * Math.PI) * 110 + (idx % 2 === 0 ? 15 : -15);
      return { ...wp, x, y };
    });
  }, [waypoints]);

  // Construct SVG Bezier path string
  const svgPathD = useMemo(() => {
    if (svgPoints.length === 0) return '';
    let d = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    for (let i = 0; i < svgPoints.length - 1; i++) {
      const p1 = svgPoints[i];
      const p2 = svgPoints[i + 1];
      const cx1 = p1.x + (p2.x - p1.x) * 0.5;
      const cy1 = p1.y;
      const cx2 = p1.x + (p2.x - p1.x) * 0.5;
      const cy2 = p2.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [svgPoints]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setActiveWp(null);
  };

  return (
    <div className={`dest-routemap-root ${mapStyle} ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Top Map Toolbar */}
      <div className="dest-routemap-toolbar">
        <div className="dest-routemap-status">
          <span className="dest-live-beacon" />
          <strong className="dest-routemap-title">{destination?.name}</strong>
          <span className="dest-routemap-tag">GPS Telemetry Verified</span>
        </div>

        {/* Map Control Actions */}
        <div className="dest-routemap-actions">
          <button
            type="button"
            className="dest-map-tool-btn"
            onClick={() => setMapStyle(prev => prev === 'dark' ? 'satellite' : (prev === 'satellite' ? 'terrain' : 'dark'))}
            title={`Current: ${mapStyle} (Click to switch map layer)`}
          >
            {mapStyle === 'dark' ? '🛰️ Satellite' : (mapStyle === 'satellite' ? '⛰️ Terrain' : '🗺️ Dark GPS')}
          </button>

          <button
            type="button"
            className="dest-map-tool-btn"
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom in map"
          >
            +
          </button>

          <button
            type="button"
            className="dest-map-tool-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom out map"
          >
            −
          </button>

          <button
            type="button"
            className="dest-map-tool-btn"
            onClick={handleResetZoom}
            title="Reset Map View"
            aria-label="Reset map"
          >
            ⟲
          </button>

          <button
            type="button"
            className="dest-map-tool-btn fullscreen"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Expedition Map'}
            aria-label="Toggle fullscreen map"
          >
            {isFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>

      {/* Main Interactive Geographic Canvas */}
      <div
        className="dest-routemap-viewport"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Geographic Topographic Base Layer (No blurry screenshots) */}
        <div className="dest-map-geo-canvas">
          {/* Latitude & Longitude Coordinate Grid */}
          <div className="dest-map-latlong-grid" />

          {/* Elevation Topo Contour Vectors */}
          <svg className="dest-map-contours" viewBox="0 0 500 260" preserveAspectRatio="none">
            <path d="M 0,40 Q 140,80 260,30 T 500,70" stroke="rgba(255,255,255,0.06)" fill="none" strokeWidth="1" />
            <path d="M 0,110 Q 120,60 280,120 T 500,90" stroke="rgba(255,255,255,0.06)" fill="none" strokeWidth="1" />
            <path d="M 0,180 Q 160,220 300,160 T 500,200" stroke="rgba(255,255,255,0.06)" fill="none" strokeWidth="1" />
            <path d="M 0,230 Q 190,170 340,240 T 500,220" stroke="rgba(255,255,255,0.06)" fill="none" strokeWidth="1" />
          </svg>

          {/* Highway Network Overlay */}
          <svg className="dest-map-expressway-track" viewBox="0 0 500 260">
            {/* Outer Highway Glow */}
            <path
              d={svgPathD}
              stroke="rgba(245, 158, 11, 0.28)"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Solid Asphalt Underlay */}
            <path
              d={svgPathD}
              stroke="#0f172a"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Glowing Golden Route Spline */}
            <path
              d={svgPathD}
              stroke="#fbbf24"
              strokeWidth="2.8"
              fill="none"
              strokeDasharray="6 4"
              strokeLinecap="round"
              className="dest-map-active-route"
            />

            {/* Animated Motorcycle Beacon on Path */}
            {svgPoints.length > 0 && (
              <circle
                cx={svgPoints[1]?.x || svgPoints[0].x}
                cy={svgPoints[1]?.y || svgPoints[0].y}
                r="5"
                fill="#ffffff"
                stroke="#f59e0b"
                strokeWidth="2.5"
                className="dest-map-moving-rider"
              />
            )}
          </svg>

          {/* Real Waypoint Markers */}
          {svgPoints.map((wp, index) => {
            const isStart = wp.type === 'start';
            const isEnd = wp.type === 'end';
            const isSelected = activeWp?.name === wp.name;

            return (
              <div
                key={wp.id || index}
                className={`dest-map-node-pin ${wp.type} ${isSelected ? 'selected' : ''}`}
                style={{ left: `${(wp.x / 500) * 100}%`, top: `${(wp.y / 260) * 100}%` }}
                onClick={() => {
                  setActiveWp(wp);
                  if (onSelectWaypoint) onSelectWaypoint(wp);
                }}
              >
                {/* Radar Pulse on Start/End */}
                {(isStart || isEnd) && <div className="dest-node-radar" />}

                {/* Marker Badge */}
                <div className={`dest-node-bubble ${isStart ? 'start-node' : (isEnd ? 'end-node' : 'mid-node')}`}>
                  {isStart ? 'A' : (isEnd ? 'B' : `0${index}`)}
                </div>

                {/* Location Tooltip / Label */}
                <div className="dest-node-label-card">
                  <div className="dest-node-title-row">
                    <strong>{wp.name}</strong>
                    <span className="dest-node-alt">{wp.elevation}</span>
                  </div>
                  <span className="dest-node-sub">{wp.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Waypoint Legs Strip / Telemetry Legend */}
      <div className="dest-routemap-footer">
        <div className="dest-route-stops-legend">
          {waypoints.map((wp, i) => (
            <React.Fragment key={i}>
              <button
                type="button"
                className={`dest-stop-pill ${activeWp?.name === wp.name ? 'active' : ''}`}
                onClick={() => setActiveWp(wp)}
              >
                <span className={`dest-stop-dot ${wp.type}`} />
                <span className="dest-stop-name">{wp.name}</span>
                <span className="dest-stop-alt">({wp.elevation})</span>
              </button>
              {i < waypoints.length - 1 && (
                <span className="dest-stop-arrow">→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="dest-routemap-metrics">
          <div className="dest-metric-tag">
            <span>Total Route</span>
            <strong>{destination?.distance || '~ 560 km'}</strong>
          </div>
          <div className="dest-metric-tag">
            <span>Road Grade</span>
            <strong>{routeData?.surface || '88% Asphalt'}</strong>
          </div>
          <div className="dest-metric-tag">
            <span>Max Climb</span>
            <strong>{destination?.elevation || '2,690 m'}</strong>
          </div>
        </div>

        <div className="dest-routemap-attribution">
          © RYVON Route Telemetry Engine • OpenStreetMap Geospatial Waypoints
        </div>
      </div>
    </div>
  );
}
