import React from 'react';

const callWin = (fnName: string, ...args: any[]) => {
  const w = window as any;
  if (typeof w[fnName] === 'function') {
    return w[fnName](...args);
  }
};

export const LearningOverlays: React.FC = () => {
  return (
    <>
      {/* PDF VIEWER OVERLAY */}
      <div
        id="pdfViewerContainer"
        className="fixed inset-0 z-50 bg-slate-950 hidden flex flex-col"
      >
        <div className="bg-slate-900 text-white p-3.5 flex justify-between items-center shadow-md border-b border-slate-800">
          <h3
            id="pdfTitle"
            className="text-sm font-bold truncate w-3/4 pl-2 font-display"
          >
            Document Viewer
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => callWin('togglePdfFullScreen')}
              id="btnPdfFullScreen"
              className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition"
              title="Full Screen"
            >
              <i className="fa-solid fa-expand text-xs"></i>
            </button>
            <button
              onClick={() => callWin('closePdfViewer')}
              className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition"
              title="Close"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
        <div className="flex-1 relative bg-slate-900 overflow-hidden">
          <div
            id="pdfPopoutBlocker"
            className="absolute top-0 right-0 w-24 h-20 z-50 bg-transparent"
          ></div>
          <iframe id="pdfFrame" className="w-full h-full border-0" title="PDF Viewer"></iframe>
        </div>
      </div>

      {/* CBT QUIZ PLAYER OVERLAY */}
      <div
        id="quizPlayer"
        className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 hidden flex flex-col"
      >
        {/* CBT Exam Header */}
        <div className="bg-white dark:bg-slate-900 px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs font-display shrink-0">
              CBT
            </div>
            <div className="min-w-0">
              <span
                id="quizTitle"
                className="text-xs font-bold text-slate-400 uppercase tracking-wider block truncate"
              >
                Test Name
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                  Question <span id="quizCounter">1/10</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border border-indigo-200/60 dark:border-indigo-800/60 font-mono">
              <i className="fa-regular fa-clock"></i>{' '}
              <span id="quizTimer">00:00</span>
            </div>
            <button
              onClick={() => callWin('exitQuiz')}
              className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition"
            >
              Quit
            </button>
          </div>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5">
          <div
            id="quizProgress"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 h-1.5 transition-all duration-300"
            style={{ width: '0%' }}
          ></div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 max-w-3xl w-full mx-auto">
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div
              id="questionText"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed"
            >
              Loading Question...
            </div>
          </div>
          <div id="optionsGrid" className="space-y-3.5"></div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mx-auto flex justify-between gap-4">
            <button
              onClick={() => callWin('prevQuestion')}
              className="px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <i className="fa-solid fa-arrow-left mr-1.5"></i> Previous
            </button>
            <button
              onClick={() => callWin('nextQuestion')}
              id="nextBtn"
              className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 transition"
            >
              Save &amp; Next <i className="fa-solid fa-arrow-right ml-1.5"></i>
            </button>
          </div>
        </div>
      </div>

      {/* CBT QUIZ RESULTS OVERLAY */}
      <div
        id="quizResults"
        className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 hidden flex flex-col overflow-y-auto p-6 animate-fade-in"
      >
        <div className="max-w-md mx-auto w-full my-auto text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 p-1 mx-auto mb-5 shadow-xl shadow-orange-500/20 flex items-center justify-center">
            <i className="fa-solid fa-trophy text-4xl text-white"></i>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display mb-1">
            Assessment Complete!
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Your real-time CBT evaluation report is ready
          </p>

          <div id="resGrid" className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-lg shadow-indigo-600/20">
              <span className="text-[10px] uppercase font-bold opacity-80 tracking-wider">
                Accuracy
              </span>
              <h3
                id="resAccuracy"
                className="text-3xl font-extrabold mt-1 font-display"
              >
                0%
              </h3>
            </div>
            <div className="glass-card p-5 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Final Score
              </span>
              <h3
                id="resScoreText"
                className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-display"
              >
                0/0
              </h3>
            </div>
          </div>

          <div id="resExtraStatsContainer"></div>

          <div className="space-y-3 mt-4">
            <button
              onClick={() => callWin('showQuizReview')}
              className="w-full py-3.5 rounded-xl glass-card text-indigo-600 dark:text-indigo-400 font-extrabold text-sm hover:bg-indigo-50 transition"
            >
              Inspect Detailed Solutions
            </button>
            <button
              onClick={() => callWin('closeQuizAll')}
              className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-extrabold text-sm shadow-lg"
            >
              Return to Portal
            </button>
          </div>
        </div>
      </div>

      {/* CBT SOLUTIONS REVIEW OVERLAY */}
      <div
        id="quizReviewView"
        className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 hidden flex flex-col"
      >
        <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
          <h3 className="font-extrabold text-slate-900 dark:text-white font-display">
            Step-by-Step Solutions
          </h3>
          <button
            onClick={() => {
              const el = document.getElementById('quizReviewView');
              if (el) el.classList.add('hidden');
            }}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-3.5 py-2 rounded-xl"
          >
            Done
          </button>
        </div>
        <div
          id="reviewListMain"
          className="flex-1 overflow-y-auto p-5 space-y-4 max-w-3xl w-full mx-auto"
        ></div>
      </div>

      {/* DAILY MOTIVATION MODAL */}
      <div
        id="quoteModal"
        className="fixed inset-0 z-50 bg-slate-950/75 hidden flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 w-full max-w-sm rounded-3xl p-7 shadow-2xl relative text-center text-white border border-white/15">
          <button
            onClick={() => callWin('closeQuoteModal')}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-lg text-white hover:bg-white/30 flex items-center justify-center backdrop-blur-sm"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl backdrop-blur-md shadow-inner">
            <i className="fa-solid fa-quote-left"></i>
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-200 mb-4">
            Scholar&apos;s Daily Spark
          </h3>
          <p
            id="dailyQuoteText"
            className="text-lg font-extrabold italic mb-4 leading-relaxed font-display"
          >
            &quot;Success is the sum of small efforts, repeated day in and day out.&quot;
          </p>
          <p id="dailyQuoteAuthor" className="text-xs font-semibold text-indigo-200">
            - Robert Collier
          </p>
          <button
            onClick={() => callWin('newQuote')}
            className="mt-6 bg-white text-indigo-700 font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition active:scale-95"
          >
            Inspire Me Again
          </button>
        </div>
      </div>

      {/* FOCUS TIMER (POMODORO) MODAL */}
      <div
        id="focusTimerModal"
        className="fixed inset-0 z-50 bg-slate-950/75 hidden flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-center">
          <button
            onClick={() => callWin('closeFocusTimer')}
            className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="w-14 h-14 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
            <i className="fa-solid fa-stopwatch"></i>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mb-1">
            Deep Focus Timer
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            25-minute distraction-free Pomodoro study sprint
          </p>

          <div className="w-48 h-48 rounded-full border-8 border-indigo-100 dark:border-slate-800 flex flex-col items-center justify-center mx-auto mb-6 relative shadow-inner">
            <span
              id="timerDisplay"
              className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight"
            >
              25:00
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mt-1">
              Focus Mode
            </span>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => callWin('startFocusTimer')}
              id="btnStartTimer"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 active:scale-95 transition flex items-center gap-2"
            >
              <i className="fa-solid fa-play"></i> Start
            </button>
            <button
              onClick={() => callWin('pauseFocusTimer')}
              id="btnPauseTimer"
              className="bg-amber-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition hidden flex items-center gap-2"
            >
              <i className="fa-solid fa-pause"></i> Pause
            </button>
            <button
              onClick={() => callWin('resetFocusTimer')}
              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs px-4 py-3.5 rounded-xl hover:bg-slate-200 transition active:scale-95"
            >
              <i className="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* APP GUIDE MODAL */}
      <div
        id="appGuideModal"
        className="fixed inset-0 z-50 bg-slate-950/75 hidden flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-center overflow-hidden">
          <button
            onClick={() => callWin('closeAppGuide')}
            className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 z-10 flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          <div id="appGuideContent" className="py-4">
            <div className="w-full overflow-hidden relative h-64">
              <div
                id="guideSlider"
                className="flex transition-transform duration-300 h-full"
              >
                <div className="min-w-full flex flex-col items-center justify-center px-4">
                  <div className="w-20 h-20 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-sm">
                    <i className="fa-solid fa-graduation-cap"></i>
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mb-2">
                    Welcome to The Online Classes
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your unified EdTech command center for structured batches, live interactive classes, and CBT mock tests.
                  </p>
                </div>
                <div className="min-w-full flex flex-col items-center justify-center px-4">
                  <div className="w-20 h-20 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-sm">
                    <i className="fa-solid fa-tower-broadcast"></i>
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mb-2">
                    HD Live &amp; Recorded Classes
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Never miss a concept. Join live broadcasts or revise anytime with 1080p recorded archives and PDF notes.
                  </p>
                </div>
                <div className="min-w-full flex flex-col items-center justify-center px-4">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-sm">
                    <i className="fa-solid fa-chart-Simple"></i>
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mb-2">
                    Track Your Rank &amp; Accuracy
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Attempt timed mock tests, inspect step-by-step solutions, and climb the live scholar leaderboard!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-1.5 mb-6" id="guideDots">
              <div className="w-4 h-1.5 rounded-full bg-indigo-600 transition-all"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 transition-all"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 transition-all"></div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => callWin('prevGuideSlide')}
                id="guidePrevBtn"
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hidden"
              >
                Previous
              </button>
              <button
                onClick={() => callWin('nextGuideSlide')}
                id="guideNextBtn"
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COURSE DETAIL & THEATER VIDEO OVERLAY */}
      <div
        id="courseDetailOverlay"
        className="fixed inset-0 z-50 bg-white dark:bg-slate-950 hidden flex flex-col overflow-y-auto animate-fade-in"
      >
        <div className="relative h-64 sm:h-80 lg:h-96 bg-slate-950 shrink-0 w-full max-w-5xl mx-auto sm:mt-4 sm:rounded-2xl overflow-hidden shadow-2xl">
          <div id="courseVideoPlayer" className="hidden w-full h-full relative">
            <iframe
              id="courseIframe"
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Course Video Player"
            ></iframe>
            <div className="absolute top-0 left-0 right-0 h-14 z-20 bg-transparent pointer-events-auto"></div>
            <div className="absolute bottom-0 right-0 w-36 h-12 z-20 bg-transparent pointer-events-auto"></div>
            <div className="absolute bottom-0 left-0 w-28 h-12 z-20 bg-transparent pointer-events-auto"></div>
          </div>

          <img
            id="courseDetailThumb"
            src=""
            className="w-full h-full object-cover opacity-85"
            alt="Course Thumbnail"
          />
          <div
            id="courseThumbOverlay"
            className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"
          ></div>

          <button
            onClick={() => callWin('closeCourseDetail')}
            className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-slate-900/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-900 transition z-30 border border-white/15"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>

          <div
            id="playIntroOverlay"
            onClick={() => callWin('playIntroVideo')}
            className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/90 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition shadow-2xl shadow-indigo-600/50">
              <i className="fa-solid fa-play text-2xl ml-1"></i>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 max-w-5xl w-full mx-auto bg-white dark:bg-slate-950 relative z-10 pb-28">
          <div className="flex justify-between items-start mb-3">
            <span
              id="detCategory"
              className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider"
            >
              Batch
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <i className="fa-solid fa-star"></i>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold">
                4.9
              </span>
            </div>
          </div>

          <h1
            id="detTitle"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mb-2 leading-tight"
          >
            Course Title
          </h1>
          <div className="flex items-baseline gap-2 mb-6">
            <p
              id="detPrice"
              className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-display"
            >
              Free
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass-card p-3.5 rounded-2xl text-center">
              <i className="fa-solid fa-layer-group text-indigo-500 text-sm mb-1"></i>
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                Level
              </p>
              <p
                id="detDifficulty"
                className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5"
              >
                All Levels
              </p>
            </div>
            <div className="glass-card p-3.5 rounded-2xl text-center">
              <i className="fa-solid fa-language text-violet-500 text-sm mb-1"></i>
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                Medium
              </p>
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                Hinglish
              </p>
            </div>
            <div className="glass-card p-3.5 rounded-2xl text-center">
              <i className="fa-solid fa-certificate text-emerald-500 text-sm mb-1"></i>
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                Tag
              </p>
              <p
                id="detTag"
                className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5"
              >
                Verified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl glass-card mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                Lead Educator
              </p>
              <h4
                id="detInstructor"
                className="font-extrabold text-slate-900 dark:text-white text-sm font-display"
              >
                Expert Faculty
              </h4>
              <p id="detRating" className="text-[11px] text-indigo-500 font-semibold">
                Senior Subject Specialist
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display mb-2">
                Batch Overview &amp; Syllabus
              </h3>
              <p
                id="detDesc"
                className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line"
              >
                Description loading...
              </p>
            </div>

            <div
              id="instructSec"
              className="hidden bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200/70 dark:border-amber-800/50"
            >
              <h3 className="font-extrabold text-amber-800 dark:text-amber-300 text-xs uppercase mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-info"></i> Batch Guidelines
              </h3>
              <p
                id="detInstruct"
                className="text-xs text-amber-700 dark:text-amber-200 leading-relaxed"
              ></p>
            </div>

            <div id="attachmentSec" className="hidden">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display mb-3">
                Included Study Material
              </h3>
              <div id="detAttachments" className="space-y-2.5"></div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-20">
          <div className="max-w-5xl mx-auto">
            <button
              id="detMainBtn"
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <span>Start Learning</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING GLASS BOTTOM NAVIGATION */}
      <nav className="bottom-nav" id="bottomNav">
        <div
          onClick={() => callWin('switchPage', 'home')}
          className="nav-item active"
          id="btn-home"
        >
          <i className="fa-solid fa-house"></i>
          <span>Home</span>
        </div>
        <div
          onClick={() => callWin('switchPage', 'mycourses')}
          className="nav-item"
          id="btn-mycourses"
        >
          <i className="fa-solid fa-circle-play"></i>
          <span>My Batches</span>
        </div>
        <div
          onClick={() => callWin('switchPage', 'notes')}
          className="nav-item"
          id="btn-notes"
        >
          <i className="fa-solid fa-book-open"></i>
          <span>Notes</span>
        </div>
        <div
          onClick={() => callWin('switchPage', 'timetable')}
          className="nav-item"
          id="btn-timetable"
        >
          <i className="fa-regular fa-calendar-days"></i>
          <span>Schedule</span>
        </div>
        <div
          onClick={() => callWin('switchPage', 'profile')}
          className="nav-item"
          id="btn-profile"
        >
          <i className="fa-regular fa-user"></i>
          <span>Profile</span>
        </div>
      </nav>
    </>
  );
};
