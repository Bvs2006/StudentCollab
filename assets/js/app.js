// ─── SHARED APP UTILITIES ───

SH.repoUrl = 'https://github.com/Bvs2006/StudentCollab';
SH.contributeUrl = `${SH.repoUrl}/issues`;
SH.demoUrl = '';
SH.githubRepo = 'Bvs2006/StudentCollab';

// Resolve a GitHub repository URL to a likely demo/homepage URL.
SH.parseGitHubRepo = (url) => {
  if (!url) return null;
  try {
    const u = url.trim();
    const m = u.match(/github\.com\/(?:.+?@)?([^/\s]+)\/([^/\s]+)(?:\/|$)/i);
    if (!m) return null;
    const owner = m[1].replace('.git', '');
    const repo = m[2].replace(/\.git$/, '');
    return { owner, repo };
  } catch (e) {
    return null;
  }
};

// Supabase REST settings (uses publishable anon key)
SH.SUPABASE_URL = 'https://wyccxmgkhahtcwkqhair.supabase.co';
SH.SUPABASE_KEY = 'sb_publishable_aVE9k66o2XOtBl3p1VM30w_a8QDO9JB';

// Simple Supabase REST helpers (fallbacks to localStorage on failure)
SH.supabaseHeaders = () => ({
  apikey: SH.SUPABASE_KEY,
  Authorization: `Bearer ${SH.SUPABASE_KEY}`,
  'Content-Type': 'application/json',
});

SH.fetchWithTimeout = async (url, options = {}, timeoutMs = 3500) => {
  const controller =
    typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller
    ? window.setTimeout(() => controller.abort(), timeoutMs)
    : null;
  try {
    return await fetch(url, {
      ...options,
      signal: controller ? controller.signal : options.signal,
    });
  } finally {
    if (timer) window.clearTimeout(timer);
  }
};

SH.readLocalArray = (key, fallback = []) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : fallback;
  } catch (e) {
    return fallback;
  }
};

SH.fetchProjectsFromSupabase = async () => {
  try {
    const url = `${SH.SUPABASE_URL}/rest/v1/projects?select=*&order=created.desc`;
    const res = await SH.fetchWithTimeout(url, {
      headers: SH.supabaseHeaders(),
    });
    if (!res.ok) throw new Error('Supabase fetch failed');
    const data = await res.json();
    // Normalize rows to app format if needed
    SH.projects = data.map((d) => ({
      id: d.id,
      title: d.title,
      desc: d.desc,
      tags: d.tags || [],
      status: d.status || 'open',
      members: d.members || [],
      likes: d.likes || 0,
      owner: d.owner || d.owner_name || 'Unknown',
      ownerEmail: d.owner_email || d.ownerEmail || '',
      ownerId: d.owner_id || d.ownerId || '',
      created: d.created || d.created_at || 'Some time',
      lookingFor: d.looking_for || d.lookingFor || [],
      details: d.details || d.desc,
      repoUrl: d.repo_url || d.repoUrl || null,
      contributeUrl: d.contribute_url || d.contributeUrl || SH.contributeUrl,
      demoUrl: d.demo_url || d.demoUrl || null,
      difficulty: d.difficulty || d.level || 'Beginner friendly',
      maintainer:
        d.maintainer || d.student_maintainer || d.owner || 'Student maintainer',
      meeting: d.meeting || d.weekly_sync || '',
      contact: d.contact || d.contact_link || d.owner_email || '',
      nextStep: d.next_step || d.nextStep || '',
      orgId: d.org_id || d.orgId || SH.defaultOrgId,
    }));
    // cache locally
    localStorage.setItem('sh_projects', JSON.stringify(SH.projects));
    return SH.projects;
  } catch (e) {
    console.warn('Supabase projects load failed, using local cache', e);
    SH.projects = SH.readLocalArray('sh_projects', SH.projects || []);
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
      owner_email: project.ownerEmail || '',
      owner_id: project.ownerId || '',
      created: project.created,
      looking_for: project.lookingFor || project.looking_for,
      repo_url: project.repoUrl || null,
      contribute_url: project.contributeUrl || null,
      demo_url: project.demoUrl || null,
      org_id: project.orgId || SH.getActiveOrgId(),
    };
    const res = await SH.fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: SH.supabaseHeaders(),
        body: JSON.stringify(payload),
      },
      5000
    );
    if (!res.ok) throw new Error('Supabase insert failed');
    const resp = await res.json();
    // Supabase returns an array of inserted rows
    const row = Array.isArray(resp) ? resp[0] : resp;
    return row;
  } catch (e) {
    console.warn('Supabase save failed, saving locally', e);
    // assign an id and save locally
    project.id = project.id || Date.now();
    const cur = SH.readLocalArray('sh_projects');
    cur.unshift(project);
    localStorage.setItem('sh_projects', JSON.stringify(cur));
    return project;
  }
};

SH.fetchIdeasFromSupabase = async () => {
  try {
    const url = `${SH.SUPABASE_URL}/rest/v1/ideas?select=*&order=created.desc`;
    const res = await SH.fetchWithTimeout(url, {
      headers: SH.supabaseHeaders(),
    });
    if (!res.ok) throw new Error('Supabase ideas fetch failed');
    const data = await res.json();
    SH.ideas = data.map((d) => ({
      id: d.id,
      title: d.title,
      desc: d.desc,
      tags: d.tags || [],
      votes: d.votes || 0,
      author: d.author || 'Unknown',
      authorEmail: d.author_email || d.authorEmail || '',
      authorId: d.author_id || d.authorId || '',
      time: d.time || d.created || 'Just now',
      comments: d.comments || 0,
      linkedin: d.linkedin || d.linkedin_url || '',
      voted: false,
      orgId: d.org_id || d.orgId || SH.defaultOrgId,
    }));
    localStorage.setItem('sh_ideas', JSON.stringify(SH.ideas));
    return SH.ideas;
  } catch (e) {
    console.warn('Supabase ideas load failed, using local cache', e);
    SH.ideas = SH.readLocalArray('sh_ideas', SH.ideas || []);
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
      author_email: idea.authorEmail || '',
      author_id: idea.authorId || '',
      time: idea.time,
      comments: idea.comments,
      linkedin: idea.linkedin || '',
      created: idea.time,
      org_id: idea.orgId || SH.getActiveOrgId(),
    };
    const res = await SH.fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: SH.supabaseHeaders(),
        body: JSON.stringify(payload),
      },
      5000
    );
    if (!res.ok) throw new Error('Supabase idea insert failed');
    const resp = await res.json();
    const row = Array.isArray(resp) ? resp[0] : resp;
    return row;
  } catch (e) {
    console.warn('Supabase idea save failed, saving locally', e);
    idea.id = idea.id || Date.now();
    const cur = SH.readLocalArray('sh_ideas');
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

SH.cleanDemoLocalData = () => {
  const cleanupKey = 'sh_demo_cleanup_v2';
  if (localStorage.getItem(cleanupKey)) return;

  const demoNames = [
    'torusai',
    'torus ai',
    'campusflow',
    'skillbridge',
    'greenroute',
    'git basics: commit, branch, and collaborate',
    'project review clinic',
  ];
  const isDemoRecord = (item) => {
    const haystack = [
      item?.id,
      item?.title,
      item?.name,
      item?.owner,
      item?.author,
      item?.host,
      item?.email,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return demoNames.some((name) => haystack.includes(name));
  };
  const cleanArrayKey = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(value)) return;
      const cleaned = value.filter((item) => !isDemoRecord(item));
      localStorage.setItem(key, JSON.stringify(cleaned));
    } catch (e) {
      console.warn(`Unable to clean ${key}`, e);
    }
  };

  [
    'sh_projects',
    'sh_ideas',
    'sh_learninglab_events',
    'SH_proposals_v1',
  ].forEach(cleanArrayKey);
  localStorage.setItem(cleanupKey, '1');
};

SH.sameOwner = (item, user) => {
  if (!item || !user) return false;
  const userEmail = String(user.email || '').toLowerCase();
  return (
    item.ownerId === user.id ||
    item.authorId === user.id ||
    String(item.ownerEmail || item.authorEmail || '').toLowerCase() ===
      userEmail
  );
};

SH.canManageItem = (item) => {
  const user = SH.currentUser();
  const orgId = item?.orgId || SH.defaultOrgId;
  return SH.canManageOrg(orgId, user) || SH.sameOwner(item, user);
};

SH.deleteProjectFromSupabase = async (id) => {
  try {
    const res = await SH.fetchWithTimeout(
      `${SH.SUPABASE_URL}/rest/v1/projects?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: SH.supabaseHeaders(),
      },
      5000
    );
    if (!res.ok) throw new Error('Supabase project delete failed');
  } catch (e) {
    console.warn('Supabase project delete failed, removing locally', e);
  }
};

SH.deleteIdeaFromSupabase = async (id) => {
  try {
    const res = await SH.fetchWithTimeout(
      `${SH.SUPABASE_URL}/rest/v1/ideas?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: SH.supabaseHeaders(),
      },
      5000
    );
    if (!res.ok) throw new Error('Supabase idea delete failed');
  } catch (e) {
    console.warn('Supabase idea delete failed, removing locally', e);
  }
};

SH.deleteProject = async (id) => {
  const project = (SH.projects || []).find((p) => String(p.id) === String(id));
  if (!project || !SH.canManageItem(project)) {
    SH.toast('Only the owner or an admin can delete this project');
    return;
  }
  if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) {
    return;
  }
  await SH.deleteProjectFromSupabase(id);
  try {
    const deletedIds = JSON.parse(
      localStorage.getItem('sh_deleted_project_ids') || '[]'
    );
    if (!deletedIds.includes(String(id))) deletedIds.push(String(id));
    localStorage.setItem('sh_deleted_project_ids', JSON.stringify(deletedIds));
  } catch (e) {
    console.warn('Unable to remember deleted project id', e);
  }
  const matchesDeletedProject = (p) =>
    String(p.id) === String(id) ||
    (project.title &&
      p.title === project.title &&
      (p.ownerEmail || '') === (project.ownerEmail || '') &&
      (p.ownerId || '') === (project.ownerId || ''));

  SH.projects = (SH.projects || []).filter((p) => !matchesDeletedProject(p));
  localStorage.setItem('sh_projects', JSON.stringify(SH.projects));
  try {
    const cached = JSON.parse(localStorage.getItem('sh_projects') || '[]');
    localStorage.setItem(
      'sh_projects',
      JSON.stringify(cached.filter((p) => !matchesDeletedProject(p)))
    );
    const tasks = JSON.parse(localStorage.getItem(SH.projectTasksKey) || '{}');
    delete tasks[id];
    localStorage.setItem(SH.projectTasksKey, JSON.stringify(tasks));
    const requests = JSON.parse(
      localStorage.getItem(SH.joinRequestsKey) || '[]'
    );
    localStorage.setItem(
      SH.joinRequestsKey,
      JSON.stringify(
        requests.filter((request) => String(request.projectId) !== String(id))
      )
    );
  } catch (e) {
    console.warn('Unable to clean deleted project cache', e);
  }
  SH.closeModal('project-modal');
  window.renderProgramBoard?.();
  window.renderProjects?.();
  window.renderOverview?.();
  SH.toast('Project deleted');
};

SH.deleteIdea = async (id) => {
  const idea = (SH.ideas || []).find((i) => String(i.id) === String(id));
  if (!idea || !SH.canManageItem(idea)) {
    SH.toast('Only the owner or an admin can delete this idea');
    return;
  }
  if (!window.confirm(`Delete "${idea.title}"? This cannot be undone.`)) {
    return;
  }
  await SH.deleteIdeaFromSupabase(id);
  SH.ideas = (SH.ideas || []).filter((i) => String(i.id) !== String(id));
  SH.persistIdeasCache();
  SH.closeModal('idea-detail-modal');
  window.renderIdeas?.();
  window.renderTrending?.();
  SH.toast('Idea deleted');
};

// --- Local role-based auth for the static prototype
SH.authUsersKey = 'sh_auth_users';
SH.authSessionKey = 'sh_auth_session';
SH.orgsKey = 'sh_organizations';
SH.orgRequestsKey = 'sh_org_requests';
SH.orgStudentsKey = 'sh_org_students';
SH.defaultOrgId = 'org-studenthub-default';

SH.defaultOrg = {
  id: SH.defaultOrgId,
  name: 'StudentHub',
  slug: 'studenthub',
  description: 'Default workspace for existing StudentHub content.',
  requesterId: 'admin-default',
  requesterEmail: 'admin@studenthub.local',
  adminUserId: 'admin-default',
  status: 'approved',
  createdAt: '2026-05-24T00:00:00.000Z',
  approvedAt: '2026-05-24T00:00:00.000Z',
};

SH.defaultAdmin = {
  id: 'admin-default',
  name: 'Admin',
  email: 'admin@studenthub.local',
  password: 'admin123',
  role: 'admin',
  orgIds: [SH.defaultOrgId],
  activeOrgId: SH.defaultOrgId,
  github: 'Bvs2006',
  bio: 'StudentHub workspace administrator',
  skills: ['Peer Review', 'Project Operations', 'Open Source'],
  createdAt: '2026-05-24T00:00:00.000Z',
};

SH.loadUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem(SH.authUsersKey) || '[]');
    if (!users.some((u) => u.role === 'admin')) users.unshift(SH.defaultAdmin);
    users.forEach((user) => {
      user.orgIds = Array.isArray(user.orgIds)
        ? user.orgIds
        : [SH.defaultOrgId];
      user.activeOrgId = user.activeOrgId || user.orgIds[0] || SH.defaultOrgId;
    });
    localStorage.setItem(SH.authUsersKey, JSON.stringify(users));
    return users;
  } catch (e) {
    return [SH.defaultAdmin];
  }
};

SH.saveUsers = (users) => {
  localStorage.setItem(SH.authUsersKey, JSON.stringify(users));
};

SH.safeJsonArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (e) {
    return [];
  }
};

SH.slugify = (value) =>
  String(value || 'organization')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'organization';

SH.loadOrganizations = () => {
  const orgs = SH.safeJsonArray(SH.orgsKey);
  if (!orgs.some((org) => org.id === SH.defaultOrgId)) {
    orgs.unshift(SH.defaultOrg);
    localStorage.setItem(SH.orgsKey, JSON.stringify(orgs));
  }
  return orgs;
};

SH.saveOrganizations = (orgs) => {
  localStorage.setItem(SH.orgsKey, JSON.stringify(orgs));
};

SH.loadOrgRequests = () => SH.safeJsonArray(SH.orgRequestsKey);

SH.saveOrgRequests = (requests) => {
  localStorage.setItem(SH.orgRequestsKey, JSON.stringify(requests));
};

SH.getOrganization = (orgId) =>
  SH.loadOrganizations().find((org) => org.id === orgId) || SH.defaultOrg;

SH.getActiveOrgId = () => {
  const user = SH.currentUser && SH.currentUser();
  return user?.activeOrgId || user?.orgIds?.[0] || SH.defaultOrgId;
};

SH.getActiveOrg = () => SH.getOrganization(SH.getActiveOrgId());

SH.setActiveOrg = (orgId) => {
  const user = SH.currentUser();
  if (!user) return null;
  const allowed = user.role === 'admin' || (user.orgIds || []).includes(orgId);
  if (!allowed) return user;
  return SH.updateCurrentUser({ activeOrgId: orgId });
};

SH.isGlobalAdmin = (user = SH.currentUser()) => user?.role === 'admin';

SH.isOrgAdmin = (user = SH.currentUser(), orgId = SH.getActiveOrgId()) =>
  user?.role === 'org_admin' && (user.orgIds || []).includes(orgId);

SH.canManageOrg = (orgId, user = SH.currentUser()) =>
  SH.isGlobalAdmin(user) || SH.isOrgAdmin(user, orgId);

SH.roleLabel = (role) =>
  ({
    user: 'Student',
    org_admin: 'Organisation',
    admin: 'Global Admin',
  }[role] || 'Student');

SH.isOrganisationUser = (user = SH.currentUser()) => user?.role === 'org_admin';

SH.studentFeaturePages = new Set([
  'profile.html',
  'organizations.html',
  'projects.html',
  'proposals.html',
  'ideas.html',
  'dsa.html',
  'interviews.html',
  'learninglab.html',
  'opportunities.html',
  'about.html',
]);

SH.organisationFeaturePages = new Set([
  'admin.html',
  'organizations.html',
  'profile.html',
  'about.html',
]);

SH.enforceRoleFeatureAccess = () => {
  const user = SH.currentUser && SH.currentUser();
  if (!user || user.role === 'admin') return;
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const inPages = window.location.pathname.includes('/pages/');
  if (!inPages || page === 'login.html') return;
  const allowed =
    user.role === 'org_admin'
      ? SH.organisationFeaturePages
      : SH.studentFeaturePages;
  if (allowed.has(page)) return;
  SH.toast(
    user.role === 'org_admin'
      ? 'Organisation accounts use the organisation dashboard.'
      : 'Students can use only student features.'
  );
  window.location.href =
    user.role === 'org_admin' ? SH.adminHref() : SH.profileHref();
};

SH.normalizeEmail = (email) =>
  String(email || '')
    .trim()
    .toLowerCase();

SH.loadOrgStudents = () => SH.safeJsonArray(SH.orgStudentsKey);

SH.saveOrgStudents = (students) => {
  localStorage.setItem(SH.orgStudentsKey, JSON.stringify(students));
};

SH.findOrgStudentByEmail = (email) => {
  const normalized = SH.normalizeEmail(email);
  return SH.loadOrgStudents().find(
    (student) => SH.normalizeEmail(student.email) === normalized
  );
};

SH.addOrgStudent = ({ name, email, rollNo, course, year, orgId }) => {
  const activeOrgId = orgId || SH.getActiveOrgId();
  if (!SH.canManageOrg(activeOrgId)) {
    return {
      ok: false,
      message: 'You can only add students to your organisation.',
    };
  }
  const normalized = SH.normalizeEmail(email);
  if (!normalized || !String(name || '').trim()) {
    return {
      ok: false,
      message: 'Student name and college email are required.',
    };
  }
  if (!normalized.includes('@')) {
    return { ok: false, message: 'Enter a valid college email.' };
  }
  const students = SH.loadOrgStudents();
  const existing = students.find(
    (student) =>
      SH.normalizeEmail(student.email) === normalized &&
      (student.orgId || SH.defaultOrgId) === activeOrgId
  );
  const record = {
    id: existing?.id || `org-student-${Date.now()}`,
    orgId: activeOrgId,
    name: String(name || '').trim(),
    email: normalized,
    rollNo: String(rollNo || '').trim(),
    course: String(course || '').trim(),
    year: String(year || '').trim(),
    status: existing?.status || 'invited',
    userId: existing?.userId || '',
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (existing) {
    const idx = students.findIndex((student) => student.id === existing.id);
    students[idx] = record;
  } else {
    students.unshift(record);
  }
  SH.saveOrgStudents(students);
  return { ok: true, student: record };
};

SH.importOrgStudents = (rows, orgId = SH.getActiveOrgId()) => {
  const results = { added: 0, skipped: 0, errors: [] };
  rows.forEach((row, index) => {
    const result = SH.addOrgStudent({ ...row, orgId });
    if (result.ok) {
      results.added += 1;
    } else {
      results.skipped += 1;
      results.errors.push(`Row ${index + 1}: ${result.message}`);
    }
  });
  return results;
};

SH.linkStudentRecordToUser = (student, user) => {
  if (!student || !user) return;
  const students = SH.loadOrgStudents();
  const idx = students.findIndex((item) => item.id === student.id);
  if (idx === -1) return;
  students[idx] = {
    ...students[idx],
    status: 'active',
    userId: user.id,
    linkedAt: new Date().toISOString(),
  };
  SH.saveOrgStudents(students);
};

SH.withOrgFields = (payload = {}) => ({
  ...payload,
  orgId: payload.orgId || SH.getActiveOrgId(),
});

SH.filterByActiveOrg = (items = []) => {
  const user = SH.currentUser && SH.currentUser();
  if (user?.role === 'admin') return items;
  const activeOrgId = SH.getActiveOrgId();
  return items.filter(
    (item) => (item.orgId || SH.defaultOrgId) === activeOrgId
  );
};

SH.submitOrgRequest = ({ name, description }) => {
  const user = SH.requireAuth();
  if (!user) return { ok: false, message: 'Please login first.' };
  const orgName = String(name || '').trim();
  if (!orgName) return { ok: false, message: 'Organization name is required.' };
  const requests = SH.loadOrgRequests();
  const orgs = SH.loadOrganizations();
  const slug = SH.slugify(orgName);
  const existing = [...requests, ...orgs].find(
    (item) => SH.slugify(item.name) === slug && item.status !== 'rejected'
  );
  if (existing) {
    return {
      ok: false,
      message: 'This organization already exists or is waiting for approval.',
    };
  }
  const request = {
    id: `org-request-${Date.now()}`,
    name: orgName,
    slug,
    description: String(description || '').trim(),
    requesterId: user.id,
    requesterEmail: user.email,
    requesterName: user.name || 'Student',
    adminUserId: '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    approvedAt: '',
  };
  requests.unshift(request);
  SH.saveOrgRequests(requests);
  return { ok: true, request };
};

SH.approveOrgRequest = (requestId) => {
  const requests = SH.loadOrgRequests();
  const idx = requests.findIndex((request) => request.id === requestId);
  if (idx === -1)
    return { ok: false, message: 'Organization request not found.' };
  const request = requests[idx];
  const orgId = `org-${request.slug}-${Date.now()}`;
  const org = {
    id: orgId,
    name: request.name,
    slug: request.slug,
    description: request.description,
    requesterId: request.requesterId,
    requesterEmail: request.requesterEmail,
    adminUserId: request.requesterId,
    status: 'approved',
    createdAt: request.createdAt,
    approvedAt: new Date().toISOString(),
  };
  const orgs = SH.loadOrganizations();
  orgs.unshift(org);
  SH.saveOrganizations(orgs);

  request.status = 'approved';
  request.adminUserId = request.requesterId;
  request.approvedAt = org.approvedAt;
  requests[idx] = request;
  SH.saveOrgRequests(requests);

  const users = SH.loadUsers();
  const userIdx = users.findIndex(
    (user) =>
      user.id === request.requesterId ||
      String(user.email || '').toLowerCase() ===
        String(request.requesterEmail || '').toLowerCase()
  );
  if (userIdx >= 0) {
    users[userIdx] = {
      ...users[userIdx],
      role: 'org_admin',
      orgIds: [orgId],
      activeOrgId: orgId,
    };
    SH.saveUsers(users);
    const session = SH.currentUser();
    if (session?.id === users[userIdx].id) SH.setSession(users[userIdx]);
  }
  return { ok: true, org };
};

SH.rejectOrgRequest = (requestId) => {
  const requests = SH.loadOrgRequests();
  const idx = requests.findIndex((request) => request.id === requestId);
  if (idx === -1)
    return { ok: false, message: 'Organization request not found.' };
  requests[idx].status = 'rejected';
  SH.saveOrgRequests(requests);
  return { ok: true };
};

SH.migrateOrgData = () => {
  SH.loadOrganizations();
  SH.loadUsers();
  const arrayKeys = [
    'sh_projects',
    'sh_ideas',
    'sh_learninglab_events',
    'SH_proposals_v1',
    'sh_dsa_help_requests',
    'sh_alumni_interview_requests',
  ];
  arrayKeys.forEach((key) => {
    const items = SH.safeJsonArray(key);
    let changed = false;
    items.forEach((item) => {
      if (item && !item.orgId) {
        item.orgId = SH.defaultOrgId;
        changed = true;
      }
    });
    if (changed) localStorage.setItem(key, JSON.stringify(items));
  });
};

SH.currentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(SH.authSessionKey) || 'null');
  } catch (e) {
    return null;
  }
};

SH.setSession = (user) => {
  const safe = { ...user };
  delete safe.password;
  localStorage.setItem(SH.authSessionKey, JSON.stringify(safe));
};

SH.login = (email, password, role) => {
  const users = SH.loadUsers();
  const normalized = String(email || '')
    .trim()
    .toLowerCase();
  const user = users.find(
    (u) =>
      String(u.email).toLowerCase() === normalized &&
      u.password === password &&
      (!role || u.role === role || (role === 'user' && u.role === 'org_admin'))
  );
  if (!user)
    return { ok: false, message: 'Invalid login details for this role.' };
  SH.setSession(user);
  return { ok: true, user };
};

SH.registerUser = (payload) => {
  const users = SH.loadUsers();
  const email = SH.normalizeEmail(payload.email);
  if (!email || !payload.password || !payload.name) {
    return { ok: false, message: 'Name, email, and password are required.' };
  }
  if (users.some((u) => String(u.email).toLowerCase() === email)) {
    return { ok: false, message: 'An account already exists for this email.' };
  }
  const hasRoster = SH.loadOrgStudents().length > 0;
  const rosterRecord = SH.findOrgStudentByEmail(email);
  if (hasRoster && !rosterRecord) {
    return {
      ok: false,
      message:
        'This college email is not in an organisation student list yet. Ask your organisation admin to add it.',
    };
  }
  const orgIds = rosterRecord?.orgId ? [rosterRecord.orgId] : [SH.defaultOrgId];
  const user = {
    id: `user-${Date.now()}`,
    name: rosterRecord?.name || payload.name.trim(),
    email,
    password: payload.password,
    role: 'user',
    orgIds,
    activeOrgId: orgIds[0],
    rollNo: rosterRecord?.rollNo || '',
    course: rosterRecord?.course || payload.course || '',
    year: rosterRecord?.year || '',
    github: (payload.github || '')
      .replace(/^https?:\/\/github.com\//i, '')
      .replace(/^@/, '')
      .trim(),
    bio: payload.bio || '',
    skills: payload.skills || [],
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  SH.saveUsers(users);
  SH.setSession(user);
  SH.linkStudentRecordToUser(rosterRecord, user);
  SH.saveProfile({
    name: user.name,
    role: rosterRecord?.course || payload.course || 'Student Builder',
    email: user.email,
    github: user.github,
    bio: user.bio,
    skills: user.skills,
  });
  return { ok: true, user };
};

SH.resetPassword = (email, newPassword) => {
  const normalized = String(email || '')
    .trim()
    .toLowerCase();
  const password = String(newPassword || '').trim();
  if (!normalized || !password) {
    return { ok: false, message: 'Email and new password are required.' };
  }
  if (password.length < 6) {
    return { ok: false, message: 'Password must be at least 6 characters.' };
  }
  const users = SH.loadUsers();
  const idx = users.findIndex(
    (user) => String(user.email || '').toLowerCase() === normalized
  );
  if (idx === -1 || users[idx].role === 'admin') {
    return { ok: false, message: 'No student account found for this email.' };
  }
  users[idx].password = password;
  SH.saveUsers(users);
  return { ok: true, message: 'Password updated. You can login now.' };
};

SH.updateCurrentUser = (updates) => {
  const session = SH.currentUser();
  if (!session) return null;
  const users = SH.loadUsers();
  const idx = users.findIndex(
    (u) =>
      u.id === session.id ||
      String(u.email).toLowerCase() === String(session.email).toLowerCase()
  );
  const updated = { ...(idx >= 0 ? users[idx] : session), ...updates };
  if (idx >= 0) {
    users[idx] = updated;
    SH.saveUsers(users);
  }
  SH.setSession(updated);
  return updated;
};

SH.logout = () => {
  const ok = confirm('Are you sure you want to log out?');
  if (!ok) return;
  localStorage.removeItem(SH.authSessionKey);
  SH.toast('Logged out');
  const loginHref = window.location.pathname.includes('/pages/')
    ? 'login.html'
    : 'pages/login.html';
  window.location.href = loginHref;
};

// Notifications
SH.notificationsKey = 'sh_notifications';
SH.getNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem(SH.notificationsKey) || '[]');
  } catch (e) {
    return [];
  }
};
SH.unreadNotificationsCount = () => {
  const items = SH.getNotifications();
  return items.filter((n) => !n.read).length;
};

SH.loginHref = () =>
  window.location.pathname.includes('/pages/')
    ? 'login.html'
    : 'pages/login.html';
SH.profileHref = () =>
  window.location.pathname.includes('/pages/')
    ? 'profile.html'
    : 'pages/profile.html';
SH.adminHref = () =>
  window.location.pathname.includes('/pages/')
    ? 'admin.html'
    : 'pages/admin.html';
SH.siteHref = (path) => {
  // When running from a page under /pages/, return correct relative paths.
  const inPages = window.location.pathname.includes('/pages/');
  if (inPages) {
    if (path.startsWith('pages/')) return path.replace(/^pages\//, '');
    if (path.startsWith('../')) return path;
    return `../${path}`;
  }
  return path;
};

SH.requireAuth = (role) => {
  const user = SH.currentUser();
  const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];
  const isAllowed =
    !allowedRoles.length ||
    allowedRoles.includes(user?.role) ||
    (allowedRoles.includes('user') && user?.role === 'org_admin');
  if (!user || !isAllowed) {
    SH.toast(
      allowedRoles.includes('admin')
        ? 'Admin login required'
        : 'Please login first'
    );
    const redirect = encodeURIComponent(window.location.href);
    window.location.href = `${SH.loginHref()}?redirect=${redirect}${
      allowedRoles.includes('admin') && !allowedRoles.includes('user')
        ? '&role=admin'
        : ''
    }`;
    return null;
  }
  return user;
};

SH.openProtectedModal = (id, role) => {
  if (!SH.currentUser()) {
    SH.requireAuth(role);
    return;
  }
  SH.openModal(id);
};

SH.repoIssuesUrl = (repoUrl) => {
  const parsed = SH.parseGitHubRepo(repoUrl);
  if (!parsed) return null;
  return `https://github.com/${parsed.owner}/${parsed.repo}/issues`;
};

SH.fetchRepoApi = async (owner, repo) => {
  const res = await SH.fetchWithTimeout(
    `https://api.github.com/repos/${owner}/${repo}`,
    {},
    3500
  );
  if (!res.ok) throw new Error('repo fetch failed');
  return res.json();
};

SH.fetchPackageJsonHomepage = async (owner, repo) => {
  const res = await SH.fetchWithTimeout(
    `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
    {},
    3500
  );
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.content) return null;
  try {
    const decoded = atob(json.content.replace(/\n/g, ''));
    const pj = JSON.parse(decoded);
    return pj.homepage || null;
  } catch (e) {
    return null;
  }
};

SH.testUrlExists = async (url) => {
  try {
    const res = await SH.fetchWithTimeout(url, { method: 'HEAD' }, 3000);
    return res.ok;
  } catch (e) {
    return false;
  }
};

SH.resolveRepoDemoUrl = async (repoUrl) => {
  const parsed = SH.parseGitHubRepo(repoUrl);
  if (!parsed) return null;
  const { owner, repo } = parsed;
  try {
    const repoInfo = await SH.fetchRepoApi(owner, repo);
    if (repoInfo && repoInfo.homepage) return repoInfo.homepage;
  } catch (e) {
    /* ignore */
  }
  // try package.json
  try {
    const homepage = await SH.fetchPackageJsonHomepage(owner, repo);
    if (homepage) return homepage;
  } catch (e) {
    /* ignore */
  }
  // try GitHub Pages default
  const pages = `https://${owner}.github.io/${repo}/`;
  if (await SH.testUrlExists(pages)) return pages;
  // fallback: repo html url
  return `https://github.com/${owner}/${repo}`;
};

// Enrich a project object with `demoUrl` if a GitHub repo link is provided.
SH.enrichProjectWithDemo = async (project) => {
  if (!project || project.demoUrl) return project;
  const repoCandidates = [
    project.repoUrl,
    project.github,
    project.contributeUrl,
  ].filter(Boolean);
  for (const r of repoCandidates) {
    if (!r) continue;
    const parsed = SH.parseGitHubRepo(r);
    if (!parsed) continue;
    const demo = await SH.resolveRepoDemoUrl(r);
    if (demo) {
      project.demoUrl = demo;
      return project;
    }
  }
  return project;
};

// Counter animation
SH.animateCounters = () => {
  document.querySelectorAll('.stat-n[data-target]').forEach((el) => {
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
  html = html.replace(
    /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
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
  tabs.forEach((t) => t.classList.remove('active'));
  if (trigger) trigger.classList.add('active');

  if (mode === 'preview') {
    preview.innerHTML = SH.renderMarkdownPreview(
      input.value || 'Nothing to preview yet.'
    );
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
  } catch (e) {
    return false;
  }
};
SH.loadProfile = () => {
  try {
    const raw = localStorage.getItem(SH.profileKey);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

SH.saveProfileFromForm = () => {
  const name = document.getElementById('p-name')?.value?.trim();
  const role = document.getElementById('p-role')?.value?.trim();
  const skills = (document.getElementById('p-skills')?.value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!name) {
    SH.toast('Please enter your name');
    return;
  }
  const profile = { name, role, skills };
  SH.saveProfile(profile);
  SH.toast('Profile saved');
  SH.closeModal('onboard-modal');
  SH.renderNavProfile();
};

SH.clearProfile = () => {
  localStorage.removeItem(SH.profileKey);
  localStorage.removeItem(SH.authSessionKey);
  SH.renderNavProfile();
  SH.toast('Logged out');
};

SH.themeKey = 'sh_theme';

SH.getPreferredTheme = () => {
  return 'light';
};

SH.setTheme = () => {
  document.documentElement.dataset.theme = 'light';
  localStorage.setItem(SH.themeKey, 'light');
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.remove();
};

SH.renderThemeToggle = () => {
  document.getElementById('theme-toggle')?.remove();
};

SH.applyTheme = () => {
  SH.setTheme();
};

SH.renderNavProfile = () => {
  const user = SH.currentUser();
  const profile = user;
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let node = document.getElementById('nav-user');
  const isLoginPage = /\/pages\/login(?:\.html)?$/i.test(
    window.location.pathname
  );
  const isLandingPage = document.body.classList.contains('startupage-home');
  if (isLoginPage) {
    // If we're on the login page, remove nav-user and login-link.
    // If the user is already logged in, hide the whole top nav on this page.
    if (node) node.remove();
    document.getElementById('nav-login-link')?.remove();
    if (profile) {
      nav.style.display = 'none';
    } else {
      nav.style.display = '';
    }
    return;
  }
  document.body.classList.toggle('logged-in-shell', Boolean(profile));
  // hide signup CTA when logged in
  document.querySelectorAll('.nav-signup').forEach((el) => el.remove());
  // re-render sidebar when auth state changes
  setTimeout(() => SH.renderSidebar && SH.renderSidebar(), 10);
  if (profile) {
    const navLinks = nav.querySelector('.nav-links');
    const navActions = nav.querySelector('.nav-actions');
    navActions?.remove();
    // hide any login buttons when logged in
    document
      .querySelectorAll('.btn-join, .btn-login, .nav-login')
      .forEach((el) => el.remove());
    const initial = (profile.name || 'U').charAt(0).toUpperCase();
    const avatarColor = SH.avatarColors[0];
    const profileHref =
      profile.role === 'admin' || profile.role === 'org_admin'
        ? SH.adminHref()
        : SH.profileHref();
    const studentNav = `
          <a href="${SH.siteHref('index.html')}" class="nav-link">Home</a>
          <a href="${SH.siteHref(
            'pages/opportunities.html'
          )}" class="nav-link">Opportunities</a>
          <a href="${SH.siteHref(
            'pages/projects.html'
          )}" class="nav-link">Projects</a>
          <a href="${SH.siteHref(
            'pages/proposals.html'
          )}" class="nav-link">Proposals</a>
          <a href="${SH.siteHref(
            'pages/ideas.html'
          )}" class="nav-link">Ideas</a>
          <a href="${SH.siteHref(
            'pages/organizations.html'
          )}" class="nav-link">Organizations</a>
          <a href="${SH.siteHref(
            'pages/dsa.html'
          )}" class="nav-link">DSA Prep</a>
          <a href="${SH.siteHref(
            'pages/interviews.html'
          )}" class="nav-link">Interviews</a>
          <a href="${SH.siteHref(
            'pages/learninglab.html'
          )}" class="nav-link">LearningLab</a>
          <a href="${SH.siteHref(
            'pages/profile.html'
          )}" class="nav-link">Profile</a>
          <a href="${SH.siteHref(
            'pages/about.html'
          )}" class="nav-link">About</a>
        `;
    const organisationNav = `
          <a href="${SH.siteHref('index.html')}" class="nav-link">Home</a>
          <a href="${SH.siteHref(
            'pages/admin.html'
          )}" class="nav-link">Organisation Dashboard</a>
          <a href="${SH.siteHref(
            'pages/organizations.html'
          )}" class="nav-link">Organisation</a>
          <a href="${SH.siteHref(
            'pages/profile.html'
          )}" class="nav-link">Account</a>
          <a href="${SH.siteHref(
            'pages/about.html'
          )}" class="nav-link">About</a>
        `;
    if (navLinks) {
      if (isLandingPage) {
        // Minimal landing nav
        navLinks.innerHTML = `
          <a href="${SH.siteHref('index.html')}" class="nav-link">Home</a>
          <a href="#features" class="nav-link">Features</a>
          <a href="${SH.siteHref(
            'pages/about.html'
          )}" class="nav-link">About</a>
        `;
      } else {
        navLinks.innerHTML =
          profile.role === 'org_admin' ? organisationNav : studentNav;
      }
    }
    const html = `
      <div id="nav-user" class="nav-user">
        <a class="mini-link-btn outline" href="${SH.siteHref(
          'pages/profile.html'
        )}">Dashboard</a>
        <button class="nav-profile-btn" onclick="window.location.href='${profileHref}'">
          <span class="av" style="width:28px;height:28px;border-radius:99px;background:${avatarColor};font-size:0.85rem">${initial}</span>
          <span>${SH.escapeHtml((profile.name || 'User').split(' ')[0])}</span>
        </button>
        <button class="mini-link-btn outline" onclick="SH.logout()">Logout</button>
      </div>
    `;
    if (!node) {
      // append to nav so it appears on the right side
      nav.insertAdjacentHTML('beforeend', html);
    } else {
      node.outerHTML = html;
    }
  } else {
    if (node) node.remove();
    const actions = nav.querySelector('.nav-actions') || nav;
    const hasLoginAction = Array.from(nav.querySelectorAll('a, button')).some(
      (el) => el.textContent.trim().toLowerCase() === 'login'
    );
    if (!document.getElementById('nav-login-link') && !hasLoginAction) {
      actions.insertAdjacentHTML(
        'beforeend',
        `<a id="nav-login-link" class="mini-link-btn outline" href="${SH.loginHref()}">Login</a>`
      );
    }
  }
  if (profile) {
    document.getElementById('nav-login-link')?.remove();
    document.querySelectorAll('.nav-signup').forEach((el) => el.remove());
  }
};

// Render sidebar for authenticated users
SH.sidebarStateKey = 'sh_sidebar_state';

SH.applySidebarState = () => {
  const state = localStorage.getItem(SH.sidebarStateKey) || 'full';
  document.body.classList.toggle('sidebar-compact', state === 'compact');
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('is-compact', state === 'compact');
  const toggle = sidebar.querySelector('.sidebar-toggle');
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(state !== 'compact'));
    toggle.setAttribute(
      'aria-label',
      state === 'compact' ? 'Expand sidebar' : 'Collapse sidebar'
    );
    toggle.textContent = state === 'compact' ? 'Full' : 'Compact';
  }
};

SH.toggleSidebar = () => {
  const isCompact = document.body.classList.contains('sidebar-compact');
  localStorage.setItem(SH.sidebarStateKey, isCompact ? 'full' : 'compact');
  SH.applySidebarState();
};

SH.renderSidebar = () => {
  const sidebarId = 'app-sidebar';
  const existing = document.getElementById(sidebarId);
  // Don't show sidebar on the public landing page even if logged-in
  if (
    !document.body.classList.contains('logged-in-shell') ||
    document.body.classList.contains('startupage-home')
  ) {
    if (existing) existing.remove();
    return;
  }
  const unread = SH.unreadNotificationsCount
    ? SH.unreadNotificationsCount()
    : 0;
  const user = SH.currentUser();
  const activeOrg = SH.getActiveOrg ? SH.getActiveOrg() : null;
  if (existing) {
    // update badge
    const badge = existing.querySelector('.notif-badge');
    if (badge) badge.textContent = String(unread);
    const orgName = existing.querySelector('[data-sidebar-org-name]');
    if (orgName) orgName.textContent = activeOrg?.name || 'StudentHub';
    SH.applySidebarState();
    return;
  }
  const sidebar = document.createElement('aside');
  const studentLinks = `
      <a href="${SH.siteHref(
        'pages/profile.html'
      )}" title="Dashboard" data-page="profile.html"><span class="sidebar-icon">D</span><span class="sidebar-label">Dashboard</span></a>
      <a href="${SH.siteHref(
        'pages/organizations.html'
      )}" title="Organizations" data-page="organizations.html"><span class="sidebar-icon">W</span><span class="sidebar-label">Organizations</span></a>
      <a href="${SH.siteHref(
        'pages/projects.html'
      )}" title="Projects" data-page="projects.html"><span class="sidebar-icon">P</span><span class="sidebar-label">Projects</span></a>
      <a href="${SH.siteHref(
        'pages/proposals.html'
      )}" title="Proposals" data-page="proposals.html"><span class="sidebar-icon">R</span><span class="sidebar-label">Proposals</span></a>
      <a href="${SH.siteHref(
        'pages/ideas.html'
      )}" title="Ideas" data-page="ideas.html"><span class="sidebar-icon">I</span><span class="sidebar-label">Ideas</span></a>
      <a href="${SH.siteHref(
        'pages/dsa.html'
      )}" title="DSA Prep" data-page="dsa.html"><span class="sidebar-icon">C</span><span class="sidebar-label">DSA Prep</span></a>
      <a href="${SH.siteHref(
        'pages/interviews.html'
      )}" title="Interviews" data-page="interviews.html"><span class="sidebar-icon">M</span><span class="sidebar-label">Interviews</span></a>
      <a href="${SH.siteHref(
        'pages/learninglab.html'
      )}" title="LearningLab" data-page="learninglab.html"><span class="sidebar-icon">L</span><span class="sidebar-label">LearningLab</span></a>
      <a href="${SH.siteHref(
        'pages/opportunities.html'
      )}" title="Opportunities" data-page="opportunities.html"><span class="sidebar-icon">O</span><span class="sidebar-label">Opportunities</span></a>
      <a href="${SH.siteHref(
        'pages/about.html'
      )}" title="About" data-page="about.html"><span class="sidebar-icon">?</span><span class="sidebar-label">About</span></a>
      <a href="${SH.siteHref(
        'pages/profile.html'
      )}" id="nav-notifications" title="Notifications"><span class="sidebar-icon">N</span><span class="sidebar-label">Notifications</span> <span class="notif-badge">${unread}</span></a>
  `;
  const organisationLinks = `
      <a href="${SH.siteHref(
        'pages/admin.html'
      )}" title="Organisation Dashboard" data-page="admin.html"><span class="sidebar-icon">A</span><span class="sidebar-label">Organisation Dashboard</span></a>
      <a href="${SH.siteHref(
        'pages/organizations.html'
      )}" title="Organisation Workspace" data-page="organizations.html"><span class="sidebar-icon">W</span><span class="sidebar-label">Organisation</span></a>
      <a href="${SH.siteHref(
        'pages/profile.html'
      )}" title="Account" data-page="profile.html"><span class="sidebar-icon">D</span><span class="sidebar-label">Account</span></a>
      <a href="${SH.siteHref(
        'pages/about.html'
      )}" title="About" data-page="about.html"><span class="sidebar-icon">?</span><span class="sidebar-label">About</span></a>
  `;
  sidebar.id = sidebarId;
  sidebar.className = 'app-sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-head">
      <div class="sidebar-title"><span class="sidebar-logo">S</span><span class="sidebar-label">StudentHub</span></div>
      <button class="sidebar-toggle" type="button" onclick="SH.toggleSidebar()" aria-expanded="true">Compact</button>
    </div>
    <a class="sidebar-org-card" href="${SH.siteHref(
      'pages/organizations.html'
    )}" title="Organization workspace" data-page="organizations.html">
      <span class="sidebar-icon">O</span>
      <span class="sidebar-label"><small>Workspace</small><strong data-sidebar-org-name>${SH.escapeHtml(
        activeOrg?.name || 'StudentHub'
      )}</strong></span>
    </a>
    <nav class="sidebar-links">
      ${
        user?.role === 'org_admin' || user?.role === 'admin'
          ? organisationLinks
          : studentLinks
      }
    </nav>
    <button class="sidebar-logout" type="button" onclick="SH.logout()" title="Logout">
      <span class="sidebar-icon">X</span>
      <span class="sidebar-label">Logout</span>
    </button>
  `;
  document.body.insertAdjacentElement('afterbegin', sidebar);
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.sidebar-links a').forEach((link) => {
    if (link.dataset.page === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });
  SH.applySidebarState();
};

// Render project card
SH.renderProjectCard = (p, onclick) => {
  const memberAvatars = p.members
    .slice(0, 4)
    .map((m, i) => SH.av(m, i))
    .join('');
  const extra =
    p.members.length > 4
      ? `<span class="av" style="background:var(--surface2);color:var(--text2)">+${
          p.members.length - 4
        }</span>`
      : '';
  const contributeUrl = p.repoUrl
    ? SH.repoIssuesUrl(p.repoUrl) || p.contributeUrl || SH.contributeUrl
    : p.contributeUrl || SH.contributeUrl;
  const demoUrl = p.demoUrl || '';
  const matchCount = SH.getProjectSkillMatch?.(p);
  const matchChip =
    matchCount === null || matchCount === undefined
      ? 'Profile match'
      : matchCount > 0
      ? `${matchCount} skill match${matchCount === 1 ? '' : 'es'}`
      : 'Explore fit';
  const idArg = JSON.stringify(String(p.id));
  const deleteAction = SH.canManageItem(p)
    ? `<button class="mini-link-btn danger" onclick="event.stopPropagation();SH.deleteProject(${idArg})">Delete</button>`
    : '';
  return `
    <div class="project-card" onclick="${
      onclick || `SH.openProjectDetail(${idArg})`
    }">
      <div class="pc-top">
        <div class="pc-tags">${p.tags
          .map((t) => `<span class="tag ${SH.getTagClass(t)}">${t}</span>`)
          .join('')}</div>
        ${SH.statusBadge(p.status)}
      </div>
      <div class="pc-title">${p.title}</div>
      <div class="pc-desc">${p.desc}</div>
      <div class="project-collab-strip">
        <span>${SH.escapeHtml(p.difficulty || 'Beginner friendly')}</span>
        <span>${SH.escapeHtml(matchChip)}</span>
      </div>
      <div class="pc-footer">
        <div class="pc-members">${memberAvatars}${extra}</div>
        <div class="pc-meta">
          <span class="pc-likes">❤ <span>${p.likes}</span></span>
          <div class="pc-actions">
            <button class="mini-link-btn" onclick="event.stopPropagation();window.open('${contributeUrl}', '_blank', 'noopener,noreferrer')">Contribute</button>
            ${
              demoUrl
                ? `<button class="mini-link-btn outline" onclick="event.stopPropagation();window.open('${demoUrl}', '_blank', 'noopener,noreferrer')">Demo</button>`
                : ''
            }
            ${deleteAction}
          </div>
        </div>
      </div>
    </div>
  `;
};

// Render idea item
SH.renderIdeaItem = (idea, compact) => {
  const idArg = JSON.stringify(String(idea.id));
  return `
    <div class="idea-item">
      <div class="idea-vote">
        <button class="vote-btn ${
          idea.voted ? 'voted' : ''
        }" onclick="SH.voteIdea(${idArg}, this)">▲</button>
        <span class="vote-count" id="vote-${idea.id}">${idea.votes}</span>
      </div>
      <div class="idea-body">
        <div class="idea-title">${idea.title}</div>
        ${!compact ? `<div class="idea-desc">${idea.desc}</div>` : ''}
        <div class="idea-meta">
          <div class="pc-tags">${idea.tags
            .map((t) => `<span class="tag ${SH.getTagClass(t)}">${t}</span>`)
            .join('')}</div>
          <span class="idea-author">by ${idea.author}</span>
          <span class="idea-time">· ${idea.time}</span>
          <span class="idea-time">· 💬 ${idea.comments}</span>
        </div>
      </div>
      <div class="idea-actions">
        <button class="join-btn" onclick="SH.openContributionLink('${encodeURIComponent(
          idea.title
        )}')">Contribute</button>
      </div>
    </div>
  `;
};

// Vote on idea
SH.voteIdea = (id, btn) => {
  const idea = SH.ideas.find((i) => String(i.id) === String(id));
  if (!idea) return;
  idea.voted = !idea.voted;
  idea.votes += idea.voted ? 1 : -1;
  btn.classList.toggle('voted', idea.voted);
  const countEl = document.getElementById(`vote-${id}`);
  if (countEl) countEl.textContent = idea.votes;
  SH.persistIdeasCache();
};

SH.openContributionLink = () => {
  const url = `${SH.contributeUrl}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  SH.toast('Opened GitHub contribution page');
};

SH.joinRequestsKey = 'sh_join_requests';
SH.projectTasksKey = 'sh_project_tasks';
SH.projectJournalsKey = 'sh_project_journals';
SH.projectKanbanKey = 'sh_project_kanban';

SH.getCurrentProfileSkills = () => {
  const user = SH.currentUser();
  const profile = SH.loadProfile?.();
  return [...(user?.skills || []), ...(profile?.skills || [])]
    .map((skill) => String(skill).toLowerCase().trim())
    .filter(Boolean);
};

SH.getProjectSkillMatch = (project) => {
  const skills = SH.getCurrentProfileSkills();
  if (!skills.length) return null;
  const needs = [...(project.lookingFor || []), ...(project.tags || [])].map(
    (need) => String(need).toLowerCase()
  );
  return skills.filter((skill) =>
    needs.some((need) => need.includes(skill) || skill.includes(need))
  ).length;
};

SH.getCollabStatus = (project) => {
  const roles = project.lookingFor || [];
  if (!roles.length || roles[0] === 'Open Roles') return 'Needs role clarity';
  if ((project.members || []).length <= 1) return 'Recruiting team';
  if (project.nextStep) return 'Ready to collaborate';
  return 'Needs next step';
};

SH.loadJoinRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(SH.joinRequestsKey) || '[]');
  } catch (e) {
    return [];
  }
};

SH.saveJoinRequests = (requests) => {
  localStorage.setItem(SH.joinRequestsKey, JSON.stringify(requests));
};

SH.requestToJoinProject = (projectId) => {
  const user = SH.requireAuth();
  if (!user) return;
  const project = SH.projects.find((p) => String(p.id) === String(projectId));
  if (!project) return;
  const requests = SH.loadJoinRequests();
  const exists = requests.some(
    (r) => r.projectId === projectId && r.userEmail === user.email
  );
  if (exists) {
    SH.toast('Join request already sent');
    return;
  }
  requests.unshift({
    id: Date.now(),
    projectId,
    projectTitle: project.title,
    ownerEmail: project.ownerEmail || '',
    userId: user.id,
    userName: user.name || 'Student',
    userEmail: user.email,
    skills: user.skills || SH.loadProfile?.()?.skills || [],
    created: new Date().toISOString(),
    status: 'pending',
  });
  SH.saveJoinRequests(requests);
  SH.toast('Join request saved. Contact the student maintainer to start.');
};

SH.defaultProjectTasks = (project) => [
  `Confirm problem statement for ${project.title}`,
  'Assign roles and first weekly checkpoint',
  'Create or update GitHub issues',
];

SH.loadProjectTasks = (project) => {
  try {
    const all = JSON.parse(localStorage.getItem(SH.projectTasksKey) || '{}');
    if (!all[project.id]) {
      all[project.id] = SH.defaultProjectTasks(project).map((title, index) => ({
        id: `${project.id}-${index}`,
        title,
        done: false,
      }));
      localStorage.setItem(SH.projectTasksKey, JSON.stringify(all));
    }
    return all[project.id];
  } catch (e) {
    return SH.defaultProjectTasks(project).map((title, index) => ({
      id: `${project.id}-${index}`,
      title,
      done: false,
    }));
  }
};

SH.toggleProjectTask = (projectId, taskId) => {
  const project = SH.projects.find((p) => String(p.id) === String(projectId));
  if (!project) return;
  const all = JSON.parse(localStorage.getItem(SH.projectTasksKey) || '{}');
  const tasks = all[projectId] || SH.loadProjectTasks(project);
  const task = tasks.find((t) => t.id === taskId);
  if (task) task.done = !task.done;
  all[projectId] = tasks;
  localStorage.setItem(SH.projectTasksKey, JSON.stringify(all));
  SH.openProjectDetail(projectId);
};

SH.loadProjectJournals = (project) => {
  try {
    const all = JSON.parse(localStorage.getItem(SH.projectJournalsKey) || '{}');
    all[project.id] = all[project.id] || [];
    return all[project.id];
  } catch (e) {
    return [];
  }
};

SH.postProjectJournal = (projectId, titleInputId, bodyInputId) => {
  const user = SH.requireAuth();
  if (!user) return;
  const project = SH.projects.find((p) => String(p.id) === String(projectId));
  if (!project) return;
  const titleEl = document.getElementById(titleInputId);
  const bodyEl = document.getElementById(bodyInputId);
  const title = titleEl?.value.trim() || '';
  const body = bodyEl?.value.trim() || '';
  if (!body) {
    SH.toast('Add a weekly update before posting');
    return;
  }
  const all = JSON.parse(localStorage.getItem(SH.projectJournalsKey) || '{}');
  const entry = {
    id: Date.now(),
    title: title || 'Weekly update',
    body,
    author: user.name || 'Student',
    created: new Date().toISOString(),
  };
  all[project.id] = [entry, ...(all[project.id] || [])];
  localStorage.setItem(SH.projectJournalsKey, JSON.stringify(all));
  if (titleEl) titleEl.value = '';
  if (bodyEl) bodyEl.value = '';
  SH.toast('Project update posted');
  SH.openProjectDetail(projectId);
};

SH.loadProjectKanban = (project) => {
  try {
    const all = JSON.parse(localStorage.getItem(SH.projectKanbanKey) || '{}');
    if (!all[project.id]) {
      all[project.id] = {
        todo: SH.defaultProjectTasks(project).map((title, index) => ({
          id: `${project.id}-todo-${index}`,
          title,
          updated: new Date().toISOString(),
        })),
        inProgress: [],
        done: [],
      };
      localStorage.setItem(SH.projectKanbanKey, JSON.stringify(all));
    }
    return all[project.id];
  } catch (e) {
    return {
      todo: SH.defaultProjectTasks(project).map((title, index) => ({
        id: `${project.id}-todo-${index}`,
        title,
        updated: new Date().toISOString(),
      })),
      inProgress: [],
      done: [],
    };
  }
};

SH.saveProjectKanban = (projectId, board) => {
  const all = JSON.parse(localStorage.getItem(SH.projectKanbanKey) || '{}');
  all[projectId] = board;
  localStorage.setItem(SH.projectKanbanKey, JSON.stringify(all));
};

SH.addProjectKanbanCard = (projectId, inputId) => {
  const user = SH.requireAuth();
  if (!user) return;
  const project = SH.projects.find((p) => String(p.id) === String(projectId));
  if (!project) return;
  const input = document.getElementById(inputId);
  const title = input?.value.trim() || '';
  if (!title) {
    SH.toast('Add a task title first');
    return;
  }
  const board = SH.loadProjectKanban(project);
  board.todo.unshift({
    id: `${project.id}-${Date.now()}`,
    title,
    updated: new Date().toISOString(),
  });
  SH.saveProjectKanban(project.id, board);
  if (input) input.value = '';
  SH.toast('Task added to To Do');
  SH.openProjectDetail(projectId);
};

SH.moveProjectKanbanCard = (projectId, cardId, fromColumn, direction) => {
  const project = SH.projects.find((p) => String(p.id) === String(projectId));
  if (!project) return;
  const board = SH.loadProjectKanban(project);
  const columns = ['todo', 'inProgress', 'done'];
  const fromIndex = columns.indexOf(fromColumn);
  const targetIndex = fromIndex + direction;
  if (fromIndex < 0 || targetIndex < 0 || targetIndex >= columns.length) return;
  const fromCards = board[fromColumn] || [];
  const cardIndex = fromCards.findIndex(
    (card) => String(card.id) === String(cardId)
  );
  if (cardIndex < 0) return;
  const [card] = fromCards.splice(cardIndex, 1);
  card.updated = new Date().toISOString();
  board[columns[targetIndex]] = board[columns[targetIndex]] || [];
  board[columns[targetIndex]].unshift(card);
  SH.saveProjectKanban(project.id, board);
  SH.openProjectDetail(projectId);
};

SH.renderProjectJournalSection = (project) => {
  const projectId = String(project.id);
  const entries = SH.loadProjectJournals(project);
  return `
    <div class="project-update-panel" style="margin:1.25rem 0;padding:1rem;border:1px solid rgba(255,255,255,0.08);border-radius:18px;background:rgba(255,255,255,0.03)">
      <div class="form-label">Build in Public journal</div>
      <p style="margin:0.35rem 0 1rem;color:var(--text3);font-size:0.85rem">Post weekly progress so teammates and followers can track the story of the project.</p>
      <div class="form-group" style="margin-bottom:0.75rem">
        <input id="journal-title-${projectId}" type="text" class="form-input" placeholder="Week 4: Shipped the onboarding flow" />
      </div>
      <div class="form-group" style="margin-bottom:0.75rem">
        <textarea id="journal-body-${projectId}" class="form-textarea" rows="4" placeholder="What changed this week? What is blocked? What comes next?"></textarea>
      </div>
      <div class="modal-footer" style="margin-top:0;justify-content:flex-start">
        <button class="btn-submit" onclick="SH.postProjectJournal('${projectId}', 'journal-title-${projectId}', 'journal-body-${projectId}')">Post update</button>
      </div>
      <div style="display:grid;gap:0.75rem;margin-top:1rem">
        ${
          entries.length
            ? entries
                .map(
                  (entry) => `
                    <article style="padding:0.9rem 1rem;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06)">
                      <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:0.45rem">
                        <strong style="font-size:0.92rem">${SH.escapeHtml(
                          entry.title
                        )}</strong>
                        <span style="color:var(--text3);font-size:0.78rem">${SH.escapeHtml(
                          entry.author
                        )} · ${new Date(
                    entry.created
                  ).toLocaleDateString()}</span>
                      </div>
                      <p style="margin:0;color:var(--text2);font-size:0.88rem;line-height:1.6;white-space:pre-wrap">${SH.escapeHtml(
                        entry.body
                      )}</p>
                    </article>
                  `
                )
                .join('')
            : `
                <div class="empty-state" style="padding:1rem;margin:0">
                  <div class="empty-icon">+</div>
                  <h3>No updates yet</h3>
                  <p>The first weekly journal entry will appear here.</p>
                </div>
              `
        }
      </div>
    </div>
  `;
};

SH.renderProjectKanbanSection = (project) => {
  const projectId = String(project.id);
  const board = SH.loadProjectKanban(project);
  const columnMeta = [
    ['todo', 'To Do'],
    ['inProgress', 'In Progress'],
    ['done', 'Done'],
  ];
  return `
    <div class="project-board-panel" style="margin:1.25rem 0;padding:1rem;border:1px solid rgba(255,255,255,0.08);border-radius:18px;background:rgba(255,255,255,0.03)">
      <div class="form-label">Kanban board</div>
      <p style="margin:0.35rem 0 1rem;color:var(--text3);font-size:0.85rem">Move tasks across the board as the project changes from ideas to shipped work.</p>
      <div class="form-group" style="margin-bottom:0.75rem">
        <input id="kanban-input-${projectId}" type="text" class="form-input" placeholder="Add a new task to To Do" />
      </div>
      <div class="modal-footer" style="margin-top:0;justify-content:flex-start">
        <button class="btn-submit" onclick="SH.addProjectKanbanCard('${projectId}', 'kanban-input-${projectId}')">Add card</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:0.75rem;margin-top:1rem">
        ${columnMeta
          .map(
            ([key, label], columnIndex) => `
              <section style="padding:0.85rem;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);min-height:180px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
                  <strong style="font-size:0.9rem">${label}</strong>
                  <span style="color:var(--text3);font-size:0.78rem">${
                    board[key].length
                  }</span>
                </div>
                <div style="display:grid;gap:0.6rem">
                  ${
                    board[key].length
                      ? board[key]
                          .map(
                            (card) => `
                              <article style="padding:0.75rem;border-radius:14px;background:rgba(9, 14, 28, 0.55);border:1px solid rgba(255,255,255,0.06)">
                                <strong style="display:block;font-size:0.86rem;line-height:1.35;margin-bottom:0.55rem">${SH.escapeHtml(
                                  card.title
                                )}</strong>
                                <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;font-size:0.72rem;color:var(--text3)">
                                  <span>${new Date(
                                    card.updated
                                  ).toLocaleDateString()}</span>
                                  <div style="display:flex;gap:0.35rem">
                                    ${
                                      columnIndex > 0
                                        ? `<button class="btn-cancel" style="padding:0.35rem 0.55rem;font-size:0.72rem" onclick="SH.moveProjectKanbanCard('${projectId}', '${card.id}', '${key}', -1)">←</button>`
                                        : ''
                                    }
                                    ${
                                      columnIndex < columnMeta.length - 1
                                        ? `<button class="btn-cancel" style="padding:0.35rem 0.55rem;font-size:0.72rem" onclick="SH.moveProjectKanbanCard('${projectId}', '${card.id}', '${key}', 1)">→</button>`
                                        : ''
                                    }
                                  </div>
                                </div>
                              </article>
                            `
                          )
                          .join('')
                      : `<div class="empty-state" style="padding:0.75rem;margin:0"><p style="margin:0;color:var(--text3);font-size:0.8rem">No cards here yet.</p></div>`
                  }
                </div>
              </section>
            `
          )
          .join('')}
      </div>
    </div>
  `;
};

// Project detail modal
SH.openProjectDetail = (id) => {
  const p = SH.projects.find((x) => String(x.id) === String(id));
  if (!p) return;
  let overlay = document.getElementById('project-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'project-modal';
    overlay.innerHTML = `<div class="modal" id="project-modal-inner"></div>`;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) SH.closeModal('project-modal');
    });
    document.body.appendChild(overlay);
  }
  const inner = document.getElementById('project-modal-inner');
  const contributeUrl = p.repoUrl
    ? SH.repoIssuesUrl(p.repoUrl) || p.contributeUrl || SH.contributeUrl
    : p.contributeUrl || SH.contributeUrl;
  const demoUrl = p.demoUrl || '';
  const tasks = SH.loadProjectTasks(p);
  const doneTasks = tasks.filter((task) => task.done).length;
  const matchCount = SH.getProjectSkillMatch(p);
  const matchLabel =
    matchCount === null
      ? 'Add profile skills for match hints'
      : matchCount > 0
      ? `${matchCount} skill match${matchCount === 1 ? '' : 'es'}`
      : 'No profile skill match yet';
  const contact = p.contact || p.ownerEmail || 'Ask the project owner';
  const idArg = JSON.stringify(String(p.id));
  const deleteButton = SH.canManageItem(p)
    ? `<button class="btn-cancel danger" onclick="SH.deleteProject(${idArg})">Delete Project</button>`
    : '';
  inner.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem">
      <div>
        <div class="pc-tags" style="margin-bottom:0.5rem">${p.tags
          .map((t) => `<span class="tag ${SH.getTagClass(t)}">${t}</span>`)
          .join('')} ${SH.statusBadge(p.status)}</div>
        <div class="modal-title" style="margin-bottom:0">${p.title}</div>
        <div style="color:var(--text3);font-size:0.82rem;margin-top:0.25rem">Posted by ${
          p.owner
        } · ${p.created}</div>
      </div>
      <button class="btn-cancel" onclick="SH.closeModal('project-modal')" style="flex-shrink:0">✕</button>
    </div>
    <p style="color:var(--text2);font-size:0.9rem;line-height:1.65;margin-bottom:1.25rem">${
      p.details
    }</p>
    <div class="collab-summary">
      <div>
        <span>Collaboration status</span>
        <strong>${SH.escapeHtml(SH.getCollabStatus(p))}</strong>
      </div>
      <div>
        <span>Your fit</span>
        <strong>${SH.escapeHtml(matchLabel)}</strong>
      </div>
      <div>
        <span>Checklist</span>
        <strong>${doneTasks}/${tasks.length} done</strong>
      </div>
    </div>
    <div style="margin-bottom:1.25rem">
      <div class="form-label">Looking for</div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">${p.lookingFor
        .map((r) => `<span class="skill-pill">${r}</span>`)
        .join('')}</div>
    </div>
    <div class="collab-detail-grid">
      <div class="collab-detail">
        <span>Contribution level</span>
        <strong>${SH.escapeHtml(p.difficulty || 'Beginner friendly')}</strong>
      </div>
      <div class="collab-detail">
        <span>Student maintainer</span>
        <strong>${SH.escapeHtml(
          p.maintainer || p.owner || 'Student maintainer'
        )}</strong>
      </div>
      <div class="collab-detail">
        <span>Weekly sync</span>
        <strong>${SH.escapeHtml(
          p.meeting || 'Flexible / to be decided'
        )}</strong>
      </div>
      <div class="collab-detail">
        <span>Contact</span>
        <strong>${SH.escapeHtml(contact)}</strong>
      </div>
    </div>
    ${SH.renderProjectJournalSection(p)}
    ${SH.renderProjectKanbanSection(p)}
    <div class="project-task-panel">
      <div class="form-label">First contribution checklist</div>
      ${tasks
        .map(
          (task) => `
            <button class="task-row ${
              task.done ? 'done' : ''
            }" onclick="SH.toggleProjectTask(${idArg}, '${task.id}')">
              <span>${task.done ? 'Done' : 'Todo'}</span>
              <strong>${SH.escapeHtml(task.title)}</strong>
            </button>
          `
        )
        .join('')}
    </div>
    <div style="margin-bottom:1.5rem">
      <div class="form-label">Team (${p.members.length} members)</div>
      <div style="display:flex;gap:0.4rem">${p.members
        .map((m, i) => SH.av(m, i))
        .join('')}</div>
    </div>
    <div class="modal-footer" style="margin-top:0">
      <button class="btn-cancel" onclick="SH.closeModal('project-modal')">Close</button>
      ${deleteButton}
      <button class="btn-submit" onclick="SH.requestToJoinProject(${idArg})">Request to Join</button>
      <button class="btn-submit" onclick="window.open('${contributeUrl}', '_blank', 'noopener,noreferrer');SH.toast('Opened GitHub issues for contribution');SH.closeModal('project-modal')">Contribute on GitHub</button>
      ${
        demoUrl
          ? `<button class="btn-cancel" onclick="window.open('${demoUrl}', '_blank', 'noopener,noreferrer');SH.toast('Opened demo link');SH.closeModal('project-modal')">View Demo</button>`
          : ''
      }
    </div>
  `;
  SH.openModal('project-modal');
};

// Run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SH.migrateOrgData();
  SH.enforceRoleFeatureAccess();
  SH.cleanDemoLocalData();
  SH.applyTheme();
  SH.animateCounters();
  SH.renderNavProfile();
  SH.initMobileNav();
  SH.renderSidebar && SH.renderSidebar();
  // Fetch live GitHub stats for the repo and show them on the homepage
  SH.fetchGitHubStats = async () => {
    const starsEl = document.getElementById('gh-stars');
    const forksEl = document.getElementById('gh-forks');
    const contribsEl = document.getElementById('gh-contribs');
    if (!starsEl && !forksEl && !contribsEl) return;
    try {
      const repoRes = await SH.fetchWithTimeout(
        `https://api.github.com/repos/${SH.githubRepo}`,
        {},
        2500
      );
      if (!repoRes.ok) return;
      const repo = await repoRes.json();
      if (starsEl)
        starsEl.textContent = repo.stargazers_count?.toLocaleString() || '0';
      if (forksEl)
        forksEl.textContent = repo.forks_count?.toLocaleString() || '0';

      // Contributors (first 6)
      if (!contribsEl) return;
      const contribRes = await SH.fetchWithTimeout(
        `https://api.github.com/repos/${SH.githubRepo}/contributors?per_page=6`,
        {},
        2500
      );
      if (!contribRes.ok) return;
      const contribs = await contribRes.json();
      contribsEl.innerHTML = contribs
        .slice(0, 6)
        .map(
          (c) =>
            `<img src="${c.avatar_url}" alt="${c.login}" title="${c.login}" style="width:28px;height:28px;border-radius:99px;border:2px solid var(--surface);">`
        )
        .join('');
    } catch (e) {
      console.warn('GitHub stats fetch failed', e);
    }
  };
  SH.fetchGitHubStats();
});

// Mobile nav toggle behavior
SH.initMobileNav = () => {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.style.display = open ? 'block' : 'none';
    menu.setAttribute('aria-hidden', String(!open));
  };
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  });
  // Close when clicking a mobile link
  menu
    .querySelectorAll('a, button')
    .forEach((el) => el.addEventListener('click', () => setOpen(false)));
  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
};
