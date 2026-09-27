const clubs = [
  {
    id: 1,
    name: 'IEEE Student Branch',
    category: 'Technical',
    description: 'Learn cutting-edge technologies and engineering practices',
    president: 'Rajesh Kumar',
    contact: 'ieee@srmramapuram.edu.in',
    upcomingEvents: 2,
  },
  {
    id: 2,
    name: 'Coding Club',
    category: 'Technical',
    description: 'Competitive programming and web development workshops',
    president: 'Priya Sharma',
    contact: 'coding@srmramapuram.edu.in',
    upcomingEvents: 3,
  },
  {
    id: 3,
    name: 'AI/ML Society',
    category: 'Technical',
    description: 'Artificial Intelligence and Machine Learning projects',
    president: 'Vikram Singh',
    contact: 'aiml@srmramapuram.edu.in',
    upcomingEvents: 1,
  },
  {
    id: 4,
    name: 'Cultural Committee',
    category: 'Cultural',
    description: 'Music, dance, drama, and other cultural events',
    president: 'Anjali Patel',
    contact: 'cultural@srmramapuram.edu.in',
    upcomingEvents: 5,
  },
  {
    id: 5,
    name: 'Sports Club',
    category: 'Sports',
    description: 'Football, cricket, basketball, and fitness activities',
    president: 'Arjun Verma',
    contact: 'sports@srmramapuram.edu.in',
    upcomingEvents: 4,
  },
  {
    id: 6,
    name: 'Photography Club',
    category: 'Cultural',
    description: 'Photography and visual arts workshops',
    president: 'Shweta Gupta',
    contact: 'photo@srmramapuram.edu.in',
    upcomingEvents: 2,
  },
];

const events = [
  {
    id: 1,
    title: 'Hackathon 2024',
    club: 'Coding Club',
    date: '2024-10-15',
    description: '24-hour coding competition',
  },
  {
    id: 2,
    title: 'Tech Talks Series',
    club: 'IEEE Student Branch',
    date: '2024-09-25',
    description: 'Industry experts sharing insights',
  },
  {
    id: 3,
    title: 'Annual Sports Championship',
    club: 'Sports Club',
    date: '2024-11-01',
    description: 'Inter-department sports competition',
  },
];

function getClubs(filters = {}) {
  let results = [...clubs];

  if (filters.category) {
    results = results.filter((club) => club.category === filters.category);
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    results = results.filter(
      (club) => club.name.toLowerCase().includes(search) || club.description.toLowerCase().includes(search)
    );
  }

  return results;
}

module.exports = {
  clubs,
  events,
  getClubs,
};
