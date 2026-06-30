import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const OtpVerification = ({ onVerify, loading = false, expectedOtp = '1234' }) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newDigits = [...digits];
    // Take only the last character if pasted/typed multiple
    newDigits[index] = value.substring(value.length - 1);
    setDigits(newDigits);

    // Shift focus forward
    if (value && index < 3) {
      refs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: shift focus back
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 4) {
      toast.error('Please enter all 4 digits.');
      return;
    }
    
    if (onVerify) {
      onVerify(otp);
    } else {
      // General demo check
      if (otp === expectedOtp) {
        toast.success('Security code verified successfully!');
      } else {
        toast.error('Verification code incorrect. Use 1234.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="p-3 bg-brand-50 text-brand-650 rounded-full mb-4">
        <FiLock className="h-6 w-6" />
      </div>
      
      <h3 className="text-base font-semibold text-slate-900">
        OTP Delivery Verification
      </h3>
      <p className="text-xs text-slate-500 mt-1 text-center max-w-xs leading-relaxed">
        Please ask the customer for their security pass-code (Default: <span className="font-bold text-slate-700">{expectedOtp}</span>)
      </p>

      <form onSubmit={handleSubmit} className="mt-6 w-full space-y-6">
        <div className="flex justify-center gap-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={refs[idx]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-305 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-900 transition-all shadow-subtle"
            />
          ))}
        </div>

        <Button type="submit" variant="success" className="w-full" loading={loading}>
          Verify OTP Code
        </Button>
      </form>
    </div>
  );
};

export default OtpVerification;
