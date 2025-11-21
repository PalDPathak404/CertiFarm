import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inspectionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FiClipboard, FiClock, FiCheckCircle, FiAward, 
  FiArrowRight, FiAlertCircle
} from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, color, link }) => (
  <Link to={link} className="card-hover flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </Link>
);

const QADashboard = ({ stats }) => {
  const { user } = useAuth();
  const [pendingBatches, setPendingBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingBatches();
  }, []);

  const fetchPendingBatches = async () => {
    try {
      const response = await inspectionAPI.getPending();
      setPendingBatches(response.data.data.batches || []);
    } catch (error) {
      console.error('Failed to fetch pending batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: 'badge-info',
      under_inspection: 'badge-warning',
    };
    return styles[status] || 'badge-gray';
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'urgent') return 'badge-error';
    if (priority === 'express') return 'badge-warning';
    return 'badge-gray';
  };

  const statusCounts = stats?.statusBreakdown?.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">QA Agency Dashboard - Manage inspections and certifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FiClock}
          label="Pending Inspection"
          value={pendingBatches.filter(b => b.status === 'submitted').length}
          color="bg-yellow-500"
          link="/dashboard/pending"
        />
        <StatCard
          icon={FiClipboard}
          label="In Progress"
          value={pendingBatches.filter(b => b.status === 'under_inspection').length}
          color="bg-blue-500"
          link="/dashboard/inspections"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Completed Today"
          value={statusCounts.inspection_complete || 0}
          color="bg-green-500"
          link="/dashboard/inspections"
        />
        <StatCard
          icon={FiAward}
          label="Certificates Issued"
          value={statusCounts.certified || 0}
          color="bg-purple-500"
          link="/dashboard/credentials"
        />
      </div>

      {/* Urgent Items Alert */}
      {pendingBatches.some(b => b.priority === 'urgent') && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Urgent Inspections Pending</h3>
              <p className="text-sm text-red-700">
                You have {pendingBatches.filter(b => b.priority === 'urgent').length} urgent inspection(s) awaiting action
              </p>
            </div>
            <Link to="/dashboard/pending" className="btn btn-danger ml-auto">
              View Now
            </Link>
          </div>
        </div>
      )}

      {/* Pending Inspections Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Inspections</h2>
          <Link to="/dashboard/pending" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : pendingBatches.length === 0 ? (
          <div className="text-center py-8">
            <FiCheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p className="text-gray-500">No pending inspections</p>
            <p className="text-sm text-gray-400">All caught up! Great work.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Batch ID</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Exporter</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Submitted</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingBatches.slice(0, 5).map((batch) => (
                  <tr key={batch._id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <span className="font-mono text-sm font-medium text-primary-600">
                        {batch.batchId}
                      </span>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{batch.product?.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{batch.product?.category}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-gray-900">{batch.exporter?.name}</p>
                      <p className="text-sm text-gray-500">{batch.exporter?.organization}</p>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${getPriorityBadge(batch.priority)}`}>
                        {batch.priority?.charAt(0).toUpperCase() + batch.priority?.slice(1)}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${getStatusBadge(batch.status)}`}>
                        {formatStatus(batch.status)}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-sm">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/dashboard/inspect/${batch._id}`}
                        className="btn btn-primary text-sm"
                      >
                        {batch.status === 'submitted' ? 'Start' : 'Continue'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QADashboard;