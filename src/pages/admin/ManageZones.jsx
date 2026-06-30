import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zoneService } from '../../services/zoneService';
import Table from '../../components/Table';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import SearchBar from '../../components/SearchBar';
import toast from 'react-hot-toast';
import { FiMap, FiPlusCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';

const ManageZones = () => {
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState([]);
  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await zoneService.getZones({ search });
      setZones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, [search]);

  const handleOpenCreate = () => {
    setSelectedZone(null);
    reset({ name: '', code: '', description: '' });
    setShowFormModal(true);
  };

  const handleOpenEdit = (zone) => {
    setSelectedZone(zone);
    reset({
      name: zone.name,
      code: zone.code,
      description: zone.description,
    });
    setShowFormModal(true);
  };

  const handleOpenDelete = (zone) => {
    setSelectedZone(zone);
    setShowDeleteModal(true);
  };

  const onSubmit = async (data) => {
    setModalLoading(true);
    try {
      if (selectedZone) {
        await zoneService.updateZone(selectedZone.id, data);
        toast.success('Zone details updated.');
      } else {
        await zoneService.createZone(data);
        toast.success('Zone registered successfully.');
      }
      setShowFormModal(false);
      fetchZones();
    } catch (err) {
      toast.error(err.message || 'Error executing request.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await zoneService.deleteZone(selectedZone.id);
      toast.success('Zone deleted.');
      setShowDeleteModal(false);
      fetchZones();
    } catch (err) {
      toast.error(err.message || 'Failed to delete zone.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    { key: 'code', label: 'Zone Code', render: (val) => <span className="font-bold text-brand-600">{val}</span> },
    { key: 'name', label: 'Zone Name' },
    { key: 'description', label: 'Description', render: (val) => <span className="truncate max-w-[200px] block">{val}</span> },
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
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FiMap className="text-brand-600" />
            Manage Zones
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure geographic zones, routing boundaries, and operational nodes.
          </p>
        </div>
        <Button variant="success" icon={FiPlusCircle} onClick={handleOpenCreate}>
          Create New Zone
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
        <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search by name or code..." />
      </div>

      <Table columns={columns} data={zones} loading={loading} emptyMessage="No zones configured." />

      {/* Form Modal */}
      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={selectedZone ? 'Edit Zone Info' : 'Create New Zone'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Zone Code"
              name="code"
              placeholder="NZ-01"
              error={errors.code}
              required
              {...register('code', { required: 'Code is required' })}
            />
            <Input
              label="Zone Name"
              name="name"
              placeholder="North Zone"
              className="sm:col-span-2"
              error={errors.name}
              required
              {...register('name', { required: 'Name is required' })}
            />
          </div>

          <Input
            label="Description / Bounds"
            name="description"
            placeholder="Covers industrial or retail sectors..."
            error={errors.description}
            {...register('description')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Save Zone
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Zone"
        message={`Are you sure you want to permanently delete zone "${selectedZone?.name}"? This action fails if sub-areas are linked.`}
        loading={modalLoading}
      />
    </div>
  );
};

export default ManageZones;
