import React from 'react';

const callWin = (fnName: string, ...args: any[]) => {
  const w = window as any;
  if (typeof w[fnName] === 'function') {
    return w[fnName](...args);
  }
};

export const AuthAndProfileModals: React.FC = () => {
  return (
    <>
      {/* AUTHENTICATION & PROFILE SETUP MODAL */}
      <div
        id="authSection"
        className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl hidden flex flex-col justify-center items-center p-4 sm:p-6 overflow-y-auto"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative my-auto animate-fade-in max-h-[92dvh] overflow-y-auto">
          <div className="text-center mb-6">
            <div
              id="authLogo"
              className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30 overflow-hidden"
            >
              <img
                src="/toc-logo.svg"
                alt="The Online Classes Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
              The Online Classes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in to sync your batches, live classes &amp; mock test analytics
            </p>
          </div>

          <div id="loginForm" className="space-y-3">
            <button
              onClick={() => callWin('signInWithGoogle')}
              id="googleSignInBtn"
              className="w-full flex items-center justify-center gap-3 bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 font-bold py-4 px-4 rounded-2xl shadow-lg transition transform active:scale-95"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-5 h-5 bg-white rounded-full p-0.5"
                alt="Google"
              />
              <span className="text-sm">Continue with Google</span>
            </button>
            <button
              onClick={() => callWin('signInAsGuest')}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold py-3.5 px-4 rounded-2xl transition active:scale-95 text-xs"
            >
              <i className="fa-solid fa-bolt text-amber-500"></i>
              <span>Instant Guest Access</span>
            </button>
          </div>

          <div id="profileSetupForm" className="hidden space-y-3.5">
            <div className="bg-indigo-50 dark:bg-indigo-950/60 p-3 rounded-xl text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2 text-center border border-indigo-200/50 dark:border-indigo-800/50">
              Almost there! Complete your scholar profile
            </div>
            <div className="input-group">
              <i className="fa-regular fa-user input-icon"></i>
              <input
                type="text"
                id="setupName"
                placeholder="Full Name"
                className="app-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="input-group">
                <i className="fa-solid fa-venus-mars input-icon"></i>
                <select id="setupGender" className="app-input" defaultValue="">
                  <option value="" disabled>
                    Gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <i className="fa-solid fa-calendar-day input-icon"></i>
                <input
                  type="number"
                  id="setupAge"
                  placeholder="Age"
                  className="app-input"
                />
              </div>
            </div>
            <div className="input-group">
              <i className="fa-regular fa-envelope input-icon"></i>
              <input
                type="email"
                id="setupEmail"
                placeholder="Email Address"
                className="app-input bg-slate-100 dark:bg-slate-800 text-slate-400"
                readOnly
              />
            </div>
            <div className="input-group">
              <i className="fa-solid fa-phone input-icon"></i>
              <input
                type="tel"
                id="setupPhone"
                placeholder="WhatsApp / Mobile Number"
                className="app-input"
              />
            </div>
            <button
              onClick={() => callWin('saveProfileData')}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 mt-2 text-sm transition"
            >
              Complete Registration
            </button>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <div
        id="editProfileModal"
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex flex-col justify-center items-center p-4 sm:p-6 overflow-y-auto"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative my-auto animate-fade-in max-h-[90dvh] overflow-y-auto">
          <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
              Edit Scholar Profile
            </h3>
            <button
              onClick={() => callWin('closeEditProfileModal')}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="space-y-3.5">
            <div className="input-group">
              <i className="fa-regular fa-user input-icon"></i>
              <input
                type="text"
                id="editName"
                placeholder="Full Name"
                className="app-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="input-group">
                <i className="fa-solid fa-venus-mars input-icon"></i>
                <select id="editGender" className="app-input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <i className="fa-solid fa-calendar-day input-icon"></i>
                <input
                  type="number"
                  id="editAge"
                  placeholder="Age"
                  className="app-input"
                />
              </div>
            </div>
            <div className="input-group">
              <i className="fa-regular fa-envelope input-icon"></i>
              <input
                type="email"
                id="editEmail"
                placeholder="Email Address"
                className="app-input bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                readOnly
              />
            </div>
            <div className="input-group">
              <i className="fa-solid fa-phone input-icon"></i>
              <input
                type="tel"
                id="editPhone"
                placeholder="Phone Number"
                className="app-input"
              />
            </div>
            <button
              onClick={() => callWin('updateProfileData')}
              id="updateProfileBtn"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 mt-2 text-sm transition"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* SOCIAL MEDIA POPUP */}
      <div
        id="socialPopup"
        className="fixed inset-0 z-50 bg-slate-950/75 hidden flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-center max-h-[88dvh] overflow-y-auto">
          <button
            onClick={() => callWin('closeSocialPopup')}
            className="absolute top-4 right-4 w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="w-14 h-14 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
            <i className="fa-solid fa-share-nodes"></i>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mb-1">
            Connect With Us
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Join our official channels for daily exam updates &amp; free study PDFs
          </p>
          <div id="socialLinksGrid" className="grid grid-cols-2 gap-3"></div>
        </div>
      </div>

      {/* SUPPORT POPUP */}
      <div
        id="supportPopup"
        className="fixed inset-0 z-50 bg-slate-950/75 hidden flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-center max-h-[88dvh] overflow-y-auto">
          <button
            onClick={() => callWin('closeSupportPopup')}
            className="absolute top-4 right-4 w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">
            <i className="fa-solid fa-headset"></i>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mb-1">
            24/7 Student Care
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Need help with batch enrollment or technical issues? Reach out directly.
          </p>
          <div id="supportContactsList" className="space-y-3 text-left"></div>
        </div>
      </div>

      {/* GOAL / CATEGORY SELECTOR MODAL */}
      <div
        id="categorySelectorModal"
        className="fixed inset-0 z-50 bg-slate-950/75 hidden flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 pb-8 sm:pb-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85dvh] flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
                Select Your Target Goal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize batches, live classes &amp; mock tests for your exam
              </p>
            </div>
            <button
              onClick={() => callWin('closeCategorySelector')}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div
            id="categoryOptionList"
            className="overflow-y-auto space-y-2.5 flex-1 pr-1"
          >
            {/* Dynamic Categories */}
          </div>
        </div>
      </div>

      {/* MULTI-GATEWAY CHECKOUT MODAL (ZAPUPI, CASHFREE, RAZORPAY) */}
      <div
        id="cashfreeModal"
        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md hidden flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 pb-7 sm:pb-6 shadow-2xl text-center relative overflow-y-auto max-h-[92dvh] border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => callWin('closeCashfreeModal')}
            aria-label="Close modal"
            title="Close"
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-slate-500 dark:text-slate-300 hover:text-rose-600 flex items-center justify-center transition-all active:scale-90 z-10"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
          <div id="cashfreeModalBody">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              <i className="fa-solid fa-shield-halved fa-beat-fade"></i>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mb-1">
              Initializing Checkout
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Please wait while we prepare your encrypted payment session...
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-2/3 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* OFFICIAL BRAND LOGO SHOWCASE & PREVIEW MODAL */}
      <div
        id="brandLogoPreviewModal"
        className="fixed inset-0 z-[110] bg-slate-950/85 backdrop-blur-xl hidden flex items-center justify-center p-4 animate-fade-in"
        onClick={() => callWin('closeBrandLogoModal')}
      >
        <div
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => callWin('closeBrandLogoModal')}
            aria-label="Close Logo Preview"
            title="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 flex items-center justify-center transition-all active:scale-90"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>

          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 block mb-1">
            Official Brand Identity
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
            The Online Classes (TOC)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
            Royal Indigo &amp; Gold Academic Crest • High-Definition Vector Emblem
          </p>

          {/* Studio Logo Stage */}
          <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-5 flex items-center justify-center shadow-2xl border border-indigo-500/30 mb-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25),transparent_70%)] rounded-3xl pointer-events-none"></div>
            <img
              id="brandLogoPreviewImg"
              src="/toc-logo.svg"
              alt="The Online Classes Official Crest Logo"
              className="w-full h-full object-contain drop-shadow-2xl relative z-10"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-left bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 mb-5">
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400">Crown</p>
              <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">Scholar Cap</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400">Emblem</p>
              <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">Open Book</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400">Monogram</p>
              <p className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">TOC Crest</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <a
              href="/toc-logo.svg"
              download="The-Online-Classes-Official-Logo.svg"
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition active:scale-95"
            >
              <i className="fa-solid fa-download"></i>
              <span>Download Logo</span>
            </a>
            <button
              onClick={() => callWin('closeBrandLogoModal')}
              className="py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
