import { useAppSelector, useAppDispatch, selectRing, triggerSomethingHurts, clearSafetyHold } from '@smackgym/shared';
import { Play, ShieldAlert, Flame, Activity, Zap, CheckCircle2, HeartPulse, User } from 'lucide-react';

export default function App() {
  const dispatch = useAppDispatch();
  const dailyHome = useAppSelector((state) => state.dailyHome);
  const workout = useAppSelector((state) => state.workout);
  const auth = useAppSelector((state) => state.auth);

  const { rings, nextMove, selectedRing } = dailyHome;
  const isPainHold = workout.isPainSafetyHoldActive;

  return (
    <div className="min-h-screen bg-[#101212] text-white flex flex-col font-sans">
      {/* 1. Master Top Navigation Bar */}
      <header className="border-b border-[#222626] bg-[#101212]/95 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#C7FF00] rounded flex items-center justify-center font-anton text-[#101212] text-xl font-bold tracking-wider">
            S
          </div>
          <span className="font-anton text-2xl tracking-wider text-white">
            SMACK<span className="text-[#C7FF00]">GYM</span>
          </span>
          <span className="ml-2 text-xs bg-[#222626] text-[#C7FF00] font-semibold px-2 py-0.5 rounded border border-[#C7FF00]/20">
            DAILY HOME v4
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-400 bg-[#1A1D1D] px-3 py-1.5 rounded-full border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span>API Online</span>
          </div>

          <div className="flex items-center space-x-2 bg-[#222626] px-3 py-1.5 rounded-lg border border-gray-800 text-sm">
            <User className="w-4 h-4 text-[#C7FF00]" />
            <span className="font-medium text-gray-200">
              {auth.user?.fullName || 'Athlete Mode'}
            </span>
            <span className="text-xs bg-[#C7FF00]/10 text-[#C7FF00] px-1.5 py-0.5 rounded font-mono font-bold">
              18+
            </span>
          </div>
        </div>
      </header>

      {/* 2. Critical Safety Alert Banner (if "Something hurts" triggered) */}
      {isPainHold && (
        <div className="bg-[#FF4B4B] text-white px-6 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-white animate-bounce" />
            <div>
              <span className="font-bold text-sm uppercase tracking-wide">
                Active Clinical Safety Hold Triggered:
              </span>
              <span className="ml-2 text-xs opacity-90">
                {workout.activePainHoldDetails?.affectedBodyPart} — {workout.activePainHoldDetails?.reasonCode}. Rest timers and loaded compound lifts are locked.
              </span>
            </div>
          </div>
          <button
            onClick={() => dispatch(clearSafetyHold())}
            className="text-xs bg-black/40 hover:bg-black/60 px-3 py-1 rounded font-semibold transition"
          >
            Clear Hold
          </button>
        </div>
      )}

      {/* 3. Main Dashboard Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Welcome & Motivational Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-anton text-4xl sm:text-5xl text-white tracking-wide">
              TODAY'S <span className="text-[#C7FF00]">READINESS</span> & LOAD
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Deterministic Performance Engine • Autoregulated volume based on your recovery twin
            </p>
          </div>

          <button
            onClick={() =>
              dispatch(
                triggerSomethingHurts({
                  affectedBodyPart: 'Left Shoulder (Anterior Deltoid)',
                  reasonCode: 'SH_001_SHARP_PAIN',
                  notes: 'Pinching pain reported during warmup bench press.',
                })
              )
            }
            className="flex items-center space-x-2 bg-[#FF4B4B]/10 hover:bg-[#FF4B4B]/20 text-[#FF4B4B] border border-[#FF4B4B]/30 px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider self-start sm:self-auto"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Simulate Pain Hold</span>
          </button>
        </div>

        {/* 4. The 5 Core Rings of Daily Home v4 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Ring 1: Readiness Score */}
          <div
            onClick={() => dispatch(selectRing('readiness'))}
            className={`cursor-pointer bg-[#1A1D1D] p-5 rounded-xl border transition-all ${
              selectedRing === 'readiness' ? 'border-[#C7FF00] shadow-[0_0_15px_rgba(199,255,0,0.2)]' : 'border-[#2E3434] hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-medium">
              <span>READINESS</span>
              <Activity className="w-4 h-4 text-[#C7FF00]" />
            </div>
            <div className="font-anton text-4xl text-[#C7FF00]">
              {rings.readinessScore}%
            </div>
            <div className="text-[11px] text-gray-400 mt-2 font-medium">
              Optimal Training Zone
            </div>
          </div>

          {/* Ring 2: Weekly Work */}
          <div
            onClick={() => dispatch(selectRing('weeklyWork'))}
            className={`cursor-pointer bg-[#1A1D1D] p-5 rounded-xl border transition-all ${
              selectedRing === 'weeklyWork' ? 'border-[#C7FF00] shadow-[0_0_15px_rgba(199,255,0,0.2)]' : 'border-[#2E3434] hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-medium">
              <span>WEEKLY WORK</span>
              <Zap className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="font-anton text-4xl text-white">
              {rings.weeklyWorkScore}%
            </div>
            <div className="text-[11px] text-gray-400 mt-2 font-medium">
              3 of 5 Sessions Done
            </div>
          </div>

          {/* Ring 3: Safe Streak */}
          <div
            onClick={() => dispatch(selectRing('streak'))}
            className={`cursor-pointer bg-[#1A1D1D] p-5 rounded-xl border transition-all ${
              selectedRing === 'streak' ? 'border-[#C7FF00] shadow-[0_0_15px_rgba(199,255,0,0.2)]' : 'border-[#2E3434] hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-medium">
              <span>SAFE STREAK</span>
              <Flame className="w-4 h-4 text-[#FF4B4B]" />
            </div>
            <div className="font-anton text-4xl text-white">
              {rings.safeStreakDays} <span className="text-sm font-sans text-gray-400 font-normal">DAYS</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-2 font-medium">
              Zero Unsafe Overloads
            </div>
          </div>

          {/* Ring 4: Food Intelligence */}
          <div
            onClick={() => dispatch(selectRing('food'))}
            className={`cursor-pointer bg-[#1A1D1D] p-5 rounded-xl border transition-all ${
              selectedRing === 'food' ? 'border-[#C7FF00] shadow-[0_0_15px_rgba(199,255,0,0.2)]' : 'border-[#2E3434] hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-medium">
              <span>FUEL / MACROS</span>
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="font-anton text-4xl text-white">
              {rings.foodScore}%
            </div>
            <div className="text-[11px] text-gray-400 mt-2 font-medium">
              142g Protein Logged
            </div>
          </div>

          {/* Ring 5: Habit / Recovery */}
          <div
            onClick={() => dispatch(selectRing('habit'))}
            className={`cursor-pointer bg-[#1A1D1D] p-5 rounded-xl border transition-all ${
              selectedRing === 'habit' ? 'border-[#C7FF00] shadow-[0_0_15px_rgba(199,255,0,0.2)]' : 'border-[#2E3434] hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-medium">
              <span>HABIT / REST</span>
              <HeartPulse className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div className="font-anton text-4xl text-white">
              {rings.habitRecoveryScore}%
            </div>
            <div className="text-[11px] text-gray-400 mt-2 font-medium">
              7h 45m Sleep Score
            </div>
          </div>
        </div>

        {/* 5. Recommended "Next Move" Hero Action */}
        {nextMove && (
          <div className="bg-gradient-to-r from-[#1A1D1D] to-[#222626] border border-[#2E3434] p-6 sm:p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C7FF00]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#C7FF00] uppercase tracking-wider bg-[#C7FF00]/10 px-3 py-1 rounded-full border border-[#C7FF00]/20">
                  <span>NEXT MOVE</span>
                  <span>•</span>
                  <span>{nextMove.estimatedMinutes} MINS</span>
                </div>
                <h2 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
                  {nextMove.title}
                </h2>
                <p className="text-gray-400 text-sm max-w-xl">
                  {nextMove.subtitle}. Autoregulated load targeting chest and triceps hypertrophy with minimal shoulder strain.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button className="bg-[#C7FF00] hover:bg-[#B2E600] text-[#101212] font-anton text-lg px-8 py-3.5 rounded-xl flex items-center space-x-2 transition shadow-[0_4px_20px_rgba(199,255,0,0.3)]">
                  <Play className="w-5 h-5 fill-current" />
                  <span>START WORKOUT</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. System Architecture & Compliance Footer Card */}
        <div className="bg-[#141616] border border-[#222626] p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C7FF00]"></div>
            <span>
              <strong>Zero-SQL Architecture:</strong> Powered by MongoDB 8.0 & Redis 7.4. All set writes logged in &lt;100ms.
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>UK GDPR Art. 9 Isolated</span>
            <span>•</span>
            <span>18+ Verified Pilot</span>
          </div>
        </div>
      </main>
    </div>
  );
}
