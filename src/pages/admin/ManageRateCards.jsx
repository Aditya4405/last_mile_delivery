import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { rateCardService } from '../../services/rateCardService';
import Table from '../../components/Table';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import toast from 'react-hot-toast';
import { FiDollarSign, FiPlusCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../../utils';

const ManageRateCards = () => {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchRates = async () => {
    setLoading(true);
    try {
      const data = await rateCardService.getRateCards();
      setRates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleOpenCreate = () => {
    setSelectedRate(null);
    reset({ type: 'B2C', scope: 'Intra Zone', baseWeight: 1, basePrice: '', extraWeightPrice: '', codCharge: 0 });
    setShowFormModal(true);
  };

  const handleOpenEdit = (rate) => {
    setSelectedRate(rate);
    reset({
      type: rate.type,
      scope: rate.scope,
      baseWeight: rate.baseWeight,
      basePrice: rate.basePrice,
      extraWeightPrice: rate.extraWeightPrice,
      codCharge: rate.codCharge,
    });
    setShowFormModal(true);
  };

  const handleOpenDelete = (rate) => {
    setSelectedRate(rate);
    setShowDeleteModal(true);
  };

  const onSubmit = async (data) => {
    setModalLoading(true);
    try {
      if (selectedRate) {
        await rateCardService.updateRateCard(selectedRate.id, data);
        toast.success('Rate card parameters updated.');
      } else {
        await rateCardService.createRateCard(data);
        toast.success('Rate card registered.');
      }
      setShowFormModal(false);
      fetchRates();
    } catch (err) {
      toast.error(err.message || 'Error occurred.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await rateCardService.deleteRateCard(selectedRate.id);
      toast.success('Rate card deleted.');
      setShowDeleteModal(false);
      fetchRates();
    } catch (err) {
      toast.error('Failed to delete rate card.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    { key: 'type', label: 'Client Type', render: (val) => <span className="font-bold text-slate-800 dark:text-slate-100">{val}</span> },
    { key: 'scope', label: 'Transit Scope', render: (val) => <span className="font-semibold text-slate-550">{val}</span> },
    { key: 'baseWeight', label: 'Base Weight (kg)' },
    { key: 'basePrice', label: 'Base Price', render: (val) => formatCurrency(val) },
    { key: 'extraWeightPrice', label: 'Extra Weight / kg', render: (val) => formatCurrency(val) },
    { key: 'codCharge', label: 'COD Surcharges', render: (val) => formatCurrency(val) },
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
            <FiDollarSign className="text-brand-655" />
            Manage Rate Cards
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Edit shipping tariffs, weight slabs, and cash handling fees.
          </p>
        </div>
        <Button variant="success" icon={FiPlusCircle} onClick={handleOpenCreate}>
          Create Tariff Card
        </Button>
      </div>

      <Table columns={columns} data={rates} loading={loading} emptyMessage="No rate cards configured." />

      {/* Form Modal */}
      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={selectedRate ? 'Edit Tariff Parameters' : 'Create Tariff Card'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="SLA Class"
              name="type"
              options={['B2B', 'B2C']}
              error={errors.type}
              required
              disabled={!!selectedRate} // immutable keys
              {...register('type', { required: 'Type is required' })}
            />
            <Select
              label="Shipping Scope"
              name="scope"
              options={['Intra Zone', 'Inter Zone']}
              error={errors.scope}
              required
              disabled={!!selectedRate}
              {...register('scope', { required: 'Scope is required' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Weight Slab (kg)"
              name="baseWeight"
              type="number"
              step="0.1"
              placeholder="1"
              error={errors.baseWeight}
              required
              {...register('baseWeight', { required: 'Base weight is required', min: 0.1 })}
            />
            <Input
              label="Base Cost price ($)"
              name="basePrice"
              type="number"
              step="0.01"
              placeholder="5.00"
              error={errors.basePrice}
              required
              {...register('basePrice', { required: 'Base price is required', min: 0 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Extra Weight / kg ($)"
              name="extraWeightPrice"
              type="number"
              step="0.01"
              placeholder="1.50"
              error={errors.extraWeightPrice}
              required
              {...register('extraWeightPrice', { required: 'Extra price is required', min: 0 })}
            />
            <Input
              label="COD Surcharge ($)"
              name="codCharge"
              type="number"
              step="0.01"
              placeholder="1.00"
              error={errors.codCharge}
              required
              {...register('codCharge', { required: 'COD charge is required', min: 0 })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-750">
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Save Card
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Rate Card"
        message={`Are you sure you want to permanently delete this tariff parameters card?`}
        loading={modalLoading}
      />
    </div>
  );
};

export default ManageRateCards;
