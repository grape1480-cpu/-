import { FitnessRating, Gender, TestItemDefinition, TestItemKey } from '../types';

export const TEST_DEFINITIONS: Record<TestItemKey, TestItemDefinition> = {
  sitUpReps: {
    key: 'sitUpReps',
    nameTh: 'ลุกนั่ง (30 วินาที)',
    nameEn: 'Sit-ups',
    unit: 'ครั้ง',
    categoryTh: 'ความแข็งแรงและความอดทนของกล้ามเนื้อท้อง',
    higherIsBetter: true,
    descriptionTh: 'ทดสอบความแข็งแรงและความอดทนของกล้ามเนื้อหน้าท้องและแกนกลางลำตัว โดยนอนหงายชันเข่า มือประสานท้ายทอยแล้วยกลำตัวขึ้นแตะเข่า',
    tipsTh: 'รักษาจังหวะหายใจอย่างสม่ำเสมอ หายใจออกขณะยกลำตัวขึ้น และเกร็งกล้ามเนื้อแกนกลางลำตัว (Core) ตลอดเวลา',
    iconName: 'Activity',
    minSensible: 0,
    maxSensible: 80,
    step: 1,
  },
  pushUpReps: {
    key: 'pushUpReps',
    nameTh: 'ดันพื้น (30 วินาที)',
    nameEn: 'Push-ups',
    unit: 'ครั้ง',
    categoryTh: 'ความแข็งแรงและความอดทนของกล้ามเนื้อส่วนบน',
    higherIsBetter: true,
    descriptionTh: 'ทดสอบความแข็งแรงและความอดทนของกล้ามเนื้อแขน หัวไหล่ และหน้าอก โดยคว่ำตัวลงดันลำตัวขึ้น-ลงเป็นเส้นตรง',
    tipsTh: 'ให้ลำตัวตรงตั้งแต่ศีรษะจรดส้นเท้า อย่าให้หลังแอ่นหรืองอ และดันข้อศอกเหยียดเกือบตึงในจังหวะขึ้น',
    iconName: 'Dumbbell',
    minSensible: 0,
    maxSensible: 80,
    step: 1,
  },
  verticalJumpCm: {
    key: 'verticalJumpCm',
    nameTh: 'กระโดดสูง (สัมผัสผนัง)',
    nameEn: 'Vertical Jump',
    unit: 'ซม.',
    categoryTh: 'พลังกล้ามเนื้อขา (Explosive Power)',
    higherIsBetter: true,
    descriptionTh: 'ทดสอบพลังระเบิดของกล้ามเนื้อขา โดยยืนแตะผนังวัดความสูงตั้งต้น แล้วย่อเข่ากระโดดแตะให้สูงที่สุด นำผลต่างมาบันทึก',
    tipsTh: 'ย่อเข่าทำมุม 90-100 องศาแล้วแกว่งแขนขึ้นเพื่อส่งแรงระเบิดจากข้อเท้าและต้นขาอย่างเต็มที่',
    iconName: 'TrendingUp',
    minSensible: 5,
    maxSensible: 120,
    step: 0.5,
  },
  flexibilityCm: {
    key: 'flexibilityCm',
    nameTh: 'ความอ่อนตัว (นั่งงอตัว)',
    nameEn: 'Sit and Reach',
    unit: 'ซม.',
    categoryTh: 'ความอ่อนตัวกล้ามเนื้อหลังและต้นขาด้านหลัง',
    higherIsBetter: true,
    descriptionTh: 'ทดสอบความยืดหยุ่นของกล้ามเนื้อหลังส่วนล่างและต้นขาด้านหลัง (Hamstrings) โดยนั่งเหยียดขาตรงแล้วก้มตัวเอื้อมมือไปข้างหน้าให้ไกลที่สุด',
    tipsTh: 'เข่าต้องแนบชิดพื้นไม่งอ ค่อยๆ ก้มตัวช้าๆ พร้อมหายใจออก อย่ากระตุกหรือกระชาก',
    iconName: 'Flame',
    minSensible: -20,
    maxSensible: 45,
    step: 0.5,
  },
  shuttleRunSec: {
    key: 'shuttleRunSec',
    nameTh: 'วิ่งเก็บของ (4x10 ม.)',
    nameEn: 'Shuttle Run',
    unit: 'วินาที',
    categoryTh: 'ความคล่องแคล่วว่องไวและการเปลี่ยนทิศทาง',
    higherIsBetter: false, // น้อยกว่าคือเร็วกว่าและดีกว่า
    descriptionTh: 'ทดสอบความคล่องแคล่วว่องไวและความเร็วในการเปลี่ยนทิศทาง โดยวิ่งไป-กลับระยะทาง 10 เมตรเพื่อหยิบและวางท่อนไม้ 2 ท่อน',
    tipsTh: 'ลดจุดศูนย์ถ่วงลงต่ำขณะกลับตัว และใช้การถ่ายน้ำหนักเท้าเพื่อพุ่งตัวออกไปได้อย่างรวดเร็ว',
    iconName: 'Zap',
    minSensible: 7.0,
    maxSensible: 25.0,
    step: 0.05,
  },
};

export const TEST_KEYS: TestItemKey[] = [
  'sitUpReps',
  'pushUpReps',
  'verticalJumpCm',
  'flexibilityCm',
  'shuttleRunSec',
];

export const RATING_CONFIG: Record<
  FitnessRating,
  { labelTh: string; labelEn: string; color: string; bgBadge: string; textBadge: string; baseScore: number }
> = {
  excellent: {
    labelTh: 'ดีมาก',
    labelEn: 'Excellent',
    color: '#10b981', // emerald-500
    bgBadge: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    textBadge: 'text-emerald-700',
    baseScore: 90,
  },
  good: {
    labelTh: 'ดี',
    labelEn: 'Good',
    color: '#0ea5e9', // sky-500
    bgBadge: 'bg-sky-50 border-sky-200 text-sky-800',
    textBadge: 'text-sky-700',
    baseScore: 75,
  },
  average: {
    labelTh: 'ปานกลาง',
    labelEn: 'Average',
    color: '#f59e0b', // amber-500
    bgBadge: 'bg-amber-50 border-amber-200 text-amber-800',
    textBadge: 'text-amber-700',
    baseScore: 60,
  },
  fair: {
    labelTh: 'พอใช้',
    labelEn: 'Fair',
    color: '#f97316', // orange-500
    bgBadge: 'bg-orange-50 border-orange-200 text-orange-800',
    textBadge: 'text-orange-700',
    baseScore: 45,
  },
  poor: {
    labelTh: 'ต้องปรับปรุง',
    labelEn: 'Needs Improvement',
    color: '#ef4444', // red-500
    bgBadge: 'bg-rose-50 border-rose-200 text-rose-800',
    textBadge: 'text-rose-700',
    baseScore: 25,
  },
};

// Standard benchmarks (Department of Physical Education, Thailand standard ranges)
// Thresholds for: [excellent, good, average, fair]
// If higherIsBetter: value >= t0 => excellent, >= t1 => good, >= t2 => average, >= t3 => fair, else poor
// If !higherIsBetter: value <= t0 => excellent, <= t1 => good, <= t2 => average, <= t3 => fair, else poor
export interface BenchmarkThresholds {
  t0: number; // excellent threshold
  t1: number; // good threshold
  t2: number; // average threshold
  t3: number; // fair threshold
}

export function getBenchmark(
  testKey: TestItemKey,
  gender: Gender,
  age: number
): BenchmarkThresholds {
  const isMale = gender === 'male';

  // Age group segmentation: youth (12-18), young adult (19-35), adult (36-50), senior (51+)
  if (age <= 18) {
    switch (testKey) {
      case 'sitUpReps':
        return isMale
          ? { t0: 25, t1: 21, t2: 17, t3: 13 }
          : { t0: 21, t1: 17, t2: 13, t3: 9 };
      case 'pushUpReps':
        return isMale
          ? { t0: 26, t1: 21, t2: 16, t3: 11 }
          : { t0: 19, t1: 15, t2: 11, t3: 7 };
      case 'verticalJumpCm':
        return isMale
          ? { t0: 48, t1: 42, t2: 36, t3: 30 }
          : { t0: 38, t1: 32, t2: 26, t3: 20 };
      case 'flexibilityCm':
        return isMale
          ? { t0: 14, t1: 9, t2: 4, t3: 0 }
          : { t0: 17, t1: 12, t2: 7, t3: 2 };
      case 'shuttleRunSec':
        return isMale
          ? { t0: 10.2, t1: 10.9, t2: 11.8, t3: 12.8 }
          : { t0: 11.2, t1: 12.0, t2: 13.0, t3: 14.1 };
    }
  } else if (age <= 35) {
    switch (testKey) {
      case 'sitUpReps':
        return isMale
          ? { t0: 27, t1: 22, t2: 18, t3: 13 }
          : { t0: 22, t1: 18, t2: 14, t3: 9 };
      case 'pushUpReps':
        return isMale
          ? { t0: 28, t1: 22, t2: 17, t3: 12 }
          : { t0: 20, t1: 16, t2: 12, t3: 7 };
      case 'verticalJumpCm':
        return isMale
          ? { t0: 52, t1: 45, t2: 38, t3: 31 }
          : { t0: 40, t1: 34, t2: 28, t3: 22 };
      case 'flexibilityCm':
        return isMale
          ? { t0: 15, t1: 10, t2: 5, t3: 1 }
          : { t0: 18, t1: 13, t2: 8, t3: 3 };
      case 'shuttleRunSec':
        return isMale
          ? { t0: 9.9, t1: 10.7, t2: 11.6, t3: 12.6 }
          : { t0: 10.9, t1: 11.8, t2: 12.8, t3: 13.9 };
    }
  } else if (age <= 50) {
    switch (testKey) {
      case 'sitUpReps':
        return isMale
          ? { t0: 23, t1: 19, t2: 15, t3: 11 }
          : { t0: 19, t1: 15, t2: 11, t3: 7 };
      case 'pushUpReps':
        return isMale
          ? { t0: 24, t1: 19, t2: 14, t3: 9 }
          : { t0: 16, t1: 12, t2: 8, t3: 5 };
      case 'verticalJumpCm':
        return isMale
          ? { t0: 45, t1: 38, t2: 32, t3: 26 }
          : { t0: 34, t1: 28, t2: 23, t3: 17 };
      case 'flexibilityCm':
        return isMale
          ? { t0: 13, t1: 8, t2: 3, t3: -1 }
          : { t0: 16, t1: 11, t2: 6, t3: 1 };
      case 'shuttleRunSec':
        return isMale
          ? { t0: 10.5, t1: 11.4, t2: 12.4, t3: 13.6 }
          : { t0: 11.6, t1: 12.6, t2: 13.7, t3: 15.0 };
    }
  } else {
    // 51+
    switch (testKey) {
      case 'sitUpReps':
        return isMale
          ? { t0: 19, t1: 15, t2: 11, t3: 7 }
          : { t0: 15, t1: 11, t2: 7, t3: 4 };
      case 'pushUpReps':
        return isMale
          ? { t0: 18, t1: 14, t2: 10, t3: 6 }
          : { t0: 12, t1: 9, t2: 6, t3: 3 };
      case 'verticalJumpCm':
        return isMale
          ? { t0: 38, t1: 31, t2: 25, t3: 19 }
          : { t0: 28, t1: 23, t2: 18, t3: 13 };
      case 'flexibilityCm':
        return isMale
          ? { t0: 10, t1: 5, t2: 1, t3: -3 }
          : { t0: 13, t1: 8, t2: 3, t3: -1 };
      case 'shuttleRunSec':
        return isMale
          ? { t0: 11.3, t1: 12.3, t2: 13.5, t3: 14.8 }
          : { t0: 12.4, t1: 13.5, t2: 14.8, t3: 16.2 };
    }
  }
}
