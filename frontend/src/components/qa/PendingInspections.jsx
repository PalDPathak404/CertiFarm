import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inspectionAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiClipboard, FiRefreshCw, FiEye, FiPlay } from 'react-icons/fi';

const PendingInspections = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const response = await inspectionAPI.getPending();
      setBatches(response.data.data.batches || []);
    } catch (error) {
      console.error('Failed to fetch pending:', error);
      toast.error('Failed to load pending inspections');
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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Inspections</h1>
          <p className="text-gray-600">Batches awaiting quality inspection</p>
        </div>
        <button
          onClick={fetchPending}
          className="btn btn-secondary flex items-center gap-2 self-start"
        >
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* List */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12">
            <FiClipboard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending inspections</h3>
            <p className="text-gray-500">All inspections are up to date</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Batch ID</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Exporter</th>
                  <th className="pb-3 font-medium">Destination</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Submitted</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((batch) => (
                  <tr key={batch._id} className={`hover:bg-gray-50 ${batch.priority === 'urgent' ? 'bg-red-50' : ''}`}>
                    <td className="py-4">
                      <span className="font-mono text-sm font-medium text-primary-600">
                        {batch.batchId}
                      </span>
                    </td>
                    <td className="py-4">
                      <p className="font-medium text-gray-900">{batch.product?.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{batch.product?.category}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-gray-900">{batch.exporter?.name}</p>
                      <p className="text-sm text-gray-500">{batch.exporter?.organization}</p>
                    </td>
                    <td className="py-4 text-gray-600">{batch.destination?.country}</td>
                    <td className="py-4">
                      <span className={`badge ${getPriorityBadge(batch.priority)}`}>
                        {batch.priority?.charAt(0).toUpperCase() + batch.priority?.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`badge ${getStatusBadge(batch.status)}`}>
                        {formatStatus(batch.status)}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 text-sm">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/dashboard/inspect/${batch._id}`}
                          className="btn btn-primary text-sm flex items-center gap-1"
                        >
                          {batch.status === 'submitted' ? (
                            <>
                              <FiPlay className="w-4 h-4" /> Start
                            </>
                          ) : (
                            <>
                              <FiEye className="w-4 h-4" /> Continue
                            </>
                          )}
                        </Link>
                      </div>
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

export default PendingInspections;