// ─── SHARED APP UTILITIES ───

SH.repoUrl = 'https://github.com/Bvs2006/StudentCollab';
SH.contributeUrl = `${SH.repoUrl}/issues`;
SH.demoUrl = 'https://bvs2006.github.io/StudentCollab/';

// Counter animation
SH.animateCounters = () => {
  document.querySelectorAll('.stat-n[data-target]').forEach(el => {
    const target = +el.dataset.target;
    let cur = 0;
    const step = target / 50;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.floor(cur).toLocaleString();
      if (cur >= target) clearInterval(timer);
    }, 30);
  });
};

// Toast
SH.toast = (msg) => {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
};

// Modal
SH.openModal = (id) => {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
};
SH.closeModal = (id) => {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
};

// --- Profile persistence (localStorage)
SH.profileKey = 'sh_profile';
SH.saveProfile = (p) => {
  try {
    localStorage.setItem(SH.profileKey, JSON.stringify(p));
    return true;
  } catch (e) { return false; }
};
SH.loadProfile = () => {
  try {
    const raw = localStorage.getItem(SH.profileKey);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};

SH.saveProfileFromForm = () => {
  const name = document.getElementById('p-name')?.value?.trim();
  const role = document.getElementById('p-role')?.value?.trim();
  const skills = (document.getElementById('p-skills')?.value || '').split(',').map(s=>s.trim()).filter(Boolean);
  if (!name) { SH.toast('Please enter your name'); return; }
  const profile = { name, role, skills };
  SH.saveProfile(profile);
  SH.toast('Profile saved');
  SH.closeModal('onboard-modal');
  SH.renderNavProfile();
};

SH.clearProfile = () => { localStorage.removeItem(SH.profileKey); SH.renderNavProfile(); SH.toast('Logged out'); };

SH.renderNavProfile = () => {
  const profile = SH.loadProfile();
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let node = document.getElementById('nav-user');
  if (profile) {
    const initial = (profile.name || 'U').charAt(0).toUpperCase();
    const avatarColor = SH.avatarColors[0];
    const html = `
      <div id="nav-user" style="display:flex;align-items:center;gap:0.6rem;margin-left:1rem">
        <button class="btn-post" style="display:flex;align-items:center;gap:0.6rem;padding:0.3rem 0.6rem" onclick="window.location.href='pages/profile.html'">
          <span class="av" style="width:28px;height:28px;border-radius:99px;background:${avatarColor};font-size:0.85rem">${initial}</span>
          <span style="font-weight:600;font-size:0.9rem;color:var(--text)">${profile.name.split(' ')[0]}</span>
        </button>
        <button class="mini-link-btn outline" onclick="SH.clearProfile()">Logout</button>
      </div>
    `;
    if (!node) {
      // insert before nav-links
      const links = nav.querySelector('.nav-links');
      if (links) links.insertAdjacentHTML('beforebegin', html);
    } else {
      node.outerHTML = html;
    }
  } else {
    if (node) node.remove();
  }
};

// Render project card
SH.renderProjectCard = (p, onclick) => {
  const memberAvatars = p.members.slice(0, 4).map((m, i) => SH.av(m, i)).join('');
  const extra = p.members.length > 4 ? `<span class="av" style="background:var(--surface2);color:var(--text2)">+${p.members.length - 4}</span>` : '';
  const contributeUrl = p.contributeUrl || SH.contributeUrl;
  const demoUrl = p.demoUrl || SH.demoUrl;
  return `
    <div class="project-card" onclick="${onclick || `SH.openProjectDetail(${p.id})`}">
      <div class="pc-top">
        <div class="pc-tags">${p.tags.map(t => `<span class="tag ${SH.getTagClass(t)}">${t}</span>`).join('')}</div>
        ${SH.statusBadge(p.status)}
      </div>
      <div class="pc-title">${p.title}</div>
      <div class="pc-desc">${p.desc}</div>
      <div class="pc-footer">
        <div class="pc-members">${memberAvatars}${extra}</div>
        <div class="pc-meta">
          <span class="pc-likes">❤ <span>${p.likes}</span></span>
          <div class="pc-actions">
            <button class="mini-link-btn" onclick="event.stopPropagation();window.open('${contributeUrl}', '_blank', 'noopener,noreferrer')">Contribute</button>
            <button class="mini-link-btn outline" onclick="event.stopPropagation();window.open('${demoUrl}', '_blank', 'noopener,noreferrer')">Demo</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Render idea item
SH.renderIdeaItem = (idea, compact) => {
  return `
    <div class="idea-item">
      <div class="idea-vote">
        <button class="vote-btn ${idea.voted ? 'voted' : ''}" onclick="SH.voteIdea(${idea.id}, this)">▲</button>
        <span class="vote-count" id="vote-${idea.id}">${idea.votes}</span>
      </div>
      <div class="idea-body">
        <div class="idea-title">${idea.title}</div>
        ${!compact ? `<div class="idea-desc">${idea.desc}</div>` : ''}
        <div class="idea-meta">
          <div class="pc-tags">${idea.tags.map(t => `<span class="tag ${SH.getTagClass(t)}">${t}</span>`).join('')}</div>
          <span class="idea-author">by ${idea.author}</span>
          <span class="idea-time">· ${idea.time}</span>
          <span class="idea-time">· 💬 ${idea.comments}</span>
        </div>
      </div>
      <div class="idea-actions">
        <button class="join-btn" onclick="SH.openContributionLink('${encodeURIComponent(idea.title)}')">Contribute</button>
      </div>
    </div>
  `;
};

// Vote on idea
SH.voteIdea = (id, btn) => {
  const idea = SH.ideas.find(i => i.id === id);
  if (!idea) return;
  idea.voted = !idea.voted;
  idea.votes += idea.voted ? 1 : -1;
  btn.classList.toggle('voted', idea.voted);
  const countEl = document.getElementById(`vote-${id}`);
  if (countEl) countEl.textContent = idea.votes;
};

SH.openContributionLink = (topic) => {
  const url = `${SH.contributeUrl}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  SH.toast('Opened GitHub contribution page');
};

// Project detail modal
SH.openProjectDetail = (id) => {
  const p = SH.projects.find(x => x.id === id);
  if (!p) return;
  let overlay = document.getElementById('project-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'project-modal';
    overlay.innerHTML = `<div class="modal" id="project-modal-inner"></div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) SH.closeModal('project-modal'); });
    document.body.appendChild(overlay);
  }
  const inner = document.getElementById('project-modal-inner');
  inner.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem">
      <div>
        <div class="pc-tags" style="margin-bottom:0.5rem">${p.tags.map(t => `<span class="tag ${SH.getTagClass(t)}">${t}</span>`).join('')} ${SH.statusBadge(p.status)}</div>
        <div class="modal-title" style="margin-bottom:0">${p.title}</div>
        <div style="color:var(--text3);font-size:0.82rem;margin-top:0.25rem">Posted by ${p.owner} · ${p.created}</div>
      </div>
      <button class="btn-cancel" onclick="SH.closeModal('project-modal')" style="flex-shrink:0">✕</button>
    </div>
    <p style="color:var(--text2);font-size:0.9rem;line-height:1.65;margin-bottom:1.25rem">${p.details}</p>
    <div style="margin-bottom:1.25rem">
      <div class="form-label">Looking for</div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">${p.lookingFor.map(r => `<span class="skill-pill">${r}</span>`).join('')}</div>
    </div>
    <div style="margin-bottom:1.5rem">
      <div class="form-label">Team (${p.members.length} members)</div>
      <div style="display:flex;gap:0.4rem">${p.members.map((m,i) => SH.av(m, i)).join('')}</div>
    </div>
    <div class="modal-footer" style="margin-top:0">
      <button class="btn-cancel" onclick="SH.closeModal('project-modal')">Close</button>
      <button class="btn-submit" onclick="window.open('${SH.contributeUrl}', '_blank', 'noopener,noreferrer');SH.toast('Opened GitHub issues for contribution');SH.closeModal('project-modal')">Contribute on GitHub</button>
      <button class="btn-cancel" onclick="window.open('${SH.demoUrl}', '_blank', 'noopener,noreferrer');SH.toast('Opened demo link');SH.closeModal('project-modal')">View Demo</button>
    </div>
  `;
  SH.openModal('project-modal');
};

// Run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SH.animateCounters();
  SH.renderNavProfile();
});
