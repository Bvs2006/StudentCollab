# ⬡ StudentHub — Collaborative Project Workspace

A beautiful, fully-functional workspace for college students to discover, pitch, and collaborate on project ideas.

## 📁 Project Structure

```
studenthub/
├── index.html          ← Home / Dashboard
├── pages/
│   ├── projects.html   ← Browse & create projects
│   ├── ideas.html      ← Ideas board with voting
│   └── profile.html    ← Student profile page
├── css/
│   └── style.css       ← All styles (dark theme, design tokens)
└── js/
    ├── data.js         ← Shared mock data & helpers
    ├── app.js          ← Shared utilities (modals, toast, cards)
    └── home.js         ← Home page logic
```

## 🚀 Getting Started

Simply open `index.html` in any modern browser. No build step required.

```
open index.html
```

Or use a local server for best experience:
```
npx serve .
# or
python3 -m http.server 8080
```

## ✨ Features

### 🏠 Home Page
- Animated floating project cards
- Live stats counter animation
- Featured projects grid
- Latest ideas preview

### 🚀 Projects Page
- Browse all student projects
- Filter by status (Open, In Progress) and category
- Search projects by keyword
- Create new projects via modal form
- View project details and request to join

### 📝 Proposals
- Submit project proposals and request mentorship via `pages/proposals.html`.
- Admins can review proposals and accept them into the projects list via `pages/admin.html`.
- Project collaboration now routes contributors to the GitHub repo/issues instead of internal join requests.

### 💡 Ideas Board
- Post and discover project ideas
- Upvote/downvote system
- Sort by: Top, New, Most Discussed
- Tag-based filtering
- Trending ideas sidebar
- Post new ideas with categories

### 👤 Profile Page
- Editable student profile (persisted in localStorage)
- Contribution activity graph
- Joined projects list
- Activity feed
- Skills showcase

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#7c5cfc` (violet) |
| Secondary | `#c084fc` (purple) |
| Accent | `#22d3ee` (cyan) |
| Success | `#34d399` (green) |
| Background | `#0a0a0f` (near black) |
| Font Display | Syne (bold, geometric) |
| Font Body | DM Sans (clean, readable) |

## 🔧 Customization

### Add more projects
Edit `js/data.js` → `SH.projects` array:
```js
{
  id: 7,
  title: 'Your Project Name',
  desc: 'Short description',
  tags: ['AI/ML', 'Web Dev'],
  status: 'open',          // 'open' | 'progress' | 'closed'
  members: ['A', 'B'],     // initials for avatars
  likes: 10,
  owner: 'Your Name',
  created: '1 day ago',
  lookingFor: ['Frontend Dev'],
  details: 'Longer description...'
}
```

### Add more ideas
Edit `js/data.js` → `SH.ideas` array similarly.

### Change color theme
Edit CSS variables in `css/style.css` under `:root { ... }`.

## 📱 Responsive
Works on mobile, tablet, and desktop.

---
Built with vanilla HTML, CSS, and JavaScript. No frameworks required.
