import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { batchAPI, inspectionAPI, credentialAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, FiSave, FiCheckCircle, FiXCircle, 
  FiAward, FiPackage, FiMapPin, FiUser
} from 'react-icons/fi';

const InspectionForm = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const [formData, setFormData] = useState({
    qualityParameters: {
      moisture: { value: '', acceptable: true },
      foreignMatter: { value: '', acceptable: true },
      pesticideResidue: { detected: false, value: '', acceptable: true },
      aflatoxin: { value: '', acceptable: true },
      grade: 'A',
      organicCertified: false,
    },
    visualInspection: {
      color: { acceptable: true, remarks: '' },
      texture: { acceptable: true, remarks: '' },
      odor: { acceptable: true, remarks: '' },
      packaging: { acceptable: true, remarks: '' },
    },
    compliance: {
      fssaiCompliant: false,
      exportStandards: false,
      destinationCountryStandards: false,
      isoCompliant: false,
      isoCodes: [],
    },
    overallResult: 'pending',
    remarks: '',
    recommendations: '',
  });

  useEffect(() => {
    fetchBatchAndInspection();
  }, [batchId]);

  const fetchBatchAndInspection = async () => {
    try {
      const batchRes = await batchAPI.getById(batchId);
      setBatch(batchRes.data.data.batch);

      if (batchRes.data.data.batch.inspection) {
        const inspRes = await inspectionAPI.getById(batchRes.data.data.batch.inspection._id || batchRes.data.data.batch.inspection);
        setInspection(inspRes.data.data.inspection);
      }
    } catch (error) {
      console.error('Failed to fetch batch:', error);
      toast.error('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = async () => {
    try {
      const response = await inspectionAPI.start(batchId, { inspectionType: 'physical' });
      setInspection(response.data.data.inspection);
      toast.success('Inspection started');
      fetchBatchAndInspection();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start inspection');
    }
  };

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNestedChange = (section, field, subfield, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: {
          ...prev[section][field],
          [subfield]: value
        }
      }
    }));
  };

  const handleSubmitInspection = async () => {
    if (!inspection) {
      toast.error('Please start the inspection first');
      return;
    }

    setSubmitting(true);
    try {
      await inspectionAPI.submit(inspection._id, formData);
      toast.success('Inspection submitted successfully');
      fetchBatchAndInspection();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueCredential = async () => {
    setIssuing(true);
    try {
      await credentialAPI.issue(batchId);
      toast.success('Certificate issued successfully!');
      navigate('/dashboard/credentials');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue certificate');
    } finally {
      setIssuing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Batch not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Quality Inspection</h1>
          <p className="text-gray-600">Batch: {batch.batchId}</p>
        </div>
        {batch.status === 'inspection_complete' && (
          <button
            onClick={handleIssueCredential}
            disabled={issuing}
            className="btn btn-success flex items-center gap-2"
          >
            {issuing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <FiAward /> Issue Certificate
              </>
            )}
          </button>
        )}
      </div>

      {/* Batch Info Card */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Batch Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <FiPackage className="w-5 h-5 text-primary-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Product</p>
              <p className="font-medium">{batch.product?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{batch.product?.category} • {batch.product?.quantity?.value} {batch.product?.quantity?.unit}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiMapPin className="w-5 h-5 text-primary-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Origin</p>
              <p className="font-medium">{batch.origin?.state}, {batch.origin?.country}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiUser className="w-5 h-5 text-primary-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Exporter</p>
              <p className="font-medium">{batch.exporter?.name}</p>
              <p className="text-sm text-gray-500">{batch.exporter?.organization}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Start Inspection Button */}
      {batch.status === 'submitted' && !inspection && (
        <div className="card text-center py-8 mb-6">
          <FiClipboard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Ready to Inspect</h3>
          <p className="text-gray-500 mb-4">Click below to start the quality inspection process</p>
          <button onClick={handleStartInspection} className="btn btn-primary">
            Start Inspection
          </button>
        </div>
      )}

      {/* Inspection Form */}
      {(inspection || batch.status === 'under_inspection') && (
        <div className="space-y-6">
          {/* Quality Parameters */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quality Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Moisture Content (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.qualityParameters.moisture.value}
                    onChange={(e) => handleNestedChange('qualityParameters', 'moisture', 'value', e.target.value)}
                    className="input flex-1"
                    placeholder="e.g., 12.5"
                  />
                  <select
                    value={formData.qualityParameters.moisture.acceptable}
                    onChange={(e) => handleNestedChange('qualityParameters', 'moisture', 'acceptable', e.target.value === 'true')}
                    className="input w-32"
                  >
                    <option value="true">Pass</option>
                    <option value="false">Fail</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Foreign Matter (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.qualityParameters.foreignMatter.value}
                    onChange={(e) => handleNestedChange('qualityParameters', 'foreignMatter', 'value', e.target.value)}
                    className="input flex-1"
                    placeholder="e.g., 0.5"
                  />
                  <select
                    value={formData.qualityParameters.foreignMatter.acceptable}
                    onChange={(e) => handleNestedChange('qualityParameters', 'foreignMatter', 'acceptable', e.target.value === 'true')}
                    className="input w-32"
                  >
                    <option value="true">Pass</option>
                    <option value="false">Fail</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Aflatoxin Level (ppb)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.qualityParameters.aflatoxin.value}
                    onChange={(e) => handleNestedChange('qualityParameters', 'aflatoxin', 'value', e.target.value)}
                    className="input flex-1"
                    placeholder="e.g., 5"
                  />
                  <select
                    value={formData.qualityParameters.aflatoxin.acceptable}
                    onChange={(e) => handleNestedChange('qualityParameters', 'aflatoxin', 'acceptable', e.target.value === 'true')}
                    className="input w-32"
                  >
                    <option value="true">Pass</option>
                    <option value="false">Fail</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Grade</label>
                <select
                  value={formData.qualityParameters.grade}
                  onChange={(e) => handleChange('qualityParameters', 'grade', e.target.value)}
                  className="input"
                >
                  <option value="A">Grade A (Premium)</option>
                  <option value="B">Grade B (Standard)</option>
                  <option value="C">Grade C (Economy)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pesticide"
                  checked={formData.qualityParameters.pesticideResidue.detected}
                  onChange={(e) => handleNestedChange('qualityParameters', 'pesticideResidue', 'detected', e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <label htmlFor="pesticide" className="text-sm">Pesticide Residue Detected</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="organic"
                  checked={formData.qualityParameters.organicCertified}
                  onChange={(e) => handleChange('qualityParameters', 'organicCertified', e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <label htmlFor="organic" className="text-sm">Organic Certified</label>
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Compliance Standards</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'fssaiCompliant', label: 'FSSAI Compliant' },
                { key: 'exportStandards', label: 'Export Standards' },
                { key: 'destinationCountryStandards', label: 'Destination Standards' },
                { key: 'isoCompliant', label: 'ISO Compliant' },
              ].map(item => (
                <div key={item.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={formData.compliance[item.key]}
                    onChange={(e) => handleChange('compliance', item.key, e.target.checked)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <label htmlFor={item.key} className="text-sm">{item.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Result */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Final Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Overall Result</label>
                <select
                  value={formData.overallResult}
                  onChange={(e) => handleChange(null, 'overallResult', e.target.value)}
                  className="input"
                >
                  <option value="pending">Pending</option>
                  <option value="pass">Pass</option>
                  <option value="conditional_pass">Conditional Pass</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
              <div>
                <label className="label">Recommendations</label>
                <input
                  type="text"
                  value={formData.recommendations}
                  onChange={(e) => handleChange(null, 'recommendations', e.target.value)}
                  className="input"
                  placeholder="Any recommendations..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Inspector Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleChange(null, 'remarks', e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="Detailed inspection remarks..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSubmitInspection}
              disabled={submitting}
              className="btn btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <FiSave /> Submit Inspection
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionForm;