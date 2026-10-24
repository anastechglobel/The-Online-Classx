import React from "react";

export function SidebarDrawer() {
  return (
    <>
      <div
        id="sidebarOverlay"
        className="sidebar-overlay"
        onClick={() => window.toggleSidebar && window.toggleSidebar()}
      ></div>
      <div id="sidebar" className="sidebar">
        {/* Header (Fixed) */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 flex-shrink-0 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <button
            onClick={() => window.toggleSidebar && window.toggleSidebar()}
            aria-label="Close menu"
            title="Close menu"
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-all active:scale-90 z-10 border border-white/10"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
          <div className="flex items-center gap-4 pr-7">
            <div
              id="sidebarAvatar"
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-blue-500/30 border-2 border-white/15 shrink-0"
            >
              U
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-wider mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                Verified Learner
              </div>
              <h2
                id="sidebarUserName"
                className="font-extrabold text-base text-white tracking-tight truncate"
              >
                Student Name
              </h2>
              <p
                id="sidebarUserPhone"
                className="text-[11px] text-slate-400 font-semibold tracking-wider mt-0.5 truncate"
              >
                +91 0000000000
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div
              onClick={() => {
                window.showCategorySelector && window.showCategorySelector();
                window.toggleSidebar && window.toggleSidebar();
              }}
              className="bg-white/5 hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm p-3 rounded-2xl border border-white/10"
            >
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center justify-between">
                <span>Target Exam</span>
                <i className="fa-solid fa-pen text-[8px] text-blue-400"></i>
              </p>
              <p id="sidebarCategory" className="text-xs font-extrabold text-blue-400 truncate">
                Not Set
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Membership
              </p>
              <p className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                <i className="fa-solid fa-bolt text-[10px]"></i> Active
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="p-4 space-y-1.5 flex-1 overflow-y-auto sidebar-nav pb-20">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 px-3 pt-2">
            Academic Portal
          </p>
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.navigateTo && window.navigateTo("home");
              window.toggleSidebar && window.toggleSidebar();
            }}
            className="flex items-center gap-3.5 px-3.5 py-3 hover:bg-white/5 rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <i className="fa-solid fa-house text-sm"></i>
            </div>
            <span className="font-bold text-sm text-slate-200 group-hover:text-white">
              Study Dashboard
            </span>
          </a>
          <a
            href="#mycourses"
            onClick={(e) => {
              e.preventDefault();
              window.navigateTo && window.navigateTo("mycourses");
              window.toggleSidebar && window.toggleSidebar();
            }}
            className="flex items-center gap-3.5 px-3.5 py-3 hover:bg-white/5 rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <i className="fa-solid fa-graduation-cap text-sm"></i>
            </div>
            <span className="font-bold text-sm text-slate-200 group-hover:text-white">
              My Enrolled Batches
            </span>
          </a>
          <a
            href="#courses"
            onClick={(e) => {
              e.preventDefault();
              window.navigateTo && window.navigateTo("courses");
              window.toggleSidebar && window.toggleSidebar();
            }}
            className="flex items-center gap-3.5 px-3.5 py-3 hover:bg-white/5 rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <i className="fa-solid fa-compass text-sm"></i>
            </div>
            <span className="font-bold text-sm text-slate-200 group-hover:text-white">
              Explore All Batches
            </span>
          </a>
          <a
            href="#live"
            onClick={(e) => {
              e.preventDefault();
              window.navigateTo && window.navigateTo("live");
              window.toggleSidebar && window.toggleSidebar();
            }}
            className="flex items-center gap-3.5 px-3.5 py-3 hover:bg-white/5 rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
              <i className="fa-solid fa-tower-broadcast text-sm"></i>
            </div>
            <span className="font-bold text-sm text-slate-200 group-hover:text-white">
              Live Classroom
            </span>
          </a>
          <a
            href="#tests"
            onClick={(e) => {
              e.preventDefault();
              window.navigateTo && window.navigateTo("tests");
              window.toggleSidebar && window.toggleSidebar();
            }}
            className="flex items-center gap-3.5 px-3.5 py-3 hover:bg-white/5 rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
              <i className="fa-solid fa-vials text-sm"></i>
            </div>
            <span className="font-bold text-sm text-slate-200 group-hover:text-white">
              Mock Test Series
            </span>
          </a>
          <a
            href="#notes"
            onClick={(e) => {
              e.preventDefault();
              window.navigateTo && window.navigateTo("notes");
              window.toggleSidebar && window.toggleSidebar();
            }}
            className="flex items-center gap-3.5 px-3.5 py-3 hover:bg-white/5 rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
              <i className="fa-solid fa-file-pdf text-sm"></i>
            </div>
            <span className="font-bold text-sm text-slate-200 group-hover:text-white">
              PDF Library & Notes
            </span>
          </a>
          <a
            href="#books"
            onClick={(e) => {
              e.preventDefault();
              window.navigateTo && window.navigateTo("books");
              window.toggleSidebar && window.toggleSidebar();
            }}
            className="flex items-center gap-3.5 px-3.5 py-3 hover:bg-white/5 rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all">
              <i className="fa-solid fa-book text-sm"></i>
            </div>
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="font-bold text-sm text-slate-200 group-hover:text-white truncate">
                Syllabus Books
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider">
                Paid Batch
              </span>
            </div>
          </a>

          <a
            href="#admin"
            onClick={(e) => {
              e.preventDefault();
              window.navigateTo && window.navigateTo("admin");
              window.toggleSidebar && window.toggleSidebar();
            }}
            id="adminSidebarBtn"
            className="hidden flex items-center gap-3.5 px-3.5 py-3 hover:bg-white/5 rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
              <i className="fa-solid fa-user-shield text-slate-300 group-hover:text-slate-900 text-sm"></i>
            </div>
            <span className="font-bold text-sm text-slate-200 group-hover:text-white">
              Admin Console
            </span>
          </a>

          <div className="pt-4 space-y-1">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 px-3">
              Help & Community
            </p>
            <a
              href="#support"
              onClick={(e) => {
                e.preventDefault();
                window.openSupport && window.openSupport();
                window.toggleSidebar && window.toggleSidebar();
              }}
              className="flex items-center gap-3.5 px-3.5 py-3 hover:bg-white/5 rounded-2xl transition-all group"
            >
              <div className="w-9 h-9 shrink-0 rounded-xl bg-slate-800/80 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <i className="fa-solid fa-headset text-slate-400 group-hover:text-white text-sm"></i>
              </div>
              <span className="font-bold text-sm text-slate-300 group-hover:text-white">
                24/7 Student Support
              </span>
            </a>
            <a
              href="#social"
              onClick={(e) => {
                e.preventDefault();
                window.openSocialLinks && window.openSocialLinks();
                window.toggleSidebar && window.toggleSidebar();
              }}
              className="flex items-center gap-3.5 px-3.5 py-3 hover:bg-white/5 rounded-2xl transition-all group"
            >
              <div className="w-9 h-9 shrink-0 rounded-xl bg-slate-800/80 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <i className="fa-solid fa-share-nodes text-slate-400 group-hover:text-white text-sm"></i>
              </div>
              <span className="font-bold text-sm text-slate-300 group-hover:text-white">
                Join Study Community
              </span>
            </a>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-800/80 space-y-1.5">
            <button
              id="installAppSidebarBtn"
              onClick={() => {
                window.promptInstallApp && window.promptInstallApp();
                window.toggleSidebar && window.toggleSidebar();
              }}
              className="flex items-center gap-3.5 px-3.5 py-3 w-full text-left text-emerald-400 hover:bg-emerald-500/10 rounded-2xl transition-all group"
            >
              <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-500/15 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <i className="fa-solid fa-mobile-screen-button text-sm"></i>
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm block leading-tight">
                  Install Mobile App
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  Add to Home Screen
                </span>
              </div>
            </button>

            <button
              onClick={() => window.toggleDarkMode && window.toggleDarkMode()}
              className="flex items-center gap-3.5 px-3.5 py-3 w-full text-left text-slate-300 hover:bg-white/5 rounded-2xl transition-all group"
            >
              <div className="w-9 h-9 shrink-0 rounded-xl bg-slate-800/80 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                <i id="themeIcon" className="fa-solid fa-moon text-sm"></i>
              </div>
              <span id="themeLabel" className="font-bold text-sm">
                Dark Mode
              </span>
            </button>

            <button
              onClick={() => window.logout && window.logout()}
              className="flex items-center gap-3.5 px-3.5 py-3 w-full text-left text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all group"
            >
              <div className="w-9 h-9 shrink-0 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                <i className="fa-solid fa-power-off text-sm group-hover:text-white"></i>
              </div>
              <span className="font-bold text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
