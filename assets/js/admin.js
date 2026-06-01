// Admin dashboard for reviewing organization, event, project, and proposal work.
(function () {
  const KEY = 'SH_proposals_v1';
  const EVENT_KEY = 'sh_learninglab_events';

  const load = () => SH.safeJsonArray(KEY);
  const save = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));
  const loadEvents = () => SH.safeJsonArray(EVENT_KEY);
  const saveEvents = (arr) =>
    localStorage.setItem(EVENT_KEY, JSON.stringify(arr));
  const scopeItems = (items) => SH.filterByActiveOrg(items || []);
  const orgLabel = (orgId) => SH.getOrganization(orgId || SH.defaultOrgId).name;
  const currentScope = () => {
    const user = SH.currentUser();
    return {
      user,
      isGlobalAdmin: user?.role === 'admin',
      orgId: SH.getActiveOrgId(),
      org: SH.getActiveOrg(),
    };
  };

  const renderOverview = () => {
    const scope = currentScope();
    const proposals = scopeItems(load());
    const projects = scopeItems(SH.safeJsonArray('sh_projects'));
    const ideas = scopeItems(SH.safeJsonArray('sh_ideas'));
    const requests = SH.loadOrgRequests();
    const users = SH.loadUsers().filter((u) =>
      scope.isGlobalAdmin
        ? u.role !== 'admin'
        : (u.orgIds || []).includes(scope.orgId)
    );
    const metrics = [
      [scope.isGlobalAdmin ? 'Users' : 'Org users', users.length],
      ['Projects', projects.length],
      ['Ideas', ideas.length],
      [
        'Pending',
        proposals.filter((p) => (p.status || 'pending') === 'pending').length,
      ],
      scope.isGlobalAdmin
        ? [
            'Org requests',
            requests.filter((request) => request.status === 'pending').length,
          ]
        : ['Workspace', scope.org?.name || 'StudentHub'],
    ];
    const metricsNode = document.getElementById('admin-metrics');
    if (metricsNode) {
      metricsNode.innerHTML = metrics
        .map(
          ([label, value]) => `
        <div class="admin-metric"><strong>${SH.escapeHtml(
          String(value)
        )}</strong><span>${SH.escapeHtml(label)}</span></div>
      `
        )
        .join('');
    }
    const usersNode = document.getElementById('admin-users');
    if (!usersNode) return;
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
          <span class="role-badge">${SH.escapeHtml(
            SH.roleLabel(user.role)
          )}</span>
        </div>
      `
          )
          .join('')
      : `<div class="empty-state"><div class="empty-icon">.</div><h3>No users yet</h3><p>Students in this workspace will appear here.</p></div>`;
  };

  const renderStudents = () => {
    const container = document.getElementById('admin-students');
    if (!container) return;
    const students = scopeItems(SH.loadOrgStudents());
    container.innerHTML = students.length
      ? students
          .map(
            (student) => `
        <div class="joined-project">
          <div class="av" style="background:var(--accent2)">${(
            student.name || 'S'
          )
            .charAt(0)
            .toUpperCase()}</div>
          <div style="flex:1">
            <div class="jp-title">${SH.escapeHtml(
              student.name || 'Student'
            )}</div>
            <div class="jp-role">${SH.escapeHtml(student.email || '')}${
              student.rollNo ? ` · ${SH.escapeHtml(student.rollNo)}` : ''
            }${student.course ? ` · ${SH.escapeHtml(student.course)}` : ''}${
              student.year ? ` · ${SH.escapeHtml(student.year)}` : ''
            }</div>
          </div>
          <span class="role-badge">${SH.escapeHtml(
            student.status || 'invited'
          )}</span>
        </div>
      `
          )
          .join('')
      : `<div class="empty-state"><div class="empty-icon">+</div><h3>No student data yet</h3><p>Add college email records so students can join this organisation.</p></div>`;
  };

  const parseBulkStudents = (text) =>
    String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, email, rollNo, course, year] = line
          .split(',')
          .map((part) => part.trim());
        return { name, email, rollNo, course, year };
      });

  const submitStudentRoster = (event) => {
    event.preventDefault();
    const bulkRows = parseBulkStudents(
      document.getElementById('student-bulk').value
    );
    const single = {
      name: document.getElementById('student-name').value,
      email: document.getElementById('student-email').value,
      rollNo: document.getElementById('student-roll').value,
      course: document.getElementById('student-course').value,
      year: document.getElementById('student-year').value,
    };
    const rows = bulkRows.length ? bulkRows : [single];
    const result = SH.importOrgStudents(rows);
    if (!result.added) {
      SH.toast(result.errors[0] || 'Add at least one valid student');
      return;
    }
    event.target.reset();
    SH.toast(
      `${result.added} student record${result.added === 1 ? '' : 's'} saved`
    );
    renderStudents();
    renderOverview();
  };

  const renderOrgRequests = () => {
    const scope = currentScope();
    const panel = document.getElementById('admin-org-requests-panel');
    const container = document.getElementById('admin-org-requests');
    if (!panel || !container) return;
    panel.style.display = scope.isGlobalAdmin ? 'block' : 'none';
    if (!scope.isGlobalAdmin) return;

    const requests = SH.loadOrgRequests();
    container.innerHTML = requests.length
      ? requests
          .map(
            (request) => `
        <div class="joined-project">
          <div class="jp-dot"></div>
          <div style="flex:1">
            <div class="jp-title">${SH.escapeHtml(request.name)}</div>
            <div class="jp-role">${SH.escapeHtml(
              request.requesterName || request.requesterEmail || 'Student'
            )} · ${SH.escapeHtml(request.requesterEmail || '')}</div>
            <p style="margin:0.35rem 0 0;color:var(--text2)">${SH.escapeHtml(
              request.description || 'No description provided.'
            )}</p>
          </div>
          <span class="role-badge">${SH.escapeHtml(
            request.status || 'pending'
          )}</span>
          ${
            request.status === 'pending'
              ? `<button class="mini-link-btn danger" data-org-reject="${request.id}">Reject</button>
                 <button class="mini-link-btn" data-org-approve="${request.id}">Approve</button>`
              : ''
          }
        </div>
      `
          )
          .join('')
      : `<div class="empty-state"><div class="empty-icon">.</div><h3>No organization requests</h3><p>New workspace requests will appear here.</p></div>`;

    container.querySelectorAll('[data-org-approve]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const result = SH.approveOrgRequest(btn.dataset.orgApprove);
        SH.toast(result.ok ? 'Organization approved' : result.message);
        render();
      });
    });
    container.querySelectorAll('[data-org-reject]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const result = SH.rejectOrgRequest(btn.dataset.orgReject);
        SH.toast(result.ok ? 'Organization rejected' : result.message);
        render();
      });
    });
  };

  const renderProjects = () => {
    const container = document.getElementById('admin-projects');
    if (!container) return;
    const projects = scopeItems(SH.safeJsonArray('sh_projects'));
    container.innerHTML = projects.length
      ? projects
          .map(
            (project) => `
        <div class="joined-project">
          <div class="jp-dot"></div>
          <div style="flex:1">
            <div class="jp-title">${SH.escapeHtml(
              project.title || 'Untitled project'
            )}</div>
            <div class="jp-role">${SH.escapeHtml(
              project.owner || 'Student'
            )} · ${SH.escapeHtml(project.status || 'open')} · ${SH.escapeHtml(
              orgLabel(project.orgId)
            )}</div>
          </div>
          <button class="mini-link-btn outline" data-open-id="${
            project.id
          }">Open</button>
          <button class="mini-link-btn danger" data-delete-id="${
            project.id
          }">Delete</button>
        </div>
      `
          )
          .join('')
      : `<div class="empty-state"><div class="empty-icon">.</div><h3>No projects</h3><p>Student projects will appear here for moderation.</p></div>`;

    container.querySelectorAll('[data-open-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.location.href = 'projects.html';
      });
    });
    container.querySelectorAll('[data-delete-id]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        SH.projects = SH.safeJsonArray('sh_projects');
        await SH.deleteProject(btn.dataset.deleteId);
        renderOverview();
        renderProjects();
      });
    });
  };

  const renderEvents = () => {
    const container = document.getElementById('admin-events');
    if (!container) return;
    const events = scopeItems(loadEvents()).sort((a, b) =>
      String(b.date || '').localeCompare(String(a.date || ''))
    );
    container.innerHTML = events.length
      ? events
          .map(
            (event) => `
        <div class="joined-project">
          <div class="jp-dot"></div>
          <div style="flex:1">
            <div class="jp-title">${SH.escapeHtml(event.title)}</div>
            <div class="jp-role">${SH.escapeHtml(event.date)} · ${SH.escapeHtml(
              event.time
            )} · ${SH.escapeHtml(event.mode)} · ${SH.escapeHtml(
              orgLabel(event.orgId)
            )}</div>
          </div>
          <button class="mini-link-btn danger" data-id="${
            event.id
          }">Delete</button>
        </div>
      `
          )
          .join('')
      : `<div class="empty-state"><div class="empty-icon">.</div><h3>No LearningLab events</h3><p>Create an event to show it on the LearningLab page.</p></div>`;
    container.querySelectorAll('.mini-link-btn.danger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = loadEvents().filter(
          (event) => event.id !== btn.dataset.id
        );
        saveEvents(next);
        SH.toast('Event deleted');
        renderEvents();
      });
    });
  };

  const submitEvent = (e) => {
    e.preventDefault();
    const title = document.getElementById('event-title').value.trim();
    const host = document.getElementById('event-host').value.trim();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value.trim();
    const formUrl = document.getElementById('event-form-url').value.trim();
    const description = document
      .getElementById('event-description')
      .value.trim();
    if (!title || !host || !date || !time || !formUrl || !description) {
      SH.toast('Fill all event fields');
      return;
    }
    const events = loadEvents();
    events.unshift({
      id: `event-${Date.now()}`,
      title,
      host,
      date,
      time,
      formUrl,
      description,
      mode: document.getElementById('event-mode').value,
      level: document.getElementById('event-level').value,
      orgId: SH.getActiveOrgId(),
    });
    saveEvents(events);
    e.target.reset();
    SH.toast('LearningLab event created');
    renderEvents();
    renderOverview();
  };

  const statusChange = (e) => {
    const id = e.target.dataset.id;
    const list = load();
    const idx = list.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) return;
    list[idx].status = e.target.value;
    save(list);
    SH.toast('Status updated');
    render();
  };

  const accept = (e) => {
    const id = e.target.dataset.id;
    const list = load();
    const idx = list.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) return;
    list[idx].status = 'accepted';
    save(list);
    const p = list[idx];
    try {
      const project = {
        id: Date.now(),
        title: p.title,
        desc: p.abstract,
        tags: p.skills || [],
        status: 'open',
        members: [(p.name || 'U')[0] || 'U'],
        likes: 0,
        owner: p.name,
        ownerEmail: p.email,
        ownerId: p.userId || '',
        created: 'just now',
        lookingFor: p.skills || [],
        details: p.abstract,
        orgId: p.orgId || SH.getActiveOrgId(),
      };
      const stored = SH.safeJsonArray('sh_projects');
      stored.unshift(project);
      localStorage.setItem('sh_projects', JSON.stringify(stored));
      window.SH.projects = stored;
    } catch (err) {
      console.warn('Unable to persist accepted proposal as project', err);
    }
    SH.toast('Proposal accepted and project created');
    render();
  };

  const reject = (e) => {
    const id = e.target.dataset.id;
    const list = load();
    const idx = list.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) return;
    list[idx].status = 'rejected';
    save(list);
    SH.toast('Proposal rejected');
    render();
  };

  const assign = (e) => {
    const id = e.target.dataset.id;
    const container = document.querySelector(
      `input.reviewer-input[data-id='${id}']`
    );
    if (!container) return;
    const reviewer = container.value.trim();
    if (!reviewer) {
      SH.toast('Enter peer reviewer username');
      return;
    }
    const list = load();
    const idx = list.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) return;
    list[idx].reviewer = reviewer;
    list[idx].status = 'peer-reviewed';
    save(list);
    SH.toast('Peer reviewer assigned');
    render();
  };

  const renderProposals = () => {
    const list = scopeItems(load());
    const container = document.getElementById('admin-proposals');
    if (!container) return;
    if (!list.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">.</div><h3>No proposals</h3><p>Waiting for submissions.</p></div>`;
      return;
    }
    container.innerHTML = list
      .map(
        (p) => `
      <div style="border:1px solid var(--border);padding:1rem;border-radius:8px;margin-bottom:0.75rem;background:var(--surface)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
          <div>
            <div style="font-weight:800">${SH.escapeHtml(p.title)}</div>
            <div style="color:var(--text3);font-size:0.85rem">by ${SH.escapeHtml(
              p.name
            )} · ${SH.escapeHtml(p.email || '')}</div>
          </div>
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
            <span class="role-badge">${SH.escapeHtml(orgLabel(p.orgId))}</span>
            <select data-id="${p.id}" class="status-select">
              <option value="pending" ${
                p.status === 'pending' ? 'selected' : ''
              }>Pending</option>
              <option value="accepted" ${
                p.status === 'accepted' ? 'selected' : ''
              }>Accepted</option>
              <option value="peer-reviewed" ${
                p.status === 'peer-reviewed' ? 'selected' : ''
              }>Peer Reviewed</option>
              <option value="rejected" ${
                p.status === 'rejected' ? 'selected' : ''
              }>Rejected</option>
            </select>
            <button data-id="${
              p.id
            }" class="btn-submit btn-assign">Assign Reviewer</button>
          </div>
        </div>
        <div style="color:var(--text2);margin-top:0.6rem">${SH.escapeHtml(
          p.abstract
        )}</div>
        <div style="margin-top:0.6rem;display:flex;gap:0.6rem;align-items:center;flex-wrap:wrap">
          <input placeholder="Peer reviewer username" data-id="${
            p.id
          }" class="form-input reviewer-input" style="max-width:240px" />
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

  const render = () => {
    if (!SH.requireAuth(['admin', 'org_admin'])) return;
    renderOverview();
    renderStudents();
    renderOrgRequests();
    renderEvents();
    renderProjects();
    renderProposals();
  };

  document.addEventListener('DOMContentLoaded', () => {
    document
      .getElementById('event-form')
      ?.addEventListener('submit', submitEvent);
    document
      .getElementById('student-roster-form')
      ?.addEventListener('submit', submitStudentRoster);
    render();
  });
})();
