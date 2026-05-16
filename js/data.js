// ─── SHARED DATA STORE ───
window.SH = window.SH || {};

SH.tags = ['All', 'AI/ML', 'Web Dev', 'Mobile', 'Hardware', 'Health', 'Education', 'Finance', 'Social', 'Green Tech'];

SH.projects = [
  {
    id: 1, title: 'Campus Safety Bot',
    desc: 'An AI-powered chatbot that helps students report safety concerns and get emergency info instantly.',
    tags: ['AI/ML', 'Web Dev'], status: 'open',
    members: ['A','R','J','K','T'], likes: 47,
    owner: 'Arjun K.', created: '2 days ago',
    lookingFor: ['Backend Dev', 'ML Engineer'],
    details: 'We want to build a chatbot deployed on the campus portal that can handle safety queries, connect to emergency services, and use NLP to understand student reports. The AI component will classify reports and route them to appropriate departments.',
    contributeUrl: 'https://github.com/Bvs2006/StudentCollab/issues',
    demoUrl: 'https://bvs2006.github.io/StudentCollab/'
  },
  {
    id: 2, title: 'Alumni Network App',
    desc: 'A dedicated mobile app for alumni to connect with current students for mentorship and career guidance.',
    tags: ['Web Dev', 'Mobile'], status: 'progress',
    members: ['S','M','P'], likes: 38,
    owner: 'Sanya M.', created: '5 days ago',
    lookingFor: ['React Native Dev', 'UI Designer'],
    details: 'Built in React Native, this app bridges current students with alumni. Features: mentor matching, coffee chat scheduling, job board, and verified alumni profiles integrated with LinkedIn.',
    contributeUrl: 'https://github.com/Bvs2006/StudentCollab/issues',
    demoUrl: 'https://bvs2006.github.io/StudentCollab/'
  },
  {
    id: 3, title: 'Smart Study Desk',
    desc: 'IoT-enabled study desk that tracks posture, ambient light, and study sessions to optimize focus.',
    tags: ['Hardware', 'Health'], status: 'open',
    members: ['K','V'], likes: 29,
    owner: 'Karthik V.', created: '1 week ago',
    lookingFor: ['Hardware Eng', 'Embedded Systems', 'App Dev'],
    details: 'Using Raspberry Pi and various sensors, we build a desk attachment that monitors posture via camera (privacy-safe, on-device), light levels, and tracks focused vs distracted time. Data syncs to a companion app.',
    contributeUrl: 'https://github.com/Bvs2006/StudentCollab/issues',
    demoUrl: 'https://bvs2006.github.io/StudentCollab/'
  },
  {
    id: 4, title: 'Wellness Tracker for Students',
    desc: 'Mental health and wellness app designed specifically for the student lifestyle — stress, sleep, diet tracking.',
    tags: ['Health', 'Mobile'], status: 'open',
    members: ['J','L','N','A','B','C'], likes: 62,
    owner: 'Jaya L.', created: '3 days ago',
    lookingFor: ['Flutter Dev', 'UX Researcher'],
    details: 'A compassionate wellness companion for college students. Tracks mood, sleep quality, study-life balance, and provides personalized recommendations. Integrates with Apple Health and Google Fit. Focus on privacy — no data leaves device.',
    contributeUrl: 'https://github.com/Bvs2006/StudentCollab/issues',
    demoUrl: 'https://bvs2006.github.io/StudentCollab/'
  },
  {
    id: 5, title: 'Peer Tutoring Marketplace',
    desc: 'Students can offer paid tutoring sessions in their strong subjects and find help in weak ones.',
    tags: ['Education', 'Web Dev'], status: 'progress',
    members: ['R','D','H'], likes: 44,
    owner: 'Riya D.', created: '2 weeks ago',
    lookingFor: ['Full-stack Dev'],
    details: 'A Fiverr-style platform but exclusively for peer tutoring within universities. Verified students post tutoring profiles, students book sessions, payment via Razorpay/Stripe. Rating system ensures quality.',
    contributeUrl: 'https://github.com/Bvs2006/StudentCollab/issues',
    demoUrl: 'https://bvs2006.github.io/StudentCollab/'
  },
  {
    id: 6, title: 'GreenCampus Energy Dashboard',
    desc: 'Real-time monitoring of campus energy usage to identify waste and promote sustainability initiatives.',
    tags: ['Green Tech', 'Web Dev'], status: 'open',
    members: ['P','Q'], likes: 21,
    owner: 'Priya G.', created: '4 days ago',
    lookingFor: ['Data Engineer', 'Frontend Dev', 'IoT'],
    details: 'Working with the campus facilities team to install smart meters and aggregate data into a public-facing dashboard. Students can see real-time consumption per building and track sustainability goals.',
    contributeUrl: 'https://github.com/Bvs2006/StudentCollab/issues',
    demoUrl: 'https://bvs2006.github.io/StudentCollab/'
  }
];

SH.ideas = [
  {
    id: 1, title: 'AI-Powered Hostel Room Allocation System',
    desc: 'Use preference-matching algorithms to allocate rooms based on student habits, sleep schedules, and interests.',
    tags: ['AI/ML', 'Web Dev'], votes: 84,
    author: 'Mihir P.', time: '2 hours ago', comments: 12, voted: false
  },
  {
    id: 2, title: 'Collaborative Lecture Notes Platform',
    desc: 'Students contribute to a shared, structured notes database per course. Gamified with reputation points.',
    tags: ['Education', 'Web Dev'], votes: 71,
    author: 'Sneha R.', time: '5 hours ago', comments: 8, voted: false
  },
  {
    id: 3, title: 'Campus Food Waste Reduction App',
    desc: 'Track leftover food from canteens and connect it with student groups and NGOs to redistribute before waste.',
    tags: ['Green Tech', 'Mobile'], votes: 59,
    author: 'Tarun M.', time: '1 day ago', comments: 6, voted: false
  },
  {
    id: 4, title: 'Student Startup Legal Assistant',
    desc: 'An AI chatbot trained on Indian startup law to help student founders understand contracts, IP, and registration.',
    tags: ['AI/ML', 'Finance'], votes: 47,
    author: 'Ananya S.', time: '1 day ago', comments: 15, voted: false
  },
  {
    id: 5, title: 'Carpooling App for Students',
    desc: 'Match students from the same area for carpooling to reduce commute costs and emissions. Verified profiles only.',
    tags: ['Mobile', 'Social'], votes: 38,
    author: 'Rohan K.', time: '2 days ago', comments: 4, voted: false
  },
  {
    id: 6, title: 'Professor Rating & Feedback Platform',
    desc: 'Anonymous, constructive feedback system for professors — visible to both faculty and students.',
    tags: ['Education', 'Web Dev'], votes: 33,
    author: 'Divya T.', time: '3 days ago', comments: 9, voted: false
  },
  {
    id: 7, title: 'Sign Language Learning Game',
    desc: 'Interactive game using device camera to teach Indian Sign Language. Gamified levels and achievements.',
    tags: ['AI/ML', 'Education'], votes: 29,
    author: 'Kiran L.', time: '4 days ago', comments: 3, voted: false
  },
  {
    id: 8, title: 'Student Freelance Portfolio Builder',
    desc: 'A one-stop tool for students to build verified portfolios, showcase projects, and attract freelance clients.',
    tags: ['Web Dev', 'Social'], votes: 25,
    author: 'Pooja A.', time: '5 days ago', comments: 7, voted: false
  }
];

SH.tagColors = {
  'AI/ML': 'accent', 'Web Dev': 'cyan', 'Mobile': 'green',
  'Hardware': 'yellow', 'Health': 'green', 'Education': 'cyan',
  'Finance': 'yellow', 'Social': 'accent', 'Green Tech': 'green'
};

// Helpers
SH.getTagClass = (t) => ({ 'AI/ML': '', 'Web Dev': 'cyan', 'Mobile': 'green', 'Hardware': 'yellow', 'Health': 'green', 'Education': 'cyan', 'Finance': 'yellow', 'Social': '', 'Green Tech': 'green' }[t] || '');

SH.statusBadge = (s) => {
  const map = { open: ['badge-open', '● Open'], progress: ['badge-progress', '◐ In Progress'], closed: ['badge-closed', '● Closed'] };
  const [cls, label] = map[s] || map.open;
  return `<span class="badge ${cls}">${label}</span>`;
};

SH.avatarColors = ['#7c5cfc','#22d3ee','#34d399','#fbbf24','#f87171','#c084fc'];
SH.av = (letter, i) => `<span class="av" style="background:${SH.avatarColors[i % SH.avatarColors.length]}">${letter}</span>`;
