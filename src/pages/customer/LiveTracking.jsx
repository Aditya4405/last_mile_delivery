import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { socketService } from '../../services/socket';
import { formatDate } from '../../utils';
import MapPlaceholder from '../../components/MapPlaceholder';
import StatusChip from '../../components/Badge';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import {
  FiArrowLeft,
  FiMessageSquare,
  FiPhone,
  FiTruck,
  FiMapPin,
  FiClock,
  FiActivity,
  FiCompass,
  FiCheckCircle,
  FiUserCheck,
  FiPackage,
  FiMap,
  FiNavigation
} from 'react-icons/fi';

const LiveTracking = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [telemetry, setTelemetry] = useState({
    latitude: null,
    longitude: null,
    speed: 0,
    eta: 'Awaiting updates...',
    status: 'assigned',
  });

  const fetchOrderTracking = async () => {
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
      // Initialize telemetry from order data
      setTelemetry((prev) => ({
        ...prev,
        status: data.status,
        eta: formatDate(data.estimatedDelivery, 'hh:mm A'),
      }));
    } catch (err) {
      toast.error('Manifest registry tracking details not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderTracking();

    // Subscribe to Socket.IO live updates for this order
    socketService.connect();
    socketService.subscribe(id, (data) => {
      setTelemetry({
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        eta: data.eta,
        status: data.status,
      });

      // Update local order status if changed
      setOrder((prev) => {
        if (!prev) return prev;
        if (prev.status !== data.status) {
          return {
            ...prev,
            status: data.status,
          };
        }
        return prev;
      });
    });

    return () => {
      socketService.unsubscribe(id);
      socketService.disconnect();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
        <p className="text-xs text-slate-500 font-medium">Initializing Real-time GPS Streams...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto mt-12 shadow-card">
        <p className="text-sm text-slate-500">Shipment ID not found.</p>
        <Link to="/customer/orders" className="text-blue-600 hover:underline mt-4 inline-block font-semibold text-xs">
          Back to Order History
        </Link>
      </div>
    );
  }

  // List of standard delivery status stages
  const TRACKING_STEPS = [
    { key: 'pending', label: 'Order Confirmed', description: 'Order registered by customer', icon: FiCheckCircle },
    { key: 'assigned', label: 'Agent Assigned', description: 'Delivery executive appointed', icon: FiUserCheck },
    { key: 'picked_up', label: 'Picked Up', description: 'Package collected from pickup address', icon: FiPackage },
    { key: 'reached_hub', label: 'Reached Hub', description: 'Consignment entered local logistics hub', icon: FiMap },
    { key: 'in_transit', label: 'In Transit', description: 'Package en route to city zone', icon: FiTruck },
    { key: 'out_for_delivery', label: 'Out For Delivery', description: 'Courier rider is in your area', icon: FiNavigation },
    { key: 'delivered', label: 'Delivered', description: 'Successfully handed over with OTP verification', icon: FiCheckCircle },
  ];

  // Helper to determine status indexing
  const getStepStatus = (stepKey) => {
    const statusOrdering = [
      'pending',
      'assigned',
      'picked_up',
      'reached_hub',
      'in_transit',
      'out_for_delivery',
      'delivered',
    ];

    const currentIdx = statusOrdering.indexOf(telemetry.status);
    const stepIdx = statusOrdering.indexOf(stepKey);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  // Mock driver stats
  const agentDetails = {
    name: order.assignedAgentName || 'Vikram Singh',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    vehicle: 'Ather 450X Electric Scooter',
    vehicleNumber: 'DL-3C-SN-8714',
    rating: 4.9,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-0">
      {/* Back button header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/customer/orders/${order.id}`}
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <FiArrowLeft className="mr-1.5 h-4 w-4" /> Back to details
        </Link>
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase animate-pulse">
          ● Live Tracking Stream Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Leaflet Map & Live Stats */}
        <div className="lg:col-span-2 space-y-6">
          <MapPlaceholder
            pickupAddress={order.pickupAddress}
            dropAddress={order.dropAddress}
            status={telemetry.status}
            agentName={agentDetails.name}
            pickupZone={order.pickupZone}
            dropZone={order.dropZone}
            agentLat={telemetry.latitude}
            agentLng={telemetry.longitude}
          />

          {/* Real-time Telemetry Stats Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-card flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FiClock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ETA</p>
                <h4 className="text-sm font-extrabold text-slate-800 mt-0.5">{telemetry.eta}</h4>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-card flex items-center gap-3">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                <FiCompass className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Distance Left</p>
                <h4 className="text-sm font-extrabold text-slate-800 mt-0.5">
                  {telemetry.status === 'delivered' ? '0 km' : '4.8 km'}
                </h4>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-card flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
                <FiActivity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Speed</p>
                <h4 className="text-sm font-extrabold text-slate-800 mt-0.5">
                  {telemetry.status === 'delivered' ? '0 km/h' : `${telemetry.speed || 38} km/h`}
                </h4>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-card flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                <FiMapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Traffic</p>
                <h4 className="text-sm font-extrabold text-emerald-600 mt-0.5">Moderate</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Driver Card and Redesigned Timeline */}
        <div className="space-y-6">
          {/* Driver Details Card */}
          {order.assignedAgentId && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-card space-y-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Delivery Executive Details
              </h3>

              <div className="flex items-center gap-4">
                <img
                  src={agentDetails.avatar}
                  alt={agentDetails.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{agentDetails.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                      {agentDetails.rating} ★
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">{agentDetails.vehicle}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xxs border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle Number:</span>
                  <span className="font-bold text-slate-800 font-mono">{agentDetails.vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile contact:</span>
                  <span className="font-semibold text-slate-800">{agentDetails.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${agentDetails.phone}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toast.success(`Dialing Vikram Singh (${agentDetails.phone})...`);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <FiPhone className="text-slate-400 shrink-0" /> Call Agent
                </a>
                <button
                  onClick={() => toast.success('Connecting to Secure Chat...')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                >
                  <FiMessageSquare className="shrink-0" /> Message
                </button>
              </div>
            </div>
          )}

          {/* Timeline Redesign */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-card">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <FiTruck className="text-blue-600 shrink-0" /> Tracking Timeline
            </h3>

            <div className="flow-root">
              <ul className="-mb-8">
                {TRACKING_STEPS.map((step, idx) => {
                  const stepStatus = getStepStatus(step.key);
                  const isLast = idx === TRACKING_STEPS.length - 1;

                  return (
                    <li key={step.key}>
                      <div className="relative pb-8">
                        {!isLast && (
                          <span
                            className={`absolute top-4 left-4.5 -ml-px h-full w-0.5 ${ stepStatus === 'completed' ? 'bg-blue-600' : 'bg-slate-200 ' }`}
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3.5 items-start">
                          <div>
                            <span
                              className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all ${ stepStatus === 'completed' ? 'bg-blue-600 border-blue-600 text-white' : stepStatus === 'active' ? 'bg-orange-50 border-orange-500 text-orange-600 ' : 'bg-white border-slate-200 text-slate-400 ' }`}
                            >
                              <step.icon className="h-4.5 w-4.5" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5">
                            <p
                              className={`text-xs font-bold ${ stepStatus === 'active' ? 'text-orange-600 font-black' : 'text-slate-800 ' }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                              {step.description}
                            </p>
                            {stepStatus === 'completed' && idx === 0 && (
                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                {formatDate(order.createdAt, 'DD MMM, hh:mm A')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
