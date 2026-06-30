import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiCompass } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      zip: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await signup(data.name, data.email, data.password, data.phone, data.address, data.zip);
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900">
          Create a Customer Account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Register to book packages and track orders
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          icon={FiUser}
          placeholder="e.g. Aditya"
          error={errors.name}
          required
          {...register('name', { required: 'Full name is required' })}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          icon={FiMail}
          placeholder="e.g. aditya@retail.com"
          error={errors.email}
          required
          {...register('email', {
            required: 'Email address is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          icon={FiLock}
          placeholder="••••••••"
          error={errors.password}
          required
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          icon={FiPhone}
          placeholder="+91 98765 43210"
          error={errors.phone}
          required
          {...register('phone', { required: 'Phone number is required' })}
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Address"
            name="address"
            icon={FiMapPin}
            placeholder="Sector 62, Noida"
            className="col-span-2"
            error={errors.address}
            {...register('address')}
          />
          <Input
            label="Pincode"
            name="zip"
            icon={FiCompass}
            placeholder="110001"
            error={errors.zip}
            {...register('zip')}
          />
        </div>

        <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <div className="text-center">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-650 hover:text-brand-750"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
