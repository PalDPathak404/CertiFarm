// Common Components for CertiFarm

import React from 'react';
import { FiLoader } from 'react-icons/fi';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizes[size]}`}></div>
    </div>
  );
};

// Full Page Loader
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-500">Loading...</p>
    </div>
  </div>
);

// Status Badge Component
export const StatusBadge = ({ status, size = 'md' }) => {
  const styles = {
    submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
    under_inspection: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Under Inspection' },
    inspection_complete: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Inspection Complete' },
    certified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Certified' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    revoked: { bg: 'bg-red-100', text: 'text-red-800', label: 'Revoked' },
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
    expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Expired' },
    pass: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pass' },
    fail: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fail' },
    conditional_pass: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Conditional Pass' },
    pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pending' },
  };

  const style = styles[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${style.bg} ${style.text} ${sizeClasses}`}>
      {style.label}
    </span>
  );
};

// Priority Badge Component
export const PriorityBadge = ({ priority }) => {
  const styles = {
    urgent: { bg: 'bg-red-100', text: 'text-red-800' },
    express: { bg: 'bg-orange-100', text: 'text-orange-800' },
    normal: { bg: 'bg-gray-100', text: 'text-gray-800' },
  };

  const style = styles[priority] || styles.normal;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
};

// Empty State Component
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12">
    {Icon && <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-gray-500 mb-4">{description}</p>}
    {action}
  </div>
);

// Card Component
export const Card = ({ children, className = '', hover = false }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${hover ? 'hover:shadow-md transition-shadow' : ''} ${className}`}>
    {children}
  </div>
);

// Stat Card Component
export const StatCard = ({ icon: Icon, label, value, color = 'bg-primary-500', trend, link }) => {
  const content = (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {trend && (
          <p className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
          </p>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} className="card-hover block">
        {content}
      </a>
    );
  }

  return <Card hover>{content}</Card>;
};

// Confirmation Modal
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast-like Alert Component
export const Alert = ({ type = 'info', message, onClose }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} flex items-center justify-between`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 hover:opacity-70">×</button>
      )}
    </div>
  );
};

export default {
  LoadingSpinner,
  PageLoader,
  StatusBadge,
  PriorityBadge,
  EmptyState,
  Card,
  StatCard,
  ConfirmModal,
  Alert,
};