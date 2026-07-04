import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils';
import StatsCard from '../../components/StatsCard';
import Table from '../../components/Table';
import StatusChip from '../../components/Badge';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiCreditCard, FiDollarSign, FiFileText, FiDownload, FiInfo, FiX, FiCheckCircle } from 'react-icons/fi';

const CustomerPayments = () => {
  const [loading, setLoading] = useState(true);
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

  const columns = [
    {
      key: 'paymentId',
      label: 'Payment ID',
      render: (val) => <span className="font-bold text-slate-800">{val}</span>,
    },
    {
      key: 'trackingNumber',
      label: 'Tracking No',
      render: (val) => <span className="font-semibold text-brand-600">{val || 'N/A'}</span>,
    },
    {
      key: 'amount',
      label: 'Amount Paid',
      render: (val) => <span className="font-bold text-slate-900">{formatCurrency(val)}</span>,
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (val) => <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">{val || 'Razorpay'}</span>,
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
      label: 'Invoice',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          icon={FiFileText}
          onClick={() => handlePrintInvoice(row)}
        >
          Invoice
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FiCreditCard className="text-brand-600" />
          Payments & Billing Receipts
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your shipping payments history, download tax invoices, and verify COD ledger transactions.
        </p>
      </div>

      {/* Stats overview widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Cash Paid" value={loading ? '...' : formatCurrency(dashboardData.totalPaid)} icon={FiDollarSign} />
        <StatsCard title="Pending COD Collection" value={loading ? '...' : formatCurrency(dashboardData.pendingCod)} icon={FiDollarSign} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Online Captured Runs" value={loading ? '...' : dashboardData.onlinePaymentsCount} icon={FiCheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatsCard title="Failed Checkouts" value={loading ? '...' : dashboardData.failedPaymentsCount} icon={FiX} iconBg="bg-red-50" iconColor="text-red-600" />
      </div>

      {/* History Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6">
          Billing Ledger Transaction History
        </h3>

        <Table
          columns={columns}
          data={dashboardData.recentPayments}
          loading={loading}
          emptyMessage="No billing transaction receipts found."
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

export default CustomerPayments;
