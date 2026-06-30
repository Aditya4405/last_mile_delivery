import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { agentService } from '../../services/agentService';
import { getCollection, setCollection } from '../../services/db';
import Table from '../../components/Table';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import SearchBar from '../../components/SearchBar';
import toast from 'react-hot-toast';
import { FiTruck, FiPlusCircle, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const ManageAgents = () => {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [zones, setZones] = useState([]);
  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await agentService.getAgents({ search });
      setAgents(data);
      const zonesList = getCollection('zones');
      setZones(zonesList.map((z) => ({ value: z.id, label: z.name })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [search]);

  const handleOpenCreate = () => {
    setSelectedAgent(null);
    reset({ name: '', email: '', phone: '', vehicle: 'Electric Bike', license: '', zoneId: '' });
    setShowFormModal(true);
  };

  const handleOpenEdit = (agent) => {
    setSelectedAgent(agent);
    reset({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      vehicle: agent.vehicle,
      license: agent.license,
      zoneId: agent.zoneId,
    });
    setShowFormModal(true);
  };

  const handleOpenDelete = (agent) => {
    setSelectedAgent(agent);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (agent) => {
    try {
      await agentService.toggleAvailability(agent.id);
      toast.success(`Agent ${agent.name} status toggled.`);
      fetchAgents();
    } catch (err) {
      toast.error('Failed to change status.');
    }
  };

  const onSubmit = async (data) => {
    setModalLoading(true);
    try {
      if (selectedAgent) {
        await agentService.updateAgent(selectedAgent.id, data);
        toast.success('Agent updated successfully!');
      } else {
        await agentService.createAgent(data);
        toast.success('Agent registered successfully!');
      }
      setShowFormModal(false);
      fetchAgents();
    } catch (err) {
      toast.error(err.message || 'Error occurred.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await agentService.deleteAgent(selectedAgent.id);
      toast.success('Agent account deleted.');
      setShowDeleteModal(false);
      fetchAgents();
    } catch (err) {
      toast.error('Failed to delete agent.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Agent Details',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <img src={row.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border" />
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{val}</span>
            <span className="text-[9px] text-slate-400 font-mono">{row.email}</span>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'vehicle', label: 'Vehicle Type' },
    { key: 'license', label: 'License' },
    {
      key: 'workload',
      label: 'Workload',
      render: (val) => (
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
          val > 2 ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'
        }`}>
          {val} active jobs
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border transition-colors ${
            val === 'active'
              ? 'bg-success-50 text-success-700 border-success-200'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}
        >
          {val === 'active' ? <FiToggleRight className="h-4 w-4 text-success-600" /> : <FiToggleLeft className="h-4 w-4 text-slate-400" />}
          {val.toUpperCase()}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" icon={FiEdit2} onClick={() => handleOpenEdit(row)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" icon={FiTrash2} onClick={() => handleOpenDelete(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-909 dark:text-white flex items-center gap-2">
            <FiTruck className="text-brand-655" />
            Manage Delivery Agents
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dispatch, control shift statuses, and edit courier license manifest profiles.
          </p>
        </div>
        <Button variant="success" icon={FiPlusCircle} onClick={handleOpenCreate}>
          Register Courier Agent
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-805 p-4 rounded-xl border border-slate-205 dark:border-slate-750 shadow-subtle">
        <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search by name, email, or vehicle..." />
      </div>

      <Table columns={columns} data={agents} loading={loading} emptyMessage="No delivery agents found." />

      {/* Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={selectedAgent ? 'Edit Agent Profile' : 'Register New Courier Agent'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. John Doe"
            error={errors.name}
            required
            {...register('name', { required: 'Name is required' })}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="e.g. john@swiftroute.com"
            error={errors.email}
            required
            readOnly={!!selectedAgent}
            {...register('email', { required: 'Email is required' })}
          />

          <Input
            label="Phone Number"
            name="phone"
            placeholder="+1 (555) 012-3456"
            error={errors.phone}
            required
            {...register('phone', { required: 'Phone is required' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assigned Home Zone"
              name="zoneId"
              options={zones}
              error={errors.zoneId}
              placeholder="Select Zone"
              required
              {...register('zoneId', { required: 'Zone is required' })}
            />
            <Select
              label="Vehicle Type"
              name="vehicle"
              options={['Electric Bike', 'Motorcycle', 'Mini Van', 'Cargo Truck']}
              error={errors.vehicle}
              required
              {...register('vehicle', { required: 'Vehicle is required' })}
            />
          </div>

          <Input
            label="Driving License ID"
            name="license"
            placeholder="e.g. DL-98214-A"
            error={errors.license}
            required
            {...register('license', { required: 'License is required' })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-750">
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Agent Account"
        message={`Are you sure you want to permanently delete agent account "${selectedAgent?.name}"?`}
        loading={modalLoading}
      />
    </div>
  );
};

export default ManageAgents;
