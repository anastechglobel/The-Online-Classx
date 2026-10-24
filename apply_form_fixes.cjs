const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');

// 1. Replace liveModal HTML
const liveModalOld = `<div id="liveModal" class="bg-white text-slate-900 w-full rounded-[32px] shadow-2xl border border-slate-100 overflow-y-auto relative flex flex-col max-h-[90vh] transition-all my-auto hidden p-6 md:p-8 max-w-2xl">
            <h2 class="text-xl font-bold mb-6">Schedule Live Class</h2>
            <div class="grid gap-4">
                <input type="text" id="lTitle" placeholder="Live Title">
                <textarea id="lDesc" placeholder="Class Description" class="bg-white border border-slate-200 text-slate-900 h-24"></textarea>
                <div class="grid grid-cols-2 gap-4">
                    <select id="lCourse" placeholder="Select Course"></select>
                    <select id="lCat"></select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <select id="lType"><option value="Free">Free</option><option value="Paid">Paid (Course Students Only)</option></select>
                    <select id="lMode"><option value="In-App">In-App Player (YouTube Player)</option><option value="Direct">YouTube App (Deep Link)</option></select>
                </div>
                <input type="text" id="lDirect" placeholder="Direct YouTube URL (Deep Link)">
                <input type="text" id="lEmbed" placeholder="YouTube Embed URL (e.g. youtube.com/embed/...)">
                <input type="text" id="lThumb" placeholder="Thumbnail URL (Optional)">
                <div class="grid grid-cols-1 gap-4">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mb-2 ml-1">Live Start Time (Optional)</label>
                    <input type="datetime-local" id="lTime" class="bg-white border border-slate-200 text-slate-900 w-full">
                </div>
                <div class="flex gap-4 mt-4">
                    <button onclick="saveLive()" class="btn-primary flex-1">Schedule Now</button>
                    <button onclick="closeModal()" class="bg-gray-700 px-6 rounded-lg font-bold">Cancel</button>
                </div>
            </div>
        </div>`;

const liveModalNew = `<div id="liveModal" class="bg-white text-slate-900 w-full rounded-[32px] shadow-2xl border border-slate-100 overflow-y-auto relative flex flex-col max-h-[90vh] transition-all my-auto hidden p-6 md:p-8 max-w-2xl">
            <h2 class="text-xl font-bold mb-6">Schedule Live Class</h2>
            <div class="grid gap-4">
                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Class Title</label>
                    <input type="text" id="lTitle" placeholder="Live Class Title">
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Description</label>
                    <textarea id="lDesc" placeholder="Class Description" class="bg-white border border-slate-200 text-slate-900 h-24"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Linked Course</label>
                        <select id="lCourse" class="bg-white border border-slate-200 text-slate-900 w-full"></select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Category</label>
                        <select id="lCat" class="bg-white border border-slate-200 text-slate-900 w-full"></select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Class Fee (Free / Paid)</label>
                        <select id="lType" class="bg-white border border-slate-200 text-slate-900 w-full">
                            <option value="Free">Free Class (All Students)</option>
                            <option value="Paid">Paid Class (Enrolled Course Students Only)</option>
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Streaming Mode</label>
                        <select id="lMode" class="bg-white border border-slate-200 text-slate-900 w-full">
                            <option value="In-App">In-App Player (YouTube Player)</option>
                            <option value="Direct">YouTube App (Deep Link)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Direct YouTube Link</label>
                    <input type="text" id="lDirect" placeholder="Direct YouTube URL (Deep Link)">
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">YouTube Embed URL</label>
                    <input type="text" id="lEmbed" placeholder="YouTube Embed URL (e.g. youtube.com/embed/...)">
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Thumbnail URL</label>
                    <input type="text" id="lThumb" placeholder="Thumbnail URL (Optional)">
                </div>
                <div class="grid grid-cols-1 gap-4">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mb-2 ml-1">Live Start Time (Optional)</label>
                    <input type="datetime-local" id="lTime" class="bg-white border border-slate-200 text-slate-900 w-full">
                </div>
                <div class="flex gap-4 mt-4">
                    <button onclick="saveLive()" class="btn-primary flex-1">Schedule Now</button>
                    <button onclick="closeModal()" class="bg-gray-700 px-6 rounded-lg font-bold text-white">Cancel</button>
                </div>
            </div>
        </div>`;

if (html.includes('id="liveModal"')) {
    html = html.replace(/<div id="liveModal"[\s\S]*?<\/div>\s*<\/div>\s*<div id="sliderModal"/, liveModalNew + '\n\n        <div id="sliderModal"');
}

// 2. Replace testModal HTML
const testModalOld = `<div id="testModal" class="bg-white text-slate-900 w-full rounded-[32px] shadow-2xl border border-slate-100 overflow-y-auto relative flex flex-col max-h-[90vh] transition-all my-auto hidden p-6 md:p-8 max-w-2xl">
            <h2 class="text-xl font-bold mb-6">Create Test</h2>
            <div class="grid gap-4">
                <input type="text" id="tTitle" placeholder="Test Title">
                <textarea id="tDesc" placeholder="Test Description (Series Details)" class="bg-white border border-slate-200 text-slate-900 h-24"></textarea>
                <div class="grid grid-cols-2 gap-4">
                    <select id="tCourse"></select>
                    <select id="tCat"></select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Test Type</label>
                        <select id="tType">
                            <option value="Objective">Objective (MCQ)</option>
                            <option value="Subjective">Subjective (Theory)</option>
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Time per Q (sec)</label>
                        <input type="number" id="tTime" placeholder="Seconds per question" value="15">
                    </div>
                </div>
                <div class="flex gap-4 mt-4">
                    <button onclick="saveTest()" class="btn-primary flex-1">Create Test</button>
                    <button onclick="closeModal()" class="bg-gray-700 px-6 rounded-lg font-bold text-white">Cancel</button>
                </div>
            </div>
        </div>`;

const testModalNew = `<div id="testModal" class="bg-white text-slate-900 w-full rounded-[32px] shadow-2xl border border-slate-100 overflow-y-auto relative flex flex-col max-h-[90vh] transition-all my-auto hidden p-6 md:p-8 max-w-2xl">
            <h2 class="text-xl font-bold mb-6">Create Test</h2>
            <div class="grid gap-4">
                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Test Title</label>
                    <input type="text" id="tTitle" placeholder="Test Title">
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Description</label>
                    <textarea id="tDesc" placeholder="Test Description (Series Details)" class="bg-white border border-slate-200 text-slate-900 h-24"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Linked Course</label>
                        <select id="tCourse" class="bg-white border border-slate-200 text-slate-900 w-full"></select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Category</label>
                        <select id="tCat" class="bg-white border border-slate-200 text-slate-900 w-full"></select>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Fee / Access</label>
                        <select id="tAccess" class="bg-white border border-slate-200 text-slate-900 w-full">
                            <option value="Free">Free Test (All Students)</option>
                            <option value="Paid">Paid Test Series (Course Enrolled)</option>
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Test Type</label>
                        <select id="tType" class="bg-white border border-slate-200 text-slate-900 w-full">
                            <option value="Objective">Objective (MCQ)</option>
                            <option value="Subjective">Subjective (Theory)</option>
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Time per Q (sec)</label>
                        <input type="number" id="tTime" placeholder="Seconds per question" value="15" class="bg-white border border-slate-200 text-slate-900 w-full">
                    </div>
                </div>
                <div class="flex gap-4 mt-4">
                    <button onclick="saveTest()" class="btn-primary flex-1">Create Test</button>
                    <button onclick="closeModal()" class="bg-gray-700 px-6 rounded-lg font-bold text-white">Cancel</button>
                </div>
            </div>
        </div>`;

if (html.includes('id="testModal"')) {
    html = html.replace(/<div id="testModal"[\s\S]*?<\/div>\s*<\/div>\s*<div id="questionModal"/, testModalNew + '\n\n        <div id="questionModal"');
}

// 3. Replace upcomingModal HTML
const upcomingModalNew = `<div id="upcomingModal" class="bg-white text-slate-900 w-full rounded-[32px] shadow-2xl border border-slate-100 overflow-y-auto relative flex flex-col max-h-[90vh] transition-all my-auto hidden p-6 md:p-8 max-w-3xl">
            <h2 class="text-xl font-bold mb-6">Add Upcoming Course</h2>
            <div class="grid gap-4">
                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Course Title</label>
                    <input type="text" id="uTitle" placeholder="Course Title">
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Description</label>
                    <textarea id="uDesc" placeholder="Brief Description" class="bg-white border border-slate-200 text-slate-900 h-24"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Category</label>
                        <select id="uCat" class="bg-white border border-slate-200 text-slate-900 w-full"></select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Launch Date Text</label>
                        <input type="text" id="uDate" placeholder="Launch Date Text (e.g. 15th Aug)">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Price (INR)</label>
                        <input type="number" id="uPrice" placeholder="Price (INR)">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Instructor Name</label>
                        <input type="text" id="uInstructor" placeholder="Instructor Name">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Countdown Date/Time</label>
                        <input type="datetime-local" id="uLaunchTime" placeholder="Countdown Date/Time">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Publish Status</label>
                        <select id="uStatus" class="bg-white border border-slate-200 text-slate-900 w-full">
                            <option value="published">Published (Visible to Students)</option>
                            <option value="unpublished">Unpublished (Hidden / Draft)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Thumbnail Image URL</label>
                    <input type="text" id="uThumb" placeholder="Thumbnail URL">
                </div>
                <div class="flex gap-4 mt-4">
                    <button onclick="saveUpcoming()" class="btn-primary flex-1">Add Course</button>
                    <button onclick="closeModal()" class="bg-gray-700 px-6 rounded-lg font-bold text-white">Cancel</button>
                </div>
            </div>
        </div>`;

if (html.includes('id="upcomingModal"')) {
    html = html.replace(/<div id="upcomingModal"[\s\S]*?<\/div>\s*<\/div>\s*<div id="noteModal"/, upcomingModalNew + '\n\n        <div id="noteModal"');
}

// 4. Replace sliderModal HTML
const sliderModalNew = `<div id="sliderModal" class="bg-white text-slate-900 w-full rounded-[32px] shadow-2xl border border-slate-100 overflow-y-auto relative flex flex-col max-h-[90vh] transition-all my-auto hidden p-6 md:p-8 max-w-2xl">
            <h2 class="text-xl font-bold mb-6">Home Slider Banner</h2>
            <div class="grid gap-4">
                <div>
                    <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Banner Image URL</label>
                    <input type="text" id="sUrl" placeholder="https://example.com/banner.jpg">
                </div>
                <div class="grid grid-cols-1 gap-1">
                    <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Banner Click Action</label>
                    <select id="sAction" onchange="toggleSliderTarget()">
                        <option value="none">No Action (Image Only)</option>
                        <option value="course">Open Course</option>
                        <option value="note">Open PDF Note</option>
                        <option value="test">Open Test Series</option>
                        <option value="youtube">External YouTube Link</option>
                    </select>
                </div>
                <div id="sTargetContainer" class="hidden space-y-1">
                    <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Target Content</label>
                    <select id="sTargetSelect" class="bg-white border border-slate-200 text-slate-900 w-full"></select>
                    <input type="text" id="sTargetInput" placeholder="Enter URL or ID" class="bg-white border border-slate-200 text-slate-900 w-full hidden">
                </div>
                <div class="flex gap-4 mt-4">
                    <button onclick="saveSlider()" class="btn-primary flex-1">Save Banner</button>
                    <button onclick="closeModal()" class="bg-gray-700 px-6 rounded-lg font-bold text-white">Cancel</button>
                </div>
            </div>
        </div>`;

if (html.includes('id="sliderModal"')) {
    html = html.replace(/<div id="sliderModal"[\s\S]*?<\/div>\s*<\/div>\s*<div id="staffModal"/, sliderModalNew + '\n\n        <div id="staffModal"');
}

fs.writeFileSync('admin.html', html);
console.log("HTML replaced successfully!");
