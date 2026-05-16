// ─── SHARED APP UTILITIES ───

SH.repoUrl = 'https://github.com/Bvs2006/StudentCollab';
SH.contributeUrl = `${SH.repoUrl}/issues`;
SH.demoUrl = 'https://bvs2006.github.io/StudentCollab/';
SH.githubRepo = 'Bvs2006/StudentCollab';

// Resolve a GitHub repository URL to a likely demo/homepage URL.
SH.parseGitHubRepo = (url) => {
  if (!url) return null;
  try {
    const u = url.trim();
    const m = u.match(/github\.com\/(?:.+?@)?([^\/\s]+)\/([^\/\s]+)(?:\/|$)/i);
    if (!m) return null;
    const owner = m[1].replace('.git','');
    const repo = m[2].replace(/\.git$/,'');
    return { owner, repo };
  } catch (e) { return null; }
};

// Supabase REST settings (uses publishable anon key)
SH.SUPABASE_URL = 'https://wyccxmgkhahtcwkqhair.supabase.co';
SH.SUPABASE_KEY = 'sb_publishable_aVE9k66o2XOtBl3p1VM30w_a8QDO9JB';

// Simple Supabase REST helpers (fallbacks to localStorage on failure)
SH.supabaseHeaders = () => ({
  'apikey': SH.SUPABASE_KEY,
  'Authorization': `Bearer ${SH.SUPABASE_KEY}`,
  'Content-Type': 'application/json'
});

SH.fetchProjectsFromSupabase = async () => {
  try {
    const url = `${SH.SUPABASE_URL}/rest/v1/projects?select=*&order=created.desc`;
    const res = await fetch(url, { headers: SH.supabaseHeaders() });
    if (!res.ok) throw new Error('Supabase fetch failed');
    const data = await res.json();
    // Normalize rows to app format if needed
    SH.projects = data.map(d => ({
      id: d.id,
      title: d.title,
      desc: d.desc,
      tags: d.tags || [],
      status: d.status || 'open',
      members: d.members || [],
      likes: d.likes || 0,
      owner: d.owner || d.owner_name || 'Unknown',
      created: d.created || d.created_at || 'Some time',
      lookingFor: d.looking_for || d.lookingFor || [],
      details: d.details || d.desc,
      repoUrl: d.repo_url || d.repoUrl || null,
      contributeUrl: d.contribute_url || d.contributeUrl || SH.contributeUrl,
      demoUrl: d.demo_url || d.demoUrl || null
    }));
    // cache locally
    localStorage.setItem('sh_projects', JSON.stringify(SH.projects));
    return SH.projects;
  } catch (e) {
    console.warn('Supabase projects load failed, using local cache', e);
    const raw = localStorage.getItem('sh_projects');
    SH.projects = raw ? JSON.parse(raw) : (SH.projects || []);
    return SH.projects;
  }
};

SH.saveProjectToSupabase = async (project) => {
  try {
    const url = `${SH.SUPABASE_URL}/rest/v1/projects`;
    // Map fields to snake_case columns if your table uses them
    const payload = {
      title: project.title,
      desc: project.desc,
      details: project.details,
      tags: project.tags,
      status: project.status,
      members: project.members,
      likes: project.likes,
      owner: project.owner,
      created: project.created,
      looking_for: project.lookingFor || project.looking_for,
      repo_url: project.repoUrl || null,
      contribute_url: project.contributeUrl || null,
      demo_url: project.demoUrl || null
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: SH.supabaseHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Supabase insert failed');
    const resp = await res.json();
    // Supabase returns an array of inserted rows
    const row = Array.isArray(resp) ? resp[0] : resp;
    return row;
  } catch (e) {
    console.warn('Supabase save failed, saving locally', e);
    // assign an id and save locally
    project.id = project.id || Date.now();
    const cur = JSON.parse(localStorage.getItem('sh_projects') || '[]');
    cur.unshift(project);
    localStorage.setItem('sh_projects', JSON.stringify(cur));
    return project;
  }
};

SH.fetchIdeasFromSupabase = async () => {
  try {
    const url = `${SH.SUPABASE_URL}/rest/v1/ideas?select=*&order=created.desc`;
    const res = await fetch(url, { headers: SH.supabaseHeaders() });
    if (!res.ok) throw new Error('Supabase ideas fetch failed');
    const data = await res.json();
    SH.ideas = data.map(d => ({
      id: d.id,
      title: d.title,
      desc: d.desc,
      tags: d.tags || [],
      votes: d.votes || 0,
      author: d.author || 'Unknown',
      time: d.time || d.created || 'Just now',
      comments: d.comments || 0,
      linkedin: d.linkedin || d.linkedin_url || '',
      voted: false
    }));
    localStorage.setItem('sh_ideas', JSON.stringify(SH.ideas));
    return SH.ideas;
  } catch (e) {
    console.warn('Supabase ideas load failed, using local cache', e);
    const raw = localStorage.getItem('sh_ideas');
    SH.ideas = raw ? JSON.parse(raw) : (SH.ideas || []);
    return SH.ideas;
  }
};

SH.saveIdeaToSupabase = async (idea) => {
  try {
    const url = `${SH.SUPABASE_URL}/rest/v1/ideas`;
    const payload = {
      title: idea.title,
      desc: idea.desc,
      tags: idea.tags,
      votes: idea.votes,
      author: idea.author,
      time: idea.time,
      comments: idea.comments,
      linkedin: idea.linkedin || '',
      created: idea.time
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: SH.supabaseHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Supabase idea insert failed');
    const resp = await res.json();
    const row = Array.isArray(resp) ? resp[0] : resp;
    return row;
  } catch (e) {
    console.warn('Supabase idea save failed, saving locally', e);
    idea.id = idea.id || Date.now();
    const cur = JSON.parse(localStorage.getItem('sh_ideas') || '[]');
    cur.unshift(idea);
    localStorage.setItem('sh_ideas', JSON.stringify(cur));
    return idea;
  }
};

SH.persistIdeasCache = () => {
  try {
    localStorage.setItem('sh_ideas', JSON.stringify(SH.ideas || []));
  } catch (e) {
    console.warn('Failed to persist ideas cache', e);
  }
};

SH.repoIssuesUrl = (repoUrl) => {
  const parsed = SH.parseGitHubRepo(repoUrl);
  if (!parsed) return null;
  return `https://github.com/${parsed.owner}/${parsed.repo}/issues`;
};

SH.fetchRepoApi = async (owner, repo) => {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!res.ok) throw new Error('repo fetch failed');
  return res.json();
};

SH.fetchPackageJsonHomepage = async (owner, repo) => {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`);
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.content) return null;
  try {
    const decoded = atob(json.content.replace(/\n/g, ''));
    const pj = JSON.parse(decoded);
    return pj.homepage || null;
  } catch (e) { return null; }
};

SH.testUrlExists = async (url) => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (e) { return false; }
};

SH.resolveRepoDemoUrl = async (repoUrl) => {
  const parsed = SH.parseGitHubRepo(repoUrl);
  if (!parsed) return null;
  const { owner, repo } = parsed;
  try {
    const repoInfo = await SH.fetchRepoApi(owner, repo);
    if (repoInfo && repoInfo.homepage) return repoInfo.homepage;
  } catch (e) { /* ignore */ }
  // try package.json
  try {
    const homepage = await SH.fetchPackageJsonHomepage(owner, repo);
    if (homepage) return homepage;
  } catch (e) { /* ignore */ }
  // try GitHub Pages default
  const pages = `https://${owner}.github.io/${repo}/`;
  if (await SH.testUrlExists(pages)) return pages;
  // fallback: repo html url
  return `https://github.com/${owner}/${repo}`;
};

// Enrich a project object with `demoUrl` if a GitHub repo link is provided.
SH.enrichProjectWithDemo = async (project) => {
  if (!project || project.demoUrl) return project;
  const repoCandidates = [project.repoUrl, project.github, project.contributeUrl].filter(Boolean);
  for (const r of repoCandidates) {
    if (!r) continue;
    const parsed = SH.parseGitHubRepo(r);
    if (!parsed) continue;
    const demo = await SH.resolveRepoDemoUrl(r);
    if (demo) { project.demoUrl = demo; return project; }
  }
  return project;
};

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

SH.escapeHtml = (text) => {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Minimal markdown renderer for form preview (bold, italic, links, bullets, line breaks).
SH.renderMarkdownPreview = (text) => {
  let html = SH.escapeHtml(text);
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/(^|\n)-\s+(.*?)(?=\n|$)/g, '$1• $2');
  html = html.replace(/\n/g, '<br/>');
  return html;
};

SH.switchMdTab = (targetId, mode, trigger) => {
  const input = document.getElementById(targetId);
  const preview = document.getElementById(`${targetId}-preview`);
  const wrap = document.getElementById(`${targetId}-editor`);
  if (!input || !preview || !wrap) return;

  const tabs = wrap.querySelectorAll('.md-tab');
  tabs.forEach(t => t.classList.remove('active'));
  if (trigger) trigger.classList.add('active');

  if (mode === 'preview') {
    preview.innerHTML = SH.renderMarkdownPreview(input.value || 'Nothing to preview yet.');
    input.style.display = 'none';
    preview.style.display = 'block';
  } else {
    input.style.display = 'block';
    preview.style.display = 'none';
  }
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
  const contributeUrl = p.repoUrl ? (SH.repoIssuesUrl(p.repoUrl) || p.contributeUrl || SH.contributeUrl) : (p.contributeUrl || SH.contributeUrl);
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
  SH.persistIdeasCache();
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
  const contributeUrl = p.repoUrl ? (SH.repoIssuesUrl(p.repoUrl) || p.contributeUrl || SH.contributeUrl) : (p.contributeUrl || SH.contributeUrl);
  const demoUrl = p.demoUrl || SH.demoUrl;
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
      <button class="btn-submit" onclick="window.open('${contributeUrl}', '_blank', 'noopener,noreferrer');SH.toast('Opened GitHub issues for contribution');SH.closeModal('project-modal')">Contribute on GitHub</button>
      <button class="btn-cancel" onclick="window.open('${demoUrl}', '_blank', 'noopener,noreferrer');SH.toast('Opened demo link');SH.closeModal('project-modal')">View Demo</button>
    </div>
  `;
  SH.openModal('project-modal');
};

// Run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SH.animateCounters();
  SH.renderNavProfile();
  // Fetch live GitHub stats for the repo and show them on the homepage
  SH.fetchGitHubStats = async () => {
    try {
      const repoRes = await fetch(`https://api.github.com/repos/${SH.githubRepo}`);
      if (!repoRes.ok) return;
      const repo = await repoRes.json();
      const starsEl = document.getElementById('gh-stars');
      const forksEl = document.getElementById('gh-forks');
      if (starsEl) starsEl.textContent = repo.stargazers_count?.toLocaleString() || '0';
      if (forksEl) forksEl.textContent = repo.forks_count?.toLocaleString() || '0';

      // Contributors (first 6)
      const contribRes = await fetch(`https://api.github.com/repos/${SH.githubRepo}/contributors?per_page=6`);
      if (!contribRes.ok) return;
      const contribs = await contribRes.json();
      const contribsEl = document.getElementById('gh-contribs');
      if (contribsEl) {
        contribsEl.innerHTML = contribs.slice(0,6).map(c => `<img src="${c.avatar_url}" alt="${c.login}" title="${c.login}" style="width:28px;height:28px;border-radius:99px;border:2px solid var(--surface);">`).join('');
      }
    } catch (e) {
      console.warn('GitHub stats fetch failed', e);
    }
  };
  SH.fetchGitHubStats();
});
