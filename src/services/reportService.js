import axiosInstance, { isLive } from './axios';
import toast from 'react-hot-toast';

export const reportService = {
  getReportData: async (type, filters = {}) => {
    if (isLive()) {
      try {
        const params = {};
        Object.keys(filters).forEach((key) => {
          if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
            params[key] = filters[key];
          }
        });
        
        let endpoint = type;
        if (type === 'delivery') {
          endpoint = 'tracking';
        }
        
        const response = await axiosInstance.get(`/api/reports/${endpoint}`, { params });
        return response.data.data;
      } catch (err) {
        console.warn('Backend reports offline. Falling back to demo data.');
        toast.error('Reports endpoint offline. Showing demo report.', { id: 'backend-offline-reports-data' });
      }
    }

    // Fallback Mock report list data
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (type === 'revenue' || type === 'payments') {
      return [
        { date: '2026-07-01', orders: 120, revenue: 2400.0, codCollected: 1800.0, onlineCollected: 600.0, tax: 240.0 },
        { date: '2026-07-02', orders: 145, revenue: 2900.0, codCollected: 2100.0, onlineCollected: 800.0, tax: 290.0 },
        { date: '2026-07-03', orders: 98, revenue: 1960.0, codCollected: 1400.0, onlineCollected: 560.0, tax: 196.0 }
      ];
    } else {
      // Default delivery/tracking report mock
      return [
        { date: '2026-07-01', total: 120, delivered: 110, pending: 8, failed: 2, successRate: '91.6%' },
        { date: '2026-07-02', total: 145, delivered: 135, pending: 6, failed: 4, successRate: '93.1%' },
        { date: '2026-07-03', total: 98, delivered: 90, pending: 5, failed: 3, successRate: '91.8%' }
      ];
    }
  },

  exportToFormat: async (format, reportType, filters = {}) => {
    if (isLive()) {
      try {
        const cleanFilters = {};
        Object.keys(filters).forEach((key) => {
          if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
            cleanFilters[key] = filters[key];
          }
        });

        const response = await axiosInstance.post(
          `/api/reports/export/${format}`,
          {
            reportType,
            filters: cleanFilters
          },
          {
            responseType: 'blob'
          }
        );

        const blob = new Blob([response.data], {
          type: format === 'pdf' ? 'application/pdf' :
                format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                'text/csv;charset=utf-8;'
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const extension = format === 'excel' ? 'xlsx' : format;
        link.setAttribute('download', `LogisticsReport_${reportType}_${new Date().toISOString().slice(0, 10)}.${extension}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return true;
      } catch (err) {
        console.warn('Backend download failed. Simulating local export.');
        toast.error('API export failed. Exporting demo manifest.');
      }
    }

    // Fallback Mock Local File download
    await new Promise((resolve) => setTimeout(resolve, 500));
    const content = `LogiTrack Logistics Simulated Manifest Export\nReport: ${reportType}\nGenerated: ${new Date().toISOString()}\nStatus: Success`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const ext = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
    link.setAttribute('download', `LogiTrack_${reportType}_demo.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(`Demo ${format.toUpperCase()} report downloaded successfully!`);
    return true;
  },

  exportOrdersReport: async (filters = {}) => {
    return reportService.exportToFormat('excel', 'orders', filters);
  },

  exportRevenueReport: async (filters = {}) => {
    return reportService.exportToFormat('excel', 'revenue', filters);
  }
};
