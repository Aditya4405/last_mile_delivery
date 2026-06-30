import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertOctagon, FiAlertTriangle, FiHome, FiArrowLeft, FiSettings } from 'react-icons/fi';
import Button from './Button';

// 404 Not Found Page
export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="relative">
          <h1 className="text-9xl font-extrabold text-brand-100 tracking-widest select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <FiAlertTriangle className="h-16 w-16 text-brand-500 animate-bounce" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">
            Lost in Transit?
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            The page you are looking for has either been moved, delivered somewhere else, or never existed in our manifest.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" icon={FiArrowLeft} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="primary" icon={FiHome} onClick={() => navigate('/')}>
            Back Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// 403 Forbidden Page
export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="relative">
          <h1 className="text-9xl font-extrabold text-red-100 tracking-widest select-none">
            403
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <FiAlertOctagon className="h-16 w-16 text-red-500 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">
            Access Manifest Denied
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            You do not have the security clearance required to inspect this sector. Please check your credentials.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" icon={FiArrowLeft} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="primary" icon={FiHome} onClick={() => navigate('/')}>
            Request Access
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// 500 Internal Server Error
export const ServerErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="relative">
          <h1 className="text-9xl font-extrabold text-slate-200 tracking-widest select-none">
            500
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <FiAlertOctagon className="h-16 w-16 text-slate-650" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">
            System Collision Detected
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Our central routing system encountered a critical conflict. Our dispatch team is debugging the telemetry lines.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
          <Button variant="primary" icon={FiHome} onClick={() => navigate('/')}>
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Maintenance Mode Page
export const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="relative">
          <h1 className="text-9xl font-extrabold text-amber-100 tracking-widest select-none">
            OPS
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <FiSettings className="h-16 w-16 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">
            Scheduled Maintenance
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We are upgrading our logistics servers to serve you faster. Telemetry signals will resume shortly. We expect to be online within the hour.
          </p>
        </div>

        <div className="pt-2">
          <p className="text-xs text-slate-400">
            Scheduled: 22:00 - 23:00 GMT | Current Status: Calibrating GPS Nodes
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
