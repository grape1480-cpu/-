import {
  FitnessRating,
  FitnessRecord,
  ItemTrendSummary,
  OverallTrendReport,
  RecordEvaluation,
  TestItemKey,
  TestScoreEvaluation,
  TrendDirection,
  UserProfile,
} from '../types';
import { getBenchmark, RATING_CONFIG, TEST_DEFINITIONS, TEST_KEYS } from '../data/standards';

/**
 * Evaluate single test score against age/gender norms.
 */
export function evaluateTestValue(
  key: TestItemKey,
  raw: number,
  profile: UserProfile
): TestScoreEvaluation {
  const bench = getBenchmark(key, profile.gender, profile.age);
  const def = TEST_DEFINITIONS[key];
  let rating: FitnessRating = 'poor';
  let normalizedScore = 20;

  if (def.higherIsBetter) {
    if (raw >= bench.t0) {
      rating = 'excellent';
      // Normalize score between 85 - 100
      const extra = Math.min((raw - bench.t0) / (bench.t0 * 0.25 || 1), 1);
      normalizedScore = 85 + extra * 15;
    } else if (raw >= bench.t1) {
      rating = 'good';
      const range = bench.t0 - bench.t1 || 1;
      normalizedScore = 70 + ((raw - bench.t1) / range) * 15;
    } else if (raw >= bench.t2) {
      rating = 'average';
      const range = bench.t1 - bench.t2 || 1;
      normalizedScore = 55 + ((raw - bench.t2) / range) * 15;
    } else if (raw >= bench.t3) {
      rating = 'fair';
      const range = bench.t2 - bench.t3 || 1;
      normalizedScore = 40 + ((raw - bench.t3) / range) * 15;
    } else {
      rating = 'poor';
      normalizedScore = Math.max(10, 40 - Math.min((bench.t3 - raw) * 2, 25));
    }
  } else {
    // Lower is better (Shuttle Run)
    if (raw <= bench.t0) {
      rating = 'excellent';
      const bonus = Math.max(0, Math.min((bench.t0 - raw) / 1.5, 1));
      normalizedScore = 85 + bonus * 15;
    } else if (raw <= bench.t1) {
      rating = 'good';
      const range = bench.t1 - bench.t0 || 1;
      normalizedScore = 70 + ((bench.t1 - raw) / range) * 15;
    } else if (raw <= bench.t2) {
      rating = 'average';
      const range = bench.t2 - bench.t1 || 1;
      normalizedScore = 55 + ((bench.t2 - raw) / range) * 15;
    } else if (raw <= bench.t3) {
      rating = 'fair';
      const range = bench.t3 - bench.t2 || 1;
      normalizedScore = 40 + ((bench.t3 - raw) / range) * 15;
    } else {
      rating = 'poor';
      normalizedScore = Math.max(10, 40 - Math.min((raw - bench.t3) * 5, 25));
    }
  }

  normalizedScore = Math.round(Math.max(0, Math.min(100, normalizedScore)));

  // Estimated percentile rank
  let percentileRank = normalizedScore;

  return {
    raw,
    rating,
    ratingLabelTh: RATING_CONFIG[rating].labelTh,
    normalizedScore,
    percentileRank,
  };
}

/**
 * Evaluate all 5 tests for a single record session.
 */
export function evaluateRecord(
  record: FitnessRecord,
  profile: UserProfile
): RecordEvaluation {
  const evaluations = {} as Record<TestItemKey, TestScoreEvaluation>;
  let totalScoreSum = 0;

  TEST_KEYS.forEach((key) => {
    const evaluation = evaluateTestValue(key, record.values[key], profile);
    evaluations[key] = evaluation;
    totalScoreSum += evaluation.normalizedScore;
  });

  const totalScore = Math.round(totalScoreSum / TEST_KEYS.length);

  let overallRating: FitnessRating = 'poor';
  if (totalScore >= 85) overallRating = 'excellent';
  else if (totalScore >= 70) overallRating = 'good';
  else if (totalScore >= 55) overallRating = 'average';
  else if (totalScore >= 40) overallRating = 'fair';
  else overallRating = 'poor';

  return {
    recordId: record.id,
    date: record.date,
    totalScore,
    overallRating,
    overallRatingTh: RATING_CONFIG[overallRating].labelTh,
    evaluations,
  };
}

/**
 * Perform automatic trend analysis on an array of records sorted by date.
 */
export function analyzeTrends(
  records: FitnessRecord[],
  profile: UserProfile
): OverallTrendReport | null {
  if (!records || records.length === 0) return null;

  // Sort chronological ascending
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const evaluatedRecords = sorted.map((r) => evaluateRecord(r, profile));
  const firstRec = sorted[0];
  const latestRec = sorted[sorted.length - 1];
  const prevRec = sorted.length > 1 ? sorted[sorted.length - 2] : sorted[0];

  const firstEval = evaluatedRecords[0];
  const latestEval = evaluatedRecords[evaluatedRecords.length - 1];

  const itemTrends = {} as Record<TestItemKey, ItemTrendSummary>;

  TEST_KEYS.forEach((key) => {
    const def = TEST_DEFINITIONS[key];
    const firstVal = firstRec.values[key];
    const latestVal = latestRec.values[key];
    const prevVal = prevRec.values[key];

    const totalDelta = latestVal - firstVal;
    const recentDelta = latestVal - prevVal;

    // Percent change
    let percentChangeTotal = 0;
    if (firstVal !== 0) {
      percentChangeTotal = ((latestVal - firstVal) / Math.abs(firstVal)) * 100;
    }
    let percentChangeRecent = 0;
    if (prevVal !== 0) {
      percentChangeRecent = ((latestVal - prevVal) / Math.abs(prevVal)) * 100;
    }

    // Determine direction based on whether higher is better
    // For shuttle run (higherIsBetter: false), delta < 0 means improvement
    let isImproved = false;
    let isDeclined = false;
    const thresholdPercent = 1.0; // 1% deadband

    if (def.higherIsBetter) {
      if (percentChangeTotal > thresholdPercent) isImproved = true;
      else if (percentChangeTotal < -thresholdPercent) isDeclined = true;
    } else {
      // Lower is better
      if (percentChangeTotal < -thresholdPercent) isImproved = true;
      else if (percentChangeTotal > thresholdPercent) isDeclined = true;
    }

    let direction: TrendDirection = 'stable';
    let directionLabelTh = 'คงที่';
    if (isImproved) {
      direction = 'improving';
      directionLabelTh = 'พัฒนาขึ้น';
    } else if (isDeclined) {
      direction = 'declining';
      directionLabelTh = 'ลดลง';
    }

    // Linear regression slope
    const n = sorted.length;
    let slope = 0;
    if (n > 1) {
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumXX = 0;
      for (let i = 0; i < n; i++) {
        const x = i;
        const y = sorted[i].values[key];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
      }
      slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
    }

    const latestItemEval = latestEval.evaluations[key];

    itemTrends[key] = {
      key,
      nameTh: def.nameTh,
      unit: def.unit,
      direction,
      directionLabelTh,
      firstValue: firstVal,
      latestValue: latestVal,
      previousValue: prevVal,
      totalDelta: Math.round(totalDelta * 100) / 100,
      percentChangeTotal: Math.round(percentChangeTotal * 10) / 10,
      percentChangeRecent: Math.round(percentChangeRecent * 10) / 10,
      currentRating: latestItemEval.rating,
      currentRatingLabelTh: latestItemEval.ratingLabelTh,
      currentScore: latestItemEval.normalizedScore,
      slope: Math.round(slope * 100) / 100,
    };
  });

  // Identify strongest and weakest
  let highestScore = -1;
  let lowestScore = 101;
  let strongestKey: TestItemKey = 'sitUpReps';
  let weakestKey: TestItemKey = 'flexibilityCm';

  for (const key of TEST_KEYS) {
    const score = itemTrends[key].currentScore;
    if (score > highestScore) {
      highestScore = score;
      strongestKey = key;
    }
    if (score < lowestScore) {
      lowestScore = score;
      weakestKey = key;
    }
  }

  const scoreChangeFromStart = latestEval.totalScore - firstEval.totalScore;
  let overallTrend: TrendDirection = 'stable';
  let overallTrendLabelTh = 'สมรรถภาพคงที่';

  if (scoreChangeFromStart >= 3) {
    overallTrend = 'improving';
    overallTrendLabelTh = 'สมรรถภาพพัฒนาขึ้นอย่างเห็นได้ชัด';
  } else if (scoreChangeFromStart <= -3) {
    overallTrend = 'declining';
    overallTrendLabelTh = 'สมรรถภาพมีแนวโน้มลดลง';
  }

  // Generate automated insights based on trends
  const insights: string[] = [];
  const recommendations: string[] = [];

  if (records.length === 1) {
    insights.push(`บันทึกการทดสอบครั้งแรกเรียบร้อย คะแนนภาพรวมอยู่ที่ ${latestEval.totalScore}/100 (ระดับ${latestEval.overallRatingTh})`);
    insights.push(`ด้านที่ทำได้ดีที่สุดคือ "${TEST_DEFINITIONS[strongestKey].nameTh}" (${highestScore} คะแนน)`);
    if (lowestScore < 60) {
      insights.push(`ด้านที่ต้องให้ความสนใจคือ "${TEST_DEFINITIONS[weakestKey].nameTh}" (${lowestScore} คะแนน - ${itemTrends[weakestKey].currentRatingLabelTh})`);
    }
  } else {
    // Multi-session trend insights
    const improvingCount = Object.values(itemTrends).filter((t) => t.direction === 'improving').length;
    const decliningCount = Object.values(itemTrends).filter((t) => t.direction === 'declining').length;

    if (scoreChangeFromStart > 0) {
      insights.push(
        `คะแนนสมรรถภาพรวมเพิ่มขึ้น +${scoreChangeFromStart} คะแนน จาก ${firstEval.totalScore} เป็น ${latestEval.totalScore} คะแนน (${improvingCount}/5 รายการมีทิศทางพัฒนาขึ้น)`
      );
    } else if (scoreChangeFromStart < 0) {
      insights.push(
        `คะแนนสมรรถภาพรวมลดลง ${scoreChangeFromStart} คะแนน จาก ${firstEval.totalScore} เป็น ${latestEval.totalScore} คะแนน (${decliningCount}/5 รายการมีทิศทางลดลง)`
      );
    } else {
      insights.push(`ระดับความฟิตโดยรวมคงที่ที่ ${latestEval.totalScore} คะแนน รักษาเกณฑ์มาตรฐานได้อย่างสม่ำเสมอ`);
    }

    // Specific highlight on major improvement
    const sortedByGrowth = [...Object.values(itemTrends)].sort((a, b) => {
      const aImpact = a.direction === 'improving' ? Math.abs(a.percentChangeTotal) : -100;
      const bImpact = b.direction === 'improving' ? Math.abs(b.percentChangeTotal) : -100;
      return bImpact - aImpact;
    });

    if (sortedByGrowth[0] && sortedByGrowth[0].direction === 'improving') {
      const top = sortedByGrowth[0];
      const sign = top.totalDelta > 0 ? `+${top.totalDelta}` : `${top.totalDelta}`;
      insights.push(
        `ความก้าวหน้าเด่นชัด: "${top.nameTh}" ขยับขึ้น ${sign} ${top.unit} (เปลี่ยนแปลง ${Math.abs(top.percentChangeTotal)}%) เทียบกับการทดสอบครั้งแรก`
      );
    }

    // Shuttle run agility note
    const shuttle = itemTrends.shuttleRunSec;
    if (shuttle.direction === 'improving') {
      insights.push(
        `ความคล่องแคล่วว่องไว (วิ่งเก็บของ) ทำเวลาได้เร็วขึ้น ${Math.abs(shuttle.totalDelta)} วินาที สะท้อนถึงการทรงตัวและการเร่งความเร็วที่ดีขึ้น`
      );
    } else if (shuttle.direction === 'declining') {
      insights.push(
        `วิ่งเก็บของใช้เวลาเพิ่มขึ้น ${shuttle.totalDelta} วินาที ควรฝึกจังหวะสปริ้นต์และท่าหมุนกลับตัว (Change of direction drills)`
      );
    }
  }

  // Generate tailored training recommendations
  switch (weakestKey) {
    case 'sitUpReps':
      recommendations.push('เสริมสร้างกล้ามเนื้อแกนกลางลำตัว (Core Stability) ด้วยท่า Plank 30-45 วินาที 3 เซ็ต และ Hollow Body Hold เพื่อเพิ่มแรงกล้ามเนื้อหน้าท้อง');
      break;
    case 'pushUpReps':
      recommendations.push('เพิ่มความแข็งแรงของกล้ามเนื้อส่วนบนด้วยท่า Incline Push-up หรือ Knee Push-up โฟกัสฟอร์มให้ถูกต้อง 10-15 ครั้ง 3-4 เซ็ต');
      break;
    case 'verticalJumpCm':
      recommendations.push('พัฒนาพลังระเบิดของกล้ามเนื้อขา (Plyometrics) ด้วยท่า Squat Jumps, Box Jumps หรือ Calf Raises สัปดาห์ละ 2-3 ครั้ง');
      break;
    case 'flexibilityCm':
      recommendations.push('เพิ่มความยืดหยุ่นด้วยการยืดเหยียดกล้ามเนื้อแฮมสตริงและหลังส่วนล่าง (Hamstring & Lower Back Stretch) ค้างไว้ 20-30 วินาที วันละ 2 รอบเป็นประจำ');
      break;
    case 'shuttleRunSec':
      recommendations.push('ฝึกความคล่องตัวและการเปลี่ยนทิศทาง (Agility Drills) ด้วยการวิ่งกรวยซิกแซก (Cone Drills) และฝึกการย่อตัวถ่ายน้ำหนักขณะกลับตัว');
      break;
  }

  // Second recommendation based on overall score
  if (latestEval.totalScore < 60) {
    recommendations.push('แนะนำให้ออกกำลังกายแบบแอโรบิกและเวทเทรนนิ่งอย่างน้อย 3-4 วันต่อสัปดาห์ ครั้งละ 30-45 นาที เพื่อยกระดับสมรรถภาพทุกมิติอย่างสมดุล');
  } else {
    recommendations.push('รักษาวินัยการฝึกซ้อมต่อเนื่อง และประเมินซ้ำทุกๆ 3-4 สัปดาห์เพื่อติดตามแนวโน้มการปรับตัวของร่างกาย');
  }

  return {
    profile,
    totalTestsCount: records.length,
    firstDate: firstRec.date,
    latestDate: latestRec.date,
    currentTotalScore: latestEval.totalScore,
    scoreChangeFromStart,
    overallTrend,
    overallTrendLabelTh,
    itemTrends,
    strongestItem: {
      key: strongestKey,
      nameTh: TEST_DEFINITIONS[strongestKey].nameTh,
      score: highestScore,
    },
    weakestItem: {
      key: weakestKey,
      nameTh: TEST_DEFINITIONS[weakestKey].nameTh,
      score: lowestScore,
    },
    insights,
    recommendations,
  };
}
