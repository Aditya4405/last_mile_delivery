import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiTruck, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password, data.rememberMe);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'customer') navigate('/customer');
      else if (user.role === 'agent') navigate('/agent');
    } catch (err) {
      toast.error(err.message || 'Failed to authenticate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill credentials for demo
  const quickFill = (role) => {
    if (role === 'admin') {
      setValue('email', 'admin@logitrack.com');
      setValue('password', 'password123');
    } else if (role === 'customer') {
      setValue('email', 'customer@logitrack.com');
      setValue('password', 'password123');
    } else if (role === 'agent') {
      setValue('email', 'agent@logitrack.com');
      setValue('password', 'password123');
    }
    toast.success(`${role.toUpperCase()} credentials filled!`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900">
          Sign in to your account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Welcome back! Access your tracking dashboards
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
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
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-[38px] right-3 text-slate-400 hover:text-slate-650 focus:outline-none"
          >
            {showPassword ? <FiEyeOff className="h-4.5 w-4.5" /> : <FiEye className="h-4.5 w-4.5" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 mr-2 h-4 w-4"
              {...register('rememberMe')}
            />
            Remember me
          </label>

          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-brand-650 hover:text-brand-700"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="text-center">
        <p className="text-xs text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-brand-650 hover:text-brand-750"
          >
            Create Account
          </Link>
        </p>
      </div>

      {/* Quick Access Demo Shortcut Panel */}
      <div className="pt-4 border-t border-slate-100">
        <p className="text-xxs font-bold text-center text-slate-400 uppercase tracking-wider mb-2.5">
          Quick Access Mock Roles
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => quickFill('customer')}
            className="flex flex-col items-center justify-center py-2 px-1 border border-slate-200 hover:border-brand-500 rounded-lg hover:bg-slate-50 transition-all text-slate-650"
          >
            <FiUser className="h-4 w-4 mb-1 text-sky-500" />
            <span className="text-[9px] font-bold">Customer</span>
          </button>
          <button
            type="button"
            onClick={() => quickFill('agent')}
            className="flex flex-col items-center justify-center py-2 px-1 border border-slate-200 hover:border-brand-500 rounded-lg hover:bg-slate-50 transition-all text-slate-650"
          >
            <FiTruck className="h-4 w-4 mb-1 text-emerald-500" />
            <span className="text-[9px] font-bold">Agent</span>
          </button>
          <button
            type="button"
            onClick={() => quickFill('admin')}
            className="flex flex-col items-center justify-center py-2 px-1 border border-slate-200 hover:border-brand-500 rounded-lg hover:bg-slate-50 transition-all text-slate-650"
          >
            <FiShield className="h-4 w-4 mb-1 text-indigo-500" />
            <span className="text-[9px] font-bold">Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
