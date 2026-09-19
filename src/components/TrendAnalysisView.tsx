import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Award,
  Activity,
  Dumbbell,
  Flame,
  Zap,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  BarChart2,
  GitCompare,
  FileSpreadsheet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  FitnessRecord,
  OverallTrendReport,
  TestItemKey,
  UserProfile,
} from '../types';
import { TEST_DEFINITIONS, TEST_KEYS, RATING_CONFIG } from '../data/standards';
import { evaluateRecord } from '../utils/fitnessEvaluator';

interface TrendAnalysisViewProps {
  report: OverallTrendReport;
  records: FitnessRecord[];
  profile: UserProfile;
  onOpenNewTestModal: () => void;
  onExportExcel?: () => void;
}

export const TrendAnalysisView: React.FC<TrendAnalysisViewProps> = ({
  report,
  records,
  profile,
  onOpenNewTestModal,
  onExportExcel,
}) => {
  // Chart selection mode
  const [selectedChartMetric, setSelectedChartMetric] = useState<'totalScore' | TestItemKey>('totalScore');
  const [showComparison, setShowComparison] = useState<boolean>(records.length >= 2);
  const [compareAId, setCompareAId] = useState<string>(records[0]?.id || '');
  const [compareBId, setCompareBId] = useState<string>(records[records.length - 1]?.id || '');

  // Sorted records by date
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Prepare data for line chart
  const lineChartData = sortedRecords.map((r, idx) => {
    const evaluated = evaluateRecord(r, profile);
    const dateFormatted = new Date(r.date).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });

    return {
      name: dateFormatted,
      fullDate: r.date,
      session: `ครั้งที่ ${idx + 1}`,
      totalScore: evaluated.totalScore,
      sitUpReps: r.values.sitUpReps,
      pushUpReps: r.values.pushUpReps,
      verticalJumpCm: r.values.verticalJumpCm,
      flexibilityCm: r.values.flexibilityCm,
      shuttleRunSec: r.values.shuttleRunSec,
      ratingLabel: evaluated.overallRatingTh,
    };
  });

  // Prepare radar chart data from latest record
  const latestRecord = sortedRecords[sortedRecords.length - 1];
  const latestEvaluated = evaluateRecord(latestRecord, profile);
  const firstRecord = sortedRecords[0];
  const firstEvaluated = evaluateRecord(firstRecord, profile);

  const radarData = [
    {
      subject: 'ลุกนั่ง (ท้อง/แกนกลาง)',
      score: latestEvaluated.evaluations.sitUpReps.normalizedScore,
      baselineScore: firstEvaluated.evaluations.sitUpReps.normalizedScore,
      benchmark: 75,
    },
    {
      subject: 'ดันพื้น (กล้ามเนื้อส่วนบน)',
      score: latestEvaluated.evaluations.pushUpReps.normalizedScore,
      baselineScore: firstEvaluated.evaluations.pushUpReps.normalizedScore,
      benchmark: 75,
    },
    {
      subject: 'กระโดดสูง (พลังระเบิดขา)',
      score: latestEvaluated.evaluations.verticalJumpCm.normalizedScore,
      baselineScore: firstEvaluated.evaluations.verticalJumpCm.normalizedScore,
      benchmark: 75,
    },
    {
      subject: 'ความอ่อนตัว (หลัง/ต้นขา)',
      score: latestEvaluated.evaluations.flexibilityCm.normalizedScore,
      baselineScore: firstEvaluated.evaluations.flexibilityCm.normalizedScore,
      benchmark: 75,
    },
    {
      subject: 'วิ่งเก็บของ (ความคล่องตัว)',
      score: latestEvaluated.evaluations.shuttleRunSec.normalizedScore,
      baselineScore: firstEvaluated.evaluations.shuttleRunSec.normalizedScore,
      benchmark: 75,
    },
  ];

  // Helper for trend icons & badges
  const renderTrendBadge = (direction: 'improving' | 'stable' | 'declining') => {
    switch (direction) {
      case 'improving':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            พัฒนาขึ้น
          </span>
        );
      case 'declining':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            ลดลง
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700">
            <Minus className="w-3.5 h-3.5 text-slate-500" />
            คงที่
          </span>
        );
    }
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

  // Compare sessions data
  const recordA = records.find((r) => r.id === compareAId) || records[0];
  const recordB = records.find((r) => r.id === compareBId) || records[records.length - 1];
  const evalA = recordA ? evaluateRecord(recordA, profile) : null;
  const evalB = recordB ? evaluateRecord(recordB, profile) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner: Overall Score & Trend Summary */}
      <div
        id="overall-score-card"
        className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Overall Score Circle & Level */}
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center shrink-0">
              <div
                className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center ${
                  report.currentTotalScore >= 80
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950'
                    : report.currentTotalScore >= 65
                    ? 'border-teal-500 bg-teal-50/40 text-teal-950'
                    : report.currentTotalScore >= 50
                    ? 'border-amber-500 bg-amber-50/40 text-amber-950'
                    : 'border-rose-500 bg-rose-50/40 text-rose-950'
                }`}
              >
                <span className="text-3xl font-extrabold tracking-tight">
                  {report.currentTotalScore}
                </span>
                <span className="text-[11px] font-medium text-slate-500">เต็ม 100</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  ระดับสมรรถภาพภาพรวม
                </span>
                {renderTrendBadge(report.overallTrend)}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                {latestEvaluated.overallRatingTh}
                <span className="text-xs font-normal text-slate-500">
                  (ประเมินตามเกณฑ์มาตรฐาน กรมพลศึกษา)
                </span>
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                ทดสอบสะสมแล้ว <span className="font-semibold text-slate-800">{report.totalTestsCount} ครั้ง</span>
                {report.totalTestsCount > 1 && (
                  <>
                    {' '}• ผลต่างจากครั้งแรก:{' '}
                    <span
                      className={`font-semibold ${
                        report.scoreChangeFromStart >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {report.scoreChangeFromStart >= 0 ? `+${report.scoreChangeFromStart}` : report.scoreChangeFromStart} คะแนน
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right: Quick Highlights (Strongest & Weakest) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 sm:w-48 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
                <Award className="w-4 h-4" />
                จุดเด่นที่สุด
              </div>
              <div className="text-sm font-bold text-slate-800 truncate">
                {report.strongestItem.nameTh}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                คะแนน {report.strongestItem.score}/100
              </div>
            </div>

            <div className="flex-1 sm:w-48 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mb-1">
                <AlertCircle className="w-4 h-4" />
                จุดที่ควรพัฒนา
              </div>
              <div className="text-sm font-bold text-slate-800 truncate">
                {report.weakestItem.nameTh}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                คะแนน {report.weakestItem.score}/100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Diagnostic Insights & Sport Science Recommendations */}
      <div
        id="automated-insights-card"
        className="rounded-2xl border border-teal-200/80 bg-linear-to-br from-teal-50/70 via-white to-sky-50/50 p-5 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-teal-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-base text-slate-800">
              การวิเคราะห์แนวโน้มและข้อแนะนำอัตโนมัติ (Automated Insights)
            </h3>
          </div>
          {onExportExcel && (
            <button
              id="trend-export-excel-btn"
              type="button"
              onClick={onExportExcel}
              className="self-start sm:self-auto py-1.5 px-3 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="ส่งออกผลการวิเคราะห์และประวัติเป็นไฟล์ Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              ส่งออก Excel (.xlsx)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insights */}
          <div className="space-y-2 bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              ข้อค้นพบและพัฒนาการ
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {report.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="space-y-2 bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              โปรแกรมฝึกซ้อมแนะนำเพื่อพัฒนาจุดอ่อน
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 5 Test Items Automatic Trend Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>สรุปแนวโน้มรายแบบทดสอบ (5 รายการครบถ้วน)</span>
          </h3>
          <span className="text-xs text-slate-500">
            ผลล่าสุด ณ {new Date(report.latestDate).toLocaleDateString('th-TH')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEST_KEYS.map((key) => {
            const item = report.itemTrends[key];
            const def = TEST_DEFINITIONS[key];
            const ratingStyle = RATING_CONFIG[item.currentRating];
            const isImproved = item.direction === 'improving';
            const isDeclined = item.direction === 'declining';

            return (
              <div
                key={key}
                id={`trend-summary-card-${key}`}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        {getTestIcon(key)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{def.nameTh}</h4>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                          {def.categoryTh}
                        </span>
                      </div>
                    </div>
                    {renderTrendBadge(item.direction)}
                  </div>

                  {/* Value & Rating */}
                  <div className="my-2.5 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold text-slate-900">{item.latestValue}</span>
                      <span className="text-xs font-medium text-slate-500 ml-1">{item.unit}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${ratingStyle.bgBadge}`}
                    >
                      เกณฑ์: {item.currentRatingLabelTh}
                    </span>
                  </div>

                  {/* Progress Bar Score */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>คะแนนมาตรฐาน</span>
                      <span className="font-semibold text-slate-700">{item.currentScore} / 100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.currentScore}%`,
                          backgroundColor: ratingStyle.color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footnotes: Delta from Baseline & Slope */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    เทียบครั้งแรก ({item.firstValue} {item.unit}):
                  </span>
                  <span
                    className={`font-semibold ${
                      isImproved
                        ? 'text-emerald-600'
                        : isDeclined
                        ? 'text-rose-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {item.totalDelta > 0 ? `+${item.totalDelta}` : item.totalDelta} {item.unit} (
                    {item.percentChangeTotal > 0 ? `+${item.percentChangeTotal}%` : `${item.percentChangeTotal}%`})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Section: Line Chart & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Progression Timeline Line Chart */}
        <div
          id="progression-line-chart-card"
          className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal-600" />
                กราฟเส้นแนวโน้มพัฒนาการตามช่วงเวลา (Timeline Trend)
              </h3>
              <p className="text-xs text-slate-500">
                วิเคราะห์การเปลี่ยนแปลงในแต่ละการทดสอบพร้อมทิศทาง
              </p>
            </div>

            {/* Metric Selector Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 whitespace-nowrap">แสดงข้อมูล:</label>
              <select
                id="select-chart-metric"
                value={selectedChartMetric}
                onChange={(e) =>
                  setSelectedChartMetric(e.target.value as 'totalScore' | TestItemKey)
                }
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="totalScore">คะแนนสมรรถภาพรวม (0-100 คะแนน)</option>
                <option value="sitUpReps">1. ลุกนั่ง (ครั้ง)</option>
                <option value="pushUpReps">2. ดันพื้น (ครั้ง)</option>
                <option value="verticalJumpCm">3. กระโดดสูง (ซม.)</option>
                <option value="flexibilityCm">4. ความอ่อนตัว (ซม.)</option>
                <option value="shuttleRunSec">5. วิ่งเก็บของ (วินาที - ยิ่งน้อยยิ่งดี)</option>
              </select>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  domain={
                    selectedChartMetric === 'totalScore'
                      ? [0, 100]
                      : selectedChartMetric === 'shuttleRunSec'
                      ? ['dataMin - 1', 'dataMax + 1']
                      : ['auto', 'auto']
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(value: unknown) => {
                    const num = Number(value);
                    if (selectedChartMetric === 'totalScore') {
                      return [`${num} คะแนน`, 'คะแนนสมรรถภาพรวม'];
                    }
                    const def = TEST_DEFINITIONS[selectedChartMetric as TestItemKey];
                    return [`${num} ${def.unit}`, def.nameTh];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.session} (${data.fullDate})`;
                    }
                    return label;
                  }}
                />
                {selectedChartMetric === 'totalScore' && (
                  <ReferenceLine
                    y={75}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: 'เกณฑ์ดี (75+)',
                      position: 'insideTopRight',
                      fill: '#10b981',
                      fontSize: 10,
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey={selectedChartMetric}
                  name={
                    selectedChartMetric === 'totalScore'
                      ? 'คะแนนรวม'
                      : TEST_DEFINITIONS[selectedChartMetric as TestItemKey].nameTh
                  }
                  stroke={
                    selectedChartMetric === 'totalScore'
                      ? '#0d9488'
                      : selectedChartMetric === 'shuttleRunSec'
                      ? '#0284c7'
                      : '#6366f1'
                  }
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
            <span>* วิ่งเก็บของ ยิ่งกราฟลดต่ำลง ยิ่งแสดงถึงเวลาที่เร็วขึ้นและคล่องแคล่วขึ้น</span>
            <button
              type="button"
              onClick={onOpenNewTestModal}
              className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
            >
              + บันทึกครั้งใหม่
            </button>
          </div>
        </div>

        {/* Right 1 Col: Radar Chart (5-Axis Balance) */}
        <div
          id="radar-balance-card"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-0.5">
              สมดุลสมรรถภาพ 5 มิติ (Radar Chart)
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              เปรียบเทียบคะแนนสมดุลทั้ง 5 ด้าน เทียบเกณฑ์มาตรฐาน (75 คะแนน)
            </p>
          </div>

          <div className="h-64 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                />
                <Radar
                  name="ครั้งล่าสุด"
                  dataKey="score"
                  stroke="#0d9488"
                  fill="#0d9488"
                  fillOpacity={0.4}
                />
                {sortedRecords.length > 1 && (
                  <Radar
                    name="ครั้งแรกเริ่ม"
                    dataKey="baselineScore"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.15}
                    strokeDasharray="3 3"
                  />
                )}
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconSize={8}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                  }}
                  formatter={(val: unknown) => [`${val} คะแนน`, 'คะแนน']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-100">
            รูปทรงยิ่งแผ่กว้างและสมมาตร สะท้อนถึงความพร้อมของร่างกายทุกมิติ
          </p>
        </div>
      </div>

      {/* Compare Sessions Mode (Two Points in Time) */}
      {records.length >= 2 && (
        <div
          id="compare-sessions-card"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  เปรียบเทียบผลการทดสอบ 2 ช่วงเวลา (Side-by-Side Comparison)
                </h3>
                <p className="text-xs text-slate-500">
                  เลือก 2 ครั้งที่ต้องการเปรียบเทียบ เพื่อดูผลพัฒนาการ (Delta) แต่ละแบบทดสอบ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                id="select-compare-session-a"
                value={compareAId}
                onChange={(e) => setCompareAId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
              >
                {sortedRecords.map((r, i) => (
                  <option key={r.id} value={r.id}>
                    ครั้งที่ {i + 1}: {new Date(r.date).toLocaleDateString('th-TH')}
                  </option>
                ))}
              </select>

              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

              <select
                id="select-compare-session-b"
                value={compareBId}
                onChange={(e) => setCompareBId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
              >
                {sortedRecords.map((r, i) => (
                  <option key={r.id} value={r.id}>
                    ครั้งที่ {i + 1}: {new Date(r.date).toLocaleDateString('th-TH')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {evalA && evalB && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-y border-slate-200">
                    <th className="py-2.5 px-3 font-semibold">แบบทดสอบสมรรถภาพ</th>
                    <th className="py-2.5 px-3 font-semibold">
                      ช่วงแรก ({new Date(evalA.date).toLocaleDateString('th-TH')})
                    </th>
                    <th className="py-2.5 px-3 font-semibold">
                      ช่วงเปรียบเทียบ ({new Date(evalB.date).toLocaleDateString('th-TH')})
                    </th>
                    <th className="py-2.5 px-3 font-semibold">ผลต่าง (Delta)</th>
                    <th className="py-2.5 px-3 font-semibold">การเปลี่ยนแปลง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TEST_KEYS.map((key) => {
                    const def = TEST_DEFINITIONS[key];
                    const valA = recordA.values[key];
                    const valB = recordB.values[key];
                    const delta = Math.round((valB - valA) * 100) / 100;
                    const isPositive = def.higherIsBetter ? delta > 0 : delta < 0;
                    const isZero = delta === 0;

                    return (
                      <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {def.nameTh}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          <span className="font-bold">{valA}</span> {def.unit}{' '}
                          <span className="text-[11px] text-slate-400">
                            ({evalA.evaluations[key].ratingLabelTh})
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          <span className="font-bold">{valB}</span> {def.unit}{' '}
                          <span className="text-[11px] text-slate-400">
                            ({evalB.evaluations[key].ratingLabelTh})
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-bold ${
                              isZero
                                ? 'text-slate-500'
                                : isPositive
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {delta > 0 ? `+${delta}` : delta} {def.unit}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {isZero ? (
                            <span className="text-slate-500 font-medium">คงเดิม</span>
                          ) : isPositive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                              <TrendingUp className="w-3.5 h-3.5" /> ดีขึ้น
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full">
                              <TrendingDown className="w-3.5 h-3.5" /> ลดลง
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Overall Score Row */}
                  <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                    <td className="py-3 px-3 text-slate-900">คะแนนสมรรถภาพรวม (เต็ม 100)</td>
                    <td className="py-3 px-3 text-slate-900">
                      {evalA.totalScore} คะแนน ({evalA.overallRatingTh})
                    </td>
                    <td className="py-3 px-3 text-slate-900">
                      {evalB.totalScore} คะแนน ({evalB.overallRatingTh})
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={
                          evalB.totalScore - evalA.totalScore >= 0
                            ? 'text-emerald-600 font-bold'
                            : 'text-rose-600 font-bold'
                        }
                      >
                        {evalB.totalScore - evalA.totalScore >= 0
                          ? `+${evalB.totalScore - evalA.totalScore}`
                          : evalB.totalScore - evalA.totalScore}{' '}
                        คะแนน
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {evalB.totalScore > evalA.totalScore ? (
                        <span className="text-emerald-700">พัฒนาขึ้น +{evalB.totalScore - evalA.totalScore}</span>
                      ) : evalB.totalScore < evalA.totalScore ? (
                        <span className="text-rose-700">ลดลง {evalB.totalScore - evalA.totalScore}</span>
                      ) : (
                        <span className="text-slate-500">เท่าเดิม</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
