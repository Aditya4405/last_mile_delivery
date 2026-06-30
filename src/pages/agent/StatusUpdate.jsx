import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { ORDER_STATUS } from '../../constants';
import { formatCurrency } from '../../utils';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import OtpVerification from '../auth/OtpVerification';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCamera, FiAlertTriangle, FiInfo, FiTruck } from 'react-icons/fi';

const StatusUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
        setStatus(data.status);
      } catch (err) {
        toast.error('Order not found in courier ledger.');
        navigate('/agent');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleUpdate = async (otp = '') => {
    setIsSubmitting(true);
    try {
      await orderService.updateStatus(order.id, status, notes, image, otp);
      toast.success(`Shipment ${order.id} status updated successfully!`);
      navigate('/agent');
    } catch (err) {
      toast.error(err.message || 'Failed to update shipment status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      toast.success('Proof image loaded in memory!');
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500" />
      </div>
    );
  }

  const statusOptions = [
    { value: ORDER_STATUS.PICKED_UP, label: 'Picked Up (Loading)' },
    { value: ORDER_STATUS.IN_TRANSIT, label: 'In Transit' },
    { value: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out For Delivery' },
    { value: ORDER_STATUS.DELIVERED, label: 'Delivered (OTP Verified)' },
    { value: ORDER_STATUS.FAILED, label: 'Failed (Return to Hub)' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/agent"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          <FiArrowLeft className="mr-1.5" /> Back to Dashboard
        </Link>
        <span className="text-xs font-bold text-slate-400">Order ID: {order.id}</span>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FiTruck className="text-brand-500" />
            Update Delivery Status
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify the next logistics stage and upload safety proof documents.
          </p>
        </div>

        {/* Parcel details header */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Destination drop:</span>
            <span className="text-slate-800">{order.dropAddress}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Billing details:</span>
            <span className="text-slate-800 font-semibold text-brand-600">
              {order.paymentType} {order.paymentType === 'COD' ? `(${formatCurrency(order.price)})` : ''}
            </span>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="space-y-4">
          <Select
            label="Logistics Delivery Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
          />

          {/* Conditional rendering for Delivered Status: OTP Verification */}
          {status === ORDER_STATUS.DELIVERED && (
            <div className="border border-success-200 bg-success-50/10 p-4 rounded-xl space-y-4 animate-fadeIn">
              <OtpVerification
                expectedOtp="1234"
                loading={isSubmitting}
                onVerify={(otp) => handleUpdate(otp)}
              />
            </div>
          )}

          {/* Conditional rendering for Failed Status: Reason text + Image proof upload */}
          {status === ORDER_STATUS.FAILED && (
            <div className="border border-red-200 bg-red-50/10 p-5 rounded-xl space-y-4 animate-fadeIn">
              <div className="flex items-start gap-2 text-xs text-red-750 mb-2">
                <FiAlertTriangle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-bold">Failed Delivery Manifest</p>
                  <p className="mt-0.5 leading-relaxed text-slate-500">
                    To register a delivery failure in the tracking logs, specify a reasoning description and upload photographic proof.
                  </p>
                </div>
              </div>

              <Textarea
                label="Reason description"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Customer not at address, gate locked, phone switched off..."
                required
              />

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Take/Upload Proof Photo
                </span>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-5 cursor-pointer hover:bg-slate-50 transition-all text-slate-400">
                  {image ? (
                    <img src={image} alt="Proof base64" className="h-28 object-cover rounded-lg border" />
                  ) : (
                    <>
                      <FiCamera className="h-8 w-8 mb-2" />
                      <span className="text-xxs font-bold uppercase tracking-wider">Select Proof Image File</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            </div>
          )}

          {/* Standard Statuses (Transit/Picked Up/Out for delivery) Submission button */}
          {status !== ORDER_STATUS.DELIVERED && (
            <div className="pt-4 flex items-center justify-end gap-3 border-t">
              <Link to="/agent">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                variant="primary"
                onClick={() => handleUpdate('')}
                loading={isSubmitting}
                disabled={status === ORDER_STATUS.FAILED && !notes.trim()}
              >
                Update Delivery Status
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusUpdate;
