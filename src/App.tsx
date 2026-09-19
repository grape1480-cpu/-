import React, { useState, useEffect } from 'react';
import { UserProfile, FitnessRecord } from './types';
import { INITIAL_PROFILES, INITIAL_RECORDS } from './data/sampleData';
import { analyzeTrends } from './utils/fitnessEvaluator';
import { exportFitnessToExcel } from './utils/excelExporter';
import { Header } from './components/Header';
import { TrendAnalysisView } from './components/TrendAnalysisView';
import { TestHistoryTable } from './components/TestHistoryTable';
import { TestFormModal } from './components/TestFormModal';
import { ProfileModal } from './components/ProfileModal';
import { StopwatchModal } from './components/StopwatchModal';
import { ExportReportModal } from './components/ExportReportModal';
import { Plus, Activity, HelpCircle, BookOpen } from 'lucide-react';
import { TEST_DEFINITIONS, TEST_KEYS } from './data/standards';

const STORAGE_PROFILES_KEY = 'fittrack_profiles_v1';
const STORAGE_RECORDS_KEY = 'fittrack_records_v1';
const STORAGE_ACTIVE_PROFILE_KEY = 'fittrack_active_profile_v1';

export default function App() {
  // Profiles state with localStorage
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PROFILES;
  });

  // Active profile ID
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_PROFILE_KEY);
      if (saved && profiles.some((p) => p.id === saved)) return saved;
    } catch {
      // ignore
    }
    return profiles[0]?.id || 'user_1';
  });

  // Records state with localStorage
  const [records, setRecords] = useState<FitnessRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECORDS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_RECORDS;
  });

  // UI state
  const [activeView, setActiveView] = useState<'trends' | 'history'>('trends');
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<FitnessRecord | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isStopwatchModalOpen, setIsStopwatchModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [showStandardsModal, setShowStandardsModal] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
    } catch {
      // ignore
    }
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_PROFILE_KEY, activeProfileId);
    } catch {
      // ignore
    }
  }, [activeProfileId]);

  // Current active profile
  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0] || INITIAL_PROFILES[0];

  // Records for current active profile
  const userRecords = records.filter((r) => r.profileId === activeProfile.id);

  // Trend analysis report
  const trendReport = analyzeTrends(userRecords, activeProfile);

  // Save / Update Record
  const handleSaveRecord = (recordData: Omit<FitnessRecord, 'id'>, editId?: string) => {
    if (editId) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editId ? { ...recordData, id: editId } : r))
      );
    } else {
      const newRecord: FitnessRecord = {
        ...recordData,
        id: `rec_${Date.now()}`,
      };
      setRecords((prev) => [...prev, newRecord]);
    }
    setEditingRecord(null);
  };

  // Delete Record
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Profile management
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === newProfile.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newProfile;
        return next;
      }
      return [...prev, newProfile];
    });
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setRecords((prev) => prev.filter((r) => r.profileId !== id));
    if (activeProfileId === id) {
      const remaining = profiles.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setActiveProfileId(remaining[0].id);
      }
    }
  };

  // Reset to default initial data
  const handleResetSampleData = () => {
    setProfiles(INITIAL_PROFILES);
    setRecords(INITIAL_RECORDS);
    setActiveProfileId(INITIAL_PROFILES[0].id);
  };

  // Import JSON data
  const handleImportData = (
    importedRecords: FitnessRecord[],
    importedProfiles: UserProfile[]
  ) => {
    setProfiles(importedProfiles);
    setRecords(importedRecords);
    if (importedProfiles.length > 0) {
      setActiveProfileId(importedProfiles[0].id);
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    exportFitnessToExcel(activeProfile, userRecords, trendReport);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* App Header */}
      <Header
        activeProfile={activeProfile}
        profiles={profiles}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenNewTestModal={() => {
          setEditingRecord(null);
          setIsTestModalOpen(true);
        }}
        onOpenStopwatchModal={() => setIsStopwatchModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onExportExcel={handleExportExcel}
        onResetSampleData={handleResetSampleData}
        activeView={activeView}
        onViewChange={setActiveView}
        recordsCount={userRecords.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {userRecords.length === 0 ? (
          /* Empty state for newly created profile */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center max-w-md mx-auto my-12 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              ยังไม่มีข้อมูลผลการทดสอบของ {activeProfile.name}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              เริ่มบันทึกผลการทดสอบสมรรถภาพทางกาย 5 แบบทดสอบ (ลุกนั่ง, ดันพื้น, กระโดดสูง, ความอ่อนตัว, วิ่งเก็บของ)
              เพื่อวิเคราะห์ระดับความฟิตและแนวโน้มอัตโนมัติ
            </p>
            <button
              id="empty-state-add-btn"
              type="button"
              onClick={() => {
                setEditingRecord(null);
                setIsTestModalOpen(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              บันทึกผลการทดสอบครั้งแรก
            </button>
          </div>
        ) : activeView === 'trends' && trendReport ? (
          /* Trend Analysis View */
          <TrendAnalysisView
            report={trendReport}
            records={userRecords}
            profile={activeProfile}
            onOpenNewTestModal={() => {
              setEditingRecord(null);
              setIsTestModalOpen(true);
            }}
            onExportExcel={handleExportExcel}
          />
        ) : (
          /* Full Test Records History Table View */
          <TestHistoryTable
            records={userRecords}
            profile={activeProfile}
            onAddNew={() => {
              setEditingRecord(null);
              setIsTestModalOpen(true);
            }}
            onEdit={(record) => {
              setEditingRecord(record);
              setIsTestModalOpen(true);
            }}
            onDelete={handleDeleteRecord}
            onExportExcel={handleExportExcel}
          />
        )}
      </main>

      {/* Footer & Reference button */}
      <footer className="border-t border-slate-200 bg-white/70 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>เกณฑ์ประเมินอ้างอิง: สำนักวิทยาศาสตร์การกีฬา กรมพลศึกษา กระทรวงการท่องเที่ยวและกีฬา</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowStandardsModal(true)}
              className="text-teal-700 hover:underline flex items-center gap-1 font-medium"
            >
              <BookOpen className="w-3.5 h-3.5" />
              คู่มือและเกณฑ์ 5 แบบทดสอบ
            </button>
            <span>•</span>
            <span>FitTrack Physical Fitness Evaluation</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TestFormModal
        isOpen={isTestModalOpen}
        onClose={() => {
          setIsTestModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        profile={activeProfile}
        editingRecord={editingRecord}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={(id) => {
          setActiveProfileId(id);
          setIsProfileModalOpen(false);
        }}
        onSaveProfile={handleSaveProfile}
        onDeleteProfile={handleDeleteProfile}
      />

      <StopwatchModal
        isOpen={isStopwatchModalOpen}
        onClose={() => setIsStopwatchModalOpen(false)}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={trendReport}
        records={userRecords}
        profile={activeProfile}
        onImportData={handleImportData}
        allProfiles={profiles}
        allRecords={records}
      />

      {/* Standards & Guide Modal */}
      {showStandardsModal && (
        <div
          id="standards-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  คู่มือและคำอธิบาย 5 แบบทดสอบสมรรถภาพทางกาย
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStandardsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              {TEST_KEYS.map((k, i) => {
                const def = TEST_DEFINITIONS[k];
                return (
                  <div key={k} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {i + 1}. {def.nameTh} ({def.nameEn})
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-semibold text-[11px]">
                        หน่วย: {def.unit} {def.higherIsBetter ? '(ยิ่งมากยิ่งดี)' : '(ยิ่งน้อยยิ่งดี)'}
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium">{def.categoryTh}</p>
                    <p className="text-slate-700">{def.descriptionTh}</p>
                    <p className="text-teal-800 font-medium">คำแนะนำฟอร์มการฝึก: {def.tipsTh}</p>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-slate-100 text-right bg-slate-50">
              <button
                type="button"
                onClick={() => setShowStandardsModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
