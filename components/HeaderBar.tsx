import React from "react";

export function HeaderBar() {
  return (
    <header className="sticky top-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-40 px-3 sm:px-6 py-2.5 sm:py-3.5 flex justify-between items-center gap-2 sm:gap-4 border-b border-slate-200/70 dark:border-slate-800/80">
      {/* Zone 1: Menu Trigger & Single-Line Brand Wordmark */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
        <button
          onClick={() => window.toggleSidebar && window.toggleSidebar()}
          aria-label="Open menu"
          className="w-10 h-10 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shrink-0 active:scale-95"
        >
          <i className="fa-solid fa-bars-staggered text-base"></i>
        </button>
        <div
          onClick={() => window.navigateTo && window.navigateTo("home")}
          className="flex items-center gap-2 cursor-pointer min-w-0"
        >
          <div className="tanu-logo-circle shrink-0">TOC</div>
          <span className="font-display text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            The Online Classes
          </span>
        </div>
      </div>

      {/* Zone 2: Clean Single-Line Navigation Links (Desktop) */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            window.navigateTo && window.navigateTo("home");
          }}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
        >
          Dashboard
        </a>
        <a
          href="#courses"
          onClick={(e) => {
            e.preventDefault();
            window.navigateTo && window.navigateTo("courses");
          }}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
        >
          Batches
        </a>
        <a
          href="#live"
          onClick={(e) => {
            e.preventDefault();
            window.navigateTo && window.navigateTo("live");
          }}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
        >
          Live Classes
        </a>
        <a
          href="#tests"
          onClick={(e) => {
            e.preventDefault();
            window.navigateTo && window.navigateTo("tests");
          }}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
        >
          Mock Tests
        </a>
        <a
          href="#notes"
          onClick={(e) => {
            e.preventDefault();
            window.navigateTo && window.navigateTo("notes");
          }}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
        >
          Study Notes
        </a>
        <a
          href="#books"
          onClick={(e) => {
            e.preventDefault();
            window.navigateTo && window.navigateTo("books");
          }}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <i className="fa-solid fa-book text-indigo-500 text-xs"></i>
          <span>Books</span>
        </a>
      </nav>

      {/* Zone 3: Goal Selector & Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 relative shrink-0">
        <button
          onClick={() => window.showCategorySelector && window.showCategorySelector()}
          className="flex items-center gap-1.5 sm:gap-2 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-slate-700/80 px-2.5 sm:px-3.5 py-2 min-h-[40px] rounded-xl border border-slate-200/80 dark:border-slate-700/80 cursor-pointer active:scale-95 transition-all shrink-0 whitespace-nowrap"
        >
          <i className="fa-solid fa-bullseye text-xs text-emerald-600 dark:text-emerald-400"></i>
          <span
            id="activeClassName"
            className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight max-w-[76px] sm:max-w-[150px] truncate"
          >
            Select Goal
          </span>
          <i className="fa-solid fa-chevron-down text-[9px] text-slate-400"></i>
        </button>

        {/* Quick Theme Toggle Button */}
        <button
          onClick={() => window.toggleDarkMode && window.toggleDarkMode()}
          title="Switch Theme"
          className="w-10 h-10 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors active:scale-95 shrink-0"
        >
          <i className="fa-solid fa-circle-half-stroke text-base"></i>
        </button>

        {/* Notification Bell */}
        <button
          id="notifBellBtn"
          onClick={() => window.toggleNotifications && window.toggleNotifications()}
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors active:scale-95 shrink-0"
        >
          <i className="fa-solid fa-bell text-base"></i>
          <span
            id="unreadNotifBadge"
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 ring-2 ring-white dark:ring-slate-900 rounded-full hidden"
          ></span>
        </button>

        {/* Notifications Dropdown */}
        <div
          id="notifDropdown"
          className="hidden absolute right-0 top-12 w-[calc(100vw-24px)] max-w-sm sm:w-96 glass-card rounded-2xl shadow-2xl flex-col z-50 overflow-hidden max-h-[75dvh]"
        >
          <div className="p-3.5 sm:p-4 border-b border-slate-200/60 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">
                <i className="fa-solid fa-bell"></i>
              </div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">
                Announcements
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.clearAllNotifications && window.clearAllNotifications()}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline whitespace-nowrap px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
              >
                Clear All
              </button>
              <button
                onClick={() =>
                  window.closeNotifications
                    ? window.closeNotifications()
                    : window.toggleNotifications && window.toggleNotifications()
                }
                aria-label="Close notifications"
                title="Close notifications"
                className="w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all active:scale-90 shrink-0"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>
          </div>
          <div id="notifList" className="p-3 space-y-2.5 overflow-y-auto max-h-[60dvh]">
            <div className="text-center p-6 text-slate-400 text-xs font-semibold">
              No new notifications
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
