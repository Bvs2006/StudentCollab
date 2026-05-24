// ─── HOME PAGE ───
document.addEventListener('DOMContentLoaded', async () => {
  if (window.SH && SH.fetchProjectsFromSupabase) {
    await SH.fetchProjectsFromSupabase();
  }

  if (window.SH && SH.fetchIdeasFromSupabase) {
    await SH.fetchIdeasFromSupabase();
  }

  const projContainer = document.getElementById('featured-projects');
  if (projContainer) {
    const featured = SH.projects.slice(0, 3);
    projContainer.innerHTML = featured.length
      ? featured.map((p) => SH.renderProjectCard(p)).join('')
      : `
        <div class="empty-state" style="grid-column:1 / -1">
          <div class="empty-icon">+</div>
          <h3>No projects yet</h3>
          <p>Start the first campus collaboration from the Projects page.</p>
          <a class="btn-ghost empty-action" href="pages/projects.html">Create a project</a>
        </div>
      `;
  }

  const ideasContainer = document.getElementById('home-ideas');
  if (ideasContainer) {
    const ideas = SH.ideas.slice(0, 4);
    ideasContainer.innerHTML = ideas.length
      ? ideas.map((i) => SH.renderIdeaItem(i)).join('')
      : `
        <div class="empty-state">
          <div class="empty-icon">+</div>
          <h3>No ideas posted yet</h3>
          <p>Share a concept and invite other students to shape it with you.</p>
          <a class="btn-ghost empty-action" href="pages/ideas.html">Post an idea</a>
        </div>
      `;
  }
});
