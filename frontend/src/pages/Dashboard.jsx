import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { batchAPI } from '../services/api';
import { 
  FiHome, FiPackage, FiClipboard, FiAward, FiSettings, 
  FiLogOut, FiMenu, FiX, FiBox, FiPlus, FiBell
} from 'react-icons/fi';

// Import Dashboard Components
import ExporterDashboard from '../components/exporter/ExporterDashboard';
import BatchForm from '../components/exporter/BatchForm';
import BatchList from '../components/exporter/BatchList';
import QADashboard from '../components/qa/QADashboard';
import PendingInspections from '../components/qa/PendingInspections';
import InspectionForm from '../components/qa/InspectionForm';

const Dashboard = () => {
  const { user, logout, isExporter, isQA, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await batchAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items based on role
  const getNavItems = () => {
    const common = [
      { path: '/dashboard', icon: FiHome, label: 'Overview', exact: true },
    ];

    if (isExporter) {
      return [
        ...common,
        { path: '/dashboard/batches', icon: FiPackage, label: 'My Batches' },
        { path: '/dashboard/batches/new', icon: FiPlus, label: 'New Batch' },
        { path: '/dashboard/credentials', icon: FiAward, label: 'Certificates' },
      ];
    }

    if (isQA) {
      return [
        ...common,
        { path: '/dashboard/inspections', icon: FiClipboard, label: 'Inspections' },
        { path: '/dashboard/pending', icon: FiPackage, label: 'Pending' },
        { path: '/dashboard/credentials', icon: FiAward, label: 'Issued Certs' },
      ];
    }

    if (isAdmin) {
      return [
        ...common,
        { path: '/dashboard/batches', icon: FiPackage, label: 'All Batches' },
        { path: '/dashboard/inspections', icon: FiClipboard, label: 'Inspections' },
        { path: '/dashboard/credentials', icon: FiAward, label: 'Certificates' },
        { path: '/dashboard/settings', icon: FiSettings, label: 'Settings' },
      ];
    }

    return common;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <FiBox className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">CertiFarm</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700 font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Guest'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:flex-none">
            <h1 className="text-lg font-semibold text-gray-900 lg:hidden">CertiFarm</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link 
              to="/verify" 
              className="hidden sm:inline-flex px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium text-sm"
            >
              Verify Certificate
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Routes>
            <Route index element={
              isExporter ? <ExporterDashboard stats={stats} /> :
              isQA ? <QADashboard stats={stats} /> :
              <ExporterDashboard stats={stats} />
            } />
            <Route path="batches" element={<BatchList />} />
            <Route path="batches/new" element={<BatchForm />} />
            <Route path="batches/:id" element={<BatchForm />} />
            <Route path="inspections" element={<PendingInspections />} />
            <Route path="pending" element={<PendingInspections />} />
            <Route path="inspect/:batchId" element={<InspectionForm />} />
            <Route path="credentials" element={<BatchList showCredentials />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;