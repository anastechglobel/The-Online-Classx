const n = {url: "a", title: "b"};
const hasAccess = true;
const html = `
<div onclick="${hasAccess ? `viewPdf('${n.url}', '${n.title}')` : 'showToast(\'Unlock Course to View PDF\')'}" class="...">
`;
