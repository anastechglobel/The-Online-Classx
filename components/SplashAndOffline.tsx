import React from "react";

export function SplashAndOffline() {
  return (
    <>
      {/* Premium Splash Screen */}
      <div id="splash">
        <div className="splash-logo-container">
          <img
            src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%234f46e5'/><stop offset='100%' stop-color='%237c3aed'/></linearGradient></defs><rect width='120' height='120' rx='28' fill='url(%23g)'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='900' font-size='42'>TOC</text></svg>"
            alt="TOC Logo"
            className="splash-logo-img"
          />
          <div className="splash-glow"></div>
        </div>
        <div className="splash-text-container">
          <h1 className="splash-title">The Online Classes</h1>
          <p className="splash-subtitle">Empowering Education Everywhere</p>
        </div>
        <div className="loader-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>

      {/* No Internet Popup */}
      <div id="noInternet">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mb-5">
            <i className="fa-solid fa-wifi-slash text-4xl"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            No Internet Connection
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
            Please check your network connection and try again.
          </p>
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={() => window.location.reload()}
              className="btn-blue text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
            >
              Retry Connection
            </button>
            <button
              onClick={() => window.forceOnline && window.forceOnline()}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest py-2"
            >
              Continue Offline
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
