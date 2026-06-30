import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils';
import { ORDER_STATUS } from '../../constants';
import StatusChip from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPrinter, FiXCircle, FiTruck, FiMapPin, FiCalendar, FiPackage, FiFileText } from 'react-icons/fi';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      toast.error('Order not found in tracking registries.');
      navigate('/customer/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(order.id);
      toast.success('Order cancelled successfully.');
      setShowCancelModal(false);
      fetchOrderDetails(); // refresh details
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500" />
      </div>
    );
  }

  const isCancellable = [ORDER_STATUS.PENDING, ORDER_STATUS.ASSIGNED].includes(order.status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/orders"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          <FiArrowLeft className="mr-1.5" /> Back to History
        </Link>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={FiFileText} onClick={() => setShowInvoiceModal(true)}>
            View Invoice
          </Button>
          {isCancellable && (
            <Button variant="danger" size="sm" icon={FiXCircle} onClick={() => setShowCancelModal(true)}>
              Cancel Shipment
            </Button>
          )}
          {order.status !== 'delivered' && order.status !== 'failed' && (
            <Link to={`/customer/orders/${order.id}/track`}>
              <Button variant="primary" size="sm" icon={FiTruck}>
                Live Tracking
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Manifest Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Header Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Shipment Details
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                  {order.id}
                </h2>
                <p className="text-xs text-slate-550 mt-0.5 font-semibold">
                  Tracking: {order.trackingNumber}
                </p>
              </div>
              <StatusChip status={order.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <FiCalendar className="text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">Booked Date</p>
                  <p className="font-semibold">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <FiTruck className="text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">Estimated Delivery</p>
                  <p className="font-semibold">{formatDate(order.estimatedDelivery, 'DD MMM YYYY')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Transit Route Locations
            </h3>

            <div className="relative pl-6 space-y-6">
              {/* Vertical dotted connector */}
              <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 border-l border-dashed border-slate-300" />

              {/* Pickup location */}
              <div className="relative flex gap-3 items-start text-xs">
                <span className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[9px]">
                  A
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Pickup Address</h4>
                  <p className="text-slate-500 mt-1">{order.pickupAddress}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Zone ID: {order.pickupZone}</p>
                </div>
              </div>

              {/* Drop Location */}
              <div className="relative flex gap-3 items-start text-xs">
                <span className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-success-500 text-white flex items-center justify-center font-bold text-[9px]">
                  B
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Drop Address</h4>
                  <p className="text-slate-500 mt-1">{order.dropAddress}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Zone ID: {order.dropZone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Package Measurements */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Dimension Footprints
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Volume L×B×H</p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {order.length} × {order.breadth} × {order.height} <span className="text-xxs font-normal">cm</span>
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Volumetric Weight</p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {order.volumetricWeight} <span className="text-xxs font-normal">kg</span>
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Billable Weight</p>
                <p className="text-sm font-bold text-brand-600 mt-1">
                  {order.billableWeight} <span className="text-xxs font-normal">kg</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Agent Assignment Summary */}
        <div className="space-y-6">
          {/* Price details card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Billing Ledger
            </h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Weight charge (Base):</span>
                <span className="font-semibold text-slate-800">{formatCurrency(order.price * 0.85)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fuel & Zone Scope:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(order.price * 0.15)}</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between text-sm font-bold pt-1">
                <span className="text-slate-900">Total Charge:</span>
                <span className="text-brand-600">{formatCurrency(order.price)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 text-xxs font-medium text-slate-400">
              Payment mode: <span className="font-bold text-slate-700">{order.paymentType}</span>
            </div>
          </div>

          {/* Assigned Agent Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Assigned Delivery Executive
            </h3>

            {order.assignedAgentId ? (
              <div className="flex flex-col items-center text-center">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120"
                  alt="Agent avatar"
                  className="h-16 w-16 rounded-full object-cover border border-slate-200"
                />
                <h4 className="text-xs font-bold text-slate-900 mt-3">
                  {order.assignedAgentName}
                </h4>
                <p className="text-[10px] text-slate-500">Electric Scooter Rider</p>
                <div className="w-full flex items-center justify-between border-t border-slate-100 mt-4 pt-4 text-xxs text-slate-500">
                  <span>Tel: +91 98765 43210</span>
                  <span className="font-mono">DL-98214-A</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 leading-relaxed">
                <FiPackage className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                Awaiting agent dispatch allocation by Administrator.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Delivery Order"
        message="Are you sure you want to cancel this booking? This will remove the package from the active courier queue."
        loading={cancelling}
      />

      {/* Invoice Generator Modal Layout */}
      <Modal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title="Simulated Invoice PDF" size="md">
        <div className="space-y-6 text-slate-800 p-2" id="printable-invoice">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-brand-600">LogiTrack Invoice</h2>
              <p className="text-xxs text-slate-500 mt-1">LogiTrack Logistics Pvt Ltd, NCR Terminal 4B</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold">{order.id}</p>
              <p className="text-[9px] text-slate-500">Date: {formatDate(order.createdAt, 'DD MMM YYYY')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xxs">
            <div>
              <p className="text-slate-400 font-bold uppercase">Customer Billing Details</p>
              <p className="font-bold text-slate-800 mt-1">{order.customerName}</p>
              <p className="text-slate-500 mt-0.5">Payment type: {order.paymentType}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase">Package Dimensions</p>
              <p className="text-slate-500 mt-1">Weight: {order.billableWeight} kg</p>
              <p className="text-slate-500">Dimensions: {order.length}×{order.breadth}×{order.height} cm</p>
            </div>
          </div>

          {/* Billing items table */}
          <table className="w-full text-xxs border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="p-2 border">Service Description</th>
                <th className="p-2 border text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border">Standard Last-Mile Transport ({order.pickupZone} → {order.dropZone})</td>
                <td className="p-2 border text-right">{formatCurrency(order.price)}</td>
              </tr>
              <tr className="font-bold">
                <td className="p-2 border text-right">Total Invoice Balance:</td>
                <td className="p-2 border text-right text-brand-600">{formatCurrency(order.price)}</td>
              </tr>
            </tbody>
          </table>

          <div className="text-center text-[10px] text-slate-400 border-t pt-4">
            Thank you for shipping with LogiTrack!
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" size="sm" icon={FiPrinter} onClick={() => window.print()}>
              Print Document
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowInvoiceModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;
