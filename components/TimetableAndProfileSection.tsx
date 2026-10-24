import React from 'react';

const callWin = (fnName: string, ...args: any[]) => {
  const w = window as any;
  if (typeof w[fnName] === 'function') {
    return w[fnName](...args);
  }
};

export const TimetableAndProfileSection: React.FC = () => {
  return (
    <>
      {/* 5.5 TIMETABLE PAGE */}
      <section id="page-timetable" className="page px-4 sm:px-6 pt-6 pb-12">
        <div className="mb-5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 block mb-0.5">
            Academic Planner
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Class Schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stay synchronized with your daily lectures and batch timings
          </p>
        </div>

        {/* Date Filter */}
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1"
          id="timetableDateFilter"
        >
          <button
            onClick={(e) => callWin('filterTimetable', 'all', e.currentTarget)}
            className="tt-date-btn active whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm"
          >
            All Days
          </button>
          <button
            onClick={(e) => callWin('filterTimetable', 'today', e.currentTarget)}
            className="tt-date-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold glass-card text-slate-600 dark:text-slate-300"
          >
            Today
          </button>
          <button
            onClick={(e) => callWin('filterTimetable', 'tomorrow', e.currentTarget)}
            className="tt-date-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold glass-card text-slate-600 dark:text-slate-300"
          >
            Tomorrow
          </button>
        </div>

        <div id="timetableList" className="space-y-4">
          <div className="text-center py-10 text-slate-400">
            <i className="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
            <p className="text-xs">Loading schedule...</p>
          </div>
        </div>
      </section>

      {/* 6. PROFILE PAGE */}
      <section id="page-profile" className="page px-4 sm:px-6 pt-6 pb-12">
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-0.5">
            Scholar Identity
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Student Profile &amp; Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Identity Card */}
          <div className="lg:col-span-5 glass-card rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 absolute top-0 left-0 right-0"></div>

            <button
              onClick={() => callWin('openEditProfileModal')}
              className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-white/30 transition text-xs font-bold border border-white/20"
            >
              <i className="fa-solid fa-pen text-[10px]"></i> Edit
            </button>

            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 p-1.5 mx-auto relative z-10 mt-8 mb-3 shadow-xl">
              <div className="w-full h-full rounded-xl bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 overflow-hidden font-display">
                <span id="profileAvatar">U</span>
              </div>
            </div>
            <h3
              id="profileName"
              className="text-xl font-extrabold text-slate-900 dark:text-white font-display"
            >
              Student Name
            </h3>
            <p
              id="profilePhone"
              className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-5"
            >
              +91 XXXXXXXXXX
            </p>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-200/70 dark:border-slate-800 pt-4 text-left">
              <div className="bg-slate-50/80 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Gender
                </p>
                <p
                  id="profileGender"
                  className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5"
                >
                  -
                </p>
              </div>
              <div className="bg-slate-50/80 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Age
                </p>
                <p
                  id="profileAge"
                  className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5"
                >
                  -
                </p>
              </div>
              <div className="bg-slate-50/80 dark:bg-slate-800/50 p-3 rounded-xl col-span-2 border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Registered Email
                </p>
                <p
                  id="profileEmail"
                  className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate mt-0.5"
                >
                  -
                </p>
              </div>
            </div>
          </div>

          {/* Right Performance & Quick Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            {/* PERFORMANCE REPORT CARD */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-display">
                  <i className="fa-solid fa-chart-pie text-indigo-600"></i> CBT Performance Analytics
                </h4>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Real-time Sync
                </span>
              </div>
              <div id="performanceContainer">
                <p className="text-xs text-slate-400 text-center py-6">
                  Loading performance metrics...
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800">
              <button
                onClick={() => callWin('switchPage', 'mycourses')}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <i className="fa-solid fa-bag-shopping"></i>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm block">
                      My Enrolled Batches
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Access your unlocked courses and study material
                    </span>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-400 text-xs"></i>
              </button>
              <button
                onClick={() => callWin('openSupportPopup')}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <i className="fa-solid fa-headset"></i>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm block">
                      Student Help &amp; Support
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Direct WhatsApp, Phone &amp; Email assistance
                    </span>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-400 text-xs"></i>
              </button>
              <button
                onClick={() => callWin('logoutUser')}
                className="w-full p-4 flex items-center justify-between hover:bg-rose-50/60 dark:hover:bg-rose-950/30 transition text-rose-600"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <i className="fa-solid fa-power-off"></i>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-sm block">
                      Sign Out of Account
                    </span>
                    <span className="text-[11px] text-rose-400">
                      Safely end your current session
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ADMIN ACCESS MANAGEMENT */}
      <section id="page-admin" className="page px-4 sm:px-6 pt-6 pb-12">
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
            Student Access Manager
          </h2>
          <p className="text-xs text-slate-500">
            Select a student to grant or revoke paid content access.
          </p>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search student by name or email..."
            onKeyUp={(e) =>
              callWin('filterAdminUsers', (e.target as HTMLInputElement).value)
            }
            className="w-full p-3 rounded-xl glass-card text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div id="adminUserList" className="space-y-3">
          <div className="text-center py-8 text-slate-400 text-xs">
            Loading students...
          </div>
        </div>
      </section>
    </>
  );
};
