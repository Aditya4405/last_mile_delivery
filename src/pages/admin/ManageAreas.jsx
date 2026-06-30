import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { areaService } from '../../services/areaService';
import { getCollection } from '../../services/db';
import Table from '../../components/Table';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import SearchBar from '../../components/SearchBar';
import toast from 'react-hot-toast';
import { FiMapPin, FiPlusCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';

const ManageAreas = () => {
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState([]);
  const [zones, setZones] = useState([]);
  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchAreasAndZones = async () => {
    setLoading(true);
    try {
      const data = await areaService.getAreas({ search });
      setAreas(data);
      
      const zonesList = getCollection('zones');
      setZones(zonesList.map((z) => ({ value: z.id, label: z.name })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreasAndZones();
  }, [search]);

  const handleOpenCreate = () => {
    setSelectedArea(null);
    reset({ name: '', zip: '', zoneId: '' });
    setShowFormModal(true);
  };

  const handleOpenEdit = (area) => {
    setSelectedArea(area);
    reset({
      name: area.name,
      zip: area.zip,
      zoneId: area.zoneId,
    });
    setShowFormModal(true);
  };

  const handleOpenDelete = (area) => {
    setSelectedArea(area);
    setShowDeleteModal(true);
  };

  const onSubmit = async (data) => {
    setModalLoading(true);
    try {
      if (selectedArea) {
        await areaService.updateArea(selectedArea.id, data);
        toast.success('Area updated successfully!');
      } else {
        await areaService.createArea(data);
        toast.success('Area registered successfully!');
      }
      setShowFormModal(false);
      fetchAreasAndZones();
    } catch (err) {
      toast.error(err.message || 'Error occurred.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await areaService.deleteArea(selectedArea.id);
      toast.success('Area subdivision deleted.');
      setShowDeleteModal(false);
      fetchAreasAndZones();
    } catch (err) {
      toast.error('Failed to delete area.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Area Name', sortable: true },
    { key: 'zip', label: 'Pincode', sortable: true, render: (val) => <span className="font-mono font-semibold">{val}</span> },
    {
      key: 'zoneName',
      label: 'Parent Routing Zone',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-700">{val}</span>,
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
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FiMapPin className="text-brand-600" />
            Manage Areas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure delivery pin codes and associate subdivisions to operational zones.
          </p>
        </div>
        <Button variant="success" icon={FiPlusCircle} onClick={handleOpenCreate}>
          Add New Area
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
        <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search by area name or pincode..." />
      </div>

      <Table columns={columns} data={areas} loading={loading} emptyMessage="No area subdivisions configured." />

      {/* Form Modal */}
      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={selectedArea ? 'Edit Area Subdivision' : 'Add New Area'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Area Subdivision Name"
            name="name"
            placeholder="e.g. Green Park Estate"
            error={errors.name}
            required
            {...register('name', { required: 'Name is required' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Pincode"
              name="zip"
              placeholder="e.g. 110016"
              error={errors.zip}
              required
              {...register('zip', { required: 'Pincode is required' })}
            />
            <Select
              label="Associated Zone"
              name="zoneId"
              options={zones}
              error={errors.zoneId}
              placeholder="Select Zone"
              required
              {...register('zoneId', { required: 'Zone is required' })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Save Area
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Area Subdivision"
        message={`Are you sure you want to permanently delete area subdivision "${selectedArea?.name}"?`}
        loading={modalLoading}
      />
    </div>
  );
};

export default ManageAreas;
