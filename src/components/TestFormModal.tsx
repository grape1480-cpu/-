import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Dumbbell,
  TrendingUp,
  Flame,
  Zap,
  Calendar,
  Weight,
  HelpCircle,
  Timer,
  Check,
  Info,
} from 'lucide-react';
import { FitnessRecord, FitnessTestValues, TestItemKey, UserProfile } from '../types';
import { TEST_DEFINITIONS, TEST_KEYS, RATING_CONFIG } from '../data/standards';
import { evaluateTestValue } from '../utils/fitnessEvaluator';
import { StopwatchModal } from './StopwatchModal';

interface TestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<FitnessRecord, 'id'>, editId?: string) => void;
  profile: UserProfile;
  editingRecord?: FitnessRecord | null;
}

export const TestFormModal: React.FC<TestFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profile,
  editingRecord,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bodyWeightKg, setBodyWeightKg] = useState<string>(
    profile.weightKg ? profile.weightKg.toString() : ''
  );
  const [notes, setNotes] = useState<string>('');

  const [values, setValues] = useState<FitnessTestValues>({
    sitUpReps: 20,
    pushUpReps: 18,
    verticalJumpCm: 45,
    flexibilityCm: 8,
    shuttleRunSec: 11.2,
  });

  const [activeTooltip, setActiveTooltip] = useState<TestItemKey | null>(null);
  const [isStopwatchOpen, setIsStopwatchOpen] = useState<boolean>(false);
  const [stopwatchTarget, setStopwatchTarget] = useState<'shuttle_run' | 'situp_30' | 'pushup_30'>('shuttle_run');

  useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date);
      setBodyWeightKg(editingRecord.bodyWeightKg ? editingRecord.bodyWeightKg.toString() : '');
      setNotes(editingRecord.notes || '');
      setValues({ ...editingRecord.values });
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setBodyWeightKg(profile.weightKg ? profile.weightKg.toString() : '');
      setNotes('');
      // sensible defaults based on gender
      if (profile.gender === 'female') {
        setValues({
          sitUpReps: 18,
          pushUpReps: 14,
          verticalJumpCm: 32,
          flexibilityCm: 10,
          shuttleRunSec: 12.0,
        });
      } else {
        setValues({
          sitUpReps: 22,
          pushUpReps: 20,
          verticalJumpCm: 44,
          flexibilityCm: 7,
          shuttleRunSec: 11.0,
        });
      }
    }
  }, [editingRecord, isOpen, profile]);

  if (!isOpen) return null;

  const handleValueChange = (key: TestItemKey, valStr: string) => {
    const parsed = parseFloat(valStr);
    setValues((prev) => ({
      ...prev,
      [key]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  const handleStep = (key: TestItemKey, delta: number) => {
    const current = values[key];
    const def = TEST_DEFINITIONS[key];
    const next = Math.round((current + delta) * 100) / 100;
    if (next >= def.minSensible && next <= def.maxSensible) {
      setValues((prev) => ({
        ...prev,
        [key]: next,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        profileId: profile.id,
        date,
        bodyWeightKg: bodyWeightKg ? parseFloat(bodyWeightKg) : undefined,
        notes: notes.trim(),
        values,
      },
      editingRecord ? editingRecord.id : undefined
    );
    onClose();
  };

  const openStopwatchFor = (type: 'shuttle_run' | 'situp_30' | 'pushup_30') => {
    setStopwatchTarget(type);
    setIsStopwatchOpen(true);
  };

  const handleApplyStopwatchResult = (
    key: 'sitUpReps' | 'pushUpReps' | 'shuttleRunSec',
    value: number
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getTestIcon = (key: TestItemKey) => {
    switch (key) {
      case 'sitUpReps':
        return <Activity className="w-5 h-5 text-indigo-500" />;
      case 'pushUpReps':
        return <Dumbbell className="w-5 h-5 text-teal-600" />;
      case 'verticalJumpCm':
        return <TrendingUp className="w-5 h-5 text-amber-500" />;
      case 'flexibilityCm':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'shuttleRunSec':
        return <Zap className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <>
      <div
        id="test-form-modal-overlay"
        className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      >
        <div
          id="test-form-modal-card"
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editingRecord ? 'แก้ไขผลการทดสอบสมรรถภาพ' : 'บันทึกผลการทดสอบสมรรถภาพ (5 รายการ)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ผู้รับการทดสอบ: <span className="font-semibold text-slate-700">{profile.name}</span> ({profile.gender === 'male' ? 'ชาย' : 'หญิง'}, อายุ {profile.age} ปี)
              </p>
            </div>
            <button
              id="close-test-form-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Meta: Date & Body Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  วันที่ทำการทดสอบ <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-test-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Weight className="w-4 h-4 text-slate-400" />
                  น้ำหนักตัว ณ วันทดสอบ (กก.) <span className="text-xs text-slate-400 font-normal">(ถ้ามี)</span>
                </label>
                <input
                  id="input-test-weight"
                  type="number"
                  step="0.1"
                  min="20"
                  max="200"
                  placeholder="เช่น 65.5"
                  value={bodyWeightKg}
                  onChange={(e) => setBodyWeightKg(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Test Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>รายการทดสอบสมรรถภาพทางกาย 5 แบบทดสอบ</span>
                </h3>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-teal-600" />
                  ประเมินเทียบเกณฑ์มาตรฐานอายุ/เพศอัตโนมัติ
                </span>
              </div>

              <div className="space-y-3">
                {TEST_KEYS.map((key) => {
                  const def = TEST_DEFINITIONS[key];
                  const currentVal = values[key];
                  const evalResult = evaluateTestValue(key, currentVal, profile);
                  const ratingInfo = RATING_CONFIG[evalResult.rating];

                  return (
                    <div
                      key={key}
                      id={`test-item-card-${key}`}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            {getTestIcon(key)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 text-sm">{def.nameTh}</span>
                              <button
                                type="button"
                                onClick={() => setActiveTooltip(activeTooltip === key ? null : key)}
                                className="text-slate-400 hover:text-slate-600"
                                title="ดูคำอธิบายวิธีทดสอบ"
                              >
                                <HelpCircle className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="text-xs text-slate-500">{def.categoryTh}</span>
                          </div>
                        </div>

                        {/* Current Rating Pill */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${ratingInfo.bgBadge}`}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: ratingInfo.color }}
                            />
                            เกณฑ์: {evalResult.ratingLabelTh} ({evalResult.normalizedScore} คะแนน)
                          </span>
                        </div>
                      </div>

                      {/* Tooltip Description */}
                      {activeTooltip === key && (
                        <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 mb-3 animate-in fade-in duration-150">
                          <p className="font-medium text-slate-800 mb-1">วิธีทดสอบ:</p>
                          <p className="text-slate-600 mb-1.5">{def.descriptionTh}</p>
                          <p className="text-teal-700 font-medium">คำแนะนำ: {def.tipsTh}</p>
                        </div>
                      )}

                      {/* Input Control Row */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 relative">
                          <input
                            id={`input-${key}`}
                            type="number"
                            step={def.step}
                            min={def.minSensible}
                            max={def.maxSensible}
                            required
                            value={currentVal}
                            onChange={(e) => handleValueChange(key, e.target.value)}
                            className="w-full pl-3.5 pr-14 py-2 text-base font-semibold bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                            {def.unit}
                          </span>
                        </div>

                        {/* Quick Step +/- Buttons */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStep(key, -def.step)}
                            className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStep(key, def.step)}
                            className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border-l border-slate-200 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Timer helper trigger button for timed tests */}
                        {key === 'shuttleRunSec' && (
                          <button
                            type="button"
                            onClick={() => openStopwatchFor('shuttle_run')}
                            className="px-3 py-2 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
                            title="เปิดนาฬิกาจับเวลาวิ่งเก็บของ"
                          >
                            <Timer className="w-3.5 h-3.5" />
                            จับเวลา
                          </button>
                        )}
                        {(key === 'sitUpReps' || key === 'pushUpReps') && (
                          <button
                            type="button"
                            onClick={() => openStopwatchFor(key === 'sitUpReps' ? 'situp_30' : 'pushup_30')}
                            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
                            title="เปิดนาฬิกานับถอยหลัง 30 วินาที"
                          >
                            <Timer className="w-3.5 h-3.5 text-slate-500" />
                            นับ 30s
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                บันทึกเพิ่มเติม / หมายเหตุสภาพร่างกาย
              </label>
              <textarea
                id="input-test-notes"
                rows={2}
                placeholder="เช่น นอนหลับเพียงพอ, วอร์มอัพครบ 15 นาที, มีอาการตึงกล้ามเนื้อขาเล็กน้อย"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                id="cancel-test-form-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                id="save-test-form-btn"
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                {editingRecord ? 'บันทึกการแก้ไข' : 'บันทึกผลการทดสอบ'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Stopwatch Modal */}
      <StopwatchModal
        isOpen={isStopwatchOpen}
        onClose={() => setIsStopwatchOpen(false)}
        initialMode={stopwatchTarget}
        onApplyResult={handleApplyStopwatchResult}
      />
    </>
  );
};
