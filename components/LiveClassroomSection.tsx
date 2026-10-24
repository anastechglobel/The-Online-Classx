import React from 'react';

const callWin = (fnName: string, ...args: any[]) => {
  const w = window as any;
  if (typeof w[fnName] === 'function') {
    return w[fnName](...args);
  }
};

export const LiveClassroomSection: React.FC = () => {
  return (
    <section id="page-live" className="page px-4 sm:px-6 pt-6 pb-12">
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold uppercase tracking-widest mb-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          Interactive Broadcasts
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
          Live Classrooms
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Attend real-time classes, upcoming scheduled sessions, and HD recorded archives
        </p>
      </div>

      {/* Subject Filters */}
      <div
        className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1"
        id="liveSubjectList"
      >
        <button
          onClick={(e) => callWin('filterLiveSubject', 'all', e.currentTarget)}
          className="live-sub-btn active whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-indigo-600 text-white shadow-sm transition"
        >
          All Subjects
        </button>
      </div>

      {/* Search & Free/Paid Filter */}
      <div className="flex gap-2.5 mb-5">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs"></i>
          <input
            type="text"
            id="liveSearchInput"
            onInput={() => callWin('renderLivePageContent')}
            placeholder="Search lecture topic or faculty..."
            className="w-full pl-9 pr-3 py-2.5 glass-card rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <select
          id="liveTypeFilter"
          onChange={() => callWin('renderLivePageContent')}
          className="glass-card rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none shrink-0"
        >
          <option value="all">All Access</option>
          <option value="free">Free Demo</option>
          <option value="paid">Batch Exclusive</option>
        </select>
      </div>

      {/* Segmented Control for Live Tabs */}
      <div className="flex glass-card p-1.5 rounded-2xl mb-6">
        <button
          onClick={() => callWin('switchLiveTab', 'ongoing')}
          id="live-tab-ongoing"
          className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-indigo-600 shadow-sm text-white transition flex items-center justify-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span> Live Now
        </button>
        <button
          onClick={() => callWin('switchLiveTab', 'scheduled')}
          id="live-tab-scheduled"
          className="flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          Upcoming
        </button>
        <button
          onClick={() => callWin('switchLiveTab', 'recorded')}
          id="live-tab-recorded"
          className="flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          Recorded HD
        </button>
      </div>

      <div id="live-ongoing-content">
        <div
          id="fullLiveList"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        ></div>
        <div
          id="noLiveMsg"
          className="hidden text-center py-14 glass-card rounded-2xl p-8 max-w-md mx-auto"
        >
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
            <i className="fa-solid fa-satellite-dish"></i>
          </div>
          <h4 className="font-extrabold text-slate-800 dark:text-white text-base font-display mb-1">
            No Live Broadcasts Right Now
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Check the Upcoming tab for scheduled classes or watch past lectures in Recorded HD.
          </p>
        </div>
      </div>

      <div id="live-scheduled-content" className="hidden">
        <div
          id="scheduledLiveList"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        ></div>
      </div>

      <div id="live-recorded-content" className="hidden">
        <div
          id="recordedLiveList"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        ></div>
      </div>
    </section>
  );
};
