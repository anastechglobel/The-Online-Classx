import React from 'react';

const callWin = (fnName: string, ...args: any[]) => {
  const w = window as any;
  if (typeof w[fnName] === 'function') {
    return w[fnName](...args);
  }
};

export const BatchesSection: React.FC = () => {
  return (
    <>
      {/* 1.5 MY PURCHASES / ENROLLED COURSES */}
      <section id="page-mycourses" className="page px-4 sm:px-6 pt-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-start justify-between gap-3 w-full sm:w-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-0.5">
                Enrolled Programs
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                My Active Batches
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Continue your structured learning journey where you left off
              </p>
            </div>
            <button
              onClick={() => callWin('switchPage', 'home')}
              aria-label="Close tab and go back to Home"
              title="Back to Home"
              className="sm:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 flex items-center justify-center transition-all active:scale-90 shrink-0 border border-slate-200/70 dark:border-slate-700/70"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => callWin('switchPage', 'courses')}
              className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/50 dark:border-indigo-800/50 hover:bg-indigo-100 transition flex items-center gap-2"
            >
              <i className="fa-solid fa-compass"></i> Browse More Batches
            </button>
            <button
              onClick={() => callWin('switchPage', 'home')}
              aria-label="Close tab and go back to Home"
              title="Back to Home"
              className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 items-center justify-center transition-all active:scale-90 shrink-0 border border-slate-200/70 dark:border-slate-700/70"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>
        </div>
        <div
          id="myCoursesList"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        ></div>
        <div
          id="noMyCoursesMsg"
          className="hidden text-center py-16 glass-card rounded-2xl p-8 max-w-md mx-auto my-8"
        >
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500 text-3xl shadow-inner">
            <i className="fa-solid fa-book-open-reader"></i>
          </div>
          <h3 className="text-slate-900 dark:text-white font-extrabold text-lg font-display mb-1">
            No Active Batches Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            You haven&apos;t enrolled in any courses yet. Explore our exam-focused batches to begin learning!
          </p>
          <button
            onClick={() => callWin('switchPage', 'courses')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95"
          >
            Explore All Batches
          </button>
        </div>
      </section>

      {/* 2. ALL COURSES PAGE */}
      <section id="page-courses" className="page px-4 sm:px-6 pt-6 pb-12">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-0.5">
              Course Catalog
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
              Explore All Batches
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comprehensive syllabi, live doubt rooms, and structured study plans
            </p>
          </div>
          <button
            onClick={() => callWin('switchPage', 'home')}
            aria-label="Close tab and go back to Home"
            title="Back to Home"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 flex items-center justify-center transition-all active:scale-90 shrink-0 border border-slate-200/70 dark:border-slate-700/70"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-400 text-sm"></i>
            <input
              type="text"
              id="courseSearch"
              onInput={() => callWin('filterCourses')}
              placeholder="Search batches by exam, subject, or faculty..."
              className="w-full pl-11 pr-4 py-3 glass-card rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <select
            id="courseSort"
            onChange={() => callWin('filterCourses')}
            className="glass-card rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
          >
            <option value="default">Sort By: Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div
          className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1"
          id="courseCategories"
        >
          <button
            onClick={(e) => callWin('filterCourseCategory', 'all', e.currentTarget)}
            className="cat-btn active whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm transition"
          >
            All Batches
          </button>
        </div>

        <div
          id="fullCoursesList"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        ></div>
      </section>
    </>
  );
};
