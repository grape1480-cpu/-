import React from 'react';
import {
  Activity,
  User,
  Plus,
  Timer,
  FileSpreadsheet,
  RotateCcw,
  TrendingUp,
  ListOrdered,
  ChevronDown,
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  activeProfile: UserProfile;
  profiles: UserProfile[];
  onOpenProfileModal: () => void;
  onOpenNewTestModal: () => void;
  onOpenStopwatchModal: () => void;
  onOpenExportModal: () => void;
  onExportExcel: () => void;
  onResetSampleData: () => void;
  activeView: 'trends' | 'history';
  onViewChange: (view: 'trends' | 'history') => void;
  recordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeProfile,
  onOpenProfileModal,
  onOpenNewTestModal,
  onOpenStopwatchModal,
  onOpenExportModal,
  onExportExcel,
  onResetSampleData,
  activeView,
  onViewChange,
  recordsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  ระบบบันทึกและวิเคราะห์สมรรถภาพทางกาย
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  5 แบบทดสอบมาตรฐาน
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ลุกนั่ง • ดันพื้น • กระโดดสูง • ความอ่อนตัว • วิ่งเก็บของ
              </p>
            </div>
          </div>

          {/* Profile Selector & Main Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Active Profile Pill */}
            <button
              id="header-profile-selector-btn"
              type="button"
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium transition-colors"
              title="สลับหรือจัดการผู้รับการทดสอบ"
            >
              <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                {activeProfile.name.charAt(0)}
              </div>
              <span className="font-semibold max-w-[130px] truncate">{activeProfile.name}</span>
              <span className="text-slate-400 text-[10px]">
                ({activeProfile.gender === 'male' ? 'ชาย' : 'หญิง'} {activeProfile.age}ปี)
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Stopwatch helper */}
            <button
              id="header-stopwatch-btn"
              type="button"
              onClick={onOpenStopwatchModal}
              className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="เปิดนาฬิกาจับเวลา / นับถอยหลัง"
            >
              <Timer className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">นาฬิกาช่วยทดสอบ</span>
            </button>

            {/* Direct Excel Export Button */}
            <button
              id="header-export-excel-btn"
              type="button"
              onClick={onExportExcel}
              className="py-1.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="ส่งออกผลทดสอบและแนวโน้มเป็นไฟล์ Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>ส่งออก Excel</span>
            </button>

            {/* Export / Report */}
            <button
              id="header-export-btn"
              type="button"
              onClick={onOpenExportModal}
              className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="พิมพ์รายงานหรือส่งออกข้อมูล"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">พิมพ์/สำรอง</span>
            </button>

            {/* Add Record Primary Button */}
            <button
              id="header-add-record-btn"
              type="button"
              onClick={onOpenNewTestModal}
              className="py-1.5 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกผลทดสอบ</span>
            </button>

            {/* Reset Data Button */}
            <button
              id="header-reset-btn"
              type="button"
              onClick={() => {
                if (confirm('ต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าตั้งต้นหรือไม่?')) {
                  onResetSampleData();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="รีเซ็ตข้อมูลตัวอย่าง"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-1 pb-2">
          <button
            id="view-trends-tab"
            type="button"
            onClick={() => onViewChange('trends')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'trends'
                ? 'bg-teal-50 text-teal-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-teal-600" />
            วิเคราะห์แนวโน้มอัตโนมัติ (Automated Trend Analysis)
          </button>

          <button
            id="view-history-tab"
            type="button"
            onClick={() => onViewChange('history')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'history'
                ? 'bg-teal-50 text-teal-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-teal-600" />
            ประวัติการทดสอบ ({recordsCount} ครั้ง)
          </button>
        </div>
      </div>
    </header>
  );
};
