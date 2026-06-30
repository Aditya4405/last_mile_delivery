import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils';
import Table from '../../components/Table';
import StatusChip from '../../components/Badge';
import SearchBar from '../../components/SearchBar';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { FiEye, FiTruck, FiList } from 'react-icons/fi';

const AssignedShipments = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({
        agentId: user.id,
        search,
        status: statusFilter || undefined,
      });
      setShipments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [search, statusFilter]);

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (val) => <span className="font-bold text-brand-600">{val}</span>,
    },
    { key: 'dropAddress', label: 'Drop Destination', render: (val) => <span className="truncate max-w-[180px] block">{val}</span> },
    { key: 'paymentType', label: 'Billing Mode' },
    { key: 'price', label: 'Collect Amount', render: (val, row) => row.paymentType === 'COD' ? formatCurrency(val) : 'Prepaid ($0.00)' },
    { key: 'createdAt', label: 'Assigned Date', render: (val) => formatDate(val, 'DD MMM hh:mm A') },
    { key: 'status', label: 'Status', render: (val) => <StatusChip status={val} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status !== 'delivered' && row.status !== 'failed' ? (
            <Link to={`/agent/shipments/${row.id}/status`}>
              <Button size="sm" variant="primary" icon={FiTruck}>Update</Button>
            </Link>
          ) : (
            <span className="text-xxs text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded">RESOLVED</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FiList className="text-brand-600" />
          Assigned Shipping Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect and log progress for all packages assigned to your delivery schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search by ID or address..."
          className="sm:col-span-2"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'assigned', label: 'Assigned (Pending Pickup)' },
            { value: 'picked_up', label: 'Picked Up' },
            { value: 'in_transit', label: 'In Transit' },
            { value: 'out_for_delivery', label: 'Out For Delivery' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'failed', label: 'Failed' },
          ]}
          placeholder="All Shipments"
        />
      </div>

      <Table
        columns={columns}
        data={shipments}
        loading={loading}
        emptyMessage="No shipments assigned match filters."
      />
    </div>
  );
};

export default AssignedShipments;
