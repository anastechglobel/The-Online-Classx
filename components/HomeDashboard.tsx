import React from 'react';

const callWin = (fnName: string, ...args: any[]) => {
  const w = window as any;
  if (typeof w[fnName] === 'function') {
    return w[fnName](...args);
  }
};

export const HomeDashboard: React.FC = () => {
  return (
    <section id="page-home" className="page active px-4 sm:px-6 pt-6 pb-12">
      {/* BENTO HERO & GAMIFIED STREAK ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8 items-stretch">
        {/* Main Greeting & Value Hero */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white shadow-xl border border-indigo-500/20 flex flex-col justify-between">
          <div className="absolute -right-12 -top-12 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-violet-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Active Learning Portal
            </div>
            <p className="text-xs sm:text-sm font-semibold text-indigo-200/80 mb-1">
              <span id="greetingTime">Good Morning</span>, Scholar
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white leading-tight">
              <span id="userNameHeader">Student</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md leading-relaxed">
              Your structured batches, live classrooms, and real-time mock evaluations are synced and ready.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => callWin('switchPage', 'mycourses')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 active:scale-95"
            >
              <i className="fa-solid fa-circle-play"></i> Resume My Batches
            </button>
            <button
              onClick={() => callWin('switchPage', 'live')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition flex items-center gap-2 active:scale-95"
            >
              <i className="fa-solid fa-tower-broadcast text-rose-400"></i> Live Classrooms
            </button>
          </div>
        </div>

        {/* Study Streak & Daily Discipline Bento Card */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 shrink-0">
                <i className="fa-solid fa-fire-flame-curved text-xl"></i>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                  Consistency Tracker
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-display leading-tight">
                  <span id="streakCountText">1</span> Day Study Streak
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Keep learning daily to maintain momentum!
                </p>
              </div>
            </div>
            <button
              onClick={() => callWin('openFocusTimer')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition flex items-center gap-1.5 shrink-0"
              title="Launch Pomodoro Timer"
            >
              <i className="fa-solid fa-stopwatch text-indigo-500"></i> Focus
            </button>
          </div>

          <div
            className="grid grid-cols-7 gap-1.5 pt-3 border-t border-slate-200/70 dark:border-slate-800"
            id="streakDaysContainer"
          >
            {/* Dynamic 7 Days */}
          </div>
        </div>
      </div>

      {/* DYNAMIC PROMO BANNER SLIDER */}
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg mb-8 border border-slate-200/60 dark:border-slate-800 bg-slate-900 h-44 sm:h-56">
        <div id="homeSlider" className="slider-wrapper h-full">
          <div className="min-w-full h-full bg-slate-800 animate-pulse flex items-center justify-center text-slate-500">
            Loading Banners...
          </div>
        </div>
        <div
          id="sliderDots"
          className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10"
        ></div>
      </div>

      {/* HIGH-VELOCITY LEARNING COMMAND MATRIX */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
              Academic Command Center
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant access to classes, mock tests, notes, and schedules
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => callWin('switchPage', 'courses')}
            className="glass-card p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shrink-0">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                All Batches
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                Structured Courses
              </span>
            </div>
          </div>

          <div
            onClick={() => callWin('switchPage', 'live')}
            className="glass-card p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-200 shrink-0 relative">
              <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2 animate-ping"></span>
              <i className="fa-solid fa-tower-broadcast"></i>
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                Live Classes
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                Interactive Sessions
              </span>
            </div>
          </div>

          <div
            onClick={() => callWin('switchPage', 'tests')}
            className="glass-card p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shrink-0">
              <i className="fa-solid fa-clipboard-check"></i>
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                Test Series
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                CBT Mock Exams
              </span>
            </div>
          </div>

          <div
            onClick={() => callWin('switchPage', 'notes')}
            className="glass-card p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl group-hover:bg-amber-500 group-hover:text-white transition-all duration-200 shrink-0">
              <i className="fa-solid fa-file-pdf"></i>
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                Study Notes
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                PDFs &amp; Handouts
              </span>
            </div>
          </div>

          <div
            onClick={() => callWin('switchPage', 'books')}
            className="glass-card p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer group border border-indigo-200/60 dark:border-indigo-800/50"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xl group-hover:bg-cyan-600 group-hover:text-white transition-all duration-200 shrink-0">
              <i className="fa-solid fa-book"></i>
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                Books
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold block truncate">
                Syllabus Textbooks
              </span>
            </div>
          </div>

          <div
            onClick={() => callWin('switchPage', 'timetable')}
            className="glass-card p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xl group-hover:bg-violet-600 group-hover:text-white transition-all duration-200 shrink-0">
              <i className="fa-regular fa-calendar-check"></i>
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                Schedule
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                Daily Timetable
              </span>
            </div>
          </div>

          <div
            onClick={() => callWin('openFocusTimer')}
            className="glass-card p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl group-hover:bg-teal-600 group-hover:text-white transition-all duration-200 shrink-0">
              <i className="fa-solid fa-hourglass-start"></i>
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                Pomodoro
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                25m Deep Study
              </span>
            </div>
          </div>

          <div
            onClick={() => callWin('openSupportPopup')}
            className="glass-card p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl group-hover:bg-sky-600 group-hover:text-white transition-all duration-200 shrink-0">
              <i className="fa-solid fa-headset"></i>
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                Help Desk
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                24/7 Student Care
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED COURSES SECTION */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-0.5">
              Structured Learning
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
              Featured Batches
            </h3>
          </div>
          <button
            onClick={() => callWin('switchPage', 'courses')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/50 px-3.5 py-2 rounded-xl transition"
          >
            Explore All <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>
        <div
          id="homeCoursesList"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="glass-card rounded-2xl p-4 h-64 animate-pulse bg-slate-200/60 dark:bg-slate-800/60"></div>
        </div>
      </div>

      {/* SYLLABUS BOOKS SECTION ON HOME */}
      <div id="booksHomeSection" className="mb-10 hidden">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 block mb-0.5">
              Digital Textbooks • Paid Batch Exclusive
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-book text-cyan-600 dark:text-cyan-400 text-base"></i>
              Syllabus Books
            </h3>
          </div>
          <button
            onClick={() => callWin('switchPage', 'books')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/50 px-3.5 py-2 rounded-xl transition"
          >
            View All Books <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>
        <div
          id="homeBooksList"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        ></div>
      </div>

      {/* ONGOING LIVE CLASSES */}
      <div id="liveSection" className="mb-10 hidden">
        <div className="flex justify-between items-end mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block">
                Streaming Now
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                Live Interactive Classes
              </h3>
            </div>
          </div>
          <button
            onClick={() => callWin('switchPage', 'live')}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2 rounded-xl"
          >
            View All
          </button>
        </div>
        <div
          id="homeLiveList"
          className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
        ></div>
      </div>

      {/* FREE DEMO CLASSES */}
      <div id="demoSection" className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-0.5">
              Experience Firsthand
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
              Free Demo Lectures
            </h3>
          </div>
          <button
            onClick={() => callWin('switchPage', 'live')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            See All <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
        <div
          id="homeDemoList"
          className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
        >
          <p className="text-xs text-slate-400 py-4">Loading demo lectures...</p>
        </div>
      </div>

      {/* UPCOMING BATCHES */}
      <div id="upcomingSection" className="mb-10 hidden">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 block mb-0.5">
              Next Intake
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
              Upcoming Batches
            </h3>
          </div>
        </div>
        <div
          id="homeUpcomingList"
          className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
        ></div>
      </div>

      {/* WALL OF FAME & LEADERBOARD TWO-COLUMN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* TOPPERS */}
        <div id="toppersSection" className="hidden glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <i className="fa-solid fa-trophy"></i>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                  Wall of Fame
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Our highest achieving scholars
                </p>
              </div>
            </div>
          </div>
          <div
            id="homeToppersList"
            className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
          ></div>
        </div>

        {/* QUIZ LEADERBOARD */}
        <div id="quizLeaderboardSection" className="hidden glass-card rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                <i className="fa-solid fa-medal"></i>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                  Quiz Champions
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Live CBT Test Series Leaderboard
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200/50 dark:border-indigo-800/40">
              Top Scorers
            </span>
          </div>
          <div
            id="homeQuizLeaderboardList"
            className="flex gap-3 overflow-x-auto no-scrollbar pb-2"
          ></div>
        </div>
      </div>

      {/* WHY CHOOSE US - HIGH IMPACT BENTO STATS */}
      <div className="mb-10">
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-0.5">
            Platform Excellence
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Why Scholars Trust The Online Classes
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-lg mb-3">
              <i className="fa-solid fa-video"></i>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm font-display">
                HD Live Interactive
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Two-way clarity with instant doubt resolution
              </p>
            </div>
          </div>
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg mb-3">
              <i className="fa-solid fa-book-bookmark"></i>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm font-display">
                Curated PDF Notes
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Exam-aligned handwritten &amp; digital study material
              </p>
            </div>
          </div>
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg mb-3">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm font-display">
                CBT Mock Analytics
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real exam simulation with accuracy breakdown
              </p>
            </div>
          </div>
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg mb-3">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm font-display">
                1-on-1 Mentorship
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dedicated faculty guidance throughout your prep
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <div className="mb-10">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display tracking-tight mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          <div className="glass-card rounded-2xl overflow-hidden">
            <button
              onClick={() => callWin('toggleFaq', 1)}
              className="w-full p-4 text-left font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm flex justify-between items-center"
            >
              <span>How do I enroll in a batch and get instant access?</span>
              <i
                id="faq-icon-1"
                className="fa-solid fa-chevron-down text-slate-400 transition-transform duration-300"
              ></i>
            </button>
            <div
              id="faq-1"
              className="hidden px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3 leading-relaxed"
            >
              Select your preferred batch from the &apos;All Batches&apos; section and click &apos;Enroll Now&apos;. Complete the secure Cashfree checkout (UPI, Cards, NetBanking), and your batch unlocks automatically in &apos;My Batches&apos;.
            </div>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <button
              onClick={() => callWin('toggleFaq', 2)}
              className="w-full p-4 text-left font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm flex justify-between items-center"
            >
              <span>What happens if I miss a scheduled live lecture?</span>
              <i
                id="faq-icon-2"
                className="fa-solid fa-chevron-down text-slate-400 transition-transform duration-300"
              ></i>
            </button>
            <div
              id="faq-2"
              className="hidden px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3 leading-relaxed"
            >
              Every live interactive session is automatically archived in HD. You can watch the recording anytime in the &apos;Recorded&apos; tab under Live Classes, complete with downloadable PDF class notes.
            </div>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <button
              onClick={() => callWin('toggleFaq', 3)}
              className="w-full p-4 text-left font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm flex justify-between items-center"
            >
              <span>Can I attempt CBT Mock Tests multiple times?</span>
              <i
                id="faq-icon-3"
                className="fa-solid fa-chevron-down text-slate-400 transition-transform duration-300"
              ></i>
            </button>
            <div
              id="faq-3"
              className="hidden px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3 leading-relaxed"
            >
              Yes! You can re-attempt tests in the Test Series section and inspect full step-by-step solutions and accuracy breakdowns after every submission.
            </div>
          </div>
        </div>
      </div>

      {/* SHARE & GROW BANNER */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10 max-w-md">
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-md mb-2">
            Peer Learning Network
          </span>
          <h4 className="font-extrabold text-lg sm:text-xl font-display mb-1">
            Invite Your Study Partners!
          </h4>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Share The Online Classes portal with friends and compete together on the live CBT test leaderboard.
          </p>
        </div>
        <button
          onClick={() => callWin('shareApp')}
          className="relative z-10 bg-white text-indigo-700 font-extrabold text-xs px-5 py-3 rounded-xl shadow-md active:scale-95 transition shrink-0 flex items-center gap-2 hover:bg-indigo-50"
        >
          <i className="fa-solid fa-share-nodes"></i> Share Portal Link
        </button>
        <i className="fa-solid fa-users-viewfinder text-8xl text-white/10 absolute -bottom-4 -right-3 pointer-events-none"></i>
      </div>
    </section>
  );
};
