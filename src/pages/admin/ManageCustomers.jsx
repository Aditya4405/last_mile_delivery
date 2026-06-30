import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ROLES } from '../../constants';
import Table from '../../components/Table';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import SearchBar from '../../components/SearchBar';
import toast from 'react-hot-toast';
import { FiUsers, FiPlusCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';

const ManageCustomers = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchCustomers = () => {
    setLoading(true);
    try {
      // Pull registered users list
      const allUsers = JSON.parse(localStorage.getItem('registered_users')) || [];
      const customerUsers = allUsers.filter((u) => u.role === ROLES.CUSTOMER);
      
      // Filter list
      let filtered = [...customerUsers];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.phone && c.phone.includes(q))
        );
      }
      setCustomers(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    reset({ name: '', email: '', phone: '', address: '', zip: '' });
    setShowFormModal(true);
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    reset({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      zip: customer.zip || '',
    });
    setShowFormModal(true);
  };

  const handleOpenDelete = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const onSubmit = async (data) => {
    setModalLoading(true);
    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const allUsers = JSON.parse(localStorage.getItem('registered_users')) || [];
      
      if (selectedCustomer) {
        // Edit Mode
        const idx = allUsers.findIndex((u) => u.id === selectedCustomer.id);
        if (idx !== -1) {
          allUsers[idx] = { ...allUsers[idx], ...data };
        }
        toast.success('Customer details updated successfully!');
      } else {
        // Create Mode
        if (allUsers.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
          throw new Error('A user with this email already exists.');
        }

        const newUser = {
          id: `user-customer-${Date.now()}`,
          ...data,
          role: ROLES.CUSTOMER,
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150`,
        };
        allUsers.push(newUser);
        toast.success('Customer created successfully!');
      }

      localStorage.setItem('registered_users', JSON.stringify(allUsers));
      setShowFormModal(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || 'Error occurred.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    setModalLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const allUsers = JSON.parse(localStorage.getItem('registered_users')) || [];
      const filtered = allUsers.filter((u) => u.id !== selectedCustomer.id);
      localStorage.setItem('registered_users', JSON.stringify(filtered));
      
      toast.success('Customer account deleted.');
      setShowDeleteModal(false);
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete customer.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Customer Name',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <img src={row.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (val) => val || '-' },
    { key: 'address', label: 'Billing Base Address', render: (val) => <span className="truncate max-w-[150px] block">{val || '-'}</span> },
    { key: 'zip', label: 'Zip', render: (val) => val || '-' },
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
            <FiUsers className="text-brand-655" />
            Manage Customers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, update, and remove client accounts in the system directory.
          </p>
        </div>
        <Button variant="success" icon={FiPlusCircle} onClick={handleOpenCreate}>
          Add New Customer
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-805 p-4 rounded-xl border border-slate-205 dark:border-slate-750 shadow-subtle">
        <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search by name or email..." />
      </div>

      <Table columns={columns} data={customers} loading={loading} emptyMessage="No customers found." />

      {/* Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={selectedCustomer ? 'Edit Customer Info' : 'Register New Customer'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Customer/Company Name"
            name="name"
            placeholder="e.g. Aditya"
            error={errors.name}
            required
            {...register('name', { required: 'Name is required' })}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="e.g. aditya@retail.com"
            error={errors.email}
            required
            readOnly={!!selectedCustomer} // email immutable post register
            {...register('email', { required: 'Email is required' })}
          />

          <Input
            label="Phone Number"
            name="phone"
            placeholder="+1 (555) 012-3456"
            error={errors.phone}
            {...register('phone')}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Billing Address"
              name="address"
              className="col-span-2"
              placeholder="123 Main St"
              error={errors.address}
              {...register('address')}
            />
            <Input
              label="Zip"
              name="zip"
              placeholder="110001"
              error={errors.zip}
              {...register('zip')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-750">
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Save Details
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Customer Account"
        message={`Are you sure you want to permanently delete customer account "${selectedCustomer?.name}"?`}
        loading={modalLoading}
      />
    </div>
  );
};

export default ManageCustomers;
