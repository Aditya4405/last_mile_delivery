import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils';
import { ORDER_STATUS } from '../../constants';
import Table from '../../components/Table';
import StatusChip from '../../components/Badge';
import SearchBar from '../../components/SearchBar';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { FiPlusCircle, FiTruck, FiList, FiEye } from 'react-icons/fi';

const OrderHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Sort and pagination states
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({
        customerId: user.id,
        search,
        status: statusFilter || undefined,
      });
      setOrders(data);
      setCurrentPage(1); // reset to page 1 on new searches
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  // Handle Sorting
  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle Pagination
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / itemsPerPage));
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (val) => <span className="font-bold text-brand-650 dark:text-brand-400">{val}</span>,
    },
    { key: 'trackingNumber', label: 'Tracking No', sortable: true },
    { key: 'dropAddress', label: 'Drop Location', render: (val) => <span className="truncate max-w-[160px] block">{val}</span> },
    { key: 'billableWeight', label: 'Weight (kg)', sortable: true },
    { key: 'price', label: 'Price', sortable: true, render: (val) => formatCurrency(val) },
    { key: 'createdAt', label: 'Booked Date', sortable: true, render: (val) => formatDate(val, 'DD MMM YYYY') },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link to={`/customer/orders/${row.id}`} title="View Details">
            <Button size="sm" variant="outline" icon={FiEye}>Details</Button>
          </Link>
          {row.status !== 'delivered' && row.status !== 'failed' && (
            <Link to={`/customer/orders/${row.id}/track`} title="Live Telemetry">
              <Button size="sm" variant="primary" icon={FiTruck}>Track</Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  const statusOptions = Object.entries(ORDER_STATUS).map(([key, val]) => ({
    value: val,
    label: key.replace('_', ' '),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FiList className="text-brand-655" />
            My Order History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse and search all your parcel manifest booking logs.
          </p>
        </div>
        <Link to="/customer/book">
          <Button variant="success" icon={FiPlusCircle}>
            Book New Order
          </Button>
        </Link>
      </div>

      {/* Filter and Search Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-205 dark:border-slate-750 shadow-subtle">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search by ID or Address..."
          className="sm:col-span-2"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
          placeholder="All Statuses"
        />
      </div>

      {/* Main Table Grid */}
      <Table
        columns={columns}
        data={paginatedOrders}
        loading={loading}
        sortConfig={sortConfig}
        onSort={setSortConfig}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        emptyMessage="No orders match your search parameters."
      />
    </div>
  );
};

export default OrderHistory;
