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
        className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl hidden flex flex-col justify-center items-center p-6 overflow-y-auto"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative my-auto animate-fade-in">
          <div className="text-center mb-6">
            <img
              id="authLogo"
              src="https://via.placeholder.com/80"
              className="w-20 h-20 rounded-2xl mx-auto mb-3 shadow-lg object-cover hidden"
              alt="Auth Logo"
            />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-xl font-display mx-auto mb-4 shadow-xl shadow-indigo-500/30">
              TOC
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
              The Online Classes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in to sync your batches, live classes &amp; mock test analytics
            </p>
          </div>

          <div id="loginForm" className="space-y-4">
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
          </div>

          <div id="profileSetupForm" className="hidden space-y-4">
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
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex flex-col justify-center items-center p-6 overflow-y-auto"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative my-auto animate-fade-in">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
              Edit Scholar Profile
            </h3>
            <button
              onClick={() => callWin('closeEditProfileModal')}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="space-y-4">
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
        className="fixed inset-0 z-50 bg-slate-950/75 hidden flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-center">
          <button
            onClick={() => callWin('closeSocialPopup')}
            className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="w-14 h-14 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
            <i className="fa-solid fa-share-nodes"></i>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mb-1">
            Connect With Us
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Join our official channels for daily exam updates &amp; free study PDFs
          </p>
          <div id="socialLinksGrid" className="grid grid-cols-2 gap-3"></div>
        </div>
      </div>

      {/* SUPPORT POPUP */}
      <div
        id="supportPopup"
        className="fixed inset-0 z-50 bg-slate-950/75 hidden flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-center">
          <button
            onClick={() => callWin('closeSupportPopup')}
            className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">
            <i className="fa-solid fa-headset"></i>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mb-1">
            24/7 Student Care
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
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
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col">
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
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
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

      {/* CASHFREE CHECKOUT MODAL */}
      <div
        id="cashfreeModal"
        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md hidden flex items-center justify-center p-4 animate-fade-in"
      >
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden border border-slate-200 dark:border-slate-800">
          <div id="cashfreeModalBody">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              <i className="fa-solid fa-shield-halved fa-beat-fade"></i>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mb-1">
              Initializing Cashfree Checkout
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
    </>
  );
};
