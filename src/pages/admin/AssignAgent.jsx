import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { agentService } from '../../services/agentService';
import { formatCurrency } from '../../utils';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUserCheck, FiTruck, FiMapPin, FiActivity } from 'react-icons/fi';

const AssignAgent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [nearestAgents, setNearestAgents] = useState([]);
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    const fetchOrderAndAgents = async () => {
      try {
        const orderData = await orderService.getOrderById(id);
        setOrder(orderData);

        // Fetch nearest agents in pickup zone
        const agentsList = await agentService.getNearestAgents(orderData.pickupZone);
        
        // If no agents in pickup zone, fallback to list all active agents
        if (agentsList.length === 0) {
          const allActive = await agentService.getAgents({ status: 'active' });
          setNearestAgents(allActive);
        } else {
          setNearestAgents(agentsList);
        }
      } catch (err) {
        toast.error('Order not found in manifest log.');
        navigate('/admin/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndAgents();
  }, [id]);

  const handleAssign = async (agentId) => {
    setAssigningId(agentId);
    try {
      await orderService.assignAgent(order.id, agentId);
      toast.success('Agent assigned to order successfully!');
      navigate('/admin/orders');
    } catch (err) {
      toast.error('Failed to assign agent.');
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/orders"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          <FiArrowLeft className="mr-1.5" /> Back to Orders
        </Link>
        <span className="text-xs font-bold text-slate-400">Order ID: {order.id}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Details Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Package Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup Zone:</span>
                <span className="font-semibold text-slate-800 uppercase">{order.pickupZone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Drop Zone:</span>
                <span className="font-semibold text-slate-800 uppercase">{order.dropZone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billable Weight:</span>
                <span className="font-semibold text-slate-800">{order.billableWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment mode:</span>
                <span className="font-semibold text-slate-800">{order.paymentType}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-slate-900">
                <span>Declared value:</span>
                <span>{formatCurrency(order.price)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-3.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Route locations
            </h3>
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <p className="font-bold text-slate-700">Pickup:</p>
                <p className="text-slate-500 mt-0.5">{order.pickupAddress}</p>
              </div>
              <div className="pt-2">
                <p className="font-bold text-slate-700">Drop Destination:</p>
                <p className="text-slate-500 mt-0.5">{order.dropAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nearest Agents List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <FiActivity className="text-brand-500" />
            Active Dispatch Options (Matching Zone)
          </h3>

          {nearestAgents.length === 0 ? (
            <div className="bg-white p-8 text-center border rounded-xl text-xs text-slate-500 leading-relaxed">
              No active delivery agents are currently online in pickup zone {order.pickupZone}. Check the Agent Shift status list.
            </div>
          ) : (
            <div className="space-y-3.5">
              {nearestAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-hover transition-all flex items-center justify-between gap-4 flex-wrap"
                >
                  <div className="flex items-center gap-3">
                    <img src={agent.avatar} alt="avatar" className="h-10 w-10 rounded-full object-cover border" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{agent.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Vehicle: {agent.vehicle} | Rating: ★{agent.rating}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Workload */}
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Active Workload</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">
                        {agent.workload} active jobs
                      </p>
                    </div>

                    {/* Dispatch button */}
                    <Button
                      variant="primary"
                      size="sm"
                      icon={FiUserCheck}
                      loading={assigningId === agent.id}
                      onClick={() => handleAssign(agent.id)}
                    >
                      Assign Job
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignAgent;
