import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { batchAPI, credentialAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiPackage, FiPlus, FiFilter, FiDownload, FiEye, 
  FiChevronLeft, FiChevronRight, FiRefreshCw
} from 'react-icons/fi';

const BatchList = ({ showCredentials }) => {
  const [searchParams] = useSearchParams();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    category: '',
  });

  useEffect(() => {
    fetchBatches();
  }, [filters, pagination.current]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: 10,
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
      };
      const response = await batchAPI.getAll(params);
      setBatches(response.data.data.batches);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = async (batch) => {
    if (!batch.credential) {
      toast.error('No certificate available for this batch');
      return;
    }
    try {
      const response = await credentialAPI.getQR(batch.credential._id || batch.credential);
      const link = document.createElement('a');
      link.href = response.data.data.qrCode;
      link.download = `${batch.batchId}-qr.png`;
      link.click();
      toast.success('QR Code downloaded');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: 'badge-info',
      under_inspection: 'badge-warning',
      inspection_complete: 'badge-info',
      certified: 'badge-success',
      rejected: 'badge-error',
      revoked: 'badge-error',
    };
    return styles[status] || 'badge-gray';
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_inspection', label: 'Under Inspection' },
    { value: 'inspection_complete', label: 'Inspection Complete' },
    { value: 'certified', label: 'Certified' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'spices', label: 'Spices' },
    { value: 'pulses', label: 'Pulses' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showCredentials ? 'Certificates' : 'My Batches'}
          </h1>
          <p className="text-gray-600">
            {showCredentials 
              ? 'View and download your Digital Product Passports' 
              : 'Manage your product batches and track their status'
            }
          </p>
        </div>
        <Link to="/dashboard/batches/new" className="btn btn-primary flex items-center gap-2 self-start">
          <FiPlus /> New Batch
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <FiFilter className="w-5 h-5" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input w-full sm:w-48"
          >
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input w-full sm:w-48"
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button
            onClick={fetchBatches}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Batch List */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
            <p className="text-gray-500 mb-4">
              {filters.status || filters.category 
                ? 'Try adjusting your filters' 
                : 'Get started by creating your first batch'
              }
            </p>
            <Link to="/dashboard/batches/new" className="btn btn-primary inline-flex items-center gap-2">
              <FiPlus /> Create Batch
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">Batch ID</th>
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Quantity</th>
                    <th className="pb-3 font-medium">Destination</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batches.map((batch) => (
                    <tr key={batch._id} className="hover:bg-gray-50">
                      <td className="py-4">
                        <span className="font-mono text-sm font-medium text-primary-600">
                          {batch.batchId}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="font-medium text-gray-900">{batch.product?.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{batch.product?.category}</p>
                      </td>
                      <td className="py-4 text-gray-600">
                        {batch.product?.quantity?.value} {batch.product?.quantity?.unit}
                      </td>
                      <td className="py-4 text-gray-600">{batch.destination?.country}</td>
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
                            to={`/dashboard/batches/${batch._id}`}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          {batch.status === 'certified' && (
                            <button
                              onClick={() => handleDownloadQR(batch)}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Download QR"
                            >
                              <FiDownload className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <p className="text-sm text-gray-500">
                  Showing {batches.length} of {pagination.total} batches
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(p => ({ ...p, current: p.current - 1 }))}
                    disabled={pagination.current === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.current} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(p => ({ ...p, current: p.current + 1 }))}
                    disabled={pagination.current === pagination.pages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BatchList;