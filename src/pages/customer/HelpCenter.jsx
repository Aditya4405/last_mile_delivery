import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { profileService } from '../../services/profileService';
import { orderService } from '../../services/orderService';
import { formatDate } from '../../utils';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiHelpCircle, FiChevronDown, FiMail, FiMessageSquare, FiInfo } from 'react-icons/fi';

const HelpCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subject: '',
      orderId: '',
      message: '',
    },
  });

  const faqs = [
    { q: 'How is the delivery charge estimated?', a: 'Charges are calculated based on shipment type (B2B or B2C), transport distance (Intra or Inter zone), and the higher value between actual physical weight and dimensional volumetric weight.' },
    { q: 'What is the volumetric weight divisor?', a: 'We use the industry-standard factor divisor of 5000: Volumetric Weight = (Length × Breadth × Height in cm) / 5000.' },
    { q: 'Can I cancel an order once assigned?', a: 'Yes, orders can be cancelled by the customer directly from their dashboard, provided the courier agent has not yet set the status to Picked Up.' },
    { q: 'How do I obtain the delivery verification OTP?', a: 'Once the dispatcher is out for delivery, they will request the 4-digit code. You can locate your default account OTP (1234) on the live tracking page.' },
  ];

  const fetchHelpData = async () => {
    try {
      const ticketsList = await profileService.getTickets();
      const customerOrders = await orderService.getOrders();
      setTickets(ticketsList);
      setOrders(customerOrders.map(o => ({ value: o.id, label: o.id })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchHelpData();
  }, []);

  const onSubmitTicket = async (data) => {
    setIsSubmitting(true);
    try {
      await profileService.raiseTicket(data);
      toast.success('Support ticket raised successfully!');
      reset();
      fetchHelpData(); // refresh list
    } catch (err) {
      toast.error('Failed to submit support ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FiHelpCircle className="text-brand-650" />
          Help Desk & FAQs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Resolve shipment issues, consult weight matrices, or raise support tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FAQs Accordion */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-905 dark:text-white">Frequently Asked Questions</h3>
          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-205 dark:border-slate-750 shadow-subtle overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-xs font-bold text-left text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <FiChevronDown className={`h-4.5 w-4.5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-405 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Raise Ticket Form */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-905 dark:text-white flex items-center gap-1.5">
            <FiMessageSquare className="text-brand-500" />
            Raise Support Ticket
          </h3>
          
          <form onSubmit={handleSubmit(onSubmitTicket)} className="space-y-4">
            <Input
              label="Subject / Topic"
              name="subject"
              placeholder="e.g. Package delayed, damaged item, invoice discrepancy"
              error={errors.subject}
              required
              {...register('subject', { required: 'Subject is required' })}
            />

            <Select
              label="Associated Order (Optional)"
              name="orderId"
              options={orders}
              placeholder="General Inquiry"
              error={errors.orderId}
              {...register('orderId')}
            />

            <Textarea
              label="Support Message Description"
              name="message"
              placeholder="Detail your inquiry or shipment discrepancy..."
              error={errors.message}
              required
              {...register('message', { required: 'Message description is required' })}
            />

            <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
              Submit Ticket
            </Button>
          </form>
        </div>
      </div>

      {/* Raised Tickets List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-905 dark:text-white">Active Support Tickets</h3>
        {loadingTickets ? (
          <div className="animate-pulse space-y-2 h-20 bg-slate-100 rounded-lg" />
        ) : tickets.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No tickets raised yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-xs">
              <thead className="bg-slate-50 dark:bg-slate-805">
                <tr className="text-left font-bold text-slate-500">
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Date Raised</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                {tickets.map((t) => (
                  <tr key={t.id} className="text-slate-700 dark:text-slate-250">
                    <td className="p-3 font-bold text-brand-605">{t.id}</td>
                    <td className="p-3 font-medium">{t.subject}</td>
                    <td className="p-3 font-mono">{t.orderId}</td>
                    <td className="p-3">{formatDate(t.createdAt, 'DD MMM YYYY')}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'Open' ? 'bg-amber-50 text-amber-705 border border-amber-200' : 'bg-slate-50 text-slate-505 border border-slate-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
