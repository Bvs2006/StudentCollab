// ─── HOME PAGE ───
document.addEventListener('DOMContentLoaded', () => {
  // Featured projects (first 3)
  const projContainer = document.getElementById('featured-projects');
  if (projContainer) {
    projContainer.innerHTML = SH.projects.slice(0, 3).map(p => SH.renderProjectCard(p)).join('');
  }

  // Home ideas (first 4)
  const ideasContainer = document.getElementById('home-ideas');
  if (ideasContainer) {
    ideasContainer.innerHTML = SH.ideas.slice(0, 4).map(i => SH.renderIdeaItem(i)).join('');
  }
});
