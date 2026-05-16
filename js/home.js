// ─── HOME PAGE ───
document.addEventListener('DOMContentLoaded', () => {
  // Featured projects (first 3)
  const projContainer = document.getElementById('featured-projects');
  if (projContainer) {
    const featured = SH.projects.slice(0, 3);
    projContainer.innerHTML = featured.length
      ? featured.map(p => SH.renderProjectCard(p)).join('')
      : `
        <div class="empty-state" style="grid-column:1 / -1">
          <div class="empty-icon">+</div>
          <h3>No projects yet</h3>
          <p>Start the first campus collaboration from the Projects page.</p>
        </div>
      `;
  }

  // Home ideas (first 4)
  const ideasContainer = document.getElementById('home-ideas');
  if (ideasContainer) {
    const ideas = SH.ideas.slice(0, 4);
    ideasContainer.innerHTML = ideas.length
      ? ideas.map(i => SH.renderIdeaItem(i)).join('')
      : `
        <div class="empty-state">
          <div class="empty-icon">+</div>
          <h3>No ideas posted yet</h3>
          <p>Share a concept and invite other students to shape it with you.</p>
        </div>
      `;
  }
});
