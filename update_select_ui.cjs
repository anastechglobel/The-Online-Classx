const fs = require('fs');

let adminHtml = fs.readFileSync('admin.html', 'utf8');

// 1. Replace CSS for select to make it large, clear, with SVG arrow icon and prominent focus
const oldSelectCss = `input, select, textarea {             color: #1e293b;            background: #f8fafc;             border: 1px solid #e2e8f0;             padding: 12px 16px;             border-radius: 12px;             outline: none;             width: 100%;            transition: all 0.2s ease;        }`;

const newSelectCss = `input, textarea { 
            color: #1e293b;
            background: #f8fafc; 
            border: 2px solid #e2e8f0; 
            padding: 14px 18px; 
            border-radius: 14px; 
            outline: none; 
            width: 100%;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        select { 
            color: #0f172a;
            background-color: #ffffff; 
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234f46e5' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1.25rem center;
            background-size: 1.25rem;
            border: 2px solid #cbd5e1; 
            padding: 14px 44px 14px 18px; 
            border-radius: 14px; 
            outline: none; 
            width: 100%;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            transition: all 0.2s ease;
            min-height: 52px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        select:focus, select:hover { 
            background-color: #ffffff;
            border-color: #4f46e5; 
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
        }
        select option {
            background-color: #ffffff;
            color: #0f172a;
            font-weight: 600;
            padding: 12px;
        }`;

if (adminHtml.includes(oldSelectCss)) {
    adminHtml = adminHtml.replace(oldSelectCss, newSelectCss);
    console.log("Updated CSS for select and inputs in admin.html");
} else {
    // If exact match isn't found, replace input, select, textarea block
    adminHtml = adminHtml.replace(/input,\s*select,\s*textarea\s*\{[^}]+\}/, newSelectCss);
    console.log("Replaced input, select, textarea with custom select CSS");
}

// 2. Add labels to courseModal selects
adminHtml = adminHtml.replace(
    `<div class="grid grid-cols-2 gap-4">                    <select id="cCat"></select>                    <select id="cTag">`,
    `<div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Category</label>
                        <select id="cCat"></select>
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Course Tag</label>
                        <select id="cTag">`
);

adminHtml = adminHtml.replace(
    `</select>                </div>                <div class="grid grid-cols-2 gap-4">                    <select id="cDifficulty">`,
    `</select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Difficulty Level</label>
                        <select id="cDifficulty">`
);

adminHtml = adminHtml.replace(
    `</select>                    <select id="cType" onchange="togglePrice()">`,
    `</select>
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Access Type (Paid/Free)</label>
                        <select id="cType" onchange="togglePrice()">`
);

adminHtml = adminHtml.replace(
    `</select>                </div>                <div class="grid grid-cols-2 gap-4">                    <input type="text" id="cInstructor"`,
    `</select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Instructor</label>
                        <input type="text" id="cInstructor"`
);

adminHtml = adminHtml.replace(
    `<select id="cyoutubePlayMode">`,
    `<div>
                            <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Playback Mode</label>
                            <select id="cyoutubePlayMode">`
);

adminHtml = adminHtml.replace(
    `<div class="grid grid-cols-2 gap-4">                    <select id="clinkedNoteId">                        <option value="">Link Optional Study Note</option>                    </select>                    <select id="clinkedTestId">                        <option value="">Link Optional Test Series</option>                    </select>                </div>`,
    `<div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Linked Study Note</label>
                        <select id="clinkedNoteId">
                            <option value="">Link Optional Study Note</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Linked Test Series</label>
                        <select id="clinkedTestId">
                            <option value="">Link Optional Test Series</option>
                        </select>
                    </div>
                </div>`
);

// 3. Add labels to liveModal selects
adminHtml = adminHtml.replace(
    `<div class="grid grid-cols-2 gap-4">                    <select id="lCourse" placeholder="Select Course"></select>                    <select id="lCat"></select>                </div>                <div class="grid grid-cols-2 gap-4">                    <select id="lType"><option value="Free">Free</option><option value="Paid">Paid (Course Students Only)</option></select>                    <select id="lMode"><option value="In-App">In-App Player (YouTube Player)</option><option value="Direct">YouTube App (Deep Link)</option></select>                </div>`,
    `<div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Target Course</label>
                        <select id="lCourse" placeholder="Select Course"></select>
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Category</label>
                        <select id="lCat"></select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Access Type</label>
                        <select id="lType"><option value="Free">Free Access</option><option value="Paid">Paid (Course Students Only)</option></select>
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Playback Mode</label>
                        <select id="lMode"><option value="In-App">In-App Player (Embedded)</option><option value="Direct">YouTube App (Deep Link)</option></select>
                    </div>
                </div>`
);

// 4. Add labels to noteModal selects
adminHtml = adminHtml.replace(
    `<div class="grid grid-cols-3 gap-4">                    <select id="nCourse"></select>                    <select id="nCat"></select>                    <select id="nType"><option value="Free">Free Access</option><option value="Paid">Paid Access</option></select>                </div>`,
    `<div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Course</label>
                        <select id="nCourse"></select>
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Category</label>
                        <select id="nCat"></select>
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block mb-1">Access Type</label>
                        <select id="nType"><option value="Free">Free Access</option><option value="Paid">Paid Access</option></select>
                    </div>
                </div>`
);

fs.writeFileSync('admin.html', adminHtml);
console.log("Updated select inputs and labels across admin.html");
