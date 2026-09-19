import React, { useState } from 'react';
import { X, User, Check, Plus, Trash2 } from 'lucide-react';
import { Gender, UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
}) => {
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<number>(20);
  const [heightCm, setHeightCm] = useState<string>('170');
  const [weightKg, setWeightKg] = useState<string>('65');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProfile: UserProfile = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      gender,
      age: Number(age) || 20,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveProfile(newProfile);
    onSelectProfile(newProfile.id);
    setMode('list');
    setName('');
  };

  return (
    <div
      id="profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
    >
      <div
        id="profile-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {mode === 'create' ? 'เพิ่มผู้รับการทดสอบใหม่' : 'จัดการผู้รับการทดสอบ'}
              </h3>
              <p className="text-xs text-slate-500">เลือกโปรไฟล์เพื่อคำนวณเกณฑ์ตามเพศและอายุที่ถูกต้อง</p>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'list' ? (
            <div className="space-y-4">
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {profiles.map((p) => {
                  const isSelected = p.id === activeProfileId;
                  const bmi =
                    p.heightCm && p.weightKg
                      ? (p.weightKg / Math.pow(p.heightCm / 100, 2)).toFixed(1)
                      : null;

                  return (
                    <div
                      key={p.id}
                      id={`profile-card-${p.id}`}
                      onClick={() => onSelectProfile(p.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm">{p.name}</span>
                            {isSelected && (
                              <span className="text-[11px] font-medium text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                                ใช้งานอยู่
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {p.gender === 'male' ? 'เพศชาย' : 'เพศหญิง'} • อายุ {p.age} ปี
                            {p.weightKg && ` • ${p.weightKg} กก.`}
                            {p.heightCm && ` • ${p.heightCm} ซม.`}
                            {bmi && ` (BMI ${bmi})`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {profiles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`ต้องการลบโปรไฟล์ "${p.name}" และข้อมูลที่เกี่ยวข้องหรือไม่?`)) {
                                onDeleteProfile(p.id);
                              }
                            }}
                            title="ลบโปรไฟล์"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  id="add-new-profile-btn"
                  type="button"
                  onClick={() => setMode('create')}
                  className="py-2.5 px-4 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มผู้รับการทดสอบใหม่
                </button>
                <button
                  id="confirm-profile-btn"
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                >
                  เรียบร้อย
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ - นามสกุล หรือ รหัสผู้ทดสอบ <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-profile-name"
                  type="text"
                  required
                  placeholder="เช่น เอกชัย สุขใจ หรือ นักเรียน 001"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เพศ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="select-profile-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
                  >
                    <option value="male">เพศชาย (Male)</option>
                    <option value="female">เพศหญิง (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อายุ (ปี) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-profile-age"
                    type="number"
                    min="10"
                    max="90"
                    required
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ส่วนสูง (ซม.)
                  </label>
                  <input
                    id="input-profile-height"
                    type="number"
                    step="0.5"
                    placeholder="เช่น 170"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    น้ำหนักตัว (กก.)
                  </label>
                  <input
                    id="input-profile-weight"
                    type="number"
                    step="0.1"
                    placeholder="เช่น 65"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  ย้อนกลับ
                </button>
                <button
                  id="save-new-profile-btn"
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" /> บันทึกโปรไฟล์
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
