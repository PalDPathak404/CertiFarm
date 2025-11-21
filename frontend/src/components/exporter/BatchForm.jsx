import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { batchAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPackage, FiMapPin, FiGlobe, FiSave, FiArrowLeft } from 'react-icons/fi';

const BatchForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product: {
      name: '',
      category: 'rice',
      variety: '',
      quantity: { value: '', unit: 'kg' },
      harvestDate: '',
      packagingDate: '',
    },
    origin: {
      farmLocation: '',
      district: '',
      state: '',
      country: 'India',
    },
    destination: {
      country: '',
      port: '',
      importerName: '',
      importerContact: '',
    },
    notes: '',
    priority: 'normal',
  });

  const categories = [
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'spices', label: 'Spices' },
    { value: 'pulses', label: 'Pulses' },
    { value: 'oilseeds', label: 'Oilseeds' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'tea', label: 'Tea' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'other', label: 'Other' },
  ];

  const indianStates = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 
    'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 
    'West Bengal', 'Other'
  ];

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

  const handleQuantityChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        quantity: {
          ...prev.product.quantity,
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.product.name || !formData.product.quantity.value) {
      toast.error('Please fill in product name and quantity');
      return;
    }
    if (!formData.destination.country) {
      toast.error('Please specify destination country');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        product: {
          ...formData.product,
          quantity: {
            value: Number(formData.product.quantity.value),
            unit: formData.product.quantity.unit
          }
        }
      };

      await batchAPI.create(submitData);
      toast.success('Batch submitted successfully!');
      navigate('/dashboard/batches');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit New Batch</h1>
          <p className="text-gray-600">Submit a product batch for quality inspection</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Information */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiPackage className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Product Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name *</label>
              <input
                type="text"
                value={formData.product.name}
                onChange={(e) => handleChange('product', 'name', e.target.value)}
                className="input"
                placeholder="e.g., Basmati Rice Premium"
                required
              />
            </div>
            <div>
              <label className="label">Category *</label>
              <select
                value={formData.product.category}
                onChange={(e) => handleChange('product', 'category', e.target.value)}
                className="input"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Variety</label>
              <input
                type="text"
                value={formData.product.variety}
                onChange={(e) => handleChange('product', 'variety', e.target.value)}
                className="input"
                placeholder="e.g., 1121 Sella"
              />
            </div>
            <div>
              <label className="label">Quantity *</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.product.quantity.value}
                  onChange={(e) => handleQuantityChange('value', e.target.value)}
                  className="input flex-1"
                  placeholder="1000"
                  min="1"
                  required
                />
                <select
                  value={formData.product.quantity.unit}
                  onChange={(e) => handleQuantityChange('unit', e.target.value)}
                  className="input w-28"
                >
                  <option value="kg">Kg</option>
                  <option value="tonnes">Tonnes</option>
                  <option value="quintals">Quintals</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Harvest Date</label>
              <input
                type="date"
                value={formData.product.harvestDate}
                onChange={(e) => handleChange('product', 'harvestDate', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Packaging Date</label>
              <input
                type="date"
                value={formData.product.packagingDate}
                onChange={(e) => handleChange('product', 'packagingDate', e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Origin Information */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiMapPin className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Origin Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Farm Location</label>
              <input
                type="text"
                value={formData.origin.farmLocation}
                onChange={(e) => handleChange('origin', 'farmLocation', e.target.value)}
                className="input"
                placeholder="Village/Town name"
              />
            </div>
            <div>
              <label className="label">District</label>
              <input
                type="text"
                value={formData.origin.district}
                onChange={(e) => handleChange('origin', 'district', e.target.value)}
                className="input"
                placeholder="District name"
              />
            </div>
            <div>
              <label className="label">State</label>
              <select
                value={formData.origin.state}
                onChange={(e) => handleChange('origin', 'state', e.target.value)}
                className="input"
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Country</label>
              <input
                type="text"
                value={formData.origin.country}
                onChange={(e) => handleChange('origin', 'country', e.target.value)}
                className="input"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Destination Information */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiGlobe className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Destination Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Destination Country *</label>
              <input
                type="text"
                value={formData.destination.country}
                onChange={(e) => handleChange('destination', 'country', e.target.value)}
                className="input"
                placeholder="e.g., UAE, USA, UK"
                required
              />
            </div>
            <div>
              <label className="label">Port of Entry</label>
              <input
                type="text"
                value={formData.destination.port}
                onChange={(e) => handleChange('destination', 'port', e.target.value)}
                className="input"
                placeholder="e.g., Dubai Port"
              />
            </div>
            <div>
              <label className="label">Importer Name</label>
              <input
                type="text"
                value={formData.destination.importerName}
                onChange={(e) => handleChange('destination', 'importerName', e.target.value)}
                className="input"
                placeholder="Importer company name"
              />
            </div>
            <div>
              <label className="label">Importer Contact</label>
              <input
                type="text"
                value={formData.destination.importerContact}
                onChange={(e) => handleChange('destination', 'importerContact', e.target.value)}
                className="input"
                placeholder="Email or phone"
              />
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange(null, 'priority', e.target.value)}
                className="input"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="express">Express</option>
              </select>
            </div>
            <div>
              <label className="label">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange(null, 'notes', e.target.value)}
                className="input"
                rows="2"
                placeholder="Any special instructions..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <FiSave /> Submit Batch
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BatchForm;