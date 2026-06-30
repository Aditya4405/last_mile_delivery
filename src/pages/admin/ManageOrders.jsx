import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { reportService } from '../../services/reportService';
import { getCollection } from '../../services/db';
import { formatCurrency, formatDate } from '../../utils';
import { ORDER_STATUS } from '../../constants';
import Table from '../../components/Table';
import StatusChip from '../../components/Badge';
import SearchBar from '../../components/SearchBar';
import Select from '../../components/Select';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiPackage, FiTruck, FiDownload, FiTrash2, FiUserCheck, FiFilter } from 'react-icons/fi';

const ManageOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [zones, setZones] = useState([]);
  
  // Search & filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  
  // Sorting and pagination states
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchFiltersAndOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({
        search,
        status: statusFilter || undefined,
      });

      // Filter by Zone (checks pickup or drop zone match)
      let filteredData = [...data];
      if (zoneFilter) {
        filteredData = filteredData.filter(
          (o) => o.pickupZone === zoneFilter || o.dropZone === zoneFilter
        );
      }

      // Filter by Agent
      if (agentFilter) {
        filteredData = filteredData.filter((o) => o.assignedAgentId === agentFilter);
      }

      setOrders(filteredData);
      
      const agentsList = getCollection('agents');
      const zonesList = getCollection('zones');
      
      setAgents(agentsList.map((a) => ({ value: a.id, label: a.name })));
      setZones(zonesList.map((z) => ({ value: z.id, label: z.name })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersAndOrders();
  }, [search, statusFilter, zoneFilter, agentFilter]);

  // Handle Sort
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

  // Bulk operations selection
  const handleToggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedOrders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkCancel = async () => {
    if (selectedIds.length === 0) return;
    
    let successCount = 0;
    for (const id of selectedIds) {
      try {
        await orderService.cancelOrder(id);
        successCount++;
      } catch (err) {
        console.error(err);
      }
    }
    toast.success(`Successfully cancelled ${successCount} orders.`);
    setSelectedIds([]);
    fetchFiltersAndOrders();
  };

  const handleExportCSV = () => {
    reportService.exportOrdersReport();
    toast.success('Orders Manifest CSV exported!');
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={selectedIds.length > 0 && selectedIds.length === paginatedOrders.length}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
        />
      ),
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => handleToggleSelectRow(row.id)}
          onClick={(e) => e.stopPropagation()} // prevent row-click detail navigation
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
        />
      ),
    },
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (val) => <span className="font-bold text-brand-600">{val}</span>,
    },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'dropAddress', label: 'Destination', render: (val) => <span className="truncate max-w-[150px] block">{val}</span> },
    {
      key: 'assignedAgentName',
      label: 'Agent Assigned',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          {val ? (
            <span className="font-semibold text-slate-705">{val}</span>
          ) : (
            <Link to={`/admin/orders/${row.id}/assign`} className="text-xxs font-bold text-brand-650 hover:underline flex items-center gap-1">
              <FiUserCheck className="h-3.5 w-3.5" /> Dispatch Agent
            </Link>
          )}
        </div>
      ),
    },
    { key: 'price', label: 'Value', render: (val) => formatCurrency(val) },
    { key: 'status', label: 'SLA Status', render: (val) => <StatusChip status={val} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/orders/${row.id}/assign`}>
            <Button size="sm" variant="outline">Dispatch</Button>
          </Link>
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
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FiPackage className="text-brand-600" />
            Manage Shipping Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch agents, monitor status timelines, and cancel manifest codes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="danger" size="sm" icon={FiTrash2} onClick={handleBulkCancel}>
              Cancel Selected ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" size="sm" icon={FiDownload} onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Matrix Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search by ID or destination address..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          <Select
            label="SLA Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            placeholder="All Statuses"
          />
          <Select
            label="Routing Zone"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            options={zones}
            placeholder="All Zones"
          />
          <Select
            label="Assigned Agent"
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            options={agents}
            placeholder="All Agents"
          />
        </div>
      </div>

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
        emptyMessage="No orders found matching the filter criteria."
      />
    </div>
  );
};

export default ManageOrders;
