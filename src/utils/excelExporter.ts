import * as XLSX from 'xlsx';
import { FitnessRecord, OverallTrendReport, UserProfile } from '../types';
import { TEST_DEFINITIONS, TEST_KEYS, getBenchmark, RATING_CONFIG } from '../data/standards';
import { evaluateRecord } from './fitnessEvaluator';

export function exportFitnessToExcel(
  profile: UserProfile,
  records: FitnessRecord[],
  report: OverallTrendReport | null
) {
  const wb = XLSX.utils.book_new();

  const sortedAsc = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // --- SHEET 1: ข้อมูลและประวัติการทดสอบ (Test Records) ---
  const sheet1Data: (string | number)[][] = [
    ['รายงานบันทึกและประเมินผลการทดสอบสมรรถภาพทางกาย (5 รายการมาตรฐาน)'],
    ['อ้างอิงเกณฑ์มาตรฐาน: สำนักวิทยาศาสตร์การกีฬา กรมพลศึกษา กระทรวงการท่องเที่ยวและกีฬา'],
    [],
    ['ข้อมูลผู้รับการทดสอบ'],
    ['ชื่อ-นามสกุล', profile.name, 'เพศ', profile.gender === 'male' ? 'ชาย' : 'หญิง'],
    [
      'อายุ',
      `${profile.age} ปี`,
      'ส่วนสูง / น้ำหนัก',
      `${profile.heightCm || '-'} ซม. / ${profile.weightKg || '-'} กก.`,
    ],
    [
      'ดัชนีมวลกาย (BMI)',
      profile.heightCm && profile.weightKg
        ? (profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)
        : '-',
      'วันที่ส่งออกข้อมูล',
      new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    ],
    [],
    [
      'ครั้งที่',
      'วันที่ทดสอบ',
      'น้ำหนัก (กก.)',
      '1. ลุกนั่ง (ครั้ง)',
      'เกณฑ์ลุกนั่ง',
      '2. ดันพื้น (ครั้ง)',
      'เกณฑ์ดันพื้น',
      '3. กระโดดสูง (ซม.)',
      'เกณฑ์กระโดดสูง',
      '4. ความอ่อนตัว (ซม.)',
      'เกณฑ์ความอ่อนตัว',
      '5. วิ่งเก็บของ (วินาที)',
      'เกณฑ์วิ่งเก็บของ',
      'คะแนนรวม (เต็ม 100)',
      'ระดับสมรรถภาพรวม',
      'หมายเหตุ',
    ],
  ];

  sortedAsc.forEach((rec, idx) => {
    const evaluated = evaluateRecord(rec, profile);
    sheet1Data.push([
      idx + 1,
      rec.date,
      rec.bodyWeightKg || '-',
      rec.values.sitUpReps,
      evaluated.evaluations.sitUpReps.ratingLabelTh,
      rec.values.pushUpReps,
      evaluated.evaluations.pushUpReps.ratingLabelTh,
      rec.values.verticalJumpCm,
      evaluated.evaluations.verticalJumpCm.ratingLabelTh,
      rec.values.flexibilityCm,
      evaluated.evaluations.flexibilityCm.ratingLabelTh,
      rec.values.shuttleRunSec,
      evaluated.evaluations.shuttleRunSec.ratingLabelTh,
      evaluated.totalScore,
      evaluated.overallRatingTh,
      rec.notes || '',
    ]);
  });

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

  // Set column widths for Sheet 1
  ws1['!cols'] = [
    { wch: 8 },  // ครั้งที่
    { wch: 14 }, // วันที่
    { wch: 14 }, // น้ำหนัก
    { wch: 16 }, // ลุกนั่ง
    { wch: 14 }, // เกณฑ์ลุกนั่ง
    { wch: 16 }, // ดันพื้น
    { wch: 14 }, // เกณฑ์ดันพื้น
    { wch: 18 }, // กระโดดสูง
    { wch: 16 }, // เกณฑ์กระโดดสูง
    { wch: 18 }, // ความอ่อนตัว
    { wch: 16 }, // เกณฑ์ความอ่อนตัว
    { wch: 20 }, // วิ่งเก็บของ
    { wch: 16 }, // เกณฑ์วิ่งเก็บของ
    { wch: 18 }, // คะแนนรวม
    { wch: 18 }, // ระดับรวม
    { wch: 30 }, // หมายเหตุ
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'ประวัติการทดสอบ');

  // --- SHEET 2: สรุปการวิเคราะห์แนวโน้ม (Trend Analysis Summary) ---
  if (report) {
    const sheet2Data: (string | number)[][] = [
      ['สรุปผลการวิเคราะห์แนวโน้มสมรรถภาพทางกาย (Automated Trend Analysis)'],
      ['ผู้รับการทดสอบ:', profile.name, 'จำนวนครั้งที่ทดสอบ:', `${report.totalTestsCount} ครั้ง`],
      [
        'คะแนนรวมปัจจุบัน:',
        `${report.currentTotalScore} / 100`,
        'ทิศทางภาพรวม:',
        report.overallTrendLabelTh,
      ],
      [
        'การเปลี่ยนแปลงจากครั้งแรก:',
        `${report.scoreChangeFromStart >= 0 ? '+' : ''}${report.scoreChangeFromStart} คะแนน`,
        'ช่วงเวลาทดสอบ:',
        `${report.firstDate} ถึง ${report.latestDate}`,
      ],
      [],
      [
        'แบบทดสอบ',
        'หน่วย',
        'ทิศทางที่ดี',
        'ค่าครั้งแรก',
        'ค่าครั้งก่อนหน้า',
        'ค่าล่าสุด',
        'ผลต่างรวม (Delta)',
        '% การเปลี่ยนแปลง',
        'ทิศทางแนวโน้ม',
        'คะแนนล่าสุด (0-100)',
        'ระดับเกณฑ์มาตรฐาน',
      ],
    ];

    TEST_KEYS.forEach((key) => {
      const def = TEST_DEFINITIONS[key];
      const trend = report.itemTrends[key];
      sheet2Data.push([
        def.nameTh,
        def.unit,
        def.higherIsBetter ? 'ยิ่งมากยิ่งดี' : 'ยิ่งน้อยยิ่งดี',
        trend.firstValue,
        trend.previousValue,
        trend.latestValue,
        trend.totalDelta,
        `${trend.percentChangeTotal}%`,
        trend.directionLabelTh,
        trend.currentScore,
        trend.currentRatingLabelTh,
      ]);
    });

    sheet2Data.push([]);
    sheet2Data.push(['ข้อค้นพบและพัฒนาการสำคัญ:']);
    report.insights.forEach((ins) => {
      sheet2Data.push(['•', ins]);
    });

    sheet2Data.push([]);
    sheet2Data.push(['ข้อเสนอแนะโปรแกรมการฝึกซ้อม:']);
    report.recommendations.forEach((rec) => {
      sheet2Data.push(['•', rec]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    ws2['!cols'] = [
      { wch: 26 }, // แบบทดสอบ
      { wch: 10 }, // หน่วย
      { wch: 16 }, // ทิศทางที่ดี
      { wch: 14 }, // ค่าครั้งแรก
      { wch: 16 }, // ค่าครั้งก่อนหน้า
      { wch: 14 }, // ค่าล่าสุด
      { wch: 18 }, // ผลต่างรวม
      { wch: 18 }, // % เปลี่ยนแปลง
      { wch: 16 }, // ทิศทาง
      { wch: 18 }, // คะแนน
      { wch: 18 }, // ระดับเกณฑ์
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'วิเคราะห์แนวโน้ม');
  }

  // --- SHEET 3: เกณฑ์มาตรฐานอ้างอิง (Benchmarks Reference) ---
  const benchData: (string | number)[][] = [
    ['ตารางเกณฑ์มาตรฐานสมรรถภาพทางกาย (สำนักวิทยาศาสตร์การกีฬา กรมพลศึกษา)'],
    [`สำหรับ: ${profile.gender === 'male' ? 'เพศชาย' : 'เพศหญิง'} ช่วงอายุ ${profile.age} ปี`],
    [],
    [
      'แบบทดสอบ',
      'หน่วย',
      'ดีมาก (Excellent)',
      'ดี (Good)',
      'ปานกลาง (Average)',
      'พอใช้ (Fair)',
      'ต้องปรับปรุง (Poor)',
    ],
  ];

  TEST_KEYS.forEach((key) => {
    const def = TEST_DEFINITIONS[key];
    const bench = getBenchmark(key, profile.gender, profile.age);
    if (def.higherIsBetter) {
      benchData.push([
        def.nameTh,
        def.unit,
        `>= ${bench.t0}`,
        `${bench.t1} - ${bench.t0 - 1}`,
        `${bench.t2} - ${bench.t1 - 1}`,
        `${bench.t3} - ${bench.t2 - 1}`,
        `< ${bench.t3}`,
      ]);
    } else {
      // lower is better
      benchData.push([
        def.nameTh,
        def.unit,
        `<= ${bench.t0}`,
        `${bench.t0 + 0.01} - ${bench.t1}`,
        `${bench.t1 + 0.01} - ${bench.t2}`,
        `${bench.t2 + 0.01} - ${bench.t3}`,
        `> ${bench.t3}`,
      ]);
    }
  });

  const ws3 = XLSX.utils.aoa_to_sheet(benchData);
  ws3['!cols'] = [
    { wch: 24 },
    { wch: 10 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'เกณฑ์มาตรฐาน');

  // Write and trigger download as .xlsx
  const safeName = profile.name.replace(/[/\\?%*:|"<>]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `ผลทดสอบสมรรถภาพทางกาย_${safeName}_${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);
}
