import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FiMapPin, FiTruck } from 'react-icons/fi';

// Fallback coordinate mappings for our Indian Zones to enable smooth visualization
const ZONE_COORDS = {
  'zone-1': [28.625, 77.37],  // North Zone / Noida Area
  'zone-2': [28.46, 77.03],   // South Zone / Gurgaon Area
  'zone-3': [28.54, 77.28],   // East Zone / Okhla Area
  'zone-4': [28.57, 77.19],   // West Zone / Dwarka/West Delhi Area
  'zone-5': [28.63, 77.22],   // Central Zone / Connaught Place Area
};

const MapPlaceholder = ({
  pickupAddress = 'Noida',
  dropAddress = 'New Delhi',
  status = 'assigned',
  agentName = 'Rider Agent',
  pickupZone = 'zone-1',
  dropZone = 'zone-5',
  agentLat = null,
  agentLng = null,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({ pickup: null, drop: null, agent: null });
  const routeLineRef = useRef(null);

  // Parse coordinate origins
  const pickupLatLng = ZONE_COORDS[pickupZone] || ZONE_COORDS['zone-1'];
  const dropLatLng = ZONE_COORDS[dropZone] || ZONE_COORDS['zone-5'];

  useEffect(() => {
    // Initialize leaflet map if not already done
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(pickupLatLng, 12);

      // OpenStreetMap premium tile styles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Add zoom control to bottom right
      L.control.zoom({
        position: 'bottomright',
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Remove existing markers
    if (markersRef.current.pickup) map.removeLayer(markersRef.current.pickup);
    if (markersRef.current.drop) map.removeLayer(markersRef.current.drop);
    if (markersRef.current.agent) map.removeLayer(markersRef.current.agent);
    if (routeLineRef.current) map.removeLayer(routeLineRef.current);

    // Create custom leaflet HTML markers using Tailwind
    const pickupIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 bg-orange-500 rounded-full opacity-20 animate-ping"></div>
          <div class="relative w-6 h-6 bg-orange-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const dropIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 bg-emerald-500 rounded-full opacity-20 animate-ping"></div>
          <div class="relative w-6 h-6 bg-emerald-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add pickup and drop markers
    markersRef.current.pickup = L.marker(pickupLatLng, { icon: pickupIcon })
      .addTo(map)
      .bindPopup(`<b>Pickup Location</b><br/>${pickupAddress}`);

    markersRef.current.drop = L.marker(dropLatLng, { icon: dropIcon })
      .addTo(map)
      .bindPopup(`<b>Drop Location</b><br/>${dropAddress}`);

    // Determine agent coordinates
    let currentAgentLatLng = null;
    if (status !== 'pending' && status !== 'delivered' && status !== 'failed') {
      if (agentLat && agentLng) {
        currentAgentLatLng = [agentLat, agentLng];
      } else {
        // Interpolate position based on status
        let factor = 0.2;
        if (status === 'picked_up') factor = 0.4;
        else if (status === 'in_transit') factor = 0.65;
        else if (status === 'out_for_delivery') factor = 0.85;

        currentAgentLatLng = [
          pickupLatLng[0] + (dropLatLng[0] - pickupLatLng[0]) * factor,
          pickupLatLng[1] + (dropLatLng[1] - pickupLatLng[1]) * factor,
        ];
      }
    }

    // Add Agent marker if in-transit
    if (currentAgentLatLng) {
      const agentIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center w-9 h-9">
            <div class="absolute w-9 h-9 bg-blue-600 rounded-full opacity-25 animate-ping"></div>
            <div class="relative w-7 h-7 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
              <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <span class="absolute -bottom-4 bg-blue-900 text-white font-extrabold text-[8px] px-1 rounded shadow truncate max-w-[64px]">${agentName.split(' ')[0]}</span>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      markersRef.current.agent = L.marker(currentAgentLatLng, { icon: agentIcon })
        .addTo(map)
        .bindPopup(`<b>Courier Agent: ${agentName}</b><br/>Status: <span class="capitalize font-semibold">${status.replace('_', ' ')}</span>`);
    }

    // Add route line polyline connecting pickup, agent (if present), and drop
    const routePoints = [pickupLatLng];
    if (currentAgentLatLng) {
      routePoints.push(currentAgentLatLng);
    }
    routePoints.push(dropLatLng);

    routeLineRef.current = L.polyline(routePoints, {
      color: '#2563eb', // Royal Blue
      weight: 3.5,
      opacity: 0.8,
      dashArray: '6, 6',
    }).addTo(map);

    // Fit map bounds to show all markers
    const group = new L.featureGroup(
      [markersRef.current.pickup, markersRef.current.drop, markersRef.current.agent].filter(Boolean)
    );
    map.fitBounds(group.getBounds().pad(0.15));

  }, [pickupAddress, dropAddress, status, agentName, pickupZone, dropZone, agentLat, agentLng]);

  return (
    <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-card">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating telemetry headers */}
      <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none flex gap-2 justify-between">
        <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-subtle border border-slate-200/50 text-[10px] font-semibold text-slate-700 pointer-events-auto">
          Route: {pickupAddress.split(',')[0]} → {dropAddress.split(',')[0]}
        </div>
        <div className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg shadow-subtle text-[9px] font-extrabold uppercase tracking-widest pointer-events-auto flex items-center gap-1.5">
          <FiTruck /> GPS Active
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;
