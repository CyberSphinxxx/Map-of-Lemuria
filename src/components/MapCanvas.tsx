import { useState, useEffect } from 'react';

interface MapPin {
  id: string;
  name: string;
  x: number;
  y: number;
  type: string;
}

export default function MapCanvas() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewBox, setViewBox] = useState("-500 -500 1000 1000");

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch('/api/search-entities?q='); // This now returns subset of all
        const data = await res.json();
        const locations = data
          .filter((e: any) => e.type === 'location')
          .map((e: any) => ({
            id: e.id,
            name: e.name,
            x: e.x || Math.random() * 800 - 400, // Fallback random for demo if coords missing
            y: e.y || Math.random() * 800 - 400,
            type: e.type
          }));
        setPins(locations);
      } catch (err) {
        console.error('Failed to fetch map marker data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, []);

  if (loading) return <div className="map-loading">Charting the Realm...</div>;

  return (
    <div className="map-canvas-container" style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--bg-primary)' }}>
      <svg 
        viewBox={viewBox} 
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Arcane Lattice Background */}
        <defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--border-color)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" />

        {/* Location Pins (Surveyor's Brass) */}
        {pins.map(pin => (
          <g key={pin.id} transform={`translate(${pin.x}, ${pin.y})`} className="map-pin-group">
            <circle r="6" fill="var(--accent-primary)" />
            <circle r="10" fill="none" stroke="var(--accent-primary)" strokeWidth="1" opacity="0.4">
               <animate attributeName="r" from="6" to="15" dur="3s" repeatCount="indefinite" />
               <animate attributeName="opacity" from="0.4" to="0" dur="3s" repeatCount="indefinite" />
            </circle>
            <text 
              y="-18" 
              textAnchor="middle" 
              fill="var(--text-primary)" 
              style={{ fontSize: '13px', fontFamily: 'var(--font-display)', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              {pin.name.toUpperCase()}
            </text>
            <circle 
              r="20" 
              fill="transparent" 
              style={{ cursor: 'pointer' }} 
              onClick={() => window.location.href = `/wiki/${pin.id}`}
            />
          </g>
        ))}
      </svg>

      <div className="map-controls-overlay">
        <button onClick={() => setViewBox("-500 -500 1000 1000")}>Unfurl Map</button>
      </div>

      <style>{`
        .map-pin-group:hover circle:first-child {
          fill: #fff;
          filter: drop-shadow(0 0 10px var(--accent-primary));
        }
        .map-pin-group:hover text {
          fill: var(--accent-primary);
          letter-spacing: 0.1em;
        }
        .map-controls-overlay {
          position: absolute;
          bottom: 24px;
          right: 24px;
          display: flex;
          gap: 12px;
        }
        .map-controls-overlay button {
          background: var(--bg-tertiary);
          border: 1px solid var(--accent-primary);
          color: var(--accent-primary);
          padding: 8px 16px;
          border-radius: 2px;
          font-size: 0.75rem;
          font-family: var(--font-display);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .map-controls-overlay button:hover {
          background: var(--accent-primary);
          color: var(--bg-primary);
        }
      `}</style>
    </div>
  );
}
