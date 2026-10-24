import React from 'react';

const callWin = (fnName: string, ...args: any[]) => {
  const w = window as any;
  if (typeof w[fnName] === 'function') {
    return w[fnName](...args);
  }
};

export const TestSeriesSection: React.FC = () => {
  return (
    <section id="page-tests" className="page px-4 sm:px-6 pt-6 pb-12">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-0.5">
            CBT Assessment Suite
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Mock Test Series
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time exam interface with negative marking &amp; accuracy analytics
          </p>
        </div>
        <input type="hidden" id="testTypeFilter" defaultValue="all" />
        <button
          onClick={() => callWin('switchPage', 'home')}
          aria-label="Close tab and go back to Home"
          title="Back to Home"
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 flex items-center justify-center transition-all active:scale-90 shrink-0 border border-slate-200/70 dark:border-slate-700/70"
        >
          <i className="fa-solid fa-xmark text-base"></i>
        </button>
      </div>

      {/* Free / Paid Segmented Tabs */}
      <div className="flex glass-card p-1.5 rounded-2xl mb-5 max-w-md">
        <button
          onClick={() => callWin('setTestFilterTab', 'all')}
          id="tabTestAll"
          className="flex-1 py-2 text-xs font-extrabold rounded-xl bg-indigo-600 text-white shadow-sm transition"
        >
          All Tests
        </button>
        <button
          onClick={() => callWin('setTestFilterTab', 'free')}
          id="tabTestFree"
          className="flex-1 py-2 text-xs font-bold rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 transition"
        >
          Free Mocks
        </button>
        <button
          onClick={() => callWin('setTestFilterTab', 'paid')}
          id="tabTestPaid"
          className="flex-1 py-2 text-xs font-bold rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 transition"
        >
          Batch Tests
        </button>
      </div>

      {/* Category Filter */}
      <div
        className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1"
        id="testCategoryList"
      >
        <button
          onClick={(e) => callWin('filterTests', 'all', e.currentTarget)}
          className="test-cat-btn active whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm"
        >
          All Categories
        </button>
      </div>

      <div
        id="fullTestsList"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      ></div>
      <div
        id="noTestsMsg"
        className="hidden text-center py-14 glass-card rounded-2xl p-8 max-w-md mx-auto"
      >
        <i className="fa-solid fa-file-circle-question text-4xl mb-3 text-slate-400"></i>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          No Mock Tests Found
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Try switching the category or filter tab above.
        </p>
      </div>
    </section>
  );
};
