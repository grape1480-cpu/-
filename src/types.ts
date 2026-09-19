export type Gender = 'male' | 'female';

export interface UserProfile {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  heightCm?: number;
  weightKg?: number;
  createdAt: string;
}

export type FitnessRating = 'excellent' | 'good' | 'average' | 'fair' | 'poor';

export interface FitnessTestValues {
  sitUpReps: number;       // ลุกนั่ง (ครั้ง)
  pushUpReps: number;      // ดันพื้น (ครั้ง)
  verticalJumpCm: number;  // กระโดดสูง (ซม.)
  flexibilityCm: number;   // ความอ่อนตัว (ซม.)
  shuttleRunSec: number;   // วิ่งเก็บของ (วินาที)
}

export interface FitnessRecord {
  id: string;
  profileId: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  bodyWeightKg?: number;
  values: FitnessTestValues;
}

export type TestItemKey = keyof FitnessTestValues;

export interface TestItemDefinition {
  key: TestItemKey;
  nameTh: string;
  nameEn: string;
  unit: string;
  categoryTh: string;
  higherIsBetter: boolean;
  descriptionTh: string;
  tipsTh: string;
  iconName: string;
  minSensible: number;
  maxSensible: number;
  step: number;
}

export interface TestScoreEvaluation {
  raw: number;
  rating: FitnessRating;
  ratingLabelTh: string;
  normalizedScore: number; // 0 - 100
  percentileRank: number;  // 0 - 100%
}

export interface RecordEvaluation {
  recordId: string;
  date: string;
  totalScore: number; // 0 - 100 average
  overallRating: FitnessRating;
  overallRatingTh: string;
  evaluations: Record<TestItemKey, TestScoreEvaluation>;
}

export type TrendDirection = 'improving' | 'stable' | 'declining';

export interface ItemTrendSummary {
  key: TestItemKey;
  nameTh: string;
  unit: string;
  direction: TrendDirection;
  directionLabelTh: string;
  firstValue: number;
  latestValue: number;
  previousValue: number;
  totalDelta: number;
  percentChangeTotal: number;
  percentChangeRecent: number;
  currentRating: FitnessRating;
  currentRatingLabelTh: string;
  currentScore: number;
  slope: number; // trend slope
}

export interface OverallTrendReport {
  profile: UserProfile;
  totalTestsCount: number;
  firstDate: string;
  latestDate: string;
  currentTotalScore: number;
  scoreChangeFromStart: number;
  overallTrend: TrendDirection;
  overallTrendLabelTh: string;
  itemTrends: Record<TestItemKey, ItemTrendSummary>;
  strongestItem: { key: TestItemKey; nameTh: string; score: number };
  weakestItem: { key: TestItemKey; nameTh: string; score: number };
  insights: string[];
  recommendations: string[];
}
