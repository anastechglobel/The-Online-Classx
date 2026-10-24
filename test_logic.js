const item = { id: 'test1', status: 'Paid', type: 'Objective' };
const allCoursesCached = [];
const userData = { purchased: {} };

function checkItemAccess(item, itemType) {
    if (item.type === 'Free' || item.status === 'Free') return true;
    let hasPurchased = userData && userData.purchased && (userData.purchased[item.id] || (item.courseId && userData.purchased[item.courseId]));
    if (hasPurchased) return true;
    
    if (userData && userData.purchased && allCoursesCached) {
        for (let cid of Object.keys(userData.purchased)) {
            const course = allCoursesCached.find(c => c.id === cid);
            if (course) {
                if (itemType === 'test') {
                    if (course.linkedTestId === item.id) return true;
                    if (course.linkedTestIds && course.linkedTestIds.includes(item.id)) return true;
                }
            }
        }
    }
    return false;
}
console.log(checkItemAccess(item, 'test'));
