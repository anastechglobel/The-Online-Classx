with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# Update openLive
live_idx = text.find("function openLive(id)")
if live_idx != -1:
    live_end = text.find("window.openLive = openLive;", live_idx) + len("window.openLive = openLive;")
    new_open_live = """function openLive(id) {
            fb.get(fb.ref(db, 'live/' + id)).then(snap => {
                if(!snap.exists()) return showToast('Live class session not found');
                const l = snap.val();
                l.id = id;
                const isFree = isItemFree(l, 'live');
                const hasAccess = isFree || checkItemAccess(l, 'live');

                if (hasAccess) {
                    if (l.mode === 'In-App') {
                        viewPdf(l.embedUrl || l.youtubeUrl, l.title, true);
                    } else {
                        window.open(l.youtubeUrl || l.embedUrl, '_blank');
                    }
                } else {
                    handleLockedItemClick(id, 'live');
                }
            });
        }
        window.openLive = openLive;"""
    text = text[:live_idx] + new_open_live + text[live_end:]

# Update openCourse declaration to async function openCourse
text = text.replace("function openCourse(id, type)", "async function openCourse(id, type)")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated openLive and openCourse!")
