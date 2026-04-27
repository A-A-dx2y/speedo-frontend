import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Upload, Gauge, LogOut, AlertTriangle, Loader2, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../store/index.js';
import { logout } from '../store/slices/authSlice.js';
import { authService } from '../services/auth.service.js';
import { tripService } from '../services/trip.service.js';
import type { TripResponse } from '../types/trip.types.js';
import { showSuccess, handleApiError } from '../utils/toast.js';
import Button from '../components/ui/Button.js';
import Modal from '../components/ui/Modal.js';
import ThemeToggle from '../components/ui/ThemeToggle.js';

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<TripResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTrips = async () => {
    try {
      setIsLoadingTrips(true);
      const res = await tripService.getAllTrips();
      if (res.success) {
        // Sort trips by newest first
        const sortedTrips = res.data.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        setTrips(sortedTrips);
      }
    } catch (error) {
      handleApiError(error, "Failed to load trips");
    } finally {
      setIsLoadingTrips(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      handleApiError(new Error("Only CSV files are supported"), "Upload failed");
      event.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      await tripService.uploadTrip(file);
      showSuccess("Trip uploaded and processed successfully!");
      fetchTrips(); // Refresh the list automatically
    } catch (error) {
      handleApiError(error, "Failed to upload trip");
    } finally {
      setIsUploading(false);
      event.target.value = ''; 
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      dispatch(logout()); 
      showSuccess('Logged out successfully');
      navigate('/login');
    } catch (error) {
      handleApiError(error, 'Logout failed');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;

    try {
      setIsDeleting(true);
      await tripService.deleteTrip(tripToDelete.id);
      showSuccess(`Trip "${tripToDelete.name}" deleted successfully`);
      fetchTrips();
    } catch (error) {
      handleApiError(error, "Failed to delete trip");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setTripToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black text-slate-900 dark:text-white flex flex-col font-sans selection:bg-blue-500/30 transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="w-full h-16 bg-white/90 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 sm:px-8 fixed top-0 z-50 transition-colors">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-blue-600 dark:text-blue-500">
            <Gauge size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic bg-linear-to-r from-slate-900 to-slate-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Speedo
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <Button 
            variant="primary" 
            className="bg-red-600 hover:bg-red-700 border-none px-4 sm:px-5 py-1 h-auto text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 text-white"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <LogOut size={14} className="sm:w-4 sm:h-4" />
          </Button>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)}
        title="SYSTEM SIGN-OUT"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/20">
            <div className="text-red-600 dark:text-red-500 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-900 dark:text-white/90">Confirm Logout</p>
              <p className="text-[9px] uppercase font-bold text-slate-500 dark:text-gray-500 mt-0.5">Are you sure you want to end your session?</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline"
              className="w-full sm:flex-1 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] uppercase tracking-widest h-11 sm:h-10 font-bold text-slate-900 dark:text-white"
              onClick={() => setIsLogoutModalOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none text-[10px] uppercase tracking-widest h-11 sm:h-10 font-bold"
              onClick={handleLogout}
              isLoading={isLoggingOut}
            >
              Logout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="DELETE TRIP DATA"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/20">
            <div className="text-red-600 dark:text-red-500 shrink-0 ">
              <Trash2 size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-900 dark:text-white/90">Confirm Deletion</p>
              <p className="text-[9px] uppercase font-bold text-slate-500 dark:text-gray-500 mt-0.5">
                Permanently delete trip "{tripToDelete?.name}"? This cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline"
              className="w-full sm:flex-1 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] uppercase tracking-widest h-11 sm:h-10 font-bold text-slate-900 dark:text-white"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none text-[10px] uppercase tracking-widest h-11 sm:h-10 font-bold"
              onClick={handleDeleteTrip}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Main Content */}
      <main className="flex-1 mt-16 flex flex-col items-center justify-start pt-12 sm:pt-16 px-4 pb-20 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-10">
          
          {/* Welcome Header */}
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic leading-tight text-slate-900 dark:text-white">
              Welcome <span className="text-blue-600 dark:text-blue-500 break-all">{user?.name || 'User'}</span>
            </h1>
            <p className="text-slate-500 dark:text-gray-500 text-xs sm:text-sm max-w-lg font-bold mx-auto sm:mx-0 uppercase tracking-wide">
              Enterprise-grade GPS trip analysis and vehicle tracking.
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/5 rounded-2xl p-5 sm:p-8 relative overflow-hidden group transition-colors shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="mb-6 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">Upload Trip Data</h2>
                <p className="text-slate-500 dark:text-gray-500 text-[10px] sm:text-xs mt-1 font-bold">Select a CSV file containing GPS coordinates.</p>
              </div>

              <div className="relative">
                <label className={`flex flex-col items-center justify-center w-full h-44 sm:h-52 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl cursor-pointer bg-slate-50 dark:bg-[#0a0a0a] transition-all duration-500 group/upload ${isUploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-slate-100 dark:hover:bg-[#0c0c0c] hover:border-blue-500/50 dark:hover:border-white/20'}`}>
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    <div className="text-slate-400 dark:text-white group-hover/upload:scale-110 group-hover/upload:text-blue-600 transition-transform duration-500 mb-4">
                      {isUploading ? (
                        <Loader2 size={40} className="sm:w-12 sm:h-12 animate-spin text-blue-600" strokeWidth={1.5} />
                      ) : (
                        <Upload size={40} className="sm:w-12 sm:h-12" strokeWidth={1.5} />
                      )}
                    </div>
                    <p className="mb-1 text-[10px] sm:text-xs text-slate-900 dark:text-white font-black uppercase tracking-[0.2em]">
                      {isUploading ? 'Processing Trip Data...' : 'Drag & Drop Files'}
                    </p>
                    <p className="text-[8px] sm:text-[10px] text-slate-500 dark:text-gray-600 uppercase tracking-widest font-black mt-1">
                      {isUploading ? 'Calculating speed and distances' : 'CSV Format Required'}
                    </p>
                  </div>
                  <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>
            </div>
          </div>

          {/* Trips List */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Your Trips</h2>
            
            {isLoadingTrips ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 size={24} className="animate-spin text-blue-600" />
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                <p className="text-xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-600">No trips uploaded yet.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 overflow-hidden">
                {trips.map((trip) => (
                  <div 
                    key={trip.id}
                    className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-[#111] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/trip/${trip.id}`)}
                  >
                    <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 pl-2">
                      {trip.name}
                    </span>
                    
                    <div className="flex items-center gap-6 pr-2 text-slate-400 dark:text-slate-500">
                      <button 
                        className="hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setTripToDelete(trip);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                      <div className="text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                        <ChevronRight size={18} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
