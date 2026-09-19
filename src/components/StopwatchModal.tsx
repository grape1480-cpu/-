import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Check, Timer } from 'lucide-react';

interface StopwatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResult?: (testKey: 'sitUpReps' | 'pushUpReps' | 'shuttleRunSec', value: number) => void;
  initialMode?: 'situp_30' | 'pushup_30' | 'shuttle_run';
}

export const StopwatchModal: React.FC<StopwatchModalProps> = ({
  isOpen,
  onClose,
  onApplyResult,
  initialMode = 'shuttle_run',
}) => {
  const [activeTab, setActiveTab] = useState<'shuttle_run' | 'countdown_30' | 'countdown_60'>(
    initialMode === 'situp_30' || initialMode === 'pushup_30' ? 'countdown_30' : 'shuttle_run'
  );

  // Stopwatch state (for shuttle run)
  const [stopwatchMs, setStopwatchMs] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const stopwatchRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Countdown timer state (for 30s or 60s tests)
  const targetSeconds = activeTab === 'countdown_30' ? 30 : 60;
  const [countdownRemainingMs, setCountdownRemainingMs] = useState<number>(targetSeconds * 1000);
  const [isCountdownRunning, setIsCountdownRunning] = useState<boolean>(false);
  const countdownRef = useRef<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Web Audio synth for crisp beep cues without external audio assets
  const playBeep = (freq: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context may be restricted before user gesture
    }
  };

  // Stopwatch loop
  useEffect(() => {
    if (isStopwatchRunning) {
      lastTimeRef.current = performance.now();
      const loop = () => {
        const now = performance.now();
        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;
        setStopwatchMs((prev) => prev + delta);
        stopwatchRef.current = requestAnimationFrame(loop);
      };
      stopwatchRef.current = requestAnimationFrame(loop);
    } else if (stopwatchRef.current) {
      cancelAnimationFrame(stopwatchRef.current);
    }
    return () => {
      if (stopwatchRef.current) cancelAnimationFrame(stopwatchRef.current);
    };
  }, [isStopwatchRunning]);

  // Countdown loop
  useEffect(() => {
    if (isCountdownRunning) {
      lastTimeRef.current = performance.now();
      const loop = () => {
        const now = performance.now();
        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;
        setCountdownRemainingMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            setIsCountdownRunning(false);
            playBeep(880, 0.8); // finish beep
            return 0;
          }
          // Beep on last 3 seconds
          const prevSec = Math.ceil(prev / 1000);
          const nextSec = Math.ceil(next / 1000);
          if (nextSec <= 3 && nextSec > 0 && nextSec !== prevSec) {
            playBeep(440, 0.15);
          }
          return next;
        });
        countdownRef.current = requestAnimationFrame(loop);
      };
      countdownRef.current = requestAnimationFrame(loop);
    } else if (countdownRef.current) {
      cancelAnimationFrame(countdownRef.current);
    }
    return () => {
      if (countdownRef.current) cancelAnimationFrame(countdownRef.current);
    };
  }, [isCountdownRunning, soundEnabled]);

  // Reset countdown when tab changes
  useEffect(() => {
    setIsCountdownRunning(false);
    if (activeTab === 'countdown_30') {
      setCountdownRemainingMs(30 * 1000);
    } else if (activeTab === 'countdown_60') {
      setCountdownRemainingMs(60 * 1000);
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const formatStopwatch = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (ms: number) => {
    const sec = Math.ceil(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return { sec, tenths };
  };

  const handleApplyShuttleRun = () => {
    if (onApplyResult) {
      const sec = Math.round((stopwatchMs / 1000) * 100) / 100;
      onApplyResult('shuttleRunSec', sec);
      onClose();
    }
  };

  return (
    <div
      id="stopwatch-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        id="stopwatch-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">นาฬิกาช่วยทดสอบสมรรถภาพ</h3>
              <p className="text-xs text-slate-500">จับเวลาวิ่งเก็บของ หรือนับถอยหลังลุกนั่ง/ดันพื้น</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              id="toggle-sound-btn"
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'ปิดเสียงเตือน' : 'เปิดเสียงเตือน'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              id="close-stopwatch-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50 p-1.5 gap-1 text-xs font-medium">
          <button
            id="tab-shuttle-run"
            type="button"
            onClick={() => setActiveTab('shuttle_run')}
            className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all ${
              activeTab === 'shuttle_run'
                ? 'bg-white text-teal-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            วิ่งเก็บของ (จับเวลา)
          </button>
          <button
            id="tab-countdown-30"
            type="button"
            onClick={() => setActiveTab('countdown_30')}
            className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all ${
              activeTab === 'countdown_30'
                ? 'bg-white text-teal-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            นับถอยหลัง 30 วินาที
          </button>
          <button
            id="tab-countdown-60"
            type="button"
            onClick={() => setActiveTab('countdown_60')}
            className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all ${
              activeTab === 'countdown_60'
                ? 'bg-white text-teal-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            นับถอยหลัง 60 วินาที
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-center">
          {activeTab === 'shuttle_run' ? (
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Shuttle Run 4x10m Stopwatch
              </span>
              <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-slate-800 my-4 select-none">
                {formatStopwatch(stopwatchMs)}
              </div>
              <p className="text-xs text-slate-500 mb-6 max-w-xs">
                กดเริ่มเมื่อผู้ทดสอบออกตัว และกดหยุดเมื่อวางท่อนไม้ท่อนที่ 2 เสร็จสิ้น
              </p>

              <div className="flex items-center justify-center gap-3 w-full max-w-xs">
                <button
                  id="reset-stopwatch-btn"
                  type="button"
                  onClick={() => {
                    setIsStopwatchRunning(false);
                    setStopwatchMs(0);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> รีเซ็ต
                </button>
                <button
                  id="toggle-stopwatch-btn"
                  type="button"
                  onClick={() => {
                    if (!isStopwatchRunning) {
                      playBeep(523.25, 0.1);
                    }
                    setIsStopwatchRunning(!isStopwatchRunning);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 text-white shadow-sm transition-all ${
                    isStopwatchRunning
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {isStopwatchRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> หยุด
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" /> เริ่ม
                    </>
                  )}
                </button>
              </div>

              {stopwatchMs > 0 && !isStopwatchRunning && onApplyResult && (
                <button
                  id="apply-shuttle-result-btn"
                  type="button"
                  onClick={handleApplyShuttleRun}
                  className="mt-5 w-full max-w-xs py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  นำค่า {(stopwatchMs / 1000).toFixed(2)} วินาที ไปใส่แบบฟอร์ม
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                {activeTab === 'countdown_30' ? 'ลุกนั่ง / ดันพื้น (30 วินาที)' : 'การทดสอบ 60 วินาที'}
              </span>

              {/* Circular gauge styling */}
              <div className="relative my-4 flex items-center justify-center">
                <div
                  className={`w-40 h-40 rounded-full border-8 flex flex-col items-center justify-center transition-colors ${
                    countdownRemainingMs <= 5000 && countdownRemainingMs > 0
                      ? 'border-rose-400 bg-rose-50/50'
                      : countdownRemainingMs === 0
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-teal-500 bg-teal-50/30'
                  }`}
                >
                  <div className="font-mono text-5xl font-bold tracking-tight text-slate-800">
                    {formatCountdown(countdownRemainingMs).sec}
                  </div>
                  <span className="text-xs text-slate-500 font-medium mt-1">วินาที</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-6">
                มีเสียงสัญญาณปิ๊บเตือน 3 วินาทีสุดท้าย และสัญญาณหยุดยาวเมื่อหมดเวลา
              </p>

              <div className="flex items-center justify-center gap-3 w-full max-w-xs">
                <button
                  id="reset-countdown-btn"
                  type="button"
                  onClick={() => {
                    setIsCountdownRunning(false);
                    setCountdownRemainingMs(targetSeconds * 1000);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> รีเซ็ต ({targetSeconds}s)
                </button>
                <button
                  id="toggle-countdown-btn"
                  type="button"
                  onClick={() => {
                    if (countdownRemainingMs <= 0) {
                      setCountdownRemainingMs(targetSeconds * 1000);
                    }
                    if (!isCountdownRunning) {
                      playBeep(659.25, 0.15);
                    }
                    setIsCountdownRunning(!isCountdownRunning);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 text-white shadow-sm transition-all ${
                    isCountdownRunning
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {isCountdownRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> หยุด
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" /> เริ่มนับถอยหลัง
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
