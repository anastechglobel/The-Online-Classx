with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

import re

# 1. Replace isItemFree, checkItemAccess, and insert getCourseIdForItem and handleLockedItemClick
idx = text.find("function isItemFree(")
if idx != -1:
    end_idx = text.find("function renderLive()", idx)
    
    new_helpers = """function isItemFree(item, itemType) {
            if (!item) return true;

            const isExplicitlyFree = (
                item.isFree === true || item.isFree === 'true' ||
                item.type === 'Free' || item.status === 'Free' ||
                item.access === 'Free' || item.accessType === 'Free'
            );

            const isExplicitlyPaid = (
                item.isFree === false || item.isFree === 'false' ||
                item.isPaid === true || item.isPaid === 'true' ||
                item.type === 'Paid' || item.status === 'Paid' ||
                item.access === 'Paid' || item.accessType === 'Paid'
            );

            if (isExplicitlyPaid) return false;
            if (item.price && Number(item.price) > 0) return false;
            if (isExplicitlyFree) return true;

            if (item.courseId) {
                if (typeof allCoursesCached !== 'undefined' && allCoursesCached && allCoursesCached.length > 0) {
                    const course = allCoursesCached.find(c => c.id === item.courseId);
                    if (course) {
                        if (!isItemFree(course, 'course')) return false;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }

            if (itemType && typeof allCoursesCached !== 'undefined' && allCoursesCached && allCoursesCached.length > 0) {
                for (let c of allCoursesCached) {
                    let isLinked = false;
                    if (itemType === 'test' && (c.linkedTestId === item.id || (c.linkedTestIds && c.linkedTestIds.includes(item.id)))) isLinked = true;
                    if (itemType === 'note' && (c.linkedNoteId === item.id || (c.linkedNoteIds && c.linkedNoteIds.includes(item.id)))) isLinked = true;
                    if (itemType === 'live' && (c.linkedLiveId === item.id || (c.linkedLiveIds && c.linkedLiveIds.includes(item.id)))) isLinked = true;

                    if (isLinked) {
                        if (!isItemFree(c, 'course')) return false;
                    }
                }
            }

            return true;
        }

        function checkItemAccess(item, itemType) {
            if (!item) return false;
            if (isItemFree(item, itemType)) return true;

            if (!userData || !userData.purchased) return false;

            if (userData.purchased[item.id]) return true;
            if (item.courseId && userData.purchased[item.courseId]) return true;

            if (typeof allCoursesCached !== 'undefined' && allCoursesCached) {
                for (let cid of Object.keys(userData.purchased)) {
                    if (!userData.purchased[cid]) continue;
                    const course = allCoursesCached.find(c => c.id === cid);
                    if (course) {
                        if (item.courseId && course.id === item.courseId) return true;
                        if (itemType === 'test') {
                            if (course.linkedTestId === item.id) return true;
                            if (course.linkedTestIds && course.linkedTestIds.includes(item.id)) return true;
                        } else if (itemType === 'note') {
                            if (course.linkedNoteId === item.id) return true;
                            if (course.linkedNoteIds && course.linkedNoteIds.includes(item.id)) return true;
                        } else if (itemType === 'live') {
                            if (course.linkedLiveId === item.id) return true;
                            if (course.linkedLiveIds && course.linkedLiveIds.includes(item.id)) return true;
                        }
                    }
                }
            }

            return false;
        }

        function getCourseIdForItem(item, itemType) {
            if (!item) return null;
            if (item.courseId) return item.courseId;
            if (typeof allCoursesCached !== 'undefined' && allCoursesCached) {
                for (let c of allCoursesCached) {
                    if (itemType === 'test' && (c.linkedTestId === item.id || (c.linkedTestIds && c.linkedTestIds.includes(item.id)))) return c.id;
                    if (itemType === 'note' && (c.linkedNoteId === item.id || (c.linkedNoteIds && c.linkedNoteIds.includes(item.id)))) return c.id;
                    if (itemType === 'live' && (c.linkedLiveId === item.id || (c.linkedLiveIds && c.linkedLiveIds.includes(item.id)))) return c.id;
                }
            }
            return null;
        }

        function handleLockedItemClick(itemId, itemType) {
            let item = null;
            let label = 'content';
            if (itemType === 'note') {
                item = (allNotesCached || []).find(x => x.id === itemId);
                label = 'PDF note';
            } else if (itemType === 'test') {
                item = (allTestsCached || []).find(x => x.id === itemId);
                label = 'test series';
            } else if (itemType === 'live') {
                item = (allLiveCached || []).find(x => x.id === itemId);
                label = 'live class';
            }

            showToast(`Please purchase the linked course to unlock this ${label}`);
            const courseId = getCourseIdForItem(item || { id: itemId }, itemType);
            if (courseId) {
                setTimeout(() => openCourse(courseId, 'Paid'), 600);
            } else if (item && item.price && Number(item.price) > 0) {
                setTimeout(() => openPurchaseModal(itemId, itemType), 600);
            } else {
                setTimeout(() => navigateTo('courses'), 600);
            }
        }
        window.handleLockedItemClick = handleLockedItemClick;

        """
    text = text[:idx] + new_helpers + text[end_idx:]

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated index.html helpers!")
