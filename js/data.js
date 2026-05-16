// ─── SHARED DATA STORE ───
window.SH = window.SH || {};

SH.tags = ['All', 'AI/ML', 'Web Dev', 'Mobile', 'Hardware', 'Health', 'Education', 'Finance', 'Social', 'Green Tech'];

// Seed data removed — start with empty project list for production
SH.projects = [];

// Seed ideas removed — start empty for production
SH.ideas = [];

SH.tagColors = {
  'AI/ML': 'accent', 'Web Dev': 'cyan', 'Mobile': 'green',
  'Hardware': 'yellow', 'Health': 'green', 'Education': 'cyan',
  'Finance': 'yellow', 'Social': 'accent', 'Green Tech': 'green'
};

// Helpers
SH.getTagClass = (t) => ({ 'AI/ML': '', 'Web Dev': 'cyan', 'Mobile': 'green', 'Hardware': 'yellow', 'Health': 'green', 'Education': 'cyan', 'Finance': 'yellow', 'Social': '', 'Green Tech': 'green' }[t] || '');

SH.statusBadge = (s) => {
  const map = { open: ['badge-open', '● Open'], progress: ['badge-progress', '◐ In Progress'], closed: ['badge-closed', '● Closed'] };
  const [cls, label] = map[s] || map.open;
  return `<span class="badge ${cls}">${label}</span>`;
};

SH.avatarColors = ['#7c5cfc','#22d3ee','#34d399','#fbbf24','#f87171','#c084fc'];
SH.av = (letter, i) => `<span class="av" style="background:${SH.avatarColors[i % SH.avatarColors.length]}">${letter}</span>`;
