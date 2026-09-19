import { FitnessRecord, UserProfile } from '../types';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user_1',
    name: 'สมชาย รักสุขภาพ',
    gender: 'male',
    age: 21,
    heightCm: 174,
    weightKg: 68,
    createdAt: '2026-01-10',
  },
  {
    id: 'user_2',
    name: 'กานต์พิชชา ว่องไว',
    gender: 'female',
    age: 18,
    heightCm: 162,
    weightKg: 52,
    createdAt: '2026-02-01',
  },
];

export const INITIAL_RECORDS: FitnessRecord[] = [
  // Session 1: ต้นปี (Baseline)
  {
    id: 'rec_101',
    profileId: 'user_1',
    date: '2026-01-15',
    bodyWeightKg: 70.5,
    notes: 'ทดสอบครั้งแรกหลังเริ่มตารางฝึกซ้อม กล้ามเนื้อหน้าท้องและขายังเมื่อยเร็ว',
    values: {
      sitUpReps: 18,        // 30s
      pushUpReps: 17,       // 30s
      verticalJumpCm: 41.5, // cm
      flexibilityCm: 5.0,   // cm
      shuttleRunSec: 11.4,  // s
    },
  },
  // Session 2: ผ่านไป 4 สัปดาห์
  {
    id: 'rec_102',
    profileId: 'user_1',
    date: '2026-02-18',
    bodyWeightKg: 69.8,
    notes: 'เริ่มปรับการหายใจตอนลุกนั่งได้ดีขึ้น มีการยืดเหยียดกล้ามเนื้อหลังทุกวัน',
    values: {
      sitUpReps: 21,
      pushUpReps: 20,
      verticalJumpCm: 44.0,
      flexibilityCm: 8.5,
      shuttleRunSec: 11.1,
    },
  },
  // Session 3: ผ่านไป 8 สัปดาห์
  {
    id: 'rec_103',
    profileId: 'user_1',
    date: '2026-03-22',
    bodyWeightKg: 69.0,
    notes: 'เพิ่มการฝึก Plyometrics กระโดดและสปีดกรวยซิกแซก',
    values: {
      sitUpReps: 24,
      pushUpReps: 23,
      verticalJumpCm: 47.0,
      flexibilityCm: 11.0,
      shuttleRunSec: 10.6,
    },
  },
  // Session 4: ผ่านไป 12 สัปดาห์ (ล่าสุด)
  {
    id: 'rec_104',
    profileId: 'user_1',
    date: '2026-04-25',
    bodyWeightKg: 68.2,
    notes: 'ผลการทดสอบประจำไตรมาส พัฒนาขึ้นทุกด้าน ความคล่องตัวและแรงระเบิดดีเยี่ยม',
    values: {
      sitUpReps: 28,
      pushUpReps: 26,
      verticalJumpCm: 50.5,
      flexibilityCm: 13.5,
      shuttleRunSec: 10.1,
    },
  },

  // Records for user_2
  {
    id: 'rec_201',
    profileId: 'user_2',
    date: '2026-02-05',
    bodyWeightKg: 53.0,
    notes: 'ทดสอบระดับชั้นมัธยมปลายก่อนเข้าค่ายกีฬา',
    values: {
      sitUpReps: 15,
      pushUpReps: 12,
      verticalJumpCm: 32.0,
      flexibilityCm: 10.0,
      shuttleRunSec: 12.3,
    },
  },
  {
    id: 'rec_202',
    profileId: 'user_2',
    date: '2026-03-12',
    bodyWeightKg: 52.5,
    notes: 'ฝึกเวทเทรนนิ่งเบาๆ และยืดกล้ามเนื้อสม่ำเสมอ',
    values: {
      sitUpReps: 19,
      pushUpReps: 16,
      verticalJumpCm: 35.5,
      flexibilityCm: 13.0,
      shuttleRunSec: 11.7,
    },
  },
  {
    id: 'rec_203',
    profileId: 'user_2',
    date: '2026-04-20',
    bodyWeightKg: 52.0,
    notes: 'ประเมินปลายภาคเรียน ร่างกายยืดหยุ่นขึ้นมาก',
    values: {
      sitUpReps: 23,
      pushUpReps: 18,
      verticalJumpCm: 38.0,
      flexibilityCm: 16.5,
      shuttleRunSec: 11.2,
    },
  },
];
