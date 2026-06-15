const issues = [];
const vw = window.innerWidth;
document.querySelectorAll("*").forEach((el) => {
  const rect = el.getBoundingClientRect();
  if (rect.right > vw + 2 && rect.width > 0) {
    const cls =
      el.className && typeof el.className === "string"
        ? el.className.split(" ").slice(0, 5).join(" ")
        : el.tagName;
    issues.push({
      tag: el.tagName,
      cls,
      right: Math.round(rect.right),
      vw,
      overflow: Math.round(rect.right - vw),
    });
  }
});
const unique = [];
const seen = new Set();
for (const i of issues.sort((a, b) => b.overflow - a.overflow)) {
  const key = i.cls;
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(i);
  if (unique.length >= 20) break;
}
JSON.stringify(
  {
    vw,
    scrollWidth: document.documentElement.scrollWidth,
    issues: unique,
  },
  null,
  2,
);
