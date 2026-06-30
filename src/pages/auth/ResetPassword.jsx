import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiMail, FiKey, FiLock, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve email if redirected from forgot-password
  const emailVal = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: emailVal,
      code: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await resetPassword(data.email, data.code, data.password);
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Verification failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900">
          Reset Password
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Verify the OTP and enter your new password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          name="email"
          type="email"
          icon={FiMail}
          placeholder="e.g. aditya@retail.com"
          error={errors.email}
          required
          readOnly={!!emailVal}
          {...register('email', { required: 'Email is required' })}
        />

        <Input
          label="Verification Code (OTP)"
          name="code"
          icon={FiKey}
          placeholder="Enter 123456"
          error={errors.code}
          required
          {...register('code', { required: 'Verification code is required' })}
        />

        <Input
          label="New Password"
          name="password"
          type="password"
          icon={FiLock}
          placeholder="••••••••"
          error={errors.password}
          required
          {...register('password', {
            required: 'New password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />

        <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
          Update Password
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          <FiArrowLeft className="mr-1.5" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
