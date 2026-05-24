// Admin dashboard for reviewing proposals (reads/writes SH_proposals_v1)
(function () {
  const KEY = 'SH_proposals_v1';
  const load = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const save = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));

  const renderOverview = () => {
    const proposals = load();
    const projects = JSON.parse(localStorage.getItem('sh_projects') || '[]');
    const ideas = JSON.parse(localStorage.getItem('sh_ideas') || '[]');
    const users = SH.loadUsers().filter((u) => u.role !== 'admin');
    const metrics = [
      ['Users', users.length],
      ['Projects', projects.length],
      ['Ideas', ideas.length],
      [
        'Pending',
        proposals.filter((p) => (p.status || 'pending') === 'pending').length,
      ],
    ];
    const metricsNode = document.getElementById('admin-metrics');
    if (metricsNode) {
      metricsNode.innerHTML = metrics
        .map(
          ([label, value]) => `
        <div class="admin-metric"><strong>${value}</strong><span>${label}</span></div>
      `
        )
        .join('');
    }
    const usersNode = document.getElementById('admin-users');
    if (usersNode) {
      usersNode.innerHTML = users.length
        ? users
            .map(
              (user) => `
        <div class="joined-project">
          <div class="av" style="background:var(--accent)">${(user.name || 'U')
            .charAt(0)
            .toUpperCase()}</div>
          <div style="flex:1">
            <div class="jp-title">${SH.escapeHtml(user.name || 'Student')}</div>
            <div class="jp-role">${SH.escapeHtml(user.email || '')}${
                user.github ? ` · github.com/${SH.escapeHtml(user.github)}` : ''
              }</div>
          </div>
          <span class="role-badge">${SH.escapeHtml(user.role || 'user')}</span>
        </div>
      `
            )
            .join('')
        : `<div class="empty-state"><div class="empty-icon">.</div><h3>No users yet</h3><p>New student accounts will appear here.</p></div>`;
    }
  };

  const render = () => {
    if (!SH.requireAuth('admin')) return;
    renderOverview();
    const list = load();
    const container = document.getElementById('admin-proposals');
    if (!container) return;
    if (!list.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🗳️</div><h3>No proposals</h3><p>Waiting for submissions.</p></div>`;
      return;
    }
    container.innerHTML = list
      .map(
        (p) => `
      <div style="border:1px solid var(--border);padding:1rem;border-radius:8px;margin-bottom:0.75rem;background:var(--surface)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:800">${p.title}</div>
            <div style="color:var(--text3);font-size:0.85rem">by ${p.name} · ${
          p.email
        } ${
          p.github
            ? `· <a href='https://github.com/${p.github}' target='_blank'>@${p.github}</a>`
            : ''
        }</div>
          </div>
          <div style="display:flex;gap:0.5rem;align-items:center">
            <select data-id="${p.id}" class="status-select">
              <option value="pending" ${
                p.status === 'pending' ? 'selected' : ''
              }>Pending</option>
              <option value="accepted" ${
                p.status === 'accepted' ? 'selected' : ''
              }>Accepted</option>
              <option value="rejected" ${
                p.status === 'rejected' ? 'selected' : ''
              }>Rejected</option>
            </select>
            <button data-id="${
              p.id
            }" class="btn-submit btn-assign">Assign Mentor</button>
          </div>
        </div>
        <div style="color:var(--text2);margin-top:0.6rem">${p.abstract}</div>
        <div style="margin-top:0.6rem;display:flex;gap:0.6rem;align-items:center">
          <input placeholder="Mentor username" data-id="${
            p.id
          }" class="form-input mentor-input" style="max-width:240px" />
          <button data-id="${
            p.id
          }" class="btn-cancel btn-reject">Reject</button>
          <button data-id="${
            p.id
          }" class="btn-submit btn-accept">Accept</button>
        </div>
      </div>
    `
      )
      .join('');

    // wire actions
    container
      .querySelectorAll('.btn-accept')
      .forEach((b) => b.addEventListener('click', accept));
    container
      .querySelectorAll('.btn-reject')
      .forEach((b) => b.addEventListener('click', reject));
    container
      .querySelectorAll('.btn-assign')
      .forEach((b) => b.addEventListener('click', assign));
    container
      .querySelectorAll('.status-select')
      .forEach((s) => s.addEventListener('change', statusChange));
  };

  const statusChange = (e) => {
    const id = e.target.dataset.id;
    const list = load();
    const idx = list.findIndex((x) => x.id == id);
    if (idx === -1) return;
    list[idx].status = e.target.value;
    save(list);
    SH.toast('Status updated');
    render();
  };

  const accept = (e) => {
    const id = e.target.dataset.id;
    const list = load();
    const idx = list.findIndex((x) => x.id == id);
    if (idx === -1) return;
    list[idx].status = 'accepted';
    save(list);
    // create a minimal project
    const p = list[idx];
    try {
      const project = {
        id: Date.now(),
        title: p.title,
        desc: p.abstract,
        tags: p.skills || [],
        status: 'open',
        members: [p.name[0] || 'U'],
        likes: 0,
        owner: p.name,
        ownerEmail: p.email,
        created: 'just now',
        lookingFor: p.skills || [],
        details: p.abstract,
      };
      window.SH.projects.unshift(project);
      const stored = JSON.parse(localStorage.getItem('sh_projects') || '[]');
      stored.unshift(project);
      localStorage.setItem('sh_projects', JSON.stringify(stored));
    } catch (e) {
      console.warn('Unable to persist accepted proposal as project', e);
    }
    SH.toast('✅ Proposal accepted and project created');
    render();
  };

  const reject = (e) => {
    const id = e.target.dataset.id;
    const list = load();
    const idx = list.findIndex((x) => x.id == id);
    if (idx === -1) return;
    list[idx].status = 'rejected';
    save(list);
    SH.toast('Proposal rejected');
    render();
  };

  const assign = (e) => {
    const id = e.target.dataset.id;
    const container = document.querySelector(
      `input.mentor-input[data-id='${id}']`
    );
    if (!container) return;
    const mentor = container.value.trim();
    if (!mentor) {
      SH.toast('Enter mentor username');
      return;
    }
    const list = load();
    const idx = list.findIndex((x) => x.id == id);
    if (idx === -1) return;
    list[idx].mentor = mentor;
    list[idx].status = 'mentored';
    save(list);
    SH.toast('Mentor assigned');
    render();
  };

  document.addEventListener('DOMContentLoaded', () => render());
})();
