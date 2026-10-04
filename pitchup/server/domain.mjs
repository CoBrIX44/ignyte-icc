const generateId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36));

export const TYPES = ['Bowling', 'Batting', 'Fielding'];
export function weekStart(date = new Date()) {
  const d = new Date(date); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d;
}
export function dateKey(d = new Date()) { return d.toISOString().slice(0, 10); }
export function seed(now = new Date()) {
  const daysAgo = n => { const d = new Date(now); d.setUTCDate(d.getUTCDate() - n); return dateKey(d); };
  return {
    profile: { name: 'Aisha Mehta', initials: 'AM', role: 'Pace bowler', goal: 'Build a consistent T20 training routine', weeklySessions: 4, plannedBowling: 120, language: 'en' },
    activities: [
      { id: 'seed-1', type: 'Bowling', title: 'Finding my rhythm in the nets', date: daysAgo(5), duration: 45, balls: 48, effort: 6, notes: 'Working on a repeatable run-up. This reflection stays private.', shareWithCoach: true, visibility: 'club', review: 'Reviewed in the fictional demo', createdAt: now.toISOString() },
      { id: 'seed-2', type: 'Batting', title: 'Solid footwork against pace', date: daysAgo(3), duration: 30, balls: 36, effort: 5, notes: 'Focusing on front-foot defense.', shareWithCoach: false, visibility: 'private', review: null, createdAt: now.toISOString() },
      { id: 'seed-3', type: 'Fielding', title: 'Catching and high-ball drills', date: daysAgo(1), duration: 20, balls: 0, effort: 4, notes: 'Improving reaction time.', shareWithCoach: true, visibility: 'public', review: null, createdAt: now.toISOString() }
    ],
    cheers: [], challengeJoined: false, reports: [], hiddenPosts: []
  };
}

function number(value, name, min, max) { const n = Number(value); if (value === '' || value === null || !Number.isInteger(n) || n < min || n > max) throw new Error(`${name} must be a whole number between ${min} and ${max}.`); return n; }
function clean(value, max) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
export function validateActivity(input, now = new Date()) {
  if (!TYPES.includes(input.type)) throw new Error('Choose a supported activity.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date ?? '') || Number.isNaN(Date.parse(input.date)) || dateKey(new Date(input.date)) !== input.date || input.date > dateKey(now) || input.date < '2020-01-01') throw new Error('Choose a valid session date from 2020 through today.');
  const title = clean(input.title, 90); if (!title) throw new Error('Give your session a title.');
  return { id: generateId(), type: input.type, title, date: input.date, duration: number(input.duration, 'Duration', 1, 480), balls: ['Bowling','Batting'].includes(input.type) ? number(input.balls, 'Deliveries', 1, 600) : 0, effort: number(input.effort, 'Effort', 1, 10), notes: clean(input.notes, 1500), shareWithCoach: input.shareWithCoach === true, visibility: 'private', review: null, createdAt: now.toISOString() };
}
export function validateProfile(input) {
  const name = clean(input.name, 60); if (!name) throw new Error('Enter a display name.');
  if (!['Pace bowler','Spin bowler','Batter','All-rounder','Wicketkeeper'].includes(input.role)) throw new Error('Choose a cricket role.');
  const goal = clean(input.goal, 160); if (!goal) throw new Error('Enter a goal.');
  return { name, initials: name.split(/\s+/).slice(0,2).map(n => n[0]).join('').toUpperCase(), role: input.role, goal, weeklySessions: number(input.weeklySessions, 'Weekly sessions', 1, 14), plannedBowling: number(input.plannedBowling, 'Planned weekly deliveries', 0, 1000), language: input.language === 'hi' ? 'hi' : 'en' };
}
export function summary(activities, profile, now = new Date()) {
  const start = dateKey(weekStart(now)), end = dateKey(now);
  const current = activities.filter(a => a.date >= start && a.date <= end);
  const bowling = current.filter(a => a.type === 'Bowling').reduce((sum,a) => sum+a.balls,0);
  return { sessions: current.length, minutes: current.reduce((sum,a)=>sum+a.duration,0), bowling,
    days: Array.from({length:7},(_,i)=> {const d = weekStart(now); d.setUTCDate(d.getUTCDate()+i); const date=dateKey(d); return {date, minutes: current.filter(a=>a.date===date).reduce((sum,a)=>sum+a.duration,0)}; }),
    status: !current.length ? 'Start your record' : !profile.plannedBowling ? 'No bowling plan entered' : bowling > profile.plannedBowling ? 'Plan review suggested' : 'Your week, in perspective',
    explanation: !current.length ? 'Log a session to see a factual overview of your week.' : !profile.plannedBowling ? 'Your sessions are recorded. Add a bowling plan only if it is relevant to your role.' : bowling > profile.plannedBowling ? `You recorded ${bowling} bowling deliveries, ${bowling-profile.plannedBowling} above your entered weekly plan of ${profile.plannedBowling}. Discuss the difference with a qualified coach; this is not an injury-risk assessment.` : `You recorded ${bowling} of ${profile.plannedBowling} planned bowling deliveries this week. This compares your entries with your own plan; it is not a recommendation to add more training.`
  };
}
export function milestone(activity, profile) {
  return { id: activity.id, author: profile.name, initials: profile.initials, role: profile.role, type: activity.type, title: activity.title, date: activity.date, visibility: activity.visibility, summary: `Completed a ${activity.type.toLowerCase()} session as part of a personal cricket journey.`, owned: true, demo: true };
}
export function projectActivity(activity, perspective) {
  if (perspective === 'athlete') return {...activity};
  if (perspective === 'coach' && activity.shareWithCoach) { const {notes, ...allowed} = activity; return allowed; }
  return null;
}
export function demoPosts(today = dateKey()) {
  return [
    { id:'club-1', author:'Naina Rao', initials:'NR', role:'Batter', type:'Batting', title:'Small adjustments. A more confident cover drive.', date:today, visibility:'club', summary:'A practice milestone from the fictional Boundary Collective. Progress looks different for every player.', owned:false, demo:true },
    { id:'club-2', author:'Meera Shah', initials:'MS', role:'All-rounder', type:'Fielding', title:'Better together, one drill at a time.', date:today, visibility:'public', summary:'A fictional club update celebrating practice, connection, and showing up for each other.', owned:false, demo:true }
  ];
}
export function stateFor(db, perspective) {
  const personal = perspective === 'athlete';
  const posts = [...db.activities.filter(a => a.visibility === 'public' || (a.visibility === 'club' && perspective !== 'visitor')).map(a=>milestone(a,db.profile)), ...demoPosts().filter(p=>perspective!=='visitor'||p.visibility==='public')].filter(p=>!db.hiddenPosts.includes(p.id)).map(p=>({...p,cheered: db.cheers.includes(p.id)}));
  const activities = db.activities.map(a=>projectActivity(a,perspective)).filter(Boolean).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));
  return { perspective, profile: personal ? db.profile : {name:db.profile.name,initials:db.profile.initials,role:db.profile.role}, activities, posts, summary: personal? summary(db.activities,db.profile):null, challengeJoined:personal?db.challengeJoined:false, demo:true };
}
