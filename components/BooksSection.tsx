import React from 'react';

const callWin = (fnName: string, ...args: any[]) => {
  const w = window as any;
  if (typeof w[fnName] === 'function') {
    return w[fnName](...args);
  }
};

export const BooksSection: React.FC = () => {
  return (
    <section id="page-books" className="page px-4 sm:px-6 pt-6 pb-12">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-0.5">
            Paid Batch Exclusive Library
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-book text-indigo-600 dark:text-indigo-400 text-xl"></i>
            Syllabus Books
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive digital books with Zoom, Colour Highlighter, Rectangular Marker &amp; Phone Full-Screen Reader
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

      {/* Interactive Reader & Markup Mode Banner */}
      <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-600/10 via-violet-600/10 to-amber-500/10 dark:from-indigo-950/60 dark:via-violet-950/50 dark:to-slate-900/80 border border-indigo-200/70 dark:border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <i className="fa-solid fa-pen-ruler text-sm"></i>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Native PDF Markup &amp; Smart Reader
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase tracking-wider">
                Touch &amp; Mouse Canvas
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Freehand draw, chisel marker, rectangular box highlights &amp; auto-saved notes per book
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <i className="fa-solid fa-crown text-amber-500"></i> Enrolled Students Only
          </span>
        </div>
      </div>

      {/* Category / Subject Filter */}
      <div
        className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1"
        id="booksCategoryList"
      >
        <button
          onClick={(e) => callWin('filterBooks', 'all', e.currentTarget)}
          className="book-cat-btn active whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm"
        >
          All Books
        </button>
      </div>

      {/* Search & Unlocked Filter */}
      <div className="flex gap-2.5 mb-6">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs"></i>
          <input
            type="text"
            id="booksSearchInput"
            onInput={() => callWin('renderBooksPageContent')}
            placeholder="Search syllabus books by name, subject, batch..."
            className="w-full pl-9 pr-3 py-2.5 glass-card rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <select
          id="booksAccessFilter"
          onChange={() => callWin('renderBooksPageContent')}
          className="glass-card rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none shrink-0"
        >
          <option value="All">All Syllabus Books</option>
          <option value="Unlocked">My Unlocked Books</option>
        </select>
      </div>

      <div
        id="fullBooksList"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
      ></div>

      <div
        id="noBooksMsg"
        className="hidden text-center py-14 glass-card rounded-2xl p-8 max-w-md mx-auto"
      >
        <i className="fa-solid fa-book-open-reader text-4xl mb-3 text-slate-400"></i>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          No Syllabus Books Found
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Books uploaded for your class or batch will appear here with cover preview.
        </p>
      </div>
    </section>
  );
};
