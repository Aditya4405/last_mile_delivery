import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatDate } from '../../utils';
import Timeline from '../../components/Timeline';
import MapPlaceholder from '../../components/MapPlaceholder';
import StatusChip from '../../components/Badge';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiMessageSquare, FiPhone, FiTruck, FiMapPin } from 'react-icons/fi';

const LiveTracking = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  const fetchOrderTracking = async () => {
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      toast.error('Manifest registry tracking not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderTracking();
    
    // Poll order status every 15 seconds to catch live agent updates
    const interval = setInterval(fetchOrderTracking, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500 dark:text-slate-400">Order not found.</p>
        <Link to="/customer/orders" className="text-brand-605 mt-2 inline-block">Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Nav */}
      <div className="flex items-center justify-between">
        <Link
          to={`/customer/orders/${order.id}`}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205"
        >
          <FiArrowLeft className="mr-1.5" /> Back to details
        </Link>
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
          Telemetry Update: Every 15s
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Map Simulator */}
        <div className="lg:col-span-2 space-y-6">
          <MapPlaceholder
            pickupAddress={order.pickupAddress}
            dropAddress={order.dropAddress}
            status={order.status}
            agentName={order.assignedAgentName || 'Courier Rider'}
          />

          {/* Quick Route Status Summary */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] text-slate-405 font-bold uppercase">Estimated Delivery Time</p>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                {formatDate(order.estimatedDelivery, 'DD MMMM, hh:mm A')}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Status:</span>
              <StatusChip status={order.status} />
            </div>
          </div>
        </div>

        {/* Status Timeline & Agent Contact Cards */}
        <div className="space-y-6">
          {/* Tracking History Timeline */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card">
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <FiTruck className="text-brand-500" />
              Tracking Timeline
            </h3>

            <Timeline events={order.timeline} activeStatus={order.status} />
          </div>

          {/* Contact Agent Widget */}
          {order.assignedAgentId && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card space-y-4">
              <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider">
                Active Courier Details
              </h3>

              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                  alt="Agent avatar"
                  className="h-10 w-10 rounded-full object-cover border"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{order.assignedAgentName}</h4>
                  <p className="text-[9px] text-slate-500 font-mono">Electric Scooter Dispatcher</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  icon={FiPhone}
                  onClick={() => toast.success('Calling dispatcher John...')}
                >
                  Call Agent
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                  icon={FiMessageSquare}
                  onClick={() => toast.success('Opening SMS Gateway connection...')}
                >
                  Message
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
