import { getCollection } from './db';
import { formatDate } from '../utils';

export const reportService = {
  getReportData: async (type, dateRange = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const orders = getCollection('orders');
    const agents = getCollection('agents');
    
    switch (type) {
      case 'orders': {
        const total = orders.length;
        const delivered = orders.filter((o) => o.status === 'delivered').length;
        const failed = orders.filter((o) => o.status === 'failed').length;
        const pending = orders.filter((o) => o.status === 'pending').length;
        
        return {
          summary: { total, delivered, failed, pending },
          chartData: [
            { name: 'Delivered', value: delivered },
            { name: 'Failed/Cancelled', value: failed },
            { name: 'Pending/Transit', value: total - delivered - failed },
          ],
        };
      }
      
      case 'revenue': {
        const totalRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
        const codRevenue = orders
          .filter((o) => o.paymentType === 'COD')
          .reduce((sum, o) => sum + (o.price || 0), 0);
        const prepaidRevenue = totalRevenue - codRevenue;

        return {
          summary: { totalRevenue, codRevenue, prepaidRevenue },
          chartData: [
            { name: 'Prepaid', value: prepaidRevenue },
            { name: 'COD Collected', value: codRevenue },
          ],
        };
      }
      
      case 'delivery': {
        // Mock average transit time in hours
        return {
          summary: {
            avgDeliveryTime: '3.4 hrs',
            onTimeRate: '96.4%',
            slaCompliance: '98.1%',
          },
          chartData: [
            { name: 'On-Time', value: 92 },
            { name: 'Delayed', value: 6 },
            { name: 'Breached', value: 2 },
          ],
        };
      }

      case 'agents': {
        const active = agents.filter((a) => a.status === 'active').length;
        const total = agents.length;

        return {
          summary: {
            totalAgents: total,
            activeAgents: active,
            avgRating: 4.75,
          },
          chartData: agents.map((a) => ({
            name: a.name.split(' ')[0],
            workload: a.workload,
            rating: a.rating,
          })),
        };
      }
      
      default:
        return {};
    }
  },

  exportToCSV: (filename, headers, rows) => {
    // Generate CSV contents
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((val) => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${formatDate(new Date(), 'YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },

  exportOrdersReport: async () => {
    const orders = getCollection('orders');
    const headers = ['Order ID', 'Tracking No', 'Pickup Address', 'Drop Address', 'Type', 'Payment', 'Price', 'Status', 'Date Created'];
    const rows = orders.map((o) => [
      o.id,
      o.trackingNumber,
      o.pickupAddress,
      o.dropAddress,
      o.orderType,
      o.paymentType,
      o.price,
      o.status,
      formatDate(o.createdAt),
    ]);
    reportService.exportToCSV('orders_report', headers, rows);
  },

  exportRevenueReport: async () => {
    const orders = getCollection('orders');
    const headers = ['Order ID', 'Payment Type', 'Revenue Amount', 'Billing Date', 'Status'];
    const rows = orders.map((o) => [
      o.id,
      o.paymentType,
      o.price,
      formatDate(o.createdAt),
      o.status,
    ]);
    reportService.exportToCSV('revenue_report', headers, rows);
  },
};
