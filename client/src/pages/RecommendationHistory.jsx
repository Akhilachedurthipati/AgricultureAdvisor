import React, { useState, useEffect } from 'react';
import { 
  History, 
  Sprout, 
  FlaskConical, 
  ScanSearch, 
  Bot, 
  Trash2, 
  Eye, 
  Calendar, 
  Filter, 
  Search, 
  RefreshCw, 
  X, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
import { useTranslation } from 'react-i18next';
import { 
  fetchUnifiedHistory, 
  fetchHistoryItemDetails, 
  deleteHistoryItem, 
  clearUnifiedHistory 
} from '../services/historyService';

// Target crops for filter dropdown
const FILTER_CROPS = [
  'All Crops',
  'Rice',
  'Cotton',
  'Groundnut',
  'Maize',
  'Tomato',
  'Chilli',
  'Potato',
  'Wheat',
  'Soybean'
];

export default function RecommendationHistory() {
  const { t } = useTranslation();

  // State filters
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'crop' | 'fertilizer' | 'disease' | 'chat'
  const [searchInput, setSearchInput] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Data state
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal details state
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load records whenever filters or page changes
  useEffect(() => {
    loadHistoryData();
  }, [activeTab, selectedCrop, startDate, endDate, currentPage]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistoryData();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadHistoryData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetchUnifiedHistory({
        module: activeTab,
        search: searchInput.trim(),
        crop: selectedCrop === 'All Crops' ? '' : selectedCrop,
        startDate,
        endDate,
        page: currentPage,
        limit: pageSize
      });

      if (res.success) {
        setRecords(res.data || []);
        setTotalCount(res.count || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to retrieve agricultural history.');
    } finally {
      setLoading(false);
    }
  };

  // Open full detail modal
  const handleOpenDetailModal = async (record) => {
    setLoadingModal(true);
    try {
      const details = await fetchHistoryItemDetails(record.module, record.id);
      setActiveModalItem(details.data || record);
    } catch {
      setActiveModalItem(record); // Fallback to list record
    } finally {
      setLoadingModal(false);
    }
  };

  // Delete single record
  const handleDeleteRecord = async (record, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this ${record.resultType || 'record'}?`)) {
      try {
        await deleteHistoryItem(record.module, record.id);
        setActionSuccess('Record deleted successfully.');
        setTimeout(() => setActionSuccess(null), 3500);
        loadHistoryData();
        if (activeModalItem && activeModalItem.id === record.id) {
          setActiveModalItem(null);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to delete record.');
      }
    }
  };

  // Clear history
  const handleConfirmClear = async () => {
    try {
      await clearUnifiedHistory(activeTab);
      setShowClearConfirm(false);
      setActionSuccess(`History cleared successfully for ${activeTab === 'all' ? 'all modules' : activeTab}.`);
      setTimeout(() => setActionSuccess(null), 3500);
      setCurrentPage(1);
      loadHistoryData();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to clear history.');
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveTab('all');
    setSearchInput('');
    setSelectedCrop('All Crops');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Print current active modal record
  const handlePrint = () => {
    window.print();
  };

  // Render module icon helper
  const renderModuleIcon = (module, size = 'w-5 h-5') => {
    switch (module) {
      case 'crop':
        return <Sprout className={`${size} text-emerald-600`} />;
      case 'fertilizer':
        return <FlaskConical className={`${size} text-amber-600`} />;
      case 'disease':
        return <ScanSearch className={`${size} text-rose-600`} />;
      case 'chat':
        return <Bot className={`${size} text-purple-600`} />;
      default:
        return <History className={`${size} text-slate-600`} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase">
              {t('common.module', 'Module 08')}
            </span>
            <span className="text-xs text-slate-400 font-medium">Auditing, Analytics & Farmer Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Recommendation & Advisory History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Comprehensive archive of machine learning crop predictions, fertilizer schedules, disease scans, and AI assistant consultations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral">
            {totalCount} Total Saved Records
          </Badge>

          {records.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear {activeTab === 'all' ? 'All' : activeTab.toUpperCase()}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <AlertBanner
          variant="success"
          title="Operation Succeeded"
          message={actionSuccess}
        />
      )}
      {errorMessage && (
        <AlertBanner
          variant="danger"
          title="History Service Notice"
          message={errorMessage}
        />
      )}

      {/* Module Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl w-fit border border-slate-200/60">
        {[
          { key: 'all', label: 'All Records', countLabel: '' },
          { key: 'crop', label: 'Crop Advisory', icon: Sprout },
          { key: 'fertilizer', label: 'Fertilizer Plans', icon: FlaskConical },
          { key: 'disease', label: 'Disease Scans', icon: ScanSearch },
          { key: 'chat', label: 'AI Consultations', icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-agri-600' : 'text-slate-400'}`} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Keyword Search */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by crop, disease, nutrient, or question..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agri-500/20 focus:border-agri-500 text-xs sm:text-sm text-slate-800 transition"
            />
          </div>

          {/* Crop Selector */}
          <div className="lg:col-span-3">
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-agri-500"
            >
              {FILTER_CROPS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date Range Start & End */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 focus:outline-none focus:border-agri-500"
              title="Filter from start date"
            />
            <span className="text-xs text-slate-400 font-bold">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 focus:outline-none focus:border-agri-500"
              title="Filter to end date"
            />
          </div>

          {/* Reset Action */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition text-xs shadow-xs"
              title="Reset all filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </Card>

      {/* Main Records List Card */}
      <Card>
        {loading ? (
          /* Loading Skeleton */
          <div className="divide-y divide-slate-100 p-2 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="py-4 flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100" />
                  <div className="space-y-1.5">
                    <div className="h-4 bg-slate-100 rounded w-48" />
                    <div className="h-3 bg-slate-100 rounded w-64" />
                  </div>
                </div>
                <div className="h-8 bg-slate-100 rounded-xl w-24" />
              </div>
            ))}
          </div>
        ) : records.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {records.map((record) => (
              <div
                key={record.id}
                onClick={() => handleOpenDetailModal(record)}
                className="py-4 px-3 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-2xl transition cursor-pointer group"
              >
                {/* Left side details */}
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    record.module === 'crop' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : record.module === 'fertilizer'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : record.module === 'disease'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}>
                    {renderModuleIcon(record.module, 'w-5 h-5')}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-agri-700 transition">
                        {record.title}
                      </h4>
                      <Badge variant={record.badgeColor || 'neutral'}>
                        {record.resultType}
                      </Badge>
                      {record.crop && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {record.crop}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{record.summary}</p>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetailModal(record);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold shadow-xs transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteRecord(record, e)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <History className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">No Agricultural Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchInput || selectedCrop !== 'All Crops' || startDate || endDate
                ? 'No past advisories match your active search filters. Try resetting the filters to view all records.'
                : 'You have not saved any advisory queries yet. Try using Crop Recommendation, Fertilizer Calculation, or Disease Screening.'}
            </p>
            {(searchInput || selectedCrop !== 'All Crops' || startDate || endDate) && (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination Bar */}
        {totalCount > 0 && (
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Record Full Details Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                  activeModalItem.module === 'crop' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : activeModalItem.module === 'fertilizer'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : activeModalItem.module === 'disease'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {renderModuleIcon(activeModalItem.module, 'w-5 h-5')}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">
                    {activeModalItem.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Timestamp: {new Date(activeModalItem.date).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                  title="Print Advisory Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Module-Specific Renderings */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              
              {/* Crop Recommendation Details */}
              {activeModalItem.module === 'crop' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block">
                        Optimal Agricultural Prediction:
                      </span>
                      <h4 className="text-xl font-black text-emerald-950 mt-0.5">
                        {activeModalItem.crop}
                      </h4>
                    </div>
                    <Badge variant={activeModalItem.details?.recommendation?.isConfident === false ? "warning" : "success"}>
                      {activeModalItem.details?.recommendation?.confidenceScore != null
                        ? (activeModalItem.details.recommendation.confidenceScore <= 1.0
                            ? Math.round(activeModalItem.details.recommendation.confidenceScore * 100)
                            : Math.round(activeModalItem.details.recommendation.confidenceScore))
                        : 98}% Confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Soil Type:</span>
                      <span className="font-semibold">{activeModalItem.details?.inputs?.soilType || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Season:</span>
                      <span className="font-semibold">{activeModalItem.details?.inputs?.season || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Rainfall:</span>
                      <span className="font-semibold">{activeModalItem.details?.inputs?.rainfall} mm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Temperature:</span>
                      <span className="font-semibold">{activeModalItem.details?.inputs?.temperature}°C</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Humidity:</span>
                      <span className="font-semibold">{activeModalItem.details?.inputs?.humidity}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Soil pH:</span>
                      <span className="font-semibold">{activeModalItem.details?.inputs?.ph}</span>
                    </div>
                  </div>

                  {activeModalItem.details?.recommendation?.uncertaintyWarning && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      <span className="font-bold block">Advisory Uncertainty Notice:</span>
                      <p className="mt-0.5 text-amber-800">{activeModalItem.details.recommendation.uncertaintyWarning}</p>
                    </div>
                  )}

                  {activeModalItem.details?.recommendation?.suitabilityExplanation && (
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1">Agronomic Suitability:</h5>
                      <p className="leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                        {activeModalItem.details.recommendation.suitabilityExplanation}
                      </p>
                    </div>
                  )}

                  {activeModalItem.details?.recommendation?.cultivationTips && (
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1">Cultivation Guidelines:</h5>
                      <p className="leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                        {activeModalItem.details.recommendation.cultivationTips}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Fertilizer Recommendation Details */}
              {activeModalItem.module === 'fertilizer' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide block">
                      Target Crop & Area:
                    </span>
                    <h4 className="text-lg font-black text-amber-950 mt-0.5">
                      {activeModalItem.details?.inputs?.crop} ({activeModalItem.details?.inputs?.landArea} {activeModalItem.details?.inputs?.landAreaUnit || 'Acres'})
                    </h4>
                    <p className="font-semibold text-amber-900 mt-1">
                      {activeModalItem.details?.recommendation?.fertilizerCombination}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Soil N:</span>
                      <span className="font-bold text-slate-800">{activeModalItem.details?.inputs?.nitrogen} kg/ha</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Soil P:</span>
                      <span className="font-bold text-slate-800">{activeModalItem.details?.inputs?.phosphorus} kg/ha</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Soil K:</span>
                      <span className="font-bold text-slate-800">{activeModalItem.details?.inputs?.potassium} kg/ha</span>
                    </div>
                  </div>

                  {activeModalItem.details?.recommendation?.applicationGuidance && (
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1">Application Schedule:</h5>
                      <p className="leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                        {activeModalItem.details.recommendation.applicationGuidance}
                      </p>
                    </div>
                  )}

                  {activeModalItem.details?.recommendation?.safetyPrecautions?.length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1">Handling Precautions:</h5>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        {activeModalItem.details.recommendation.safetyPrecautions.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Disease Detection Details */}
              {activeModalItem.module === 'disease' && (
                <div className="space-y-4">
                  {/* Image Preview if available */}
                  {activeModalItem.details?.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-56 flex items-center justify-center">
                      <img 
                        src={activeModalItem.details.imageUrl} 
                        alt="Leaf specimen scan" 
                        className="max-h-56 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl border ${
                    activeModalItem.details?.detection?.isHealthy
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      Screening Diagnostic Result:
                    </span>
                    <h4 className="text-lg font-black mt-0.5">
                      {activeModalItem.details?.detection?.diseaseName || activeModalItem.title}
                    </h4>
                    {activeModalItem.details?.detection?.scientificName && (
                      <p className="text-[11px] italic opacity-80 mt-0.5">
                        Pathogen: {activeModalItem.details.detection.scientificName}
                      </p>
                    )}
                  </div>

                  {activeModalItem.details?.detection?.symptoms?.length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1">Field Symptoms:</h5>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        {activeModalItem.details.detection.symptoms.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeModalItem.details?.detection?.treatment?.length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1">Recommended Treatment:</h5>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        {activeModalItem.details.detection.treatment.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Consultation Details */}
              {activeModalItem.module === 'chat' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide block">
                      Farmer Inquiry:
                    </span>
                    <p className="font-semibold text-slate-900 text-xs">
                      "{activeModalItem.details?.message}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                      AI Assistant Advisory Response:
                    </span>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 leading-relaxed font-medium text-slate-800 whitespace-pre-line">
                      {activeModalItem.details?.response}
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
                {activeModalItem.details?.disclaimer || 'Advisory Notice: Generated by Agriculture Advisor decision support. Consult your certified agricultural extension officer before taking critical financial or chemical action.'}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Record ID: {activeModalItem.id}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalItem(null)}
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900">
                Clear {activeTab === 'all' ? 'All History' : `${activeTab.toUpperCase()} Records`}?
              </h3>
              <p className="text-xs text-slate-500">
                This will permanently delete all {activeTab === 'all' ? 'agricultural history records' : `${activeTab} records`} for your farmer account. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleConfirmClear}
              >
                Yes, Clear
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
