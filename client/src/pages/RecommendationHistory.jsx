import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function RecommendationHistory() {
  const [filter, setFilter] = useState('all'); // 'all' | 'crop' | 'fertilizer' | 'disease' | 'chat'

  const [records, setRecords] = useState([
    {
      id: 1,
      type: 'crop',
      title: 'Rice (Paddy) Advisory',
      details: 'Alluvial Soil • Kharif Season • High Rainfall (180mm)',
      date: 'Today at 1:15 PM',
      icon: Sprout,
      color: 'agri'
    },
    {
      id: 2,
      type: 'fertilizer',
      title: 'Urea + DAP Nutrient Schedule',
      details: 'Cotton • 2 Acres • Moderate Nitrogen Deficit',
      date: 'Yesterday at 4:30 PM',
      icon: FlaskConical,
      color: 'amber'
    },
    {
      id: 3,
      type: 'disease',
      title: 'Tomato Early Blight Diagnosis',
      details: 'Confidence: 91% • Copper Fungicide Recommended',
      date: 'Nov 3, 2026',
      icon: ScanSearch,
      color: 'danger'
    },
    {
      id: 4,
      type: 'chat',
      title: 'Consultation: Black Soil Crop Suitability',
      details: 'Answered via English & Telugu assistant',
      date: 'Nov 2, 2026',
      icon: Bot,
      color: 'info'
    }
  ]);

  const handleDelete = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredRecords = filter === 'all' 
    ? records 
    : records.filter((r) => r.type === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase">
              Module 08
            </span>
            <span className="text-xs text-slate-400 font-medium">Farmer Records & Auditing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Recommendation History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review past agronomic predictions, disease detections, and conversational consultations
          </p>
        </div>

        <Badge variant="neutral">
          {records.length} Saved Records
        </Badge>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        {[
          { key: 'all', label: 'All Records' },
          { key: 'crop', label: 'Crops' },
          { key: 'fertilizer', label: 'Fertilizer' },
          { key: 'disease', label: 'Diseases' },
          { key: 'chat', label: 'AI Consultations' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filter === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Records List */}
      <Card>
        {filteredRecords.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((record) => {
              const Icon = record.icon;
              return (
                <div
                  key={record.id}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {record.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{record.details}</p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{record.date}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            No records found for the selected filter category.
          </div>
        )}
      </Card>

    </div>
  );
}
