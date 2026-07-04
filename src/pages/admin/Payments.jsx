import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils';
import StatsCard from '../../components/StatsCard';
import Table from '../../components/Table';
import StatusChip from '../../components/Badge';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiCreditCard, FiDollarSign, FiFileText, FiDownload, FiInfo, FiX, FiCheckCircle, FiRotateCcw } from 'react-icons/fi';

const AdminPayments = () => {
  const [loading, setLoading] = useState(true);
  const [refundLoading, setRefundLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalPaid: 0,
    pendingCod: 0,
    onlinePaymentsCount: 0,
    failedPaymentsCount: 0,
    refundsCount: 0,
    recentPayments: [],
  });

  // Invoice Viewer Modal State
  const [activeInvoice, setActiveInvoice] = useState(null);

  const fetchPaymentLedger = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPaymentDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transaction ledger records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentLedger();
  }, []);

  const handlePrintInvoice = (payment) => {
    setActiveInvoice(payment);
  };

  const handleTriggerRefund = async (paymentId) => {
    if (!window.confirm('Are you sure you want to trigger a full refund for this payment? This will refund client funds via Razorpay and cancel the shipment order.')) {
      return;
    }

    setRefundLoading(true);
    try {
      await paymentService.refundPayment(paymentId);
      toast.success('Refund processed successfully!');
      fetchPaymentLedger();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Refund process failed.');
    } finally {
      setRefundLoading(false);
    }
  };

  const columns = [
    {
      key: 'paymentId',
      label: 'Payment ID',
      render: (val) => <span className="font-bold text-slate-800">{val}</span>,
    },
    {
      key: 'customerName',
      label: 'Client Name',
      render: (val) => <span className="font-semibold text-slate-700">{val}</span>,
    },
    {
      key: 'trackingNumber',
      label: 'Tracking No',
      render: (val) => <span className="font-semibold text-brand-600">{val || 'N/A'}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="font-bold text-slate-900">{formatCurrency(val)}</span>,
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (val) => <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">{val || 'ONLINE'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: 'createdAt',
      label: 'Date Paid',
      render: (val) => <span>{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            icon={FiFileText}
            onClick={() => handlePrintInvoice(row)}
          >
            Invoice
          </Button>
          {row.status === 'CAPTURED' && (
            <Button
              size="sm"
              variant="danger"
              icon={FiRotateCcw}
              loading={refundLoading}
              onClick={() => handleTriggerRefund(row.id)}
            >
              Refund
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FiCreditCard className="text-brand-600" />
          System Billing Ledger & Payments
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor system cash flow, review customer payments receipts, manage invoice taxings, and trigger refund transactions.
        </p>
      </div>

      {/* Stats overview widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <StatsCard title="Total Cash Flow" value={loading ? '...' : formatCurrency(dashboardData.totalPaid)} icon={FiDollarSign} />
        <StatsCard title="COD Pending" value={loading ? '...' : formatCurrency(dashboardData.pendingCod)} icon={FiDollarSign} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Online Captured" value={loading ? '...' : dashboardData.onlinePaymentsCount} icon={FiCheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatsCard title="Failed Checkouts" value={loading ? '...' : dashboardData.failedPaymentsCount} icon={FiX} iconBg="bg-red-50" iconColor="text-red-600" />
        <StatsCard title="Refunds Triggered" value={loading ? '...' : dashboardData.refundsCount} icon={FiRotateCcw} iconBg="bg-slate-100" iconColor="text-slate-650" />
      </div>

      {/* History Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6">
          Global Transaction Receipts Ledger
        </h3>

        <Table
          columns={columns}
          data={dashboardData.recentPayments}
          loading={loading}
          emptyMessage="No payments transaction ledger logs registered."
        />
      </div>

      {/* Styled Invoice Viewer Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-premium overflow-hidden border border-slate-100 flex flex-col justify-between">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black tracking-wide text-orange-400">TAX INVOICE</h4>
                <p className="text-xxs text-slate-400 mt-1">LogiTrack System logistics private limited</p>
              </div>
              <button
                onClick={() => setActiveInvoice(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Invoice Contents */}
            <div className="p-6 space-y-6 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-slate-400 block mb-1">Invoice Number:</span>
                  <span className="font-bold text-slate-800">{activeInvoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Billing Date:</span>
                  <span className="font-semibold text-slate-800">{formatDate(activeInvoice.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Customer Profile:</span>
                  <span className="font-semibold text-slate-800">{activeInvoice.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Payment Reference:</span>
                  <span className="font-semibold text-slate-800">{activeInvoice.transactionReference}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-xxs">Receipt Items Summary</h5>
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border">
                  <div className="flex justify-between font-semibold border-b border-slate-200 pb-1.5 text-slate-800">
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipment Delivery Fees (Tracking ID: {activeInvoice.trackingNumber})</span>
                    <span>{formatCurrency(Math.round(activeInvoice.amount / 1.18 * 100) / 100)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-xxs">
                    <span>Integrated Goods & Services Tax (18% IGST)</span>
                    <span>{formatCurrency(Math.round(activeInvoice.amount * 0.18 / 1.18 * 100) / 100)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-850">
                    <span>Total Tax Paid (Net Amount)</span>
                    <span className="text-blue-600">{formatCurrency(activeInvoice.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Gateway parameters */}
              <div className="bg-slate-50 p-3 rounded-lg text-xxs text-slate-500 border border-dashed flex items-center gap-2">
                <FiInfo className="text-blue-500 shrink-0 h-4 w-4" />
                <span>Verified Online transaction via Razorpay ID: <b>{activeInvoice.razorpayPaymentId || 'N/A'}</b></span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 p-4 border-t flex justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                icon={FiX}
                onClick={() => setActiveInvoice(null)}
              >
                Close Receipt
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={FiDownload}
                onClick={() => {
                  window.print();
                }}
              >
                Print Receipt
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPayments;
