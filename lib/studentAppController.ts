import { auth, db, fb } from "./firebase";

declare global {
  interface Window {
    [key: string]: any;
  }
}

let isControllerInitialized = false;

export function initStudentAppController() {
  if (typeof window === "undefined" || isControllerInitialized) return;
  isControllerInitialized = true;

  // Audio Synthesizer for notifications, streaks, and test completion
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioCtx ? new AudioCtx() : null;

  function playSound(type: string) {
    try {
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      if (type === "notification") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === "streak") {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "triangle";
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0, now + i * 0.1);
          gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.8);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.8);
        });
      } else if (type === "testComplete") {
        const notes = [587.33, 739.99, 880.0];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.setValueAtTime(freq, now + i * 0.15);
          gain.gain.setValueAtTime(0, now + i * 0.15);
          gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.6);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.6);
        });
      }
    } catch (e) {
      console.log("Audio play prevented:", e);
    }
  }
  window.playSound = playSound;

  // Safe DOM helper utilities
  const safeSetHTML = (id: string, html: string) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };
  const safeSetVal = (id: string, val: any) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = val;
  };
  const safeSetSrc = (id: string, src: string) => {
    const el = document.getElementById(id) as HTMLImageElement | HTMLIFrameElement | null;
    if (el) el.src = src;
  };
  const safeGetText = (id: string, def = "") => {
    const el = document.getElementById(id);
    return el ? el.innerText : def;
  };
  const safeClassAdd = (id: string, ...cls: string[]) => {
    const el = document.getElementById(id);
    if (el) el.classList.add(...cls);
  };
  const safeClassRemove = (id: string, ...cls: string[]) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove(...cls);
  };
  const safeClassToggle = (id: string, cls: string) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle(cls);
  };
  const safeSetStyle = (id: string, prop: string, val: string) => {
    const el = document.getElementById(id);
    if (el && el.style) (el.style as any)[prop] = val;
  };
  function safeSetValue(id: string, val: any) {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = val !== undefined && val !== null ? val : "";
  }
  function safeSetText(id: string, text: any) {
    const el = document.getElementById(id);
    if (el) el.innerText = text !== undefined && text !== null ? String(text) : "";
  }

  let currentUser: any = null;
  let userData: any = null;
  let currentCourseId: string | null = null;
  let allCoursesCached: any[] = [];
  let coursesLoaded = false;
  let allTestsCached: any[] = [];
  let allLiveCached: any[] = [];
  let allNotesCached: any[] = [];
  let allTimetablesCached: any[] = [];
  let allToppersCached: any[] = [];
  let allQuizLeaderboardCached: any[] = [];
  let allUpcomingCached: any[] = [];
  let allCategoriesCached: any[] = [];
  let allSubjectsCached: any[] = [];
  let pendingPurchases = new Set<string>();

  let activeCategory = localStorage.getItem("user_category") || "";

  window.onGenderChange = function (_selectId: string, _val: string) {
    // Preserved hook for gender select change
  };

  function showCategorySelector() {
    const list = document.getElementById("categoryOptionList");
    if (!list) return;
    list.innerHTML = "";

    list.innerHTML += `
      <div onclick="selectCategory('')" class="p-4 rounded-2xl border ${
        activeCategory === ""
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
          : "bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-blue-400"
      } active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl ${
            activeCategory === ""
              ? "bg-white/20 text-white"
              : "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200/60 dark:border-slate-700"
          } flex items-center justify-center text-base shadow-2xs">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <p class="text-[9px] font-extrabold uppercase tracking-widest ${
              activeCategory === "" ? "text-blue-100" : "text-slate-400"
            }">Complete Catalogue</p>
            <h3 class="font-extrabold text-sm tracking-tight">All Classes & Exams</h3>
          </div>
        </div>
        <i class="fa-solid ${
          activeCategory === "" ? "fa-circle-check text-white" : "fa-chevron-right text-slate-400"
        } text-sm"></i>
      </div>
    `;

    allCategoriesCached.forEach((cat) => {
      const isSelected = activeCategory === cat.name;
      list.innerHTML += `
        <div onclick="selectCategory('${cat.name}')" class="p-4 rounded-2xl border ${
          isSelected
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
            : "bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-blue-400"
        } active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl ${
              isSelected
                ? "bg-white/20 text-white"
                : "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200/60 dark:border-slate-700"
            } flex items-center justify-center text-base shadow-2xs">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <p class="text-[9px] font-extrabold uppercase tracking-widest ${
                isSelected ? "text-blue-100" : "text-slate-400"
              }">Target Exam</p>
              <h3 class="font-extrabold text-sm tracking-tight font-sans">${cat.name}</h3>
            </div>
          </div>
          <i class="fa-solid ${
            isSelected ? "fa-circle-check text-white" : "fa-chevron-right text-slate-400"
          } text-sm"></i>
        </div>
      `;
    });

    safeClassRemove("categorySelectorModal", "hidden");
    document.body.style.overflow = "hidden";
  }

  function hideCategorySelector() {
    safeClassAdd("categorySelectorModal", "hidden");
    document.body.style.overflow = "";
  }

  function selectCategory(catName: string) {
    activeCategory = catName;
    localStorage.setItem("user_category", catName);
    const triggerText = document.getElementById("activeClassName");
    if (triggerText) triggerText.innerText = catName || "All Classes";
    hideCategorySelector();
    refreshUI();
    showToast(catName ? `Switched to ${catName}` : "Showing All Classes");
  }

  function renderCategoryFilters() {
    const container = document.getElementById("courseCategories");
    if (!container) return;

    container.innerHTML = `
      <button onclick="selectCategory('')" class="${
        activeCategory === ""
          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-blue-400"
      } border px-4 py-2 rounded-xl whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wider transition-all active:scale-95">All Batches</button>
    `;

    allCategoriesCached.forEach((cat) => {
      const isSelected = activeCategory === cat.name;
      container.innerHTML += `
        <button onclick="selectCategory('${cat.name}')" class="${
          isSelected
            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-blue-400"
        } border px-4 py-2 rounded-xl whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wider transition-all active:scale-95">${cat.name}</button>
      `;
    });
  }

  function refreshUI() {
    renderHomeCourses();
    renderAllCourses();
    renderUpcoming();
    renderTests();
    renderLive();
    renderNotes();
    renderCategoryFilters();

    const sideCat = document.getElementById("sidebarCategory");
    if (sideCat) sideCat.innerText = activeCategory || "General";
  }

  function renderAllCourses(filtered?: any[]) {
    const fullCourses = document.getElementById("fullCoursesList");
    if (!fullCourses) return;
    fullCourses.innerHTML = "";

    let data = filtered || allCoursesCached;
    if (!filtered && activeCategory) {
      data = allCoursesCached.filter((c) => c.category === activeCategory);
    }

    if (data.length === 0) {
      fullCourses.innerHTML =
        '<div class="col-span-full text-center py-16 text-slate-400 font-bold text-xs uppercase tracking-wider bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">No batches available for this category.</div>';
      return;
    }

    data.forEach((c) => {
      fullCourses.innerHTML += generateCourseCard(c);
    });
  }

  function renderMyCourses() {
    const myCoursesList = document.getElementById("myCoursesList");
    const noMyCoursesMsg = document.getElementById("noMyCoursesMsg");
    if (!myCoursesList) return;

    myCoursesList.innerHTML = "";

    const purchased = allCoursesCached.filter((c) => {
      return (userData && userData.purchased && userData.purchased[c.id]) || c.type === "Free";
    });

    const pending = allCoursesCached.filter((c) => {
      return (
        pendingPurchases.has(c.id) &&
        !(userData && userData.purchased && userData.purchased[c.id])
      );
    });

    if (purchased.length === 0 && pending.length === 0) {
      if (noMyCoursesMsg) noMyCoursesMsg.classList.remove("hidden");
      return;
    } else {
      if (noMyCoursesMsg) noMyCoursesMsg.classList.add("hidden");
    }

    purchased.forEach((c) => {
      const card = `
        <div onclick="openCourse('${c.id}', '${c.type}')" class="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-soft hover:shadow-elevated border border-slate-200/80 dark:border-slate-800 group hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col">
          <div class="relative aspect-[16/9] overflow-hidden bg-slate-900">
            <img src="${c.thumbnail}" class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
            <div class="absolute top-3.5 left-3.5">
              <span class="text-[10px] font-extrabold text-white uppercase tracking-wider bg-blue-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg">${c.category}</span>
            </div>
            <div class="absolute bottom-3.5 left-4 flex items-center gap-2">
              <span class="bg-emerald-400 w-2 h-2 rounded-full animate-pulse"></span>
              <span class="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider">Enrolled Batch</span>
            </div>
          </div>
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${c.title}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 flex items-center gap-2">
                <i class="fa-solid fa-chalkboard-user text-blue-500"></i> ${c.instructor || "Expert Faculty"}
              </p>
            </div>
            <button class="w-full btn-blue text-white py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm">
              <span>Continue Classroom</span> <i class="fa-solid fa-circle-play text-xs"></i>
            </button>
          </div>
        </div>
      `;
      myCoursesList.innerHTML += card;
    });

    pending.forEach((c) => {
      const card = `
        <div onclick="openCourse('${c.id}', '${c.type}')" class="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-dashed border-amber-300 dark:border-amber-800/60 opacity-90 group transition-all duration-300 cursor-pointer flex flex-col">
          <div class="relative aspect-[16/9] grayscale opacity-70">
            <img src="${c.thumbnail}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-slate-950/30"></div>
          </div>
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <span class="inline-block text-[9px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg mb-2">Verification in Progress</span>
              <h3 class="text-base font-extrabold text-slate-700 dark:text-slate-300 leading-snug mb-3">${c.title}</h3>
            </div>
            <div class="bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-800/50 flex items-center gap-2.5">
              <i class="fa-solid fa-clock-rotate-left text-amber-500"></i>
              <span class="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Payment under admin review</span>
            </div>
          </div>
        </div>
      `;
      myCoursesList.innerHTML += card;
    });
  }

  function handleCourseFilter() {
    const searchEl = document.getElementById("courseSearch") as HTMLInputElement | null;
    const sortEl = document.getElementById("courseSort") as HTMLSelectElement | null;
    const queryStr = searchEl ? searchEl.value.toLowerCase() : "";
    const sort = sortEl ? sortEl.value : "latest";

    const filtered = allCoursesCached.filter(
      (c) =>
        (c.title && c.title.toLowerCase().includes(queryStr)) ||
        (c.description && c.description.toLowerCase().includes(queryStr)) ||
        (c.category && c.category.toLowerCase().includes(queryStr))
    );

    if (sort === "latest") {
      filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sort === "popular") {
      filtered.sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0));
    } else if (sort === "priceLow") {
      filtered.sort((a, b) => {
        const pa = a.discount > 0 ? Math.round(a.price * (1 - a.discount / 100)) : a.price;
        const pb = b.discount > 0 ? Math.round(b.price * (1 - b.discount / 100)) : b.price;
        return pa - pb;
      });
    } else if (sort === "priceHigh") {
      filtered.sort((a, b) => {
        const pa = a.discount > 0 ? Math.round(a.price * (1 - a.discount / 100)) : a.price;
        const pb = b.discount > 0 ? Math.round(b.price * (1 - b.discount / 100)) : b.price;
        return pb - pa;
      });
    }

    renderAllCourses(filtered);
  }

  function generateCourseCard(c: any) {
    const id = c.id;
    const hasAccess = (userData && userData.purchased && userData.purchased[id]) || c.type === "Free";
    const isPending = pendingPurchases.has(id);
    const priceVal = c.discount > 0 ? Math.round(c.price * (1 - c.discount / 100)) : c.price;
    const fallbackImg =
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%230f172a'/><stop offset='100%' stop-color='%231e3a8a'/></linearGradient></defs><rect width='640' height='360' fill='url(%23g)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2393c5fd' font-family='sans-serif' font-weight='800' font-size='22'>THE ONLINE CLASSES</text></svg>";
    const safeTitle = (c.title || "").replace(/'/g, "\\'");
    return `
      <div onclick="openCourse('${id}', '${c.type}')" class="glass-card course-card group flex flex-col cursor-pointer rounded-3xl overflow-hidden">
        <div class="relative w-full aspect-[16/9] shrink-0 overflow-hidden bg-slate-900">
          <img src="${c.thumbnail || fallbackImg}" onerror="this.onerror=null;this.src='${fallbackImg}'" referrerPolicy="no-referrer" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="${c.title}">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
          <button onclick="event.stopPropagation(); shareCourse('${id}', '${safeTitle}')" class="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-slate-950/60 hover:bg-blue-600 backdrop-blur-md text-white flex items-center justify-center transition-colors z-10 border border-white/15" title="Share Batch">
            <i class="fa-solid fa-share-nodes text-xs"></i>
          </button>
          <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white z-10">
            <span class="text-xs font-semibold flex items-center gap-1.5 text-slate-100 truncate">
              <i class="fa-solid fa-chalkboard-user text-emerald-400"></i> ${c.instructor || "Top Educators"}
            </span>
            <div class="flex items-center gap-1 text-xs font-bold text-amber-300 tabular-nums shrink-0">
              <i class="fa-solid fa-star text-[10px] text-amber-400"></i>
              <span>${c.rating || "4.9"}</span>
            </div>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5 flex-wrap">
              <span>${c.category || "Target Batch"}</span>
              <span aria-hidden="true" class="text-slate-300 dark:text-slate-600">·</span>
              <span class="text-slate-500 dark:text-slate-400">Lectures · PDF Notes · CBT Tests</span>
              ${
                c.tag
                  ? `<span aria-hidden="true" class="text-slate-300 dark:text-slate-600">·</span><span class="text-emerald-600 dark:text-emerald-400">${c.tag}</span>`
                  : ""
              }
            </div>
            <h3 class="font-display font-extrabold text-base sm:text-lg leading-snug mb-2 line-clamp-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${c.title}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium mb-4">${
              c.description ||
              "Complete syllabus coverage with live lectures, PDF study notes & CBT mock tests."
            }</p>
          </div>

          <div class="flex justify-between items-center pt-3.5 border-t border-slate-200/60 dark:border-slate-800 gap-2">
            <div class="flex flex-col">
              ${
                c.discount > 0 && c.price > 0
                  ? `
                    <div class="flex items-center gap-1.5 text-xs">
                      <span class="text-slate-400 line-through font-medium tabular-nums">₹${c.price}</span>
                      <span aria-hidden="true" class="text-slate-300 dark:text-slate-600">·</span>
                      <span class="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">${c.discount}% Off</span>
                    </div>
                    <span class="text-slate-900 dark:text-white font-display font-black text-xl leading-tight tracking-tight tabular-nums">₹${priceVal}</span>
                  `
                  : `
                    <span class="text-[11px] font-medium text-slate-400">Batch Fee</span>
                    <span class="${
                      c.price > 0
                        ? "text-slate-900 dark:text-white"
                        : "text-emerald-600 dark:text-emerald-400"
                    } font-display font-black text-xl leading-tight tracking-tight tabular-nums">${
                      c.price > 0 ? "₹" + c.price : "FREE"
                    }</span>
                  `
              }
            </div>
            <div class="shrink-0">
              ${
                hasAccess
                  ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20 whitespace-nowrap"><i class="fa-solid fa-circle-check text-emerald-500"></i> Study Now</span>'
                  : isPending
                  ? '<span class="text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5 bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-500/20 whitespace-nowrap"><i class="fa-solid fa-clock text-amber-500"></i> Pending</span>'
                  : '<button class="btn-blue text-white font-bold text-xs flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 whitespace-nowrap"><span>Explore Batch</span> <i class="fa-solid fa-arrow-right text-[10px]"></i></button>'
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Dark Mode Logic
  function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeUI(isDark);
    showToast(isDark ? "Dark Mode Enabled" : "Light Mode Enabled");
  }

  function updateThemeUI(isDark: boolean) {
    const icon = document.getElementById("themeIcon");
    const label = document.getElementById("themeLabel");
    if (icon) icon.className = isDark ? "fa-solid fa-sun text-sm" : "fa-solid fa-moon text-sm";
    if (label) label.innerText = isDark ? "Light Mode" : "Dark Mode";

    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      if (isDark) sidebar.classList.add("dark");
      else sidebar.classList.remove("dark");
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      updateThemeUI(true);
    } else {
      updateThemeUI(false);
    }
  }

  async function saveProfile() {
    const name = (document.getElementById("setupName") as HTMLInputElement | null)?.value.trim() || "";
    const gender = (document.getElementById("setupGender") as HTMLSelectElement | null)?.value || "";
    const age = (document.getElementById("setupAge") as HTMLInputElement | null)?.value || "";
    const email = (document.getElementById("setupEmail") as HTMLInputElement | null)?.value.trim() || "";
    const phone = (document.getElementById("setupPhone") as HTMLInputElement | null)?.value.trim() || "";

    if (!name || !gender || !age || !phone) {
      alert("Please fill all mandatory fields (Name, Gender, Age, Phone)");
      return;
    }

    if (phone.length < 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    const profile: any = userData
      ? { ...userData }
      : {
          uid: currentUser.uid,
          role: "user",
          createdAt: Date.now(),
          purchased: {},
        };

    profile.name = name;
    profile.gender = gender;
    profile.age = age;
    profile.email = email;
    profile.phone = phone;
    profile.lastLogin = Date.now();

    try {
      if (currentUser && currentUser.uid) {
        await fb.set(fb.ref(db, "users/" + currentUser.uid), profile);
      }
      userData = profile;

      safeClassAdd("authSection", "hidden");
      safeClassAdd("profileSetupForm", "hidden");
      safeClassRemove("mainContent", "hidden");
      safeClassRemove("bottomNav", "hidden");

      loadAppData();
      showToast("Account Saved Successfully!");
    } catch (e: any) {
      alert("Error saving profile: " + e.message);
    }
  }

  function openEditProfile() {
    if (!userData) {
      const pName = document.getElementById("profileName")?.innerText;
      const pPhone = document.getElementById("profilePhone")?.innerText;
      const pGender = document.getElementById("profileGender")?.innerText;
      const pAge = document.getElementById("profileAge")?.innerText;
      const pEmail = document.getElementById("profileEmail")?.innerText;

      userData = {
        name: pName && pName !== "User Name" ? pName : currentUser?.displayName || "Student",
        gender: pGender && pGender !== "Not set" ? pGender : "Male",
        age: pAge && pAge !== "Not set" ? pAge : "20",
        email: pEmail && pEmail !== "Not provided" ? pEmail : currentUser?.email || "",
        phone: pPhone && pPhone !== "+91 1234567890" ? pPhone : currentUser?.phoneNumber || "",
      };
    }

    safeSetValue("editName", userData.name || currentUser?.displayName || "");
    safeSetValue("editGender", userData.gender || "Male");
    safeSetValue("editAge", userData.age || "20");
    safeSetValue("editEmail", userData.email || currentUser?.email || "");
    safeSetValue("editPhone", userData.phone || currentUser?.phoneNumber || "");

    const modal = document.getElementById("editProfileModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  function closeEditProfile() {
    const modal = document.getElementById("editProfileModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  async function updateProfile() {
    const name = (document.getElementById("editName") as HTMLInputElement | null)?.value.trim();
    const gender = (document.getElementById("editGender") as HTMLSelectElement | null)?.value;
    const age = (document.getElementById("editAge") as HTMLInputElement | null)?.value.trim();
    const email = (document.getElementById("editEmail") as HTMLInputElement | null)?.value.trim();
    const phone = (document.getElementById("editPhone") as HTMLInputElement | null)?.value.trim();

    if (!name || !gender || !age || !phone) {
      alert("Please fill all mandatory fields (Name, Gender, Age, Phone)");
      return;
    }

    const btn = document.getElementById("updateProfileBtn") as HTMLButtonElement | null;
    const originalText = btn ? btn.innerText : "Save Changes";
    if (btn) {
      btn.innerText = "Saving...";
      btn.disabled = true;
    }

    try {
      const updatedData = {
        ...(userData || {}),
        name,
        gender,
        age,
        email,
        phone,
        lastModified: Date.now(),
      };

      if (currentUser && currentUser.uid) {
        try {
          await fb.update(fb.ref(db, "users/" + currentUser.uid), updatedData);
        } catch (fbErr) {
          console.warn("Firebase save failed, falling back to local storage:", fbErr);
          localStorage.setItem("user_profile_" + currentUser.uid, JSON.stringify(updatedData));
        }
      }

      userData = updatedData;

      safeSetText("profileName", userData.name);
      safeSetText("profilePhone", userData.phone || "");
      safeSetText("profileGender", userData.gender || "Not set");
      safeSetText("profileAge", userData.age || "");
      safeSetText("profileEmail", userData.email || "Not provided");

      const initial =
        userData.name && userData.name.length > 0 ? userData.name.charAt(0).toUpperCase() : "U";
      safeSetText("userAvatar", initial);
      safeSetText("profileAvatar", initial);
      safeSetText("sidebarUserName", userData.name);
      safeSetText("sidebarUserPhone", userData.phone || "");
      safeSetText("sidebarAvatar", initial);

      const uName = document.getElementById("userNameHeader");
      if (uName) uName.innerText = userData.name.split(" ")[0];

      closeEditProfile();
      showToast("Profile Updated Successfully!");
    } catch (e: any) {
      alert("Error updating profile: " + e.message);
    } finally {
      if (btn) {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    }
  }

  async function signInWithGoogle() {
    const btn = document.getElementById("googleSignInBtn") as HTMLButtonElement | null;
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Connecting...';

    try {
      const provider = new fb.GoogleAuthProvider();
      const result = await fb.signInWithPopup(auth, provider);
      currentUser = result.user;
      showToast("Signed in successfully!");
      checkUserProfile();
    } catch (err: any) {
      console.warn("Google Sign-In Error:", err);
      if (err.code === "auth/popup-blocked" || err.code === "auth/unauthorized-domain") {
        alert(
          "Sign-in popup was blocked or unauthorized in this preview environment. You can open the app in a new tab, or use 'Instant Guest Access' below."
        );
      } else if (err.code === "auth/popup-closed-by-user") {
        // user closed popup
      } else {
        alert("Sign-in failed: " + err.message);
      }
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }

  function checkUserProfile() {
    const uid = currentUser.uid;
    fb.get(fb.ref(db, "users/" + uid))
      .then((snapshot) => {
        if (snapshot.exists()) {
          handleProfileData(snapshot.val(), uid);
        } else {
          let userPhone = currentUser.phoneNumber;
          if (
            !userPhone &&
            currentUser.email &&
            currentUser.email.includes("@the-online-classes.auth.com")
          ) {
            userPhone = "+" + currentUser.email.split("@")[0];
          }

          if (userPhone) {
            fb.get(fb.query(fb.ref(db, "users"), fb.orderByChild("phone"), fb.equalTo(userPhone)))
              .then((phoneSnap) => {
                if (phoneSnap.exists()) {
                  let oldData: any = null;
                  phoneSnap.forEach((childSnap) => {
                    oldData = childSnap.val();
                  });

                  if (oldData) {
                    oldData.uid = uid;
                    fb.set(fb.ref(db, "users/" + uid), oldData)
                      .then(() => handleProfileData(oldData, uid))
                      .catch(() => handleProfileData(oldData, uid));
                  } else {
                    showProfileSetup();
                  }
                } else {
                  showProfileSetup();
                }
              })
              .catch(() => showProfileSetup());
          } else {
            showProfileSetup();
          }
        }
      })
      .catch((e: any) => {
        if (e.message && e.message.includes("Permission denied")) {
          showProfileSetup();
        } else {
          console.warn("Profile check error:", e);
          showAuth();
        }
      });
  }

  function handleProfileData(data: any, _currentUid: string) {
    if (!data || !data.phone) {
      userData = data || null;
      showProfileSetup();
      return;
    }

    userData = data;
    const adminPhones = ["+919999999999", "+918000000000"];
    const adminEmails = ["xanasrahmani@gmail.com"];

    if (
      adminEmails.includes(currentUser.email) ||
      adminPhones.includes(currentUser.phoneNumber) ||
      (userData && userData.role === "admin")
    ) {
      if (userData) userData.isAdmin = true;
      safeClassRemove("adminSidebarBtn", "hidden");
    }

    hideAuth();
    loadAppData();
  }

  let notificationsSnapshotCached: any = null;

  function renderNotifications(input: any) {
    const nList = document.getElementById("notifList");
    if (!nList) return;
    nList.innerHTML = "";

    let data: any[] = [];
    if (Array.isArray(input)) {
      data = [...input];
    } else if (input && typeof input.forEach === "function") {
      input.forEach((childSnap: any) => {
        data.push({ id: childSnap.key, ...childSnap.val() });
      });
    }

    if (!Array.isArray(input)) data.reverse();

    const hiddenNots: string[] = JSON.parse(localStorage.getItem("hidden_notifications") || "[]");
    let visibleCount = 0;

    data.forEach((n) => {
      const id = n.id;
      if (hiddenNots.includes(id)) return;

      if (
        n.category &&
        n.category !== "All" &&
        typeof activeCategory !== "undefined" &&
        activeCategory &&
        n.category !== activeCategory
      ) {
        return;
      }

      visibleCount++;
      const timeStr = new Date(n.time || n.timestamp || Date.now()).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      nList.innerHTML += `
        <div class="glass-card p-3.5 rounded-2xl relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button onclick="hideNotification('${id}')" class="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-500">
            <i class="fa-solid fa-xmark text-[10px]"></i>
          </button>
          <div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 pr-6">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
            <span class="text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider">${
              n.category || "Global"
            }</span>
            <span>·</span>
            <span class="tabular-nums">${timeStr}</span>
          </div>
          <h3 class="font-display font-bold text-xs text-slate-900 dark:text-white tracking-tight line-clamp-1 mb-0.5">${
            n.title || ""
          }</h3>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">${
            n.message || ""
          }</p>
        </div>
      `;
    });

    if (visibleCount === 0) {
      nList.innerHTML =
        '<div class="text-center py-10 text-slate-400 text-xs font-bold">No new notifications.</div>';
    }

    const badge = document.getElementById("unreadNotifBadge");
    if (badge) {
      if (visibleCount > 0) badge.classList.remove("hidden");
      else badge.classList.add("hidden");
    }
  }

  let sliderInterval: any;
  let currentSlide = 0;

  function renderSlider(snapshot: any) {
    const wrapper = document.getElementById("homeSlider");
    const dots = document.getElementById("sliderDots");
    if (!wrapper || !dots) return;

    wrapper.innerHTML = "";
    dots.innerHTML = "";
    let index = 0;

    if (!snapshot.exists()) {
      wrapper.innerHTML = `<div class="slider-item bg-slate-900 flex items-center justify-center h-full"><p class="text-white/30 text-[10px] font-bold">NO ACTIVE BANNERS</p></div>`;
      return;
    }

    snapshot.forEach((childSnap: any) => {
      const s = childSnap.val();
      const url = typeof s === "string" ? s : s.url;
      wrapper.innerHTML += `
        <div onclick="handleSliderAction('${childSnap.key}')" class="slider-item h-full cursor-pointer overflow-hidden">
          <img src="${url}" class="w-full h-full object-cover transition-transform hover:scale-105 duration-[3000ms]">
        </div>
      `;
      dots.innerHTML += `<div class="dot w-1.5 h-1.5 rounded-full bg-white/40 transition-all ${
        index === 0 ? "bg-white w-4" : ""
      }" data-index="${index}"></div>`;
      index++;
    });

    startSlider(index);
  }

  async function handleSliderAction(sliderId: string) {
    const snap = await fb.get(fb.ref(db, `sliders/${sliderId}`));
    if (!snap.exists()) return;
    const s = snap.val();
    if (typeof s === "string" || !s.action || s.action === "none") return;

    switch (s.action) {
      case "course":
        openCourse(s.target);
        break;
      case "note":
        fb.get(fb.ref(db, `notes/${s.target}`)).then((snapNote) => {
          if (snapNote.exists()) {
            const n = snapNote.val();
            n.id = s.target;
            const hasAccess = checkItemAccess(n, "note");
            const isFree =
              n.type === "Free" || n.status === "Free" || n.accessType === "Free" || n.isFree;
            if (isFree || hasAccess) {
              viewPdf(n.url, n.title);
            } else {
              showToast("Please purchase the linked course to access this note.");
            }
          }
        });
        break;
      case "test":
        fb.get(fb.ref(db, `tests/${s.target}`)).then((snapTest) => {
          if (snapTest.exists()) {
            const t = snapTest.val();
            t.id = s.target;
            const hasAccess = checkItemAccess(t, "test");
            const isFree = t.status === "Free" || t.accessType === "Free" || t.isFree;
            if (isFree || hasAccess) {
              startQuiz(s.target);
            } else {
              showToast("Please purchase the linked course to access this test.");
            }
          }
        });
        break;
      case "youtube":
        if (s.target.includes("youtu")) {
          playDemoVideo(s.target);
        } else {
          window.open(s.target, "_blank");
        }
        break;
    }
  }

  function startSlider(total: number) {
    clearInterval(sliderInterval);
    if (total <= 1) return;
    currentSlide = 0;
    const wrapper = document.getElementById("homeSlider");
    const dots = document.querySelectorAll("#sliderDots .dot");

    sliderInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % total;
      if (wrapper) wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.forEach((d, i) => {
        d.classList.toggle("bg-white", i === currentSlide);
        d.classList.toggle("w-4", i === currentSlide);
        d.classList.toggle("bg-white/40", i !== currentSlide);
        d.classList.toggle("w-1.5", i !== currentSlide);
      });
    }, 4000);
  }

  function renderDemoClasses(snapshot: any) {
    const list = document.getElementById("homeDemoList");
    if (!list) return;
    list.innerHTML = "";

    if (!snapshot.exists()) {
      list.innerHTML = `<div class="min-w-[260px] aspect-video bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center"><p class="text-[11px] text-slate-400 font-bold">No demo lectures available yet.</p></div>`;
      return;
    }

    const demoFallbackThumb =
      "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Cdefs%3E%3ClinearGradient id='dg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23064e3b'/%3E%3Cstop offset='100%25' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23dg)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='800' font-size='22' fill='%2334d399'%3EFREE DEMO CLASS%3C/text%3E%3C/svg%3E";
    snapshot.forEach((childSnap: any) => {
      const d = childSnap.val();
      const id = childSnap.key;
      list.innerHTML += `
        <div onclick="openDemo('${id}', '${d.playMode}', '${d.videoUrl}')" class="min-w-[260px] max-w-[260px] glass-card rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-elevated transition-all duration-300 active:scale-[0.98] cursor-pointer group">
          <div class="relative aspect-video overflow-hidden bg-slate-900">
            <img src="${d.thumbnail || demoFallbackThumb}" onerror="this.onerror=null;this.src='${demoFallbackThumb}';" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-center justify-center">
              <div class="w-11 h-11 bg-white/95 text-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-play ml-0.5 text-sm"></i>
              </div>
            </div>
            <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-emerald-500/95 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-wider shadow-sm">Free Demo</span>
          </div>
          <div class="p-3.5">
            <div class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">Concept Preview · HD Video</div>
            <h3 class="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${
              d.title
            }</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">${
              d.description || "Experience our classroom teaching methodology"
            }</p>
          </div>
        </div>
      `;
    });
  }

  function openDemo(_id: string, playMode: string, url: string) {
    if (playMode === "Redirect") {
      window.open(url, "_blank");
    } else {
      playDemoVideo(url);
    }
  }

  function playDemoVideo(url: string) {
    let vidId = url;
    const regExp =
      /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[1].length === 11) {
      vidId = `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
      viewPdf(vidId, "Demo Lecture", true);
    } else {
      viewPdf(url, "Demo Lecture", true);
    }
  }

  function switchLiveTab(tab: string) {
    document.querySelectorAll(".live-tab").forEach((el) => {
      const isActive = el.id === "live-tab-" + tab;
      el.classList.toggle("active", isActive);
      el.classList.toggle("bg-white", isActive);
      el.classList.toggle("dark:bg-slate-800", isActive);
      el.classList.toggle("text-blue-600", isActive);
      el.classList.toggle("dark:text-blue-400", isActive);
      el.classList.toggle("shadow-sm", isActive);
      el.classList.toggle("text-slate-500", !isActive);
    });

    document.querySelectorAll(".live-content").forEach((el) => {
      el.classList.toggle("active", el.id === "live-" + tab + "-content");
      el.classList.toggle("hidden", el.id !== "live-" + tab + "-content");
    });

    renderLive();
  }

  function renderHomeCourses() {
    const list = document.getElementById("homeCoursesList");
    if (!list) return;
    list.innerHTML = "";

    const filtered = allCoursesCached.filter(
      (c) => !activeCategory || c.category === activeCategory
    );
    if (filtered.length === 0) {
      list.innerHTML =
        '<div class="col-span-full text-center py-10 text-slate-400 font-bold text-xs uppercase bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">No batches available in this category yet.</div>';
      return;
    }
    filtered.slice(0, 4).forEach((c) => {
      list.innerHTML += generateCourseCard(c);
    });
  }

  function renderToppers() {
    const list = document.getElementById("homeToppersList");
    const section = document.getElementById("toppersSection");
    if (!list || !section) return;

    if (allToppersCached.length === 0) {
      section.classList.add("hidden");
      return;
    }

    section.classList.remove("hidden");
    list.innerHTML = "";

    allToppersCached
      .slice()
      .reverse()
      .forEach((t) => {
        const badgeText = t.achievementBadge || "Topper";
        list.innerHTML += `
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-center border border-slate-200/80 dark:border-slate-800 shadow-soft relative group transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div class="absolute -top-2.5 right-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm z-20 flex items-center gap-1">
              <i class="fa-solid fa-crown text-[8px]"></i> ${badgeText}
            </div>
            <img src="${t.imageUrl}" class="w-16 h-16 rounded-2xl object-cover border-2 border-amber-200 dark:border-amber-800/60 shadow-sm mb-3 z-10" onerror="this.src='https://placehold.co/100x100/e2e8f0/94a3b8?text=Topper'">
            <h3 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 z-10 text-center w-full">${
              t.name || "-"
            }</h3>
            ${
              t.exam
                ? `<p class="text-[10px] font-bold text-amber-700 dark:text-amber-400 mt-1 line-clamp-1 text-center w-full bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">${t.exam}</p>`
                : ""
            }
          </div>
        `;
      });
  }

  function renderQuizLeaderboard() {
    const list = document.getElementById("homeQuizLeaderboardList");
    const section = document.getElementById("quizLeaderboardSection");
    if (!list || !section) return;

    if (allQuizLeaderboardCached.length === 0) {
      section.classList.add("hidden");
      return;
    }

    section.classList.remove("hidden");
    list.innerHTML = "";

    const sorted = allQuizLeaderboardCached
      .slice()
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    sorted.slice(0, 10).forEach((user, index) => {
      let rankColors = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
      if (index === 0)
        rankColors =
          "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm shadow-amber-500/30";
      else if (index === 1)
        rankColors = "bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-sm";
      else if (index === 2)
        rankColors = "bg-gradient-to-br from-orange-400 to-amber-700 text-white shadow-sm";

      const testsTaken = user.testsTaken || 1;
      const photo =
        user.photo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name || "User"
        )}&background=2563EB&color=fff`;

      list.innerHTML += `
        <div class="flex items-center gap-3.5 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft relative transition-all hover:border-blue-400/50">
          <div class="w-8 h-8 rounded-xl ${rankColors} flex items-center justify-center font-black text-xs shrink-0 z-10">
            #${index + 1}
          </div>
          <img src="${photo}" class="w-10 h-10 rounded-xl object-cover shadow-2xs bg-slate-100 shrink-0" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name || "User"
          )}'">
          <div class="flex-1 min-w-0">
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">${
              user.name || "Student"
            }</h4>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">${testsTaken} Mock Test${
        testsTaken > 1 ? "s" : ""
      } Completed</p>
          </div>
          <div class="shrink-0 text-right bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
            <div class="text-sm font-black text-emerald-600 dark:text-emerald-400 leading-none tabular-nums">${
              user.totalScore || 0
            }</div>
            <div class="text-[8px] font-extrabold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider mt-0.5">Score</div>
          </div>
        </div>
      `;
    });
  }

  function renderUpcoming() {
    const list = document.getElementById("homeUpcomingList");
    const section = document.getElementById("upcomingSection");
    if (!list || !section) return;
    list.innerHTML = "";

    const filtered = allUpcomingCached.filter(
      (u) => !activeCategory || u.category === activeCategory
    );
    if (filtered.length === 0) {
      section.classList.add("hidden");
      return;
    }
    section.classList.remove("hidden");

    const upcomingFallbackThumb =
      "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Cdefs%3E%3ClinearGradient id='ug' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231e1b4b'/%3E%3Cstop offset='100%25' stop-color='%23312e81'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23ug)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='800' font-size='22' fill='%23fbbf24'%3ELAUNCHING SOON%3C/text%3E%3C/svg%3E";
    filtered.forEach((u) => {
      list.innerHTML += `
        <div class="min-w-[270px] max-w-[270px] glass-card rounded-3xl overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1 hover:shadow-elevated transition-all duration-300 active:scale-[0.98]">
          <div class="relative aspect-[16/9] overflow-hidden bg-slate-900">
            <img src="${u.thumbnail || upcomingFallbackThumb}" onerror="this.onerror=null;this.src='${upcomingFallbackThumb}';" class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
            <div class="absolute top-3 left-3">
              <span class="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-sm">Launching Soon</span>
            </div>
            <div class="absolute bottom-3 left-3.5 flex items-center gap-1.5 text-white">
              <i class="fa-regular fa-calendar text-amber-300 text-[10px]"></i>
              <span class="text-[11px] font-bold tracking-tight tabular-nums">${
                u.launchDate || "Dates Announced Soon"
              }</span>
            </div>
          </div>
          <div class="p-4">
            <div class="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mb-0.5">${
              u.category || "New Target Batch"
            } · Pre-Launch</div>
            <h3 class="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">${
              u.title
            }</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">${
              u.description || "New foundation & target batch starting soon with expert educators."
            }</p>
          </div>
        </div>`;
    });
  }

  function renderTimetables() {
    const list = document.getElementById("timetableList");
    if (!list) return;

    const filterInput = document.getElementById("timetableDateFilter") as HTMLInputElement | null;
    const filterDate = filterInput ? filterInput.value : "";
    let filtered = allTimetablesCached.slice().reverse();

    if (filterDate) {
      filtered = filtered.filter((t) => t.date === filterDate);
    }

    if (filtered.length === 0) {
      list.innerHTML = `<div class="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider">No class schedule published${
        filterDate ? " for this date" : " right now"
      }.</div>`;
      return;
    }

    let html = "";
    filtered.forEach((t) => {
      const displayDate = t.date
        ? new Date(t.date).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";
      html += `
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft mb-5">
          <img src="${t.imageUrl}" alt="Time Table" class="w-full h-auto rounded-2xl mb-4 border border-slate-100 dark:border-slate-800" onerror="this.src='https://placehold.co/600x400/e2e8f0/475569?text=Schedule+Image'">
          <div class="flex items-center justify-between px-1">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">${
                  displayDate || "Routine"
                }</span>
              </div>
              <h3 class="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">${
                t.title || "Daily Class Schedule"
              }</h3>
              ${
                t.contact
                  ? `<p class="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1"><i class="fa-solid fa-headset text-blue-500 mr-1"></i> Support: ${t.contact}</p>`
                  : ""
              }
            </div>
            ${
              t.contact
                ? `<a href="tel:${t.contact}" class="w-11 h-11 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-blue-200/60 dark:border-blue-800/50 active:scale-95"><i class="fa-solid fa-phone text-sm"></i></a>`
                : ""
            }
          </div>
        </div>
      `;
    });
    list.innerHTML = html;
  }

  function getAvailableSubjects(itemsList: any[]) {
    const subjectsMap = new Map<string, number>();
    (allSubjectsCached || []).forEach((sub) => {
      const name = (typeof sub === "string" ? sub : sub.name || sub.id || sub.title || "").trim();
      if (name && !subjectsMap.has(name)) {
        subjectsMap.set(name, 0);
      }
    });
    (itemsList || []).forEach((item) => {
      const subName = item && item.subject ? item.subject.trim() : "";
      if (subName) {
        subjectsMap.set(subName, (subjectsMap.get(subName) || 0) + 1);
      }
    });
    const result: Array<{ name: string; count: number }> = [];
    subjectsMap.forEach((count, name) => {
      result.push({ name, count });
    });
    return result;
  }

  function renderSubjectTabs(
    containerId: string,
    availableSubjects: Array<{ name: string; count: number }>,
    activeSubject: string,
    selectFnName: string
  ) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let totalCount = 0;
    availableSubjects.forEach((s) => (totalCount += s.count));
    let html = `
      <button onclick="${selectFnName}('')" 
        class="px-4 py-2 rounded-xl whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wider border transition-all flex items-center gap-2 ${
          activeSubject === ""
            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
            : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400"
        }">
        <i class="fa-solid fa-layer-group text-[10px] ${
          activeSubject === "" ? "text-blue-200" : "text-slate-400"
        }"></i>
        <span>All Subjects</span>
        <span class="px-1.5 py-0.5 rounded-md text-[10px] ${
          activeSubject === ""
            ? "bg-white/20 text-white"
            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
        }">${totalCount}</span>
      </button>
    `;
    availableSubjects.forEach((sub) => {
      const subName = sub.name;
      const count = sub.count;
      const isActive = activeSubject === subName;
      const escapedName = subName.replace(/'/g, "\\'");
      html += `
        <button onclick="${selectFnName}('${escapedName}')" 
          class="px-4 py-2 rounded-xl whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wider border transition-all flex items-center gap-2 ${
            isActive
              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400"
          }">
          <i class="fa-solid fa-book-bookmark text-[10px] ${
            isActive ? "text-blue-200" : "text-blue-500"
          }"></i>
          <span>${subName}</span>
          <span class="px-1.5 py-0.5 rounded-md text-[10px] ${
            isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
          }">${count}</span>
        </button>
      `;
    });
    container.innerHTML = html;
  }

  let activeTestSubject = "";
  let activeLiveSubject = "";
  let activeNoteSubject = "";

  window.selectTestSubject = function (sub: string) {
    activeTestSubject = sub;
    renderTests();
  };
  window.selectLiveSubject = function (sub: string) {
    activeLiveSubject = sub;
    renderLive();
  };
  window.selectNoteSubject = function (sub: string) {
    activeNoteSubject = sub;
    renderNotes();
  };

  let activeTestTab = "Free";
  function setTestTab(tab: string) {
    activeTestTab = tab;
    const bAll = document.getElementById("tabTestAll");
    const bFree = document.getElementById("tabTestFree");
    const bPaid = document.getElementById("tabTestPaid");
    const activeCls =
      "text-[10px] font-extrabold uppercase px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm transition-all";
    const inactiveCls =
      "text-[10px] font-extrabold uppercase px-4 py-2 rounded-lg text-slate-500 transition-all";
    if (bAll) bAll.className = tab === "All" ? activeCls : inactiveCls;
    if (bFree) bFree.className = tab === "Free" ? activeCls : inactiveCls;
    if (bPaid) bPaid.className = tab === "Paid" ? activeCls : inactiveCls;
    renderTests();
  }

  function renderTests() {
    if (!coursesLoaded) return;
    const list = document.getElementById("fullTestsList");
    const noTests = document.getElementById("noTestsMsg");
    const catList = document.getElementById("testCategoryList");
    if (!list) return;
    list.innerHTML = "";

    if (catList) {
      const availableSubjects = getAvailableSubjects(allTestsCached);
      renderSubjectTabs("testCategoryList", availableSubjects, activeTestSubject, "selectTestSubject");
    }

    const filtered = allTestsCached.filter((t) => {
      const isFree = isItemFree(t, "test");
      const isPaid = !isFree;
      const matchesTab =
        activeTestTab === "All" ||
        (activeTestTab === "Free" && isFree) ||
        (activeTestTab === "Paid" && isPaid);
      const matchesCat =
        !activeCategory || !t.category || t.category === activeCategory || t.category === "General";
      const matchesSub = !activeTestSubject || (t.subject && t.subject === activeTestSubject);
      return matchesTab && matchesCat && matchesSub;
    });

    if (filtered.length === 0) {
      if (noTests) safeClassRemove("noTestsMsg", "hidden");
      return;
    }
    if (noTests) safeClassAdd("noTestsMsg", "hidden");

    filtered.forEach((t) => {
      const isFree = isItemFree(t, "test");
      const isPaid = !isFree;
      const hasPurchased = checkItemAccess(t, "test");
      const canAccess = isFree || hasPurchased;
      const qCount = t.questionsCount || (t.questions ? t.questions.length : 0);
      const clickAction = canAccess
        ? `startQuiz('${t.id}')`
        : `handleLockedItemClick('${t.id}', 'test')`;

      list.innerHTML += `
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden group flex flex-col justify-between p-5">
          <div>
            <div class="flex items-start justify-between gap-3 mb-3.5">
              <div class="w-12 h-12 ${
                isPaid && !hasPurchased
                  ? "bg-amber-50 dark:bg-amber-950/50 text-amber-500 border-amber-200/60 dark:border-amber-800/50"
                  : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/50"
              } border rounded-2xl flex shrink-0 items-center justify-center text-lg transition-transform group-hover:scale-105">
                <i class="fa-solid ${isPaid && !hasPurchased ? "fa-lock" : "fa-clipboard-question"}"></i>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap justify-end">
                <span class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                  ${t.subject || t.category || "Mock Test"}
                </span>
                ${
                  isPaid
                    ? hasPurchased
                      ? '<span class="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg uppercase tracking-wider">UNLOCKED</span>'
                      : '<span class="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg uppercase tracking-wider"><i class="fa-solid fa-crown text-[8px] mr-1"></i>BATCH PRO</span>'
                    : '<span class="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg uppercase tracking-wider">FREE CBT</span>'
                }
              </div>
            </div>
            <h3 class="font-extrabold text-base text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">${
              t.title
            }</h3>
            <div class="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-4">
              <span class="flex items-center gap-1"><i class="fa-solid fa-list-ol text-indigo-500 text-[10px]"></i> ${qCount} MCQs</span>
              <span>•</span>
              <span class="flex items-center gap-1"><i class="fa-regular fa-clock text-amber-500 text-[10px]"></i> ${
                t.timer || 20
              }s / Question</span>
            </div>
          </div>

          <div class="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              ${
                isPaid && !hasPurchased && t.price > 0
                  ? `
                    <span class="text-[10px] font-semibold text-slate-400 line-through block">₹${
                      t.price || 0
                    }</span>
                    <span class="text-base font-black text-slate-900 dark:text-white">₹${Math.round(
                      (t.price || 0) * (1 - (t.discount || 0) / 100)
                    )}</span>
                  `
                  : `
                    <span class="text-[10px] font-bold text-slate-400 uppercase block">Mode</span>
                    <span class="text-xs font-extrabold text-slate-700 dark:text-slate-300">Instant Result</span>
                  `
              }
            </div>
            <button onclick="${clickAction}"
              class="px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 ${
                canAccess
                  ? "btn-blue text-white shadow-sm"
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
              }">
              <span>${canAccess ? "Start Test" : "Unlock Test"}</span>
              <i class="fa-solid ${canAccess ? "fa-arrow-right" : "fa-lock"} text-[10px]"></i>
            </button>
          </div>
        </div>`;
    });
  }

  function openPurchaseModal(id: string, type: string) {
    const data =
      type === "test"
        ? allTestsCached.find((x) => x.id === id)
        : allCoursesCached.find((x) => x.id === id);
    if (!data) return;

    safeSetText("detTitle", data.title);
    safeSetText("detCategory", data.category || "Premium");
    safeSetText(
      "detDesc",
      data.description || "Access this premium content and boost your learning today."
    );

    const finalPrice = Math.round((data.price || 0) * (1 - (data.discount || 0) / 100));
    const detPrice = document.getElementById("detPrice");
    if (detPrice) detPrice.innerText = `₹${finalPrice}`;

    const btn = document.getElementById("detMainBtn");
    if (btn) {
      btn.onclick = () => {
        if (data.paymentLink) {
          window.open(data.paymentLink, "_blank");
          showPaymentConfirm(id, data.title);
        } else {
          initiateCashfreePayment(id, type);
        }
      };
      btn.innerText = "PROCEED TO PAYMENT";
    }

    safeClassRemove("courseDetailOverlay", "hidden");
  }

  function showPaymentConfirm(itemId: string, title: string) {
    const confirmDiv = document.createElement("div");
    confirmDiv.className =
      "fixed inset-0 z-[6000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6";
    confirmDiv.innerHTML = `
      <div class="card-white w-full max-w-sm p-8 text-center animate-bounce-in">
        <div class="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center text-3xl mx-auto mb-6">
          <i class="fa-solid fa-wallet"></i>
        </div>
        <h3 class="text-xl font-black text-slate-800 mb-2">Paid for ${title}?</h3>
        <p class="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">Submit your Transaction ID to get instant access after verification.</p>
        <input type="text" id="txnIdTest" placeholder="Enter TXN ID" class="bg-white border border-slate-200 text-slate-900 w-full p-4 rounded-2xl mb-4 font-bold text-center">
        <div class="flex gap-4">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="flex-1 py-4 font-black uppercase text-[10px] text-slate-400">Cancel</button>
          <button onclick="submitTestPayment('${itemId}', this)" class="flex-1 btn-blue py-4 rounded-xl font-black uppercase text-[10px]">Submit</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmDiv);
  }

  window.submitTestPayment = function (id: string, btn: HTMLElement) {
    const txnInput = document.getElementById("txnIdTest") as HTMLInputElement | null;
    const txn = txnInput ? txnInput.value : "";
    if (!txn) return alert("Please enter Transaction ID");

    fb.push(fb.ref(db, "payments"), {
      uid: currentUser.uid,
      userName: userData ? userData.name : "Unknown",
      courseId: id,
      courseTitle: allTestsCached.find((t) => t.id === id)?.title || "Test",
      txnId: txn,
      status: "Pending",
      timestamp: Date.now(),
    }).then(() => {
      alert("Payment submitted! Access will be granted after verification.");
      btn.parentElement?.parentElement?.parentElement?.remove();
    });
  };

  function isItemFree(item: any, itemType?: string): boolean {
    if (!item) return true;

    const isExplicitlyFree =
      item.isFree === true ||
      item.isFree === "true" ||
      item.type === "Free" ||
      item.status === "Free" ||
      item.access === "Free" ||
      item.accessType === "Free";

    const isExplicitlyPaid =
      item.isFree === false ||
      item.isFree === "false" ||
      item.isPaid === true ||
      item.isPaid === "true" ||
      item.type === "Paid" ||
      item.status === "Paid" ||
      item.access === "Paid" ||
      item.accessType === "Paid";

    if (isExplicitlyPaid) return false;
    if (item.price && Number(item.price) > 0) return false;
    if (isExplicitlyFree) return true;

    if (item.courseId) {
      if (allCoursesCached && allCoursesCached.length > 0) {
        const course = allCoursesCached.find((c) => c.id === item.courseId);
        if (course) {
          if (!isItemFree(course, "course")) return false;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    if (itemType && allCoursesCached && allCoursesCached.length > 0) {
      for (const c of allCoursesCached) {
        let isLinked = false;
        if (
          itemType === "test" &&
          (c.linkedTestId === item.id || (c.linkedTestIds && c.linkedTestIds.includes(item.id)))
        )
          isLinked = true;
        if (
          itemType === "note" &&
          (c.linkedNoteId === item.id || (c.linkedNoteIds && c.linkedNoteIds.includes(item.id)))
        )
          isLinked = true;
        if (
          itemType === "live" &&
          (c.linkedLiveId === item.id || (c.linkedLiveIds && c.linkedLiveIds.includes(item.id)))
        )
          isLinked = true;

        if (isLinked) {
          if (!isItemFree(c, "course")) return false;
        }
      }
    }

    return true;
  }

  function checkItemAccess(item: any, itemType?: string): boolean {
    if (!item) return false;
    if (isItemFree(item, itemType)) return true;

    if (!userData || !userData.purchased) return false;
    if (userData.purchased[item.id]) return true;
    if (item.courseId && userData.purchased[item.courseId]) return true;

    if (allCoursesCached) {
      for (const cid of Object.keys(userData.purchased)) {
        if (!userData.purchased[cid]) continue;
        const course = allCoursesCached.find((c) => c.id === cid);
        if (course) {
          if (item.courseId && course.id === item.courseId) return true;
          if (itemType === "test") {
            if (course.linkedTestId === item.id) return true;
            if (course.linkedTestIds && course.linkedTestIds.includes(item.id)) return true;
          } else if (itemType === "note") {
            if (course.linkedNoteId === item.id) return true;
            if (course.linkedNoteIds && course.linkedNoteIds.includes(item.id)) return true;
          } else if (itemType === "live") {
            if (course.linkedLiveId === item.id) return true;
            if (course.linkedLiveIds && course.linkedLiveIds.includes(item.id)) return true;
          }
        }
      }
    }

    return false;
  }

  function getCourseIdForItem(item: any, itemType: string): string | null {
    if (!item) return null;
    if (item.courseId) return item.courseId;
    if (allCoursesCached) {
      for (const c of allCoursesCached) {
        if (
          itemType === "test" &&
          (c.linkedTestId === item.id || (c.linkedTestIds && c.linkedTestIds.includes(item.id)))
        )
          return c.id;
        if (
          itemType === "note" &&
          (c.linkedNoteId === item.id || (c.linkedNoteIds && c.linkedNoteIds.includes(item.id)))
        )
          return c.id;
        if (
          itemType === "live" &&
          (c.linkedLiveId === item.id || (c.linkedLiveIds && c.linkedLiveIds.includes(item.id)))
        )
          return c.id;
      }
    }
    return null;
  }

  function handleLockedItemClick(itemId: string, itemType: string) {
    let item: any = null;
    let label = "content";
    if (itemType === "note") {
      item = (allNotesCached || []).find((x) => x.id === itemId);
      label = "PDF note";
    } else if (itemType === "test") {
      item = (allTestsCached || []).find((x) => x.id === itemId);
      label = "test series";
    } else if (itemType === "live") {
      item = (allLiveCached || []).find((x) => x.id === itemId);
      label = "live class";
    }

    showToast(`Please purchase the linked course to unlock this ${label}`);
    const courseId = getCourseIdForItem(item || { id: itemId }, itemType);
    if (courseId) {
      setTimeout(() => openCourse(courseId, "Paid"), 600);
    } else if (item && item.price && Number(item.price) > 0) {
      setTimeout(() => openPurchaseModal(itemId, itemType), 600);
    } else {
      setTimeout(() => navigateTo("courses"), 600);
    }
  }

  let liveCountdownInterval: any = null;

  function startLiveCountdowns() {
    if (liveCountdownInterval) clearInterval(liveCountdownInterval);
    liveCountdownInterval = setInterval(() => {
      const timers = document.querySelectorAll(".live-countdown");
      timers.forEach((t: any) => {
        const target = new Date(t.dataset.time).getTime();
        const now = new Date().getTime();
        const diff = target - now;

        if (diff <= 0) {
          t.innerText = "Starting Soon...";
        } else {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          t.innerText = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
            .toString()
            .padStart(2, "0")}`;
        }
      });
    }, 1000);
  }

  function generateLiveCard(l: any, hasAccess: boolean) {
    const isScheduled = l.startTime && new Date(l.startTime) > new Date();
    const timeStr = isScheduled
      ? new Date(l.startTime).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
    const liveFallbackThumb =
      "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Cdefs%3E%3ClinearGradient id='lg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230f172a'/%3E%3Cstop offset='50%25' stop-color='%231e1b4b'/%3E%3Cstop offset='100%25' stop-color='%2331102f'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23lg)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='800' font-size='22' fill='%23f43f5e'%3ELIVE INTERACTIVE CLASS%3C/text%3E%3C/svg%3E";

    return `
      <div onclick="openLive('${l.id}')" class="relative rounded-2xl overflow-hidden group transition-all active:scale-[0.98] glass-card hover:shadow-elevated hover:border-blue-400/60 dark:hover:border-blue-500/50 cursor-pointer">
        <div class="relative aspect-video overflow-hidden bg-slate-900">
          <img src="${l.thumbnail || liveFallbackThumb}" onerror="this.onerror=null;this.src='${liveFallbackThumb}';" class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent"></div>
          ${
            !hasAccess
              ? `
                <div class="absolute inset-0 bg-slate-950/65 backdrop-blur-[3px] flex flex-col items-center justify-center text-white z-20">
                  <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-2.5 border border-white/20 backdrop-blur-md shadow-lg">
                    <i class="fa-solid fa-lock text-lg text-amber-400"></i>
                  </div>
                  <span class="text-[9px] uppercase font-black tracking-[0.2em] text-white bg-slate-900/80 px-3 py-1 rounded-lg border border-white/10">Enroll to Unlock Stream</span>
                </div>
              `
              : ""
          }
          <div class="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
            <div class="${
              isScheduled ? "bg-blue-600" : l.mode === "Live" ? "bg-rose-600" : "bg-indigo-600"
            } px-3 py-1 rounded-lg text-[9px] font-black tracking-widest flex items-center gap-1.5 text-white shadow-lg border border-white/20 uppercase">
              <span class="w-1.5 h-1.5 bg-white rounded-full ${
                l.mode === "Live" && !isScheduled ? "animate-ping" : ""
              }"></span> 
              ${isScheduled ? "SCHEDULED" : l.mode === "Live" ? "LIVE NOW" : "RECORDED LECTURE"}
            </div>
          </div>

          ${
            isScheduled
              ? `
                <div class="absolute top-3.5 right-3.5 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black tracking-wider text-white shadow-lg border border-white/15 flex items-center gap-1.5 z-10 tabular-nums">
                  <i class="fa-solid fa-clock text-blue-400 text-[9px]"></i>
                  <span class="live-countdown" data-time="${l.startTime}">00:00:00</span>
                </div>
              `
              : ""
          }

          <div class="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between z-10">
            <span class="px-2.5 py-1 bg-white/15 backdrop-blur-md text-white border border-white/15 rounded-md text-[9px] font-extrabold uppercase tracking-wider">
              <i class="fa-solid fa-book-open text-[8px] mr-1 text-blue-300"></i> ${
                l.subject || l.category || "General"
              }
            </span>
            ${
              timeStr
                ? `<span class="text-[9px] font-bold text-slate-200 bg-slate-900/70 px-2 py-0.5 rounded tabular-nums">${timeStr}</span>`
                : ""
            }
          </div>
        </div>

        <div class="p-4">
          <div class="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex-wrap">
            ${
              l.category
                ? `<span class="text-blue-600 dark:text-blue-400 font-bold">${l.category}</span>`
                : "<span>Live Session</span>"
            }
            ${l.courseName ? `<span>·</span><span>${l.courseName}</span>` : ""}
          </div>
          <h3 class="font-display text-base font-bold tracking-tight leading-snug text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">${
            l.title
          }</h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4 line-clamp-2">${
            l.description ||
            "Interactive live classroom session with real-time doubt solving & concept mastery."
          }</p>
          
          <div class="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 bg-blue-50 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden border border-blue-100 dark:border-slate-700 text-blue-600 dark:text-blue-400 text-xs font-black">
                <i class="fa-solid fa-chalkboard-user"></i>
              </div>
              <div>
                <p class="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Educator</p>
                <p class="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 tracking-tight">${
                  l.instructor || "Senior Faculty"
                }</p>
              </div>
            </div>
            
            <button class="flex items-center gap-1.5 ${
              isScheduled
                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                : hasAccess
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95">
              ${
                isScheduled
                  ? '<i class="fa-regular fa-bell"></i> Remind'
                  : hasAccess
                  ? 'Watch Class <i class="fa-solid fa-play text-[8px] ml-0.5"></i>'
                  : '<i class="fa-solid fa-lock text-[9px]"></i> Unlock'
              }
            </button>
          </div>
        </div>
      </div>`;
  }

  function renderLive() {
    if (!coursesLoaded) return;
    const homeLive = document.getElementById("homeLiveList");
    const fullLive = document.getElementById("fullLiveList");
    const scheduledLive = document.getElementById("scheduledLiveList");
    const recordedLive = document.getElementById("recordedLiveList");
    const noLiveMsg = document.getElementById("noLiveMsg");
    const catList = document.getElementById("liveSubjectList");

    if (homeLive) homeLive.innerHTML = "";
    if (fullLive) fullLive.innerHTML = "";
    if (scheduledLive) scheduledLive.innerHTML = "";
    if (recordedLive) recordedLive.innerHTML = "";

    if (catList) {
      const availableSubjects = getAvailableSubjects(allLiveCached);
      renderSubjectTabs("liveSubjectList", availableSubjects, activeLiveSubject, "selectLiveSubject");
    }

    const searchInput = document.getElementById("liveSearchInput") as HTMLInputElement | null;
    const searchQ = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const typeFilter = document.getElementById("liveTypeFilter") as HTMLSelectElement | null;
    const typeQ = typeFilter ? typeFilter.value : "All";
    const filtered = allLiveCached.filter((l) => {
      const matchesCat =
        !activeCategory || !l.category || l.category === activeCategory || l.category === "General";
      const matchesSub = !activeLiveSubject || (l.subject && l.subject === activeLiveSubject);
      const matchesSearch = !searchQ || (l.title && l.title.toLowerCase().includes(searchQ));
      const isFree = isItemFree(l);
      const matchesType =
        typeQ === "All" || (typeQ === "Free" && isFree) || (typeQ === "Paid" && !isFree);
      return matchesCat && matchesSub && matchesSearch && matchesType;
    });

    const ongoing = filtered.filter(
      (l) =>
        (l.mode === "Live" || l.mode === "In-App") &&
        (!l.startTime || new Date(l.startTime) <= new Date())
    );
    const scheduled = filtered.filter(
      (l) =>
        (l.mode === "Live" || l.mode === "In-App") &&
        l.startTime &&
        new Date(l.startTime) > new Date()
    );
    const recorded = filtered.filter((l) => l.mode === "Direct" || l.mode === "Recorded");

    const liveSection = document.getElementById("liveSection");
    if (ongoing.length === 0) {
      if (noLiveMsg) noLiveMsg.classList.remove("hidden");
      if (liveSection) liveSection.classList.add("hidden");
    } else {
      if (noLiveMsg) noLiveMsg.classList.add("hidden");
      if (liveSection) liveSection.classList.remove("hidden");
      ongoing.forEach((l) => {
        const hasAccess = checkItemAccess(l, "live");
        const cardHtml = generateLiveCard(l, hasAccess);
        if (fullLive) fullLive.innerHTML += cardHtml;
        if (homeLive) homeLive.innerHTML += cardHtml;
      });
    }

    if (recorded.length === 0) {
      if (recordedLive)
        recordedLive.innerHTML =
          '<div class="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No recordings found</div>';
    } else {
      recorded.forEach((l) => {
        const hasAccess = checkItemAccess(l, "live");
        const cardHtml = generateLiveCard(l, hasAccess);
        if (recordedLive) recordedLive.innerHTML += cardHtml;
      });
    }

    if (scheduled.length === 0 && scheduledLive) {
      scheduledLive.innerHTML =
        '<div class="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No upcoming sessions</div>';
    } else if (scheduledLive) {
      scheduled.forEach((l) => {
        const hasAccess = checkItemAccess(l, "live");
        const cardHtml = generateLiveCard(l, hasAccess);
        scheduledLive.innerHTML += cardHtml;
      });
      startLiveCountdowns();
    }
  }

  function renderNotes() {
    if (!coursesLoaded) return;
    const list = document.getElementById("fullNotesList");
    const catList = document.getElementById("notesCategoryList");
    if (!list) return;
    list.innerHTML = "";

    if (catList) {
      const availableSubjects = getAvailableSubjects(allNotesCached);
      renderSubjectTabs("notesCategoryList", availableSubjects, activeNoteSubject, "selectNoteSubject");
    }

    const searchInput = document.getElementById("notesSearchInput") as HTMLInputElement | null;
    const searchQ = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const typeFilter = document.getElementById("notesTypeFilter") as HTMLSelectElement | null;
    const typeQ = typeFilter ? typeFilter.value : "All";

    const filtered = allNotesCached.filter((n) => {
      const isFree = isItemFree(n, "note");
      const matchesType =
        typeQ === "All" || (typeQ === "Free" && isFree) || (typeQ === "Paid" && !isFree);
      const matchesCat =
        !activeCategory || !n.category || n.category === activeCategory || n.category === "General";
      const matchesSub = !activeNoteSubject || (n.subject && n.subject === activeNoteSubject);
      const matchesSearch = !searchQ || (n.title && n.title.toLowerCase().includes(searchQ));

      return matchesCat && matchesSub && matchesSearch && matchesType;
    });

    if (filtered.length === 0) {
      safeClassRemove("noNotesMsg", "hidden");
    } else {
      safeClassAdd("noNotesMsg", "hidden");
    }

    filtered.forEach((n) => {
      const isFree = isItemFree(n, "note");
      const hasAccess = checkItemAccess(n, "note");
      const canView = isFree || hasAccess;
      const clickAction = canView
        ? `viewPdf('${n.url}', '${(n.title || "").replace(/'/g, "\\'")}')`
        : `handleLockedItemClick('${n.id}', 'note')`;

      list.innerHTML += `
        <div onclick="${clickAction}" class="flex items-center gap-3.5 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-soft border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 active:scale-[0.99] transition-all cursor-pointer group">
          <div class="w-12 h-12 ${
            canView
              ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50"
              : "bg-amber-50 dark:bg-amber-950/50 text-amber-500 border border-amber-100 dark:border-amber-900/50"
          } rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105">
            <i class="fa-solid ${canView ? "fa-file-pdf" : "fa-lock"}"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 mb-1 flex-wrap">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[9px] font-extrabold uppercase tracking-wider">
                ${n.subject || n.category || "Study Material"}
              </span>
              ${
                n.category && n.category !== n.subject
                  ? `<span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">• ${n.category}</span>`
                  : ""
              }
              ${
                isFree
                  ? '<span class="text-[8px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 px-2 py-0.5 rounded-md uppercase tracking-widest">FREE PDF</span>'
                  : hasAccess
                  ? '<span class="text-[8px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md uppercase tracking-widest">UNLOCKED</span>'
                  : '<span class="text-[8px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md uppercase tracking-widest">BATCH PRO</span>'
              }
            </div>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${
              n.title
            }</h3>
          </div>
          <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
            <i class="fa-solid ${canView ? "fa-arrow-up-right-from-square" : "fa-lock"} text-[10px]"></i>
          </div>
        </div>`;
    });
  }

  function navigateTo(pageId: string, pushToHistory = true) {
    const pages = [
      "home",
      "courses",
      "live",
      "tests",
      "notes",
      "timetable",
      "profile",
      "notifications",
      "mycourses",
      "admin",
    ];
    pages.forEach((p) => {
      const el = document.getElementById("page-" + p);
      if (el) el.classList.remove("active");
      const btn = document.getElementById("btn-" + p);
      if (btn) btn.classList.remove("active");
    });
    const targetPage = document.getElementById("page-" + pageId);
    if (targetPage) targetPage.classList.add("active");
    const activeBtn = document.getElementById("btn-" + pageId);
    if (activeBtn) activeBtn.classList.add("active");

    if (pageId === "mycourses") renderMyCourses();
    if (pageId === "admin") loadUsersInAdmin();

    if (pushToHistory) {
      window.history.pushState({ pageId }, "", "");
    }

    window.scrollTo(0, 0);
  }

  window.onpopstate = function (event: PopStateEvent) {
    if (event.state && event.state.pageId) {
      navigateTo(event.state.pageId, false);
    } else {
      navigateTo("home", false);
    }
  };

  window.history.replaceState({ pageId: "home" }, "", "");

  async function loadUsersInAdmin() {
    loadAdminSettings();
    const list = document.getElementById("adminUserList");
    if (!list) return;
    list.innerHTML =
      '<div class="text-center py-20 text-slate-300 font-bold animate-pulse">Fetching latest students...</div>';

    try {
      const snapshot = await fb.get(fb.ref(db, "users"));
      if (!snapshot.exists()) {
        list.innerHTML =
          '<div class="text-center py-20 text-slate-400 font-bold">No registered users found.</div>';
        return;
      }

      const users = snapshot.val();
      list.innerHTML = "";

      Object.values(users).forEach((u: any) => {
        list.innerHTML += `
          <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg shadow-blue-100">${
                (u.name || "U")[0]
              }</div>
              <div class="flex-1">
                <h4 class="font-black text-slate-800 leading-none">${u.name || "Anonymous User"}</h4>
                <p class="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1.5">${
                  u.email || "No email"
                }</p>
              </div>
              <div class="text-right">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Joined</span>
                <span class="text-[10px] font-bold text-slate-600">${
                  u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"
                }</span>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 pt-2">
              <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col justify-between">
                <p class="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-2">Student Contact</p>
                <a href="tel:${
                  u.phone
                }" class="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-100 active:scale-95 transition-all group/call">
                  <div class="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-[10px] shadow-lg shadow-emerald-100 group-hover/call:rotate-12 transition-transform">
                    <i class="fa-solid fa-phone"></i>
                  </div>
                  <span class="text-xs font-black text-blue-600 truncate">${
                    u.phone || "No Phone"
                  }</span>
                </a>
              </div>
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Details</p>
                <p class="text-xs font-black text-slate-700 uppercase">${u.gender || "N/A"} • ${
          u.age || "0"
        } Yrs</p>
              </div>
            </div>

            <div class="flex gap-2">
              <button onclick="showToast('Feature coming soon: view detailed report')" class="flex-1 bg-slate-50 text-slate-600 font-black text-[9px] uppercase tracking-widest py-3 rounded-xl border border-slate-100 bg-white dark:text-slate-400 border-slate-200">View Report</button>
              <button onclick="deleteStudent('${u.uid}', '${
          u.name || "Student"
        }')" class="flex-1 bg-rose-50 text-rose-600 font-black text-[9px] uppercase tracking-widest py-3 rounded-xl border border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30">Delete Student</button>
            </div>
          </div>
        `;
      });
    } catch (e: any) {
      console.warn("Admin fetch error:", e);
      list.innerHTML = `<div class="text-center py-20 text-rose-500 font-bold">Error loading users: ${e.message}</div>`;
    }
  }

  async function deleteStudent(uid: string, name: string) {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    try {
      showToast("Deleting student...");
      await fb.remove(fb.ref(db, "users/" + uid));
      showToast("Student deleted successfully!");
      loadUsersInAdmin();
    } catch (e: any) {
      alert("Error deleting student: " + e.message);
    }
  }

  async function clearAllStudents() {
    if (
      !confirm(
        "DANGER: Are you sure you want to clear ALL registered students? This cannot be undone."
      )
    )
      return;
    const code = prompt("Please type 'DELETE ALL' to confirm (Caps sensitive):");
    if (code !== "DELETE ALL") return showToast("Operation Cancelled");

    try {
      showToast("Clearing directory...");
      await fb.remove(fb.ref(db, "users"));
      showToast("All students cleared successfully!");
      loadUsersInAdmin();
    } catch (e: any) {
      alert("Error clearing students: " + e.message);
    }
  }

  function openSocialLinks() {
    fb.get(fb.ref(db, "settings/social")).then((s) => {
      const links = s.val() || {};
      const grid = document.getElementById("socialLinksGrid");
      if (!grid) return;
      grid.innerHTML = "";

      const available = [
        { icon: "fa-youtube text-rose-500", name: "YouTube", link: links.youtube, bg: "bg-rose-50" },
        {
          icon: "fa-whatsapp text-emerald-500",
          name: "WhatsApp",
          link: links.whatsapp ? `https://wa.me/${links.whatsapp}` : null,
          bg: "bg-emerald-50",
        },
        {
          icon: "fa-bullhorn text-amber-500",
          name: "Channel",
          link: links.whatsappChannel,
          bg: "bg-amber-50",
        },
        {
          icon: "fa-users text-blue-500",
          name: "Group",
          link: links.whatsappGroup,
          bg: "bg-blue-50",
        },
        { icon: "fa-telegram text-sky-500", name: "Telegram", link: links.telegram, bg: "bg-sky-50" },
        {
          icon: "fa-instagram text-pink-500",
          name: "Instagram",
          link: links.instagram,
          bg: "bg-pink-50",
        },
        { icon: "fa-globe text-blue-500", name: "Website", link: links.website, bg: "bg-blue-50" },
        {
          icon: "fa-mobile-screen text-blue-600",
          name: "Other App",
          link: links.thirdApp,
          bg: "bg-slate-50",
        },
      ];

      available.forEach((item) => {
        if (item.link) {
          grid.innerHTML += `
            <a href="${item.link}" target="_blank" class="flex flex-col items-center justify-center p-5 ${item.bg} rounded-3xl transition-transform active:scale-95">
              <i class="fa-brands ${item.icon} text-2xl mb-2"></i>
              <span class="text-[9px] font-black uppercase tracking-widest text-slate-800">${item.name}</span>
            </a>
          `;
        }
      });

      if (grid.innerHTML === "")
        grid.innerHTML =
          '<p class="col-span-2 text-center text-slate-400 font-bold py-10">No links added by admin yet.</p>';

      safeClassRemove("socialPopup", "hidden");
      safeClassAdd("socialPopup", "flex");
    });
  }

  function closeSocialPopup() {
    safeClassAdd("socialPopup", "hidden");
    safeClassRemove("socialPopup", "flex");
  }

  function toggleSidebar() {
    safeClassToggle("sidebar", "active");
    const overlay = document.getElementById("sidebarOverlay");
    if (overlay && overlay.style)
      overlay.style.display = overlay.style.display === "block" ? "none" : "block";
  }

  function triggerConfetti() {
    if (typeof window.confetti === "function") {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        window.confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#6366f1", "#a855f7", "#ec4899"],
        });
        window.confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#6366f1", "#a855f7", "#ec4899"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }

  function showToast(msg: string) {
    const toast = document.createElement("div");
    toast.className =
      "fixed bottom-28 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl text-white px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl z-[10000] border border-white/10 flex items-center gap-3 toast-animate";
    toast.innerHTML = `<div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px) translateX(-50%)";
      toast.style.transition = "all 0.4s ease";
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // --- Advanced Quiz Engine ---
  let currentQuestions: any[] = [];
  let userAnswers: Array<string | null> = [];
  let currentQuizIndex = 0;
  let quizTimerInterval: any;
  let testData: any = null;
  let currentActiveTestId: string | null = null;

  async function startQuiz(testId: string) {
    currentActiveTestId = testId;
    const snap = await fb.get(fb.ref(db, `tests/${testId}`));
    if (!snap.exists()) return alert("Test data not found!");

    testData = snap.val();
    testData.id = testId;

    const hasAccess = checkItemAccess(testData, "test");
    if (!hasAccess) {
      showToast("Please purchase the linked course to unlock this test.");
      return;
    }

    currentQuestions = testData.questions || [];
    if (!currentQuestions || currentQuestions.length === 0) {
      try {
        const qSnap = await fb.get(fb.ref(db, `questions/${testId}`));
        if (qSnap.exists()) {
          const qVal = qSnap.val();
          currentQuestions = Array.isArray(qVal) ? qVal : Object.values(qVal);
        }
      } catch (qe) {
        console.error("Error loading questions node:", qe);
      }
    }
    if (!currentQuestions || currentQuestions.length === 0)
      return alert("This test has no questions yet.");

    userAnswers = Array(currentQuestions.length).fill(null);
    currentQuizIndex = 0;

    safeSetText("quizTitle", testData.title);
    safeClassRemove("quizPlayer", "hidden");
    renderQuestion();
  }

  function renderQuestion() {
    clearInterval(quizTimerInterval);
    const q = currentQuestions[currentQuizIndex];

    safeSetText("quizCounter", `Question ${currentQuizIndex + 1} of ${currentQuestions.length}`);
    safeSetText("questionText", q.q);
    const prog = document.getElementById("quizProgress");
    if (prog) prog.style.width = `${((currentQuizIndex + 1) / currentQuestions.length) * 100}%`;

    const grid = document.getElementById("optionsGrid");
    if (grid) {
      grid.innerHTML = "";
      ["a", "b", "c", "d"].forEach((optKey) => {
        const optText = q[optKey];
        grid.innerHTML += `
          <button id="opt-${optKey}" onclick="selectOption('${optKey}')" 
            class="quiz-option-btn group p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 rounded-2xl text-left transition-all active:scale-[0.99] flex items-center justify-between shadow-soft">
            <div class="flex items-center gap-3.5">
              <div class="option-marker w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase shrink-0">${optKey}</div>
              <span class="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">${optText}</span>
            </div>
            <div class="circle w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all shrink-0 ml-2">
              <div class="inner-dot w-2.5 h-2.5 bg-blue-600 rounded-full opacity-0 transition-all"></div>
            </div>
          </button>
        `;
      });
    }

    safeSetHTML(
      "nextBtn",
      currentQuizIndex === currentQuestions.length - 1
        ? 'Submit Test <i class="fa-solid fa-check-double text-[10px]"></i>'
        : 'Save & Next <i class="fa-solid fa-arrow-right text-[10px]"></i>'
    );

    startQuizTimer();
  }

  function selectOption(opt: string) {
    userAnswers[currentQuizIndex] = opt;

    document.querySelectorAll(".quiz-option-btn").forEach((btn) => {
      btn.classList.remove(
        "ring-2",
        "ring-blue-500/20",
        "border-blue-600",
        "dark:border-blue-500",
        "bg-blue-50/60",
        "dark:bg-blue-950/30"
      );
      const cCircle = btn.querySelector(".circle");
      if (cCircle) cCircle.classList.remove("border-blue-600", "dark:border-blue-400");
      const cDot = btn.querySelector(".inner-dot");
      if (cDot) cDot.classList.add("opacity-0");
    });

    const selectedBtn = document.getElementById(`opt-${opt}`);
    if (selectedBtn) {
      selectedBtn.classList.add(
        "ring-2",
        "ring-blue-500/20",
        "border-blue-600",
        "dark:border-blue-500",
        "bg-blue-50/60",
        "dark:bg-blue-950/30"
      );
      const sCircle = selectedBtn.querySelector(".circle");
      if (sCircle) sCircle.classList.add("border-blue-600", "dark:border-blue-400");
      const sDot = selectedBtn.querySelector(".inner-dot");
      if (sDot) sDot.classList.remove("opacity-0");
    }
  }

  function startQuizTimer() {
    let timeLeft = testData.timer || 20;
    const timerEl = document.getElementById("quizTimer");
    if (timerEl) timerEl.innerText = `00:${timeLeft.toString().padStart(2, "0")}`;

    quizTimerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) {
        timerEl.innerText = `00:${timeLeft.toString().padStart(2, "0")}`;
        if (timeLeft <= 5) timerEl.classList.add("text-rose-600");
        else timerEl.classList.remove("text-rose-600");
      }

      if (timeLeft <= 0) {
        clearInterval(quizTimerInterval);
        nextQuestion();
      }
    }, 1000);
  }

  function nextQuestion() {
    clearInterval(quizTimerInterval);
    if (currentQuizIndex === currentQuestions.length - 1) {
      showQuizResults();
    } else {
      currentQuizIndex++;
      renderQuestion();
    }
  }

  function showQuizResults() {
    safeClassAdd("quizPlayer", "hidden");
    safeClassRemove("quizResults", "hidden");
    triggerConfetti();
    if (window.playSound) window.playSound("testComplete");

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattempted = 0;

    currentQuestions.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      if (!userAns) {
        unattempted++;
      } else if (userAns === q.ans) {
        score++;
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const accuracy = Math.round((correctCount / (correctCount + wrongCount || 1)) * 100);
    const totalQs = currentQuestions.length;
    const percentage = Math.round((score / totalQs) * 100);

    safeSetText("resAccuracy", accuracy + "%");
    safeSetText("resScoreText", `${score} / ${totalQs}`);

    const extraStats = document.getElementById("resExtraStats") || document.createElement("div");
    extraStats.id = "resExtraStats";
    extraStats.className = "grid grid-cols-3 gap-2.5 mt-4";
    extraStats.innerHTML = `
      <div class="bg-emerald-500/15 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/20 text-center">
        <p class="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Correct</p>
        <p class="text-lg font-black text-white">${correctCount}</p>
      </div>
      <div class="bg-rose-500/15 backdrop-blur-md p-3.5 rounded-2xl border border-rose-500/20 text-center">
        <p class="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">Wrong</p>
        <p class="text-lg font-black text-white">${wrongCount}</p>
      </div>
      <div class="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
        <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Skipped</p>
        <p class="text-lg font-black text-white">${unattempted}</p>
      </div>
    `;
    const statsContainer = document.getElementById("resExtraStatsContainer");
    if (statsContainer && !document.getElementById("resExtraStats")) {
      statsContainer.appendChild(extraStats);
    } else if (document.getElementById("resExtraStats")) {
      safeSetHTML("resExtraStats", extraStats.innerHTML);
    }

    let feedback = "Good effort! Keep practicing.";
    if (percentage >= 80) feedback = "Outstanding! Topper Level Performance.";
    else if (percentage >= 60) feedback = "Great job! You are on the right track.";
    else if (percentage < 40) feedback = "Revise the lecture notes and attempt again.";

    const feedbackEl = document.getElementById("resFeedback") || document.createElement("p");
    feedbackEl.id = "resFeedback";
    feedbackEl.className =
      "text-center text-[10px] font-extrabold text-blue-300 mt-4 uppercase tracking-wider";
    feedbackEl.innerText = feedback;
    if (statsContainer && !document.getElementById("resFeedback"))
      statsContainer.appendChild(feedbackEl);

    if (currentUser) {
      const submission = {
        testId: currentActiveTestId,
        testTitle: testData.title,
        score,
        total: totalQs,
        accuracy,
        percentage,
        stats: { correctCount, wrongCount, unattempted },
        userAnswers,
        submittedAt: Date.now(),
      };

      const localScores = JSON.parse(localStorage.getItem("local_quiz_scores") || "[]");
      localScores.push(percentage);
      localStorage.setItem("local_quiz_scores", JSON.stringify(localScores));
      updatePerformanceUI();

      fb.push(fb.ref(db, `users/${currentUser.uid}/test_history`), submission);

      const name = (userData && userData.name) || currentUser.displayName || "Student";
      const photo = currentUser.photoURL || "";
      const uid = currentUser.uid;

      fb.get(fb.ref(db, `quiz_leaderboard/${uid}`)).then((snap) => {
        const lData = snap.exists()
          ? snap.val()
          : { name, photo, totalScore: 0, testsTaken: 0 };
        lData.totalScore += correctCount;
        lData.testsTaken += 1;
        lData.updatedAt = Date.now();
        if (name !== "Student") lData.name = name;
        if (photo) lData.photo = photo;

        fb.set(fb.ref(db, `quiz_leaderboard/${uid}`), lData);
      });
    }
  }

  function closeReviewView() {
    safeClassAdd("quizReviewView", "hidden");
  }

  function showReviewInResults() {
    const list = document.getElementById("reviewListMain");
    if (!list) return;
    list.innerHTML = "";

    currentQuestions.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      const isCorrect = userAns === q.ans;

      list.innerHTML += `
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div class="flex justify-between items-center mb-3.5">
            <div class="px-3 py-1 rounded-lg ${
              isCorrect
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/50"
                : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/50"
            } text-[9px] font-black uppercase tracking-widest border">
              ${
                isCorrect
                  ? '<i class="fa-solid fa-check mr-1"></i> Correct Answer'
                  : userAns
                  ? '<i class="fa-solid fa-xmark mr-1"></i> Incorrect'
                  : '<i class="fa-solid fa-minus mr-1"></i> Unattempted'
              }
            </div>
            <span class="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">Question ${
              idx + 1
            }</span>
          </div>
          <h4 class="text-sm font-extrabold text-slate-900 dark:text-white mb-4 leading-relaxed">${
            q.q
          }</h4>
          
          <div class="grid gap-2">
            ${["a", "b", "c", "d"]
              .map(
                (key) => `
              <div class="p-3.5 rounded-xl flex items-center justify-between ${
                q.ans === key
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
                  : userAns === key
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800"
              } border">
                <span class="text-xs font-bold ${
                  q.ans === key
                    ? "text-emerald-700 dark:text-emerald-300"
                    : userAns === key
                    ? "text-rose-700 dark:text-rose-300"
                    : "text-slate-600 dark:text-slate-300"
                }">${key.toUpperCase()}. ${q[key]}</span>
                ${
                  q.ans === key
                    ? '<i class="fa-solid fa-circle-check text-emerald-500"></i>'
                    : userAns === key
                    ? '<i class="fa-solid fa-circle-xmark text-rose-500"></i>'
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    });

    safeClassRemove("quizReviewView", "hidden");
  }

  function closeResults() {
    safeClassAdd("quizResults", "hidden");
    navigateTo("home");
  }

  function shareResults() {
    const acc = safeGetText("resAccuracy", "0%");
    const score = safeGetText("resScoreText", "0/0");
    const title = testData ? testData.title : "a Quiz";
    const text = `I just scored ${score} with ${acc} accuracy on "${title}"! Can you beat my score?`;

    if (navigator.share) {
      navigator
        .share({
          title: "My Quiz Score",
          text,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast("Result copied to clipboard!"))
        .catch(() => showToast("Failed to copy result."));
    }
  }

  function shareCourse(id: string, title: string) {
    const url = window.location.origin + window.location.pathname + "?course=" + id;
    const text = `Check out this awesome course: ${title}`;
    if (navigator.share) {
      navigator
        .share({
          title: "Course Share",
          text,
          url,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => showToast("Course link copied to clipboard!"))
        .catch(() => showToast("Failed to copy link."));
    }
  }

  function confirmExitQuiz() {
    if (confirm("Are you sure you want to end this test? Progress will be lost.")) {
      clearInterval(quizTimerInterval);
      safeClassAdd("quizPlayer", "hidden");
    }
  }

  function showAuth() {
    safeClassAdd("mainContent", "hidden");
    safeClassAdd("bottomNav", "hidden");
    safeClassAdd("profileSetupForm", "hidden");
    safeClassAdd("authSection", "hidden");

    setTimeout(() => {
      const splash = document.getElementById("splash");
      if (splash) {
        splash.style.opacity = "0";
        setTimeout(() => {
          splash.style.display = "none";
          safeClassRemove("authSection", "hidden");
        }, 1000);
      }
    }, 1500);
  }

  function hideAuth() {
    safeClassAdd("authSection", "hidden");
  }

  function showProfileSetup() {
    safeClassAdd("loginForm", "hidden");
    safeClassRemove("profileSetupForm", "hidden");

    if (currentUser && currentUser.displayName) {
      safeSetVal("setupName", currentUser.displayName || "");
    }
    if (currentUser && currentUser.email) {
      safeSetVal("setupEmail", currentUser.email || "");
    }
  }

  async function logoutFromSetup() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await fb.signOut(auth).catch(() => {});
    } catch (err) {
      console.warn("Logout from setup error:", err);
    }
    window.location.replace(window.location.pathname + "?logout=" + Date.now());
  }

  async function logout() {
    if (!confirm("Are you sure you want to log out?")) return;

    try {
      const splash = document.getElementById("splash");
      if (splash) {
        splash.style.display = "flex";
        splash.style.opacity = "1";
        splash.innerHTML = `
          <div class="flex flex-col items-center bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <i class="fa-solid fa-power-off text-rose-500 text-4xl mb-3 animate-pulse"></i>
            <h2 class="text-slate-900 dark:text-white font-bold text-xl tracking-tight">Logging out...</h2>
            <p class="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">Cleaning session data</p>
          </div>
        `;
      }

      safeClassAdd("mainContent", "hidden");
      safeClassAdd("bottomNav", "hidden");
      safeClassAdd("editProfileModal", "hidden");

      currentUser = null;
      userData = null;

      localStorage.clear();
      sessionStorage.clear();

      await fb.signOut(auth).catch((err) => console.warn("SignOut notice:", err));

      setTimeout(() => {
        window.location.replace(window.location.pathname + "?logout=" + Date.now());
      }, 300);
    } catch (e) {
      console.warn("Logout error:", e);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace(window.location.pathname + "?logout=" + Date.now());
    }
  }

  async function openCourse(id: string, type?: string) {
    currentCourseId = id;
    fb.get(fb.ref(db, "courses/" + id)).then(async (snap) => {
      const c = snap.val();
      if (!c) return;
      const hasAccess =
        (userData && userData.purchased && userData.purchased[id]) || type === "Free" || c.type === "Free";

      safeSetText("detTitle", c.title);
      safeSetText("detDesc", c.description);
      safeSetText("detCategory", c.category);
      safeSetText("detDifficulty", c.difficulty || "Intermediate");
      safeSetText("detTag", c.tag || "LMS");
      safeSetText("detInstructor", c.instructor || "TOC Faculty");
      safeSetText("detRating", c.rating || "4.8");

      const detPriceEl = document.getElementById("detPrice");
      if (c.type === "Free") {
        if (detPriceEl) detPriceEl.innerText = "FREE";
      } else if (c.discount > 0) {
        const finalPrice = Math.round(c.price * (1 - c.discount / 100));
        if (detPriceEl) {
          detPriceEl.innerHTML = `
            <div class="flex flex-col items-start gap-1">
              <span class="text-rose-500 text-[10px] font-black bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 uppercase tracking-widest">Save ${c.discount}%</span>
              <div class="flex items-center gap-3">
                <span class="line-through text-slate-400 text-sm">₹${c.price}</span>
                <span class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹${finalPrice}</span>
              </div>
            </div>
          `;
        }
      } else {
        if (detPriceEl) detPriceEl.innerText = "₹" + c.price;
      }

      safeSetSrc("courseDetailThumb", c.thumbnail);

      const instructSec = document.getElementById("instructSec");
      if (c.instructions) {
        if (instructSec) instructSec.classList.remove("hidden");
        safeSetText("detInstruct", c.instructions);
      } else {
        if (instructSec) instructSec.classList.add("hidden");
      }

      const playOverlay = document.getElementById("playIntroOverlay");
      const thumbOverlay = document.getElementById("courseThumbOverlay");
      const iframe = document.getElementById("courseIframe") as HTMLIFrameElement | null;
      const overlayEl = document.getElementById("courseDetailOverlay");

      if (c.youtubeIntro) {
        if (playOverlay) playOverlay.classList.remove("hidden");
        if (thumbOverlay) thumbOverlay.classList.remove("hidden");

        let vidId = c.youtubeIntro;
        const regExp =
          /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/;
        const match = vidId.match(regExp);
        vidId = match && match[1].length === 11 ? match[1] : vidId;

        if (iframe) iframe.src = `https://www.youtube.com/embed/${vidId}?autoplay=0`;
        if (overlayEl) {
          overlayEl.dataset.vidId = vidId;
          overlayEl.dataset.playMode = c.youtubePlayMode || "In-App";
        }

        const playBtnText = document.querySelector("#playIntroOverlay span") as HTMLElement | null;
        if (playBtnText) {
          playBtnText.innerText =
            (c.youtubePlayMode || "In-App") === "Redirect"
              ? "Open in YouTube"
              : "Play Intro Video";
        }
      } else {
        if (playOverlay) playOverlay.classList.add("hidden");
        if (thumbOverlay) thumbOverlay.classList.add("hidden");
        if (iframe) iframe.src = "";
      }

      const attachSec = document.getElementById("attachmentSec");
      const attachList = document.getElementById("detAttachments");
      if (attachList) attachList.innerHTML = "";
      let hasAttachments = false;

      const noteIds = c.linkedNoteIds || (c.linkedNoteId ? [c.linkedNoteId] : []);
      for (const nid of noteIds) {
        const noteSnap = await fb.get(fb.ref(db, "notes/" + nid));
        if (noteSnap.exists() && attachList) {
          hasAttachments = true;
          const n = noteSnap.val();
          attachList.innerHTML += `
            <div onclick="${
              hasAccess
                ? `viewPdf('${n.url}', '${(n.title || "").replace(/'/g, "\\'")}')`
                : "showToast('Purchase course to unlock this material')"
            }" class="flex items-center gap-3.5 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft active:scale-[0.99] transition-all cursor-pointer group">
              <div class="w-10 h-10 ${
                hasAccess
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              } rounded-xl flex items-center justify-center shrink-0"><i class="fa-solid fa-file-pdf"></i></div>
              <div class="flex-1 min-w-0">
                <h4 class="text-xs font-extrabold text-slate-900 dark:text-white truncate">PDF Notes: ${
                  n.title
                }</h4>
                <p class="text-[9px] ${
                  hasAccess ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                } font-extrabold uppercase tracking-wider mt-0.5">${
            hasAccess ? "Tap to Read Material" : '<i class="fa-solid fa-lock mr-1"></i> Batch Locked'
          }</p>
              </div>
              <div class="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <i class="fa-solid ${hasAccess ? "fa-chevron-right" : "fa-lock"} text-[10px]"></i>
              </div>
            </div>
          `;
        }
      }

      const testIds = c.linkedTestIds || (c.linkedTestId ? [c.linkedTestId] : []);
      for (const tid of testIds) {
        const testSnap = await fb.get(fb.ref(db, "tests/" + tid));
        if (testSnap.exists() && attachList) {
          hasAttachments = true;
          const t = testSnap.val();
          attachList.innerHTML += `
            <div onclick="${
              hasAccess
                ? `startQuiz('${tid}')`
                : "showToast('Purchase course to unlock this test')"
            }" class="flex items-center gap-3.5 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft active:scale-[0.99] transition-all cursor-pointer group">
              <div class="w-10 h-10 ${
                hasAccess
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              } rounded-xl flex items-center justify-center shrink-0"><i class="fa-solid fa-clipboard-check"></i></div>
              <div class="flex-1 min-w-0">
                <h4 class="text-xs font-extrabold text-slate-900 dark:text-white truncate">CBT Test: ${
                  t.title
                }</h4>
                <p class="text-[9px] ${
                  hasAccess ? "text-blue-600 dark:text-blue-400" : "text-amber-500"
                } font-extrabold uppercase tracking-wider mt-0.5">${
            hasAccess ? "Attempt Mock Test" : '<i class="fa-solid fa-lock mr-1"></i> Batch Locked'
          }</p>
              </div>
              <div class="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <i class="fa-solid ${hasAccess ? "fa-chevron-right" : "fa-lock"} text-[10px]"></i>
              </div>
            </div>
          `;
        }
      }

      const liveIds = c.linkedLiveIds || (c.linkedLiveId ? [c.linkedLiveId] : []);
      for (const lid of liveIds) {
        const liveSnap = await fb.get(fb.ref(db, "live/" + lid));
        if (liveSnap.exists() && attachList) {
          hasAttachments = true;
          const l = liveSnap.val();
          attachList.innerHTML += `
            <div onclick="${
              hasAccess
                ? `openLive('${lid}')`
                : "showToast('Purchase course to unlock live class')"
            }" class="flex items-center gap-3.5 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft active:scale-[0.99] transition-all cursor-pointer group">
              <div class="w-10 h-10 ${
                hasAccess
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              } rounded-xl flex items-center justify-center shrink-0"><i class="fa-solid fa-video"></i></div>
              <div class="flex-1 min-w-0">
                <h4 class="text-xs font-extrabold text-slate-900 dark:text-white truncate">Video Lecture: ${
                  l.title
                }</h4>
                <p class="text-[9px] ${
                  hasAccess ? "text-indigo-600 dark:text-indigo-400" : "text-amber-500"
                } font-extrabold uppercase tracking-wider mt-0.5">${
            hasAccess ? l.mode || "Watch Lecture" : '<i class="fa-solid fa-lock mr-1"></i> Batch Locked'
          }</p>
              </div>
              <div class="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <i class="fa-solid ${hasAccess ? "fa-chevron-right" : "fa-lock"} text-[10px]"></i>
              </div>
            </div>
          `;
        }
      }

      if (attachSec) {
        if (hasAttachments) attachSec.classList.remove("hidden");
        else attachSec.classList.add("hidden");
      }

      const mainBtn = document.getElementById("detMainBtn");
      if (mainBtn) {
        if (hasAccess) {
          mainBtn.innerHTML = `<i class="fa-solid fa-circle-check text-sm"></i> ENROLLED • START LEARNING`;
          mainBtn.className =
            "w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2";
          mainBtn.onclick = () => {
            showToast("Batch Unlocked! Scroll up to access lectures, PDFs & tests.");
          };
        } else if (pendingPurchases.has(id)) {
          mainBtn.innerHTML = `<i class="fa-solid fa-clock text-sm"></i> VERIFICATION PENDING`;
          mainBtn.className =
            "w-full bg-amber-500 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2";
          mainBtn.onclick = () => {
            showToast("Admin is verifying your payment. Please wait.");
          };
        } else {
          const finalPrice = c.discount > 0 ? Math.round(c.price * (1 - c.discount / 100)) : c.price;
          mainBtn.className =
            "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-2";
          mainBtn.innerHTML = `<i class="fa-solid fa-bolt text-sm"></i> ENROLL IN BATCH • ${
            c.type === "Free" ? "FREE" : "₹" + finalPrice
          }`;
          mainBtn.onclick = () => {
            initiateCashfreePayment(id, "course");
          };
        }
      }

      safeClassRemove("courseDetailOverlay", "hidden");
    });
  }

  function closeCourseDetail() {
    safeClassAdd("courseDetailOverlay", "hidden");
    safeClassAdd("courseVideoPlayer", "hidden");
    safeClassRemove("courseDetailThumb", "hidden");
    safeClassAdd("courseThumbOverlay", "hidden");
    safeSetSrc("courseIframe", "");
    if (window.progressInterval) {
      clearInterval(window.progressInterval);
      window.progressInterval = null;
    }
    if (window.coursePlayer && typeof window.coursePlayer.destroy === "function") {
      try {
        window.coursePlayer.destroy();
        window.coursePlayer = null;
      } catch (_e) {}
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function toggleCourseFullscreen() {
    const container = document.getElementById("courseVideoPlayer");
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  function playIntro() {
    const overlayEl = document.getElementById("courseDetailOverlay");
    if (!overlayEl) return;
    const vidId = overlayEl.dataset.vidId;
    const playMode = overlayEl.dataset.playMode;
    if (vidId) {
      if (playMode === "Redirect") {
        window.open(`https://www.youtube.com/watch?v=${vidId}`, "_blank");
      } else {
        safeClassRemove("courseVideoPlayer", "hidden");
        safeClassAdd("courseDetailThumb", "hidden");
        safeClassAdd("courseThumbOverlay", "hidden");
        safeClassAdd("playIntroOverlay", "hidden");

        const savedTime = Number(localStorage.getItem("vidProgress_" + vidId) || 0);

        if (window.YT && window.YT.Player) {
          if (window.coursePlayer) {
            try {
              window.coursePlayer.destroy();
            } catch (_e) {}
            window.coursePlayer = null;
          }

          safeSetSrc("courseIframe", "");
          window.coursePlayer = new window.YT.Player("courseIframe", {
            videoId: vidId,
            playerVars: {
              autoplay: 1,
              enablejsapi: 1,
              start: Math.floor(savedTime),
            },
            events: {
              onReady: function () {
                if (savedTime > 10) {
                  showToast("Resuming video from saved progress.");
                }
              },
              onStateChange: function (event: any) {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  if (!window.progressInterval) {
                    window.progressInterval = setInterval(() => {
                      if (window.coursePlayer && window.coursePlayer.getCurrentTime) {
                        const currentTime = window.coursePlayer.getCurrentTime();
                        if (currentTime > 0) {
                          localStorage.setItem("vidProgress_" + vidId, String(currentTime));
                        }
                      }
                    }, 5000);
                  }
                } else {
                  if (window.progressInterval) {
                    clearInterval(window.progressInterval);
                    window.progressInterval = null;
                  }
                }
                if (event.data === window.YT.PlayerState.ENDED) {
                  localStorage.removeItem("vidProgress_" + vidId);
                  triggerConfetti();
                }
              },
            },
          });
        } else {
          safeSetSrc(
            "courseIframe",
            `https://www.youtube.com/embed/${vidId}?autoplay=1&start=${Math.floor(savedTime)}`
          );
        }
      }
    }
  }

  function openLive(id: string) {
    fb.get(fb.ref(db, "live/" + id)).then((snap) => {
      const l = snap.val();
      if (!l) return;
      l.id = id;
      const hasAccess = checkItemAccess(l, "live");

      if (hasAccess) {
        if (l.mode === "In-App") {
          viewPdf(l.embedUrl, l.title, true);
        } else {
          window.open(l.youtubeUrl, "_blank");
        }
      } else {
        showToast("Please purchase the course to join this live session.");
        if (l.courseId) {
          setTimeout(() => openCourse(l.courseId, "Paid"), 800);
        }
      }
    });
  }

  function viewPdf(url: string, title: string, isVideo = false) {
    safeSetText("pdfTitle", title);

    let viewer = url;
    if (!isVideo) {
      if (url.includes("drive.google.com")) {
        viewer = url.replace(/\/view.*$/, "/preview");
      } else {
        viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      }
      safeSetSrc("pdfFrame", viewer);
    } else {
      if (window.YT && window.YT.Player && url.includes("youtube.com/embed/")) {
        const vidId = url.split("embed/")[1].split("?")[0];
        if (window.pdfPlayer) {
          window.pdfPlayer.destroy();
          window.pdfPlayer = null;
        }
        safeSetSrc("pdfFrame", "");
        window.pdfPlayer = new window.YT.Player("pdfFrame", {
          videoId: vidId,
          playerVars: {
            autoplay: 1,
            enablejsapi: 1,
          },
          events: {
            onStateChange: function (event: any) {
              if (event.data === window.YT.PlayerState.ENDED) {
                triggerConfetti();
              }
            },
          },
        });
      } else {
        safeSetSrc("pdfFrame", viewer);
      }
    }
    safeSetStyle("pdfViewerContainer", "display", "flex");

    const blocker = document.getElementById("pdfPopoutBlocker");
    if (blocker) {
      blocker.style.display = isVideo ? "none" : "block";
    }
  }

  function closePdf() {
    safeSetStyle("pdfViewerContainer", "display", "none");
    safeSetSrc("pdfFrame", "");
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function togglePdfFullscreen() {
    const container = document.getElementById("pdfViewerContainer");
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  function closePayment() {
    safeSetStyle("paymentPopup", "display", "none");
    safeClassAdd("paymentPopup", "hidden");
    setTimeout(() => {
      safeClassRemove("paymentFormBody", "hidden");
      safeClassAdd("paymentSuccessBody", "hidden");
    }, 300);
  }

  function submitPayment() {
    const txnInput = document.getElementById("txnId") as HTMLInputElement | null;
    const txn = txnInput ? txnInput.value : "";
    if (!txn) return alert("Enter transaction ID");

    fb.push(fb.ref(db, "payment_requests"), {
      courseId: currentCourseId,
      courseName: safeGetText("payCourseTitle"),
      userId: currentUser.uid,
      userName: userData ? userData.name : "Unknown",
      userPhone: userData ? userData.phone : "Unknown",
      txnId: txn,
      status: "Pending",
      time: Date.now(),
    }).then(() => {
      safeClassAdd("paymentFormBody", "hidden");
      safeClassRemove("paymentSuccessBody", "hidden");
    });
  }

  async function broadcastNotification() {
    const titleInput = document.getElementById("notifTitle") as HTMLInputElement | null;
    const msgInput = document.getElementById("notifMsg") as HTMLInputElement | null;
    const title = titleInput ? titleInput.value : "";
    const body = msgInput ? msgInput.value : "";
    if (!title || !body) return showToast("Please fill all fields");

    try {
      showToast("Pushing alert...");
      await fb.push(fb.ref(db, "notifications"), {
        title,
        message: body,
        timestamp: Date.now(),
        type: "broadcast",
        webPush: true,
      });
      safeSetVal("notifTitle", "");
      safeSetVal("notifMsg", "");
      showToast("Successfully broadcasted!");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function requestNotificationPermission() {}
  function updateNotificationBtnState() {}

  function initNotificationListener() {
    updateNotificationBtnState();

    const notifRef = fb.query(fb.ref(db, "notifications"), fb.limitToLast(1));
    let isFirstLoad = true;
    let lastNotifId = localStorage.getItem("lastHandledNotifId");

    fb.onValue(notifRef, (snap) => {
      if (!snap.exists()) return;

      const data = snap.val();
      const currentId = Object.keys(data)[0];
      const notif = data[currentId];

      if (!isFirstLoad && currentId !== lastNotifId) {
        lastNotifId = currentId;
        localStorage.setItem("lastHandledNotifId", currentId);

        if (window.playSound) window.playSound("notification");
        showToast("New Notification: " + (notif.title || "Update"));

        if (notif.webPush !== false) {
          const audio = new Audio(
            "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
          );
          audio.play().catch(() => {});
        }
      }

      isFirstLoad = false;
      loadAllNotifications();
    });
  }

  async function loadAllNotifications() {
    const snap = await fb.get(fb.query(fb.ref(db, "notifications"), fb.limitToLast(20)));
    if (snap.exists()) {
      const notifs: any[] = [];
      snap.forEach((childSnap) => {
        notifs.unshift({ id: childSnap.key, ...childSnap.val() });
      });
      renderNotifications(notifs);
    }
  }

  async function openSupport() {
    try {
      const snap = await fb.get(fb.ref(db, "settings/support"));
      if (snap.exists()) {
        const phone = snap.val().whatsapp;
        if (phone) {
          window.open(`https://wa.me/${phone.replace(/\+/g, "").replace(/\s/g, "")}`, "_blank");
        } else {
          showToast("Support contact not set by admin");
        }
      } else {
        showToast("No support info available");
      }
    } catch (_e) {
      showToast("Cannot connect to support");
    }
  }

  async function saveSupportSettings() {
    const input = document.getElementById("supportWhatsapp") as HTMLInputElement | null;
    const whatsapp = input ? input.value : "";
    try {
      showToast("Updating support...");
      await fb.set(fb.ref(db, "settings/support"), {
        whatsapp,
        updatedAt: Date.now(),
      });
      showToast("Support Updated!");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function loadAdminSettings() {
    try {
      const snap = await fb.get(fb.ref(db, "settings/support"));
      if (snap.exists()) {
        const input = document.getElementById("supportWhatsapp") as HTMLInputElement | null;
        if (input) input.value = snap.val().whatsapp || "";
      }
    } catch (_e) {}
  }

  function closeSupport() {
    safeSetStyle("supportPopup", "display", "none");
    safeClassAdd("supportPopup", "hidden");
  }

  // Daily Quote Logic
  const quotes = [
    { q: "The expert in anything was once a beginner.", a: "Helen Hayes" },
    { q: "It always seems impossible until it is done.", a: "Nelson Mandela" },
    { q: "Success is the sum of small efforts, repeated day in and day out.", a: "Robert Collier" },
    { q: "Don't let what you cannot do interfere with what you can do.", a: "John Wooden" },
    {
      q: "Education is the most powerful weapon which you can use to change the world.",
      a: "Nelson Mandela",
    },
  ];

  function openQuoteModal() {
    const today = new Date().getDay();
    const quote = quotes[today % quotes.length];
    safeSetText("dailyQuoteText", '"' + quote.q + '"');
    safeSetText("dailyQuoteAuthor", "- " + quote.a);
    safeClassRemove("quoteModal", "hidden");
  }

  function closeQuoteModal() {
    safeClassAdd("quoteModal", "hidden");
  }

  // Focus Timer (Pomodoro) Logic
  let focusTimerInterval: any;
  let focusTimeRemaining = 25 * 60;
  let isTimerRunning = false;
  let currentTimerDuration = 25 * 60;

  function openFocusTimer() {
    safeClassRemove("focusTimerModal", "hidden");
    updateTimerDisplay();
  }

  function closeFocusTimer() {
    safeClassAdd("focusTimerModal", "hidden");
  }

  function setTimerDuration(mins: number) {
    pauseFocusTimer();
    currentTimerDuration = mins * 60;
    focusTimeRemaining = currentTimerDuration;
    updateTimerDisplay();
  }

  function startFocusTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    safeClassAdd("btnStartTimer", "hidden");
    safeClassRemove("btnPauseTimer", "hidden");

    focusTimerInterval = setInterval(() => {
      if (focusTimeRemaining > 0) {
        focusTimeRemaining--;
        updateTimerDisplay();
      } else {
        pauseFocusTimer();
        alert("Time is up! Great focus session.");
        focusTimeRemaining = currentTimerDuration;
        updateTimerDisplay();
      }
    }, 1000);
  }

  function pauseFocusTimer() {
    isTimerRunning = false;
    clearInterval(focusTimerInterval);
    safeClassRemove("btnStartTimer", "hidden");
    safeClassAdd("btnPauseTimer", "hidden");
  }

  function resetFocusTimer() {
    pauseFocusTimer();
    focusTimeRemaining = currentTimerDuration;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(focusTimeRemaining / 60);
    const secs = focusTimeRemaining % 60;
    const display = document.getElementById("timerDisplay");
    if (display) {
      display.innerText = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
  }

  window.addEventListener("online", () => {
    safeSetStyle("noInternet", "display", "none");
  });
  window.addEventListener("offline", () => {
    safeSetStyle("noInternet", "display", "flex");
  });

  function forceOnline() {
    safeSetStyle("noInternet", "display", "none");
  }

  function getApiUrl(endpoint: string) {
    let baseUrl = window.BACKEND_URL || localStorage.getItem("BACKEND_URL") || "";
    if (!baseUrl) {
      baseUrl = window.location.origin;
    }
    baseUrl = baseUrl.replace(/\/$/, "");
    if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;
    return baseUrl + endpoint;
  }

  async function signInAsGuest() {
    try {
      const result = await fb.signInAnonymously(auth);
      currentUser = result.user;
      showToast("Signed in as Guest!");
      hideAuth();
      checkUserProfile();
    } catch (err: any) {
      console.error("Guest Sign-In Error:", err);
      showToast("Guest login failed: " + (err.message || "Unknown error"));
    }
  }

  // ==========================================
  // CASHFREE PAYMENT GATEWAY INTEGRATION ENGINE
  // ==========================================
  function closeCashfreeModal() {
    safeClassAdd("cashfreeModal", "hidden");
  }

  function showCashfreeModal(cfg: any) {
    const modal = document.getElementById("cashfreeModal");
    const body = document.getElementById("cashfreeModalBody");
    if (!modal || !body) return;
    modal.classList.remove("hidden");

    if (cfg.status === "CREATING_ORDER") {
      body.innerHTML = `
        <div class="py-6 flex flex-col items-center">
          <div class="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center text-3xl mb-6 animate-pulse border border-blue-100">
            <i class="fa-solid fa-spinner animate-spin"></i>
          </div>
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-2">Step 1 of 3</span>
          <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2">Creating Order</h3>
          <p class="text-xs text-slate-400 font-medium max-w-xs leading-relaxed">Initializing secure transaction for <span class="font-bold text-slate-700 dark:text-slate-200">${
            cfg.title || "Course"
          }</span> (₹${cfg.price})...</p>
        </div>
      `;
    } else if (cfg.status === "OPENING_GATEWAY") {
      const isProd = String(cfg.cfEnv || "").toUpperCase().includes("PROD");
      const directUrl = isProd
        ? `https://payments.cashfree.com/order/#${cfg.sessionId}`
        : `https://payments-test.cashfree.com/order/#${cfg.sessionId}`;

      body.innerHTML = `
        <div class="py-6 flex flex-col items-center">
          <div class="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center text-3xl mb-6 border border-emerald-100 animate-bounce">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Step 2 of 3</span>
          <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2">Cashfree Payment Gateway</h3>
          <p class="text-xs text-slate-400 font-medium max-w-xs leading-relaxed mb-6">Choose payment method (UPI, Google Pay, Cards, NetBanking)...</p>
          <div class="w-full space-y-3">
            <button onclick="launchCashfreeCheckout('${cfg.sessionId}', '${cfg.cfEnv}', '${cfg.orderId}', '${cfg.courseId}', '_top')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-200 text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-lock"></i>
              <span>Proceed to Pay ₹${cfg.price}</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
            <a href="${directUrl}" target="_top" class="block w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider text-center transition-all">
              <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i> Open Direct Payment Page
            </a>
          </div>
        </div>
      `;
    } else if (cfg.status === "VERIFYING") {
      body.innerHTML = `
        <div class="py-6 flex flex-col items-center">
          <div class="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center text-3xl mb-6 border border-blue-100">
            <i class="fa-solid fa-cloud-arrow-up animate-pulse"></i>
          </div>
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-2">Step 3 of 3</span>
          <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2">Verifying Payment</h3>
          <p class="text-xs text-slate-400 font-medium max-w-xs leading-relaxed">Communicating with server to verify payment details...</p>
          <div class="mt-4 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-mono text-slate-500">Order ID: ${
            cfg.orderId || ""
          }</div>
        </div>
      `;
    } else if (cfg.status === "SUCCESS") {
      body.innerHTML = `
        <div class="py-6 flex flex-col items-center">
          <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl shadow-emerald-100 animate-bounce">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <span class="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-2">Payment Successful</span>
          <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2">Course Unlocked!</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs leading-relaxed mb-6">Your transaction was verified successfully. You now have full access!</p>
          <button onclick="closeCashfreeModal(); navigateTo('mycourses');" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl shadow-xl text-xs uppercase tracking-wider active:scale-95 transition-all">
            Go to My Courses
          </button>
        </div>
      `;
    } else if (cfg.status === "ERROR") {
      body.innerHTML = `
        <div class="py-6 flex flex-col items-center">
          <div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mb-6 border border-rose-100">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <span class="inline-block px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-2">Notice</span>
          <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2">Payment Notice</h3>
          <p class="text-xs text-rose-500 font-semibold max-w-xs leading-relaxed mb-6">${
            cfg.message || "Something went wrong."
          }</p>
          <button onclick="closeCashfreeModal()" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider active:scale-95 transition-all">
            Close
          </button>
        </div>
      `;
    }
  }

  async function ensureCashfreeSDK(): Promise<boolean> {
    if (typeof window.Cashfree === "function") return true;
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  window.launchCashfreeCheckout = async function (
    sessionId: string,
    cfEnv: string,
    orderId: string,
    courseId: string,
    target = "_top"
  ) {
    const isProd = String(cfEnv || "").toUpperCase().includes("PROD");
    localStorage.setItem("pending_cf_order_id", orderId);
    localStorage.setItem("pending_course_id", courseId);
    const directUrl = isProd
      ? `https://payments.cashfree.com/order/#${sessionId}`
      : `https://payments-test.cashfree.com/order/#${sessionId}`;

    const loaded = await ensureCashfreeSDK();
    if (loaded && typeof window.Cashfree === "function") {
      try {
        const cashfree = window.Cashfree({
          mode: isProd ? "production" : "sandbox",
        });
        cashfree
          .checkout({
            paymentSessionId: sessionId,
            redirectTarget: target || "_top",
          })
          .then((result: any) => {
            if (result && result.error) {
              window.open(directUrl, "_top") || (window.location.href = directUrl);
            }
          })
          .catch(() => {
            window.open(directUrl, "_top") || (window.location.href = directUrl);
          });
        return;
      } catch (_err) {
        window.open(directUrl, "_top") || (window.location.href = directUrl);
      }
    } else {
      window.open(directUrl, "_top") || (window.location.href = directUrl);
    }
  };

  async function initiateCashfreePayment(courseId: string, productType = "course") {
    if (!currentUser) {
      showAuth();
      showToast("Please sign in or use Quick Guest Sign-In to purchase");
      return;
    }
    if (userData && userData.purchased && userData.purchased[courseId]) {
      alert("You already own this item!");
      navigateTo("mycourses");
      return;
    }
    let itemTitle = "Course Item";
    let itemPrice = 0;

    if (productType === "test") {
      let testObj = (allTestsCached || []).find((t) => t.id === courseId);
      if (!testObj) {
        try {
          const snap = await fb.get(fb.ref(db, "tests/" + courseId));
          if (snap.exists()) testObj = snap.val();
        } catch (_e) {}
      }
      if (testObj) {
        itemTitle = testObj.title || "Test Series";
        const rawP = Number(testObj.price) || 0;
        const disc = Number(testObj.discount) || 0;
        itemPrice = disc > 0 ? Math.round(rawP * (1 - disc / 100)) : rawP;
      }
    } else {
      let courseObj = (allCoursesCached || []).find((c) => c.id === courseId);
      if (!courseObj) {
        try {
          const snap = await fb.get(fb.ref(db, "courses/" + courseId));
          if (snap.exists()) courseObj = snap.val();
        } catch (_e) {}
      }
      if (courseObj) {
        itemTitle = courseObj.title || "Course";
        if (courseObj.type === "Free") {
          itemPrice = 0;
        } else {
          const rawP = Number(courseObj.price) || 0;
          const disc = Number(courseObj.discount) || 0;
          itemPrice = disc > 0 ? Math.round(rawP * (1 - disc / 100)) : rawP;
        }
      }
    }

    if (itemPrice <= 0 && productType !== "test") {
      try {
        if (!userData) userData = {};
        if (!userData.purchased) userData.purchased = {};
        userData.purchased[courseId] = true;
        if (currentUser && currentUser.uid) {
          await fb.set(fb.ref(db, `users/${currentUser.uid}/purchased/${courseId}`), true);
        }
        showToast("🎉 Free Item Unlocked Successfully!");
        renderHomeCourses();
        renderAllCourses();
        renderTests();
        return;
      } catch (e) {
        console.error("Free item unlock error:", e);
      }
    }

    showCashfreeModal({
      status: "CREATING_ORDER",
      title: itemTitle,
      price: itemPrice,
    });

    try {
      const resp = await fetch(getApiUrl("/api/cashfree/create-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          courseTitle: itemTitle,
          userId: currentUser.uid,
          price: itemPrice,
          customerName: (userData && userData.name) || currentUser.displayName || "Student",
          customerEmail:
            (userData && userData.email) || currentUser.email || "student@theonlineclasses.com",
          customerPhone:
            (userData && userData.phone) || currentUser.phoneNumber || "+919999999999",
          productType,
          origin: window.location.origin,
        }),
      });

      let data: any = {};
      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await resp.json();
      } else {
        throw new Error(`Server returned error status (${resp.status}).`);
      }

      if (!resp.ok || !data.payment_session_id) {
        let errMsg =
          data.message || data.error || "Failed to initialize Cashfree payment order.";
        if (data.details) {
          try {
            const parsedDetails =
              typeof data.details === "string" ? JSON.parse(data.details) : data.details;
            if (parsedDetails.message) errMsg = parsedDetails.message;
          } catch (_e) {}
        }
        showCashfreeModal({
          status: "ERROR",
          message: errMsg,
        });
        return;
      }

      showCashfreeModal({
        status: "OPENING_GATEWAY",
        title: itemTitle,
        price: itemPrice,
        sessionId: data.payment_session_id,
        cfEnv: data.cf_env,
        orderId: data.order_id,
        courseId,
      });

      window.launchCashfreeCheckout(
        data.payment_session_id,
        data.cf_env,
        data.order_id,
        courseId,
        "_top"
      );
    } catch (err: any) {
      showCashfreeModal({
        status: "ERROR",
        message: err.message || "Network error while connecting to server.",
      });
    }
  }

  async function verifyCashfreeOrderBackend(
    orderId: string,
    courseId: string,
    retryCount = 0
  ) {
    showCashfreeModal({
      status: "VERIFYING",
      orderId,
    });
    try {
      const resp = await fetch(getApiUrl("/api/cashfree/verify-order/" + orderId));
      let data: any = {};
      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await resp.json();
      } else {
        throw new Error(`Verify endpoint returned HTTP ${resp.status}`);
      }
      if (resp.ok && data.verified && data.order_status === "PAID") {
        if (!userData) userData = {};
        if (!userData.purchased) userData.purchased = {};
        userData.purchased[courseId] = true;
        const activeUser = currentUser || auth.currentUser;
        if (activeUser && activeUser.uid) {
          fb.set(fb.ref(db, `users/${activeUser.uid}/purchased/${courseId}`), true).catch(
            () => {}
          );
        }
        localStorage.removeItem("pending_cf_order_id");
        localStorage.removeItem("pending_course_id");
        showCashfreeModal({
          status: "SUCCESS",
          courseId,
        });
        renderHomeCourses();
        renderAllCourses();
        renderTests();
      } else if (data.order_status === "ACTIVE" || data.order_status === "PENDING") {
        if (retryCount < 3) {
          setTimeout(() => {
            verifyCashfreeOrderBackend(orderId, courseId, retryCount + 1);
          }, 3000);
          return;
        }
        showCashfreeModal({
          status: "ERROR",
          message:
            "Payment verification pending. Please refresh after completing payment in Cashfree window.",
        });
      } else {
        showCashfreeModal({
          status: "ERROR",
          message: data.message || `Payment status: ${data.order_status || "FAILED"}`,
        });
      }
    } catch (_err) {
      showCashfreeModal({
        status: "ERROR",
        message: "Failed to verify payment status with server.",
      });
    }
  }

  async function checkPendingPaymentReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    let orderIdFromUrl = urlParams.get("order_id") || urlParams.get("cf_status");
    const courseIdFromUrl =
      urlParams.get("course_id") || localStorage.getItem("pending_course_id");
    const savedOrderId = localStorage.getItem("pending_cf_order_id");

    if (!orderIdFromUrl && savedOrderId) {
      orderIdFromUrl = savedOrderId;
    }

    if (orderIdFromUrl && courseIdFromUrl) {
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      verifyCashfreeOrderBackend(orderIdFromUrl, courseIdFromUrl);
    }
  }

  function toggleNotifications() {
    const dropdown = document.getElementById("notifDropdown");
    if (dropdown) {
      dropdown.classList.toggle("hidden");
    }
  }

  // App Guide / Tutorial Logic
  let currentGuideSlide = 0;
  const totalGuideSlides = 4;

  function updateGuideUI() {
    const slider = document.getElementById("guideSlider");
    if (slider) {
      slider.style.transform = `translateX(-${currentGuideSlide * 25}%)`;
    }

    const prevBtn = document.getElementById("guidePrevBtn");
    const nextBtn = document.getElementById("guideNextBtn");

    if (prevBtn) {
      if (currentGuideSlide === 0) prevBtn.classList.add("hidden");
      else prevBtn.classList.remove("hidden");
    }

    if (nextBtn) {
      if (currentGuideSlide === totalGuideSlides - 1) {
        nextBtn.innerText = "Finish";
        nextBtn.classList.remove("bg-blue-600", "hover:bg-blue-700", "shadow-blue-500/20");
        nextBtn.classList.add("bg-emerald-600", "hover:bg-emerald-700", "shadow-emerald-500/20");
      } else {
        nextBtn.innerText = "Next";
        nextBtn.classList.remove("bg-emerald-600", "hover:bg-emerald-700", "shadow-emerald-500/20");
        nextBtn.classList.add("bg-blue-600", "hover:bg-blue-700", "shadow-blue-500/20");
      }
    }

    const dotsContainer = document.getElementById("guideDots");
    if (dotsContainer) {
      dotsContainer.innerHTML = Array.from({ length: totalGuideSlides })
        .map(
          (_, i) =>
            `<div class="w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === currentGuideSlide ? "bg-blue-600 w-6" : "bg-slate-300 dark:bg-slate-700"
            }"></div>`
        )
        .join("");
    }
  }

  function openAppGuide() {
    currentGuideSlide = 0;
    updateGuideUI();

    const modal = document.getElementById("appGuideModal");
    const content = document.getElementById("appGuideContent");
    if (modal && content) {
      modal.classList.remove("hidden");
      setTimeout(() => {
        content.classList.remove("scale-95");
        content.classList.add("scale-100");
      }, 10);
    }
  }

  function closeAppGuide() {
    const modal = document.getElementById("appGuideModal");
    const content = document.getElementById("appGuideContent");
    if (modal && content) {
      content.classList.remove("scale-100");
      content.classList.add("scale-95");
      setTimeout(() => {
        modal.classList.add("hidden");
      }, 300);
    }
  }

  function guideNext() {
    if (currentGuideSlide < totalGuideSlides - 1) {
      currentGuideSlide++;
      updateGuideUI();
    } else {
      closeAppGuide();
    }
  }

  function guidePrev() {
    if (currentGuideSlide > 0) {
      currentGuideSlide--;
      updateGuideUI();
    }
  }

  function updatePerformanceUI() {
    const container = document.getElementById("performanceContainer");
    if (!container) return;

    const scoresStr = localStorage.getItem("local_quiz_scores");
    if (scoresStr) {
      try {
        const scores: number[] = JSON.parse(scoresStr);
        if (scores.length > 0) {
          const sum = scores.reduce((a, b) => a + b, 0);
          const avg = Math.round(sum / scores.length);

          let colorClass = "text-amber-500";
          let bgClass = "bg-amber-500";
          if (avg >= 80) {
            colorClass = "text-emerald-500";
            bgClass = "bg-emerald-500";
          } else if (avg < 40) {
            colorClass = "text-rose-500";
            bgClass = "bg-rose-500";
          }

          container.innerHTML = `
            <div class="flex justify-between items-end mb-2">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Score</span>
              <span class="text-xl font-black ${colorClass}">${avg}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-3">
              <div class="${bgClass} h-2 rounded-full transition-all duration-1000" style="width: ${avg}%"></div>
            </div>
            <p class="text-[10px] text-slate-400 font-medium text-left">Based on ${scores.length} test(s) taken locally.</p>
          `;
        }
      } catch (_e) {}
    }
  }

  function updateDailyStreak() {
    const today = new Date().toISOString().split("T")[0];
    const lastLogin = localStorage.getItem("last_login_date");
    let streak = parseInt(localStorage.getItem("study_streak") || "0", 10);

    if (lastLogin !== today) {
      if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          streak++;
        } else if (diffDays > 1) {
          streak = 1;
        }
      } else {
        streak = 1;
      }
      localStorage.setItem("last_login_date", today);
      localStorage.setItem("study_streak", streak.toString());

      if (streak % 7 === 0 && streak > 0) {
        setTimeout(() => {
          triggerConfetti();
          if (window.playSound) window.playSound("streak");
          showToast(`7-Day Streak Achieved! 🎉`);
        }, 2000);
      }
    }

    const countText = document.getElementById("streakCountText");
    const daysContainer = document.getElementById("streakDaysContainer");

    if (countText) countText.innerText = `${streak} Day Streak`;

    if (daysContainer) {
      daysContainer.innerHTML = "";
      const currentWeekStreak = streak % 7 === 0 && streak > 0 ? 7 : streak % 7;
      for (let i = 1; i <= 7; i++) {
        const isCompleted = i <= currentWeekStreak;
        const isToday = i === currentWeekStreak;

        const bg = isCompleted
          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 border border-emerald-400/50"
          : "bg-white/10 text-slate-400 border border-white/10";
        const scale = isToday ? "ring-2 ring-amber-400/80 scale-105" : "scale-100";
        const icon = isCompleted
          ? '<i class="fa-solid fa-check text-[9px]"></i>'
          : `<span class="text-[9px] font-bold tabular-nums">D${i}</span>`;

        daysContainer.innerHTML += `
          <div class="w-7 h-7 rounded-lg flex items-center justify-center ${bg} ${scale} transition-all">
            ${icon}
          </div>
        `;
      }
    }
  }

  function toggleFaq(id: string) {
    const content = document.getElementById(id);
    const icon = document.getElementById(id.replace("faq-", "faq-icon-"));
    if (content && icon) {
      if (content.classList.contains("hidden")) {
        content.classList.remove("hidden");
        icon.style.transform = "rotate(180deg)";
      } else {
        content.classList.add("hidden");
        icon.style.transform = "rotate(0deg)";
      }
    }
  }

  function loadAppData() {
    const triggerText = document.getElementById("activeClassName");
    if (triggerText) triggerText.innerText = activeCategory || "All Classes";

    fb.onValue(fb.ref(db, "subjects"), (snapshot) => {
      allSubjectsCached = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnap) => {
          allSubjectsCached.push({ id: childSnap.key, ...childSnap.val() });
        });
      }
      renderTests();
      renderNotes();
      renderLive();
    });

    fb.onValue(fb.ref(db, "categories"), (snapshot) => {
      allCategoriesCached = [];
      snapshot.forEach((childSnap) => {
        allCategoriesCached.push({ id: childSnap.key, ...childSnap.val() });
      });
      renderCategoryFilters();
    });

    fb.onValue(fb.ref(db, "payment_requests"), (snapshot) => {
      pendingPurchases.clear();
      snapshot.forEach((childSnap) => {
        const req = childSnap.val();
        if (currentUser && req.userId === currentUser.uid && req.status === "Pending") {
          pendingPurchases.add(req.courseId);
        }
      });
      refreshUI();
    });

    fb.onValue(fb.ref(db, "upcoming_courses"), (snapshot) => {
      allUpcomingCached = [];
      snapshot.forEach((childSnap) => {
        allUpcomingCached.push({ id: childSnap.key, ...childSnap.val() });
      });
      renderUpcoming();
    });

    fb.onValue(fb.ref(db, "timetables"), (snapshot) => {
      allTimetablesCached = [];
      snapshot.forEach((childSnap) => {
        allTimetablesCached.push({ id: childSnap.key, ...childSnap.val() });
      });
      renderTimetables();
    });

    fb.onValue(fb.ref(db, "toppers"), (snapshot) => {
      allToppersCached = [];
      snapshot.forEach((childSnap) => {
        allToppersCached.push({ id: childSnap.key, ...childSnap.val() });
      });
      renderToppers();
    });

    fb.onValue(fb.ref(db, "quiz_leaderboard"), (snapshot) => {
      allQuizLeaderboardCached = [];
      snapshot.forEach((childSnap) => {
        allQuizLeaderboardCached.push({ id: childSnap.key, ...childSnap.val() });
      });
      renderQuizLeaderboard();
    });

    fb.onValue(fb.ref(db, "courses"), (snapshot) => {
      allCoursesCached = [];
      snapshot.forEach((childSnap) => {
        allCoursesCached.push({ id: childSnap.key, ...childSnap.val() });
      });
      coursesLoaded = true;
      renderHomeCourses();
      renderAllCourses();
      renderTests();
      renderNotes();
      renderLive();
    });

    fb.onValue(fb.ref(db, "tests"), (snapshot) => {
      allTestsCached = [];
      snapshot.forEach((childSnap) => {
        allTestsCached.push({ id: childSnap.key, ...childSnap.val() });
      });
      renderTests();
    });

    fb.onValue(fb.ref(db, "live"), (snapshot) => {
      allLiveCached = [];
      snapshot.forEach((childSnap) => {
        allLiveCached.push({ id: childSnap.key, ...childSnap.val() });
      });
      renderLive();
    });

    fb.onValue(fb.ref(db, "notes"), (snapshot) => {
      allNotesCached = [];
      snapshot.forEach((childSnap) => {
        allNotesCached.push({ id: childSnap.key, ...childSnap.val() });
      });
      renderNotes();
    });

    fb.onValue(fb.ref(db, "sliders"), (snapshot) => {
      renderSlider(snapshot);
    });

    fb.onValue(fb.ref(db, "demo"), (snapshot) => {
      renderDemoClasses(snapshot);
    });

    fb.onValue(fb.ref(db, "settings/logo"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() || {};
        if (data.url) {
          const url = data.url;
          const splashImgs = document.querySelectorAll(".splash-logo-img");
          splashImgs.forEach((img: any) => {
            img.src = url;
            img.srcset = "";
          });

          const authLogo = document.getElementById("authLogo");
          if (authLogo) {
            authLogo.innerHTML = `<img src="${url}" class="w-full h-full object-contain rounded-full" />`;
            authLogo.style.background = "transparent";
          }

          const sidebarLogos = document.querySelectorAll(".tanu-logo-circle");
          sidebarLogos.forEach((logo: any) => {
            logo.innerHTML = `<img src="${url}" class="w-full h-full object-contain rounded-full" />`;
            logo.style.background = "transparent";
            logo.style.border = "none";
          });
        }
        if (data.title) {
          document.querySelectorAll(".splash-title").forEach((el: any) => {
            el.innerText = data.title;
          });
        }
        if (data.subtitle) {
          document.querySelectorAll(".splash-subtitle").forEach((el: any) => {
            el.innerText = data.subtitle;
          });
        }
      }
    });

    fb.onValue(fb.ref(db, "settings/notification"), (snapshot) => {
      if (snapshot.exists()) {
        const mText = document.getElementById("marqueeText");
        if (mText) mText.innerText = snapshot.val();
      }
    });

    fb.onValue(fb.ref(db, "settings/social"), (snapshot) => {
      if (snapshot.exists()) {
        const s = snapshot.val();
        const tg = document.getElementById("social-tg") as HTMLAnchorElement | null;
        const wa = document.getElementById("social-wa") as HTMLAnchorElement | null;
        const ig = document.getElementById("social-ig") as HTMLAnchorElement | null;
        const web = document.getElementById("social-web") as HTMLAnchorElement | null;
        if (tg) tg.href = s.telegram || "#";
        if (wa) wa.href = s.whatsapp ? "https://wa.me/" + s.whatsapp : "#";
        if (ig) ig.href = s.instagram || "#";
        if (web) web.href = s.website || "#";
      }
    });

    if (!sessionStorage.getItem("greeted")) {
      setTimeout(
        () => showToast("Welcome back, " + (userData && userData.name ? userData.name : "Student") + "!"),
        2000
      );
      sessionStorage.setItem("greeted", "true");
    }

    const hour = new Date().getHours();
    let greet = "Welcome Back";
    if (hour < 12) greet = "Good Morning";
    else if (hour < 17) greet = "Good Afternoon";
    else greet = "Good Evening";

    const gTime = document.getElementById("greetingTime");
    const uName = document.getElementById("userNameHeader");
    if (gTime) gTime.innerText = greet;
    if (uName && userData && userData.name) uName.innerText = userData.name.split(" ")[0];

    if (userData && userData.name) {
      const initial = userData.name.charAt(0).toUpperCase();
      safeSetText("profileName", userData.name);
      safeSetText("profilePhone", userData.phone || "");
      safeSetText("profileGender", userData.gender || "Not set");
      safeSetText("profileAge", userData.age || "");
      safeSetText("profileEmail", userData.email || "Not provided");
      safeSetText("userAvatar", initial);
      safeSetText("profileAvatar", initial);

      safeSetText("sidebarUserName", userData.name);
      safeSetText("sidebarUserPhone", userData.phone || "");
      safeSetText("sidebarAvatar", initial);
      safeSetText("sidebarCategory", activeCategory || "General");
    }

    setTimeout(() => {
      const splash = document.getElementById("splash");
      if (splash) {
        splash.style.opacity = "0";
        setTimeout(() => {
          splash.style.display = "none";
          safeClassRemove("mainContent", "hidden");
          safeClassRemove("bottomNav", "hidden");
        }, 1000);
      }
    }, 2000);

    initNotificationListener();
  }

  fb.onValue(fb.ref(db, "notifications"), (snapshot) => {
    notificationsSnapshotCached = snapshot;
    renderNotifications(snapshot);
  });

  window.hideNotification = (id: string) => {
    const hiddenNots: string[] = JSON.parse(localStorage.getItem("hidden_notifications") || "[]");
    if (!hiddenNots.includes(id)) {
      hiddenNots.push(id);
      localStorage.setItem("hidden_notifications", JSON.stringify(hiddenNots));
      if (notificationsSnapshotCached) renderNotifications(notificationsSnapshotCached);
    }
  };

  window.clearAllNotifications = () => {
    if (confirm("Dismiss all currently visible notifications?")) {
      const hiddenNots: string[] = JSON.parse(localStorage.getItem("hidden_notifications") || "[]");
      const list = document.querySelectorAll('#notifList button[onclick^="hideNotification"]');
      list.forEach((btn) => {
        const idStr = btn.getAttribute("onclick");
        const match = idStr ? idStr.match(/'([^']+)'/) : null;
        if (match) {
          const id = match[1];
          if (!hiddenNots.includes(id)) hiddenNots.push(id);
        }
      });
      localStorage.setItem("hidden_notifications", JSON.stringify(hiddenNots));
      if (notificationsSnapshotCached) renderNotifications(notificationsSnapshotCached);
    }
  };

  // Expose all global handlers for seamless compatibility
  window.showCategorySelector = showCategorySelector;
  window.hideCategorySelector = hideCategorySelector;
  window.selectCategory = selectCategory;
  window.logout = logout;
  window.logoutFromSetup = logoutFromSetup;
  window.navigateTo = navigateTo;
  window.toggleSidebar = toggleSidebar;
  window.saveProfile = saveProfile;
  window.openEditProfile = openEditProfile;
  window.closeEditProfile = closeEditProfile;
  window.updateProfile = updateProfile;
  window.signInWithGoogle = signInWithGoogle;
  window.signInAsGuest = signInAsGuest;
  window.openCourse = openCourse;
  window.closeCourseDetail = closeCourseDetail;
  window.toggleCourseFullscreen = toggleCourseFullscreen;
  window.playIntro = playIntro;
  window.openLive = openLive;
  window.viewPdf = viewPdf;
  window.closePdf = closePdf;
  window.togglePdfFullscreen = togglePdfFullscreen;
  window.closePayment = closePayment;
  window.submitPayment = submitPayment;
  window.openSupport = openSupport;
  window.closeSupport = closeSupport;
  window.saveSupportSettings = saveSupportSettings;
  window.forceOnline = forceOnline;
  window.handleCourseFilter = handleCourseFilter;
  window.handleSliderAction = handleSliderAction;
  window.switchLiveTab = switchLiveTab;
  window.openDemo = openDemo;
  window.playDemoVideo = playDemoVideo;
  window.renderTimetables = renderTimetables;
  window.setTestTab = setTestTab;
  window.renderTests = renderTests;
  window.openPurchaseModal = openPurchaseModal;
  window.handleLockedItemClick = handleLockedItemClick;
  window.renderLive = renderLive;
  window.renderNotes = renderNotes;
  window.renderMyCourses = renderMyCourses;
  window.loadUsersInAdmin = loadUsersInAdmin;
  window.deleteStudent = deleteStudent;
  window.clearAllStudents = clearAllStudents;
  window.openSocialLinks = openSocialLinks;
  window.closeSocialPopup = closeSocialPopup;
  window.triggerConfetti = triggerConfetti;
  window.showToast = showToast;
  window.startQuiz = startQuiz;
  window.nextQuestion = nextQuestion;
  window.closeResults = closeResults;
  window.selectOption = selectOption;
  window.showReviewInResults = showReviewInResults;
  window.closeReviewView = closeReviewView;
  window.confirmExitQuiz = confirmExitQuiz;
  window.shareResults = shareResults;
  window.shareCourse = shareCourse;
  window.broadcastNotification = broadcastNotification;
  window.requestNotificationPermission = requestNotificationPermission;
  window.initNotificationListener = initNotificationListener;
  window.updateNotificationBtnState = updateNotificationBtnState;
  window.openQuoteModal = openQuoteModal;
  window.closeQuoteModal = closeQuoteModal;
  window.openFocusTimer = openFocusTimer;
  window.closeFocusTimer = closeFocusTimer;
  window.setTimerDuration = setTimerDuration;
  window.startFocusTimer = startFocusTimer;
  window.pauseFocusTimer = pauseFocusTimer;
  window.resetFocusTimer = resetFocusTimer;
  window.getApiUrl = getApiUrl;
  window.closeCashfreeModal = closeCashfreeModal;
  window.showCashfreeModal = showCashfreeModal;
  window.ensureCashfreeSDK = ensureCashfreeSDK;
  window.initiateCashfreePayment = initiateCashfreePayment;
  window.verifyCashfreeOrderBackend = verifyCashfreeOrderBackend;
  window.checkPendingPaymentReturn = checkPendingPaymentReturn;
  window.toggleNotifications = toggleNotifications;
  window.openAppGuide = openAppGuide;
  window.closeAppGuide = closeAppGuide;
  window.guideNext = guideNext;
  window.guidePrev = guidePrev;
  window.updatePerformanceUI = updatePerformanceUI;
  window.toggleFaq = toggleFaq;
  window.toggleDarkMode = toggleDarkMode;

  // Initial Boot Sequence
  initTheme();
  updatePerformanceUI();
  updateDailyStreak();

  setTimeout(() => {
    const triggerText = document.getElementById("activeClassName");
    if (triggerText) triggerText.innerText = activeCategory || "All Classes";
  }, 100);

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("logout")) {
    localStorage.clear();
    sessionStorage.clear();
    fb.signOut(auth).catch(() => {});
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  try {
    loadAppData();
    initNotificationListener();
    checkPendingPaymentReturn();
  } catch (e) {
    console.warn("Initial loadAppData error:", e);
  }

  fb.onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      checkUserProfile();
    } else {
      showAuth();
    }
  });

  // Fail-safe for splash screen - always hide after 8 seconds max
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash && splash.style.display !== "none") {
      splash.style.display = "none";
      if (currentUser) {
        safeClassRemove("mainContent", "hidden");
        safeClassRemove("bottomNav", "hidden");
        loadAppData();
      } else {
        showAuth();
      }
    }
  }, 8000);
}
