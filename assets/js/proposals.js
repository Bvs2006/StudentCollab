// Proposals UI (stores proposals in localStorage under 'SH_proposals')
(function () {
  const KEY = 'SH_proposals_v1';

  const save = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));
  const load = () => JSON.parse(localStorage.getItem(KEY) || '[]');

  const renderList = (filterOwn = false) => {
    const list = load();
    const container = document.getElementById('proposals-list');
    if (!container) return;
    const html = list
      .filter(
        (p) =>
          !filterOwn ||
          p.email === (document.getElementById('p-email')?.value || '')
      )
      .map(
        (p) => `
        <div style="border:1px solid var(--border);padding:0.85rem;border-radius:8px;margin-bottom:0.6rem;background:var(--surface)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:700">${p.title}</div>
            <div style="color:var(--text3);font-size:0.9rem">${
              p.status || 'pending'
            }</div>
          </div>
          <div style="color:var(--text2);margin-top:0.4rem">${p.abstract}</div>
          <div style="margin-top:0.6rem;color:var(--text3);font-size:0.85rem">By ${
            p.name
          } · ${
          p.github
            ? `<a href='https://github.com/${p.github}' target='_blank'>@${p.github}</a>`
            : p.email
        } · ${p.timeline || ''}</div>
        </div>
      `
      )
      .join('');
    container.innerHTML =
      html ||
      `<div class="empty-state"><div class="empty-icon">📭</div><h3>No proposals yet</h3><p>Submit a proposal using the form above.</p></div>`;
  };

  const submit = (e) => {
    e.preventDefault();
    const user = SH.requireAuth('user');
    if (!user) return;
    const name = document.getElementById('p-name').value.trim();
    const email = document.getElementById('p-email').value.trim();
    const github = document
      .getElementById('p-github')
      .value.trim()
      .replace(/^https?:\/\/github.com\//i, '')
      .trim();
    const title = document.getElementById('p-title').value.trim();
    const abstract = document.getElementById('p-abstract').value.trim();
    const timeline = document.getElementById('p-timeline').value.trim();
    const skills = document
      .getElementById('p-skills')
      .value.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!name || !email || !title || !abstract) {
      SH.toast('Please fill required fields');
      return;
    }
    const list = load();
    const id = Date.now();
    const item = {
      id,
      name,
      email,
      github,
      title,
      abstract,
      timeline,
      skills,
      status: 'pending',
      userId: user.id,
      created: new Date().toISOString(),
    };
    list.unshift(item);
    save(list);
    SH.toast('✅ Proposal submitted');
    document.getElementById('proposal-form').reset();
    renderList();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const user = SH.currentUser();
    const profile = SH.loadProfile && SH.loadProfile();
    if (user && user.role === 'user') {
      const nameNode = document.getElementById('p-name');
      const emailNode = document.getElementById('p-email');
      const githubNode = document.getElementById('p-github');
      if (nameNode) nameNode.value = profile?.name || user.name || '';
      if (emailNode) emailNode.value = profile?.email || user.email || '';
      if (githubNode) githubNode.value = profile?.github || user.github || '';
    }
    const form = document.getElementById('proposal-form');
    if (form) form.addEventListener('submit', submit);
    renderList();
  });

  // Expose for admin scripts
  window.SH_proposals = { load, save, renderList };
})();
