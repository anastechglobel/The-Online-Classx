import React from 'react';

const callWin = (fnName: string, ...args: any[]) => {
  const w = window as any;
  if (typeof w[fnName] === 'function') {
    return w[fnName](...args);
  }
};

export const StudyNotesSection: React.FC = () => {
  return (
    <section id="page-notes" className="page px-4 sm:px-6 pt-6 pb-12">
      <div className="mb-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-0.5">
          Digital Library
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
          Study Notes &amp; PDFs
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          High-yield revision handouts, formula sheets, and chapter summaries
        </p>
      </div>

      {/* Category Filter */}
      <div
        className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1"
        id="notesCategoryList"
      >
        <button
          onClick={(e) => callWin('filterNotes', 'all', e.currentTarget)}
          className="note-cat-btn active whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm"
        >
          All Notes
        </button>
      </div>

      {/* Search & Free/Paid Filter */}
      <div className="flex gap-2.5 mb-6">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs"></i>
          <input
            type="text"
            id="notesSearchInput"
            onInput={() => callWin('renderNotesPageContent')}
            placeholder="Search chapter notes, formula sheets..."
            className="w-full pl-9 pr-3 py-2.5 glass-card rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <select
          id="notesTypeFilter"
          onChange={() => callWin('renderNotesPageContent')}
          className="glass-card rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none shrink-0"
        >
          <option value="all">All Material</option>
          <option value="free">Free PDFs</option>
          <option value="paid">Premium Notes</option>
        </select>
      </div>

      <div
        id="fullNotesList"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      ></div>
      <div
        id="noNotesMsg"
        className="hidden text-center py-14 glass-card rounded-2xl p-8 max-w-md mx-auto"
      >
        <i className="fa-regular fa-folder-open text-4xl mb-3 text-slate-400"></i>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          No Study Notes Available
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Check back soon or adjust your search filter.
        </p>
      </div>
    </section>
  );
};
