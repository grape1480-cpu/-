import React, { useState } from 'react';
import {
  Calendar,
  Edit2,
  Trash2,
  Plus,
  FileText,
  Weight,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from 'lucide-react';
import { FitnessRecord, UserProfile } from '../types';
import { TEST_DEFINITIONS, TEST_KEYS, RATING_CONFIG } from '../data/standards';
import { evaluateRecord } from '../utils/fitnessEvaluator';

interface TestHistoryTableProps {
  records: FitnessRecord[];
  profile: UserProfile;
  onAddNew: () => void;
  onEdit: (record: FitnessRecord) => void;
  onDelete: (id: string) => void;
  onExportExcel?: () => void;
}

export const TestHistoryTable: React.FC<TestHistoryTableProps> = ({
  records,
  profile,
  onAddNew,
  onEdit,
  onDelete,
  onExportExcel,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Chronological descending (newest first for table view)
  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div
      id="test-history-card"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
    >
      {/* Table Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>ประวัติการทดสอบสมรรถภาพทั้งหมด ({records.length} ครั้ง)</span>
          </h3>
          <p className="text-xs text-slate-500">
            แสดงผลการทดสอบทั้ง 5 รายการ พร้อมการประเมินคะแนนและเกณฑ์มาตรฐานรายครั้ง
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {onExportExcel && records.length > 0 && (
            <button
              id="table-export-excel-btn"
              type="button"
              onClick={onExportExcel}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="ส่งออกผลการทดสอบทั้งหมดเป็นไฟล์ Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              ส่งออก Excel
            </button>
          )}
          <button
            id="table-add-record-btn"
            type="button"
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            บันทึกผลการทดสอบใหม่
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-sm mb-1">ยังไม่มีประวัติการทดสอบ</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            เริ่มต้นบันทึกผลการทดสอบสมรรถภาพทางกายครั้งแรก เพื่อให้ระบบเริ่มวิเคราะห์แนวโน้มอัตโนมัติ
          </p>
          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold"
          >
            บันทึกครั้งแรกเลย
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">วันที่ทดสอบ</th>
                <th className="py-3 px-3">คะแนนรวม</th>
                <th className="py-3 px-3">1. ลุกนั่ง (30s)</th>
                <th className="py-3 px-3">2. ดันพื้น (30s)</th>
                <th className="py-3 px-3">3. กระโดดสูง</th>
                <th className="py-3 px-3">4. ความอ่อนตัว</th>
                <th className="py-3 px-3">5. วิ่งเก็บของ</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((record) => {
                const evaluated = evaluateRecord(record, profile);
                const overallRatingStyle = RATING_CONFIG[evaluated.overallRating];
                const isExpanded = expandedRowId === record.id;

                return (
                  <React.Fragment key={record.id}>
                    <tr
                      id={`record-row-${record.id}`}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setExpandedRowId(isExpanded ? null : record.id)}
                    >
                      {/* Date & Weight */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(record.date).toLocaleDateString('th-TH', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {record.bodyWeightKg && (
                          <div className="text-[11px] text-slate-500 font-normal mt-0.5 flex items-center gap-1">
                            <Weight className="w-3 h-3 text-slate-400" />
                            {record.bodyWeightKg} กก.
                          </div>
                        )}
                      </td>

                      {/* Overall Score */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">
                            {evaluated.totalScore}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${overallRatingStyle.bgBadge}`}
                          >
                            {evaluated.overallRatingTh}
                          </span>
                        </div>
                      </td>

                      {/* 1. Sit-ups */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {record.values.sitUpReps}
                        </span>{' '}
                        <span className="text-slate-400 text-[11px]">ครั้ง</span>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {evaluated.evaluations.sitUpReps.ratingLabelTh}
                        </div>
                      </td>

                      {/* 2. Push-ups */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {record.values.pushUpReps}
                        </span>{' '}
                        <span className="text-slate-400 text-[11px]">ครั้ง</span>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {evaluated.evaluations.pushUpReps.ratingLabelTh}
                        </div>
                      </td>

                      {/* 3. Vertical Jump */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {record.values.verticalJumpCm}
                        </span>{' '}
                        <span className="text-slate-400 text-[11px]">ซม.</span>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {evaluated.evaluations.verticalJumpCm.ratingLabelTh}
                        </div>
                      </td>

                      {/* 4. Flexibility */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {record.values.flexibilityCm}
                        </span>{' '}
                        <span className="text-slate-400 text-[11px]">ซม.</span>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {evaluated.evaluations.flexibilityCm.ratingLabelTh}
                        </div>
                      </td>

                      {/* 5. Shuttle Run */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {record.values.shuttleRunSec}
                        </span>{' '}
                        <span className="text-slate-400 text-[11px]">วินาที</span>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {evaluated.evaluations.shuttleRunSec.ratingLabelTh}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => onEdit(record)}
                            title="แก้ไขบันทึกนี้"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`ยืนยันการลบผลการทดสอบวันที่ ${record.date} หรือไม่?`)) {
                                onDelete(record.id);
                              }
                            }}
                            title="ลบบันทึกนี้"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedRowId(isExpanded ? null : record.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Details Row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 border-b border-slate-200">
                        <td colSpan={8} className="py-3 px-4">
                          <div className="space-y-2">
                            {record.notes ? (
                              <div className="flex items-start gap-2 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                                <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-semibold text-slate-800">บันทึกเพิ่มเติม: </span>
                                  <span>{record.notes}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">ไม่มีบันทึกเพิ่มเติม</p>
                            )}

                            {/* Detailed breakdown per test */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                              {TEST_KEYS.map((k) => {
                                const def = TEST_DEFINITIONS[k];
                                const evalItem = evaluated.evaluations[k];
                                return (
                                  <div
                                    key={k}
                                    className="bg-white p-2 rounded-md border border-slate-100 text-[11px]"
                                  >
                                    <div className="text-slate-500 font-medium truncate">
                                      {def.nameEn}
                                    </div>
                                    <div className="font-bold text-slate-800 mt-0.5">
                                      {record.values[k]} {def.unit}
                                    </div>
                                    <div className="text-teal-700 font-semibold mt-0.5">
                                      {evalItem.normalizedScore}/100 คะแนน
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
