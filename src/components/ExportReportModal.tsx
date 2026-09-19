import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  Award,
} from 'lucide-react';
import { FitnessRecord, OverallTrendReport, UserProfile } from '../types';
import { TEST_DEFINITIONS, TEST_KEYS, RATING_CONFIG } from '../data/standards';
import { evaluateRecord } from '../utils/fitnessEvaluator';
import { exportFitnessToExcel } from '../utils/excelExporter';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: OverallTrendReport | null;
  records: FitnessRecord[];
  profile: UserProfile;
  onImportData: (importedRecords: FitnessRecord[], importedProfiles: UserProfile[]) => void;
  allProfiles: UserProfile[];
  allRecords: FitnessRecord[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  report,
  records,
  profile,
  onImportData,
  allProfiles,
  allRecords,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'วันที่ทดสอบ',
      'ชื่อผู้ทดสอบ',
      'เพศ',
      'อายุ',
      'น้ำหนัก(กก.)',
      'ลุกนั่ง(ครั้ง)',
      'ดันพื้น(ครั้ง)',
      'กระโดดสูง(ซม.)',
      'ความอ่อนตัว(ซม.)',
      'วิ่งเก็บของ(วินาที)',
      'คะแนนรวม(เต็ม 100)',
      'ระดับสมรรถภาพ',
      'หมายเหตุ',
    ];

    const rows = records.map((r) => {
      const evalItem = evaluateRecord(r, profile);
      return [
        r.date,
        profile.name,
        profile.gender === 'male' ? 'ชาย' : 'หญิง',
        profile.age,
        r.bodyWeightKg || '',
        r.values.sitUpReps,
        r.values.pushUpReps,
        r.values.verticalJumpCm,
        r.values.flexibilityCm,
        r.values.shuttleRunSec,
        evalItem.totalScore,
        evalItem.overallRatingTh,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `รายงานสมรรถภาพทางกาย_${profile.name}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profiles: allProfiles,
      records: allRecords,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `FitTrack_Backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.records) && Array.isArray(parsed.profiles)) {
          onImportData(parsed.records, parsed.profiles);
          alert('นำเข้าข้อมูลสำเร็จเรียบร้อย!');
          onClose();
        } else {
          alert('รูปแบบไฟล์ JSON ไม่ถูกต้องตามโครงสร้างสำรองข้อมูล');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const sortedAsc = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const latestRec = sortedAsc[sortedAsc.length - 1];
  const latestEval = latestRec ? evaluateRecord(latestRec, profile) : null;

  return (
    <div
      id="export-report-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="export-report-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              พิมพ์รายงานและส่งออกข้อมูล (Export & Report)
            </h3>
            <p className="text-xs text-slate-500">
              ดาวน์โหลดรายงานแบบตาราง, ใบประเมินผลพิมพ์ หรือสำรองข้อมูล
            </p>
          </div>
          <button
            id="close-export-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Action Toolbar */}
          <div className="flex flex-wrap gap-2.5 pb-4 border-b border-slate-100">
            <button
              id="export-excel-modal-btn"
              type="button"
              onClick={() => exportFitnessToExcel(profile, records, report)}
              className="py-2 px-3.5 rounded-xl border border-emerald-300 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" /> ดาวน์โหลดไฟล์ Excel (.xlsx)
            </button>
            <button
              id="print-report-btn"
              type="button"
              onClick={handlePrint}
              className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" /> พิมพ์ใบบันทึกผล (Print)
            </button>
            <button
              id="export-csv-btn"
              type="button"
              onClick={handleExportCSV}
              className="py-2 px-3.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-600" /> ดาวน์โหลด CSV
            </button>
            <button
              id="export-json-btn"
              type="button"
              onClick={handleExportJSON}
              className="py-2 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" /> สำรองข้อมูล (JSON)
            </button>
            <button
              id="import-json-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-4 h-4" /> นำเข้าข้อมูล (Restore)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Printable Report Sheet Container */}
          <div
            id="printable-report-card"
            className="p-6 border border-slate-200 rounded-xl bg-white text-slate-900 print:border-none print:p-0"
          >
            {/* Report Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4 text-center">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                ใบสรุปผลการทดสอบสมรรถภาพทางกาย (5 รายการมาตรฐาน)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                ระบบวิเคราะห์และติดตามแนวโน้มสมรรถภาพทางกายตามเกณฑ์มาตรฐาน กรมพลศึกษา
              </p>
            </div>

            {/* Profile Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs mb-5">
              <div>
                <span className="text-slate-500 block">ชื่อผู้รับการทดสอบ:</span>
                <span className="font-bold text-slate-900 text-sm">{profile.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">เพศ / อายุ:</span>
                <span className="font-semibold text-slate-800">
                  {profile.gender === 'male' ? 'เพศชาย' : 'เพศหญิง'} • {profile.age} ปี
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">ส่วนสูง / น้ำหนัก:</span>
                <span className="font-semibold text-slate-800">
                  {profile.heightCm || '-'} ซม. • {profile.weightKg || '-'} กก.
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">จำนวนครั้งที่ทดสอบ:</span>
                <span className="font-bold text-teal-700">{records.length} ครั้ง</span>
              </div>
            </div>

            {/* Latest Evaluation Summary Table */}
            {latestRec && latestEval && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-teal-600" />
                    ผลการทดสอบครั้งล่าสุด (วันที่ {new Date(latestRec.date).toLocaleDateString('th-TH')})
                  </h4>
                  <span className="text-xs font-bold text-slate-700">
                    คะแนนรวม: {latestEval.totalScore}/100 ({latestEval.overallRatingTh})
                  </span>
                </div>

                <table className="w-full text-xs border border-slate-200 border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-2 px-3 border-r border-slate-200">แบบทดสอบสมรรถภาพ</th>
                      <th className="py-2 px-3 border-r border-slate-200">ค่าที่ทำได้</th>
                      <th className="py-2 px-3 border-r border-slate-200">ระดับเกณฑ์มาตรฐาน</th>
                      <th className="py-2 px-3 border-r border-slate-200">คะแนน (0-100)</th>
                      <th className="py-2 px-3">แนวโน้มการเปลี่ยนแปลง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {TEST_KEYS.map((key) => {
                      const def = TEST_DEFINITIONS[key];
                      const val = latestRec.values[key];
                      const itemEval = latestEval.evaluations[key];
                      const trend = report?.itemTrends[key];

                      return (
                        <tr key={key}>
                          <td className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-200">
                            {def.nameTh}
                            <span className="block text-[10px] text-slate-500">{def.categoryTh}</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                            {val} {def.unit}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-medium">
                            {itemEval.ratingLabelTh}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-teal-700">
                            {itemEval.normalizedScore}
                          </td>
                          <td className="py-2.5 px-3">
                            {trend ? (
                              <span
                                className={`font-medium ${
                                  trend.direction === 'improving'
                                    ? 'text-emerald-700'
                                    : trend.direction === 'declining'
                                    ? 'text-rose-700'
                                    : 'text-slate-600'
                                }`}
                              >
                                {trend.directionLabelTh} ({trend.totalDelta > 0 ? `+${trend.totalDelta}` : trend.totalDelta} {trend.unit})
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Analytical Insights & Recommendations for Print */}
            {report && (
              <div className="mt-5 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">
                  สรุปการวิเคราะห์แนวโน้มและคำแนะนำการพัฒนา:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {report.insights.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                  {report.recommendations.map((rec, i) => (
                    <li key={`rec-${i}`} className="text-teal-900">
                      <strong>ข้อเสนอแนะ:</strong> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Signature Section for Official Record */}
            <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 text-center text-xs text-slate-600">
              <div>
                <p className="mt-6 mb-1">ลงชื่อ ................................................................</p>
                <p>({profile.name})</p>
                <p className="text-[10px] text-slate-400">ผู้รับการทดสอบ</p>
              </div>
              <div>
                <p className="mt-6 mb-1">ลงชื่อ ................................................................</p>
                <p>(................................................................)</p>
                <p className="text-[10px] text-slate-400">ผู้ประเมิน / ครู / ผู้ฝึกสอน</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
