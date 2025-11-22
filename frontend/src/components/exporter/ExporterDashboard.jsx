import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { batchAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiPackage, FiClock, FiCheckCircle, FiAward, FiPlus, FiArrowRight } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, color, link }) => (
  <Link to={link} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </Link>
);

const ExporterDashboard = ({ stats }) => {
  const { user } = useAuth();
  const [recentBatches, setRecentBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentBatches();
  }, []);

  const fetchRecentBatches = async () => {
    try {
      const response = await batchAPI.getAll({ limit: 5 });
      setRecentBatches(response.data.data.batches || []);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800',
      under_inspection: 'bg-yellow-100 text-yellow-800',
      inspection_complete: 'bg-indigo-100 text-indigo-800',
      certified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      revoked: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const statusCounts = stats?.statusBreakdown?.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-600">Here's an overview of your export activities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FiPackage}
          label="Total Batches"
          value={stats?.totalBatches || 0}
          color="bg-blue-500"
          link="/dashboard/batches"
        />
        <StatCard
          icon={FiClock}
          label="Pending Inspection"
          value={(statusCounts.submitted || 0) + (statusCounts.under_inspection || 0)}
          color="bg-yellow-500"
          link="/dashboard/batches?status=submitted"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Certified"
          value={statusCounts.certified || 0}
          color="bg-green-500"
          link="/dashboard/batches?status=certified"
        />
        <StatCard
          icon={FiAward}
          label="This Week"
          value={stats?.recentBatches || 0}
          color="bg-purple-500"
          link="/dashboard/batches"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/dashboard/batches/new"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiPlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">New Batch</p>
              <p className="text-sm text-gray-500">Submit for inspection</p>
            </div>
          </Link>
          <Link
            to="/dashboard/credentials"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiAward className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View Certificates</p>
              <p className="text-sm text-gray-500">Download & share</p>
            </div>
          </Link>
          <Link
            to="/verify"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Verify Certificate</p>
              <p className="text-sm text-gray-500">Check authenticity</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Batches */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Batches</h2>
          <Link to="/dashboard/batches" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : recentBatches.length === 0 ? (
          <div className="text-center py-8">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No batches yet</p>
            <Link to="/dashboard/batches/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <FiPlus /> Create First Batch
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Batch ID</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Destination</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBatches.map((batch) => (
                  <tr key={batch._id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <Link to={`/dashboard/batches/${batch._id}`} className="font-medium text-green-600 hover:text-green-700">
                        {batch.batchId}
                      </Link>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{batch.product?.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{batch.product?.category}</p>
                    </td>
                    <td className="py-3 text-gray-600">{batch.destination?.country}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(batch.status)}`}>
                        {formatStatus(batch.status)}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-sm">
                      {new Date(batch.createdAt).toLocaleDateString()}
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

export default ExporterDashboard;