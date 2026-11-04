export const ME = 'me';

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const avatar = (id) => `https://i.pravatar.cc/150?u=${id}`;

const users = [
  { id: ME, name: 'Alex Carter', avatar: avatar(ME), status: 'online' },
  { id: 'u2', name: 'Priya Sharma', avatar: avatar('u2'), status: 'online' },
  { id: 'u3', name: 'Rahul Verma', avatar: avatar('u3'), status: 'away' },
  { id: 'u4', name: 'Emma Wilson', avatar: avatar('u4'), status: 'offline' },
  { id: 'u5', name: 'Karan Mehta', avatar: avatar('u5'), status: 'online' },
  { id: 'u6', name: 'Sofia Lopez', avatar: avatar('u6'), status: 'offline' },
  { id: 'u7', name: 'David Kim', avatar: avatar('u7'), status: 'online' },
  { id: 'u8', name: 'Neha Joshi', avatar: avatar('u8'), status: 'away' },
].map((u) => (u.status === 'online' ? u : { ...u, lastSeen: new Date(Date.now() - rand() * 864e5).toISOString() }));

const texts = [
  'Hey! How is it going?',
  'Did you check the PR?',
  'Sounds good 👍',
  'Can we sync at 4?',
  'I pushed the fix, please review.',
  'Lunch?',
  'The build is green now 🎉',
  'Let me look into it.',
  'Thanks a lot!',
  'Will update the ticket shortly.',
  'On my way.',
  'Haha that is hilarious 😂',
  'Can you share the Figma link?',
  'Deploying to staging now.',
  'Agreed.',
];

function makeMessages(conversationId, memberIds, count, spacingMin) {
  const now = Date.now();
  const list = [];
  for (let i = 0; i < count; i++) {
    const senderId = pick(memberIds);
    list.push({
      id: `${conversationId}-m${i}`,
      conversationId,
      senderId,
      text: pick(texts),
      createdAt: new Date(now - (count - i) * spacingMin * 60_000).toISOString(),
      editedAt: null,
      deleted: false,
      replyToId: i > 3 && rand() < 0.08 ? `${conversationId}-m${i - 2}` : null,
      status: 'read',
      reactions: rand() < 0.1 ? [{ emoji: pick(['👍', '❤️', '😂']), userIds: [pick(memberIds)] }] : [],
    });
  }
  return list;
}

const conversations = [
  { id: 'c1', type: 'direct', memberIds: [ME, 'u2'], adminIds: [], unreadCount: 2 },
  { id: 'c2', type: 'direct', memberIds: [ME, 'u3'], adminIds: [], unreadCount: 0 },
  {
    id: 'c3',
    type: 'group',
    name: 'Frontend Guild',
    description: 'All things UI',
    avatar: avatar('c3'),
    memberIds: [ME, 'u2', 'u3', 'u4', 'u5'],
    adminIds: [ME],
    unreadCount: 5,
  },
  {
    id: 'c4',
    type: 'group',
    name: 'Weekend Trip ⛰️',
    description: 'Planning the trek',
    avatar: avatar('c4'),
    memberIds: [ME, 'u5', 'u6', 'u7'],
    adminIds: ['u5'],
    unreadCount: 0,
  },
  { id: 'c5', type: 'direct', memberIds: [ME, 'u4'], adminIds: [], unreadCount: 0 },
  { id: 'c6', type: 'direct', memberIds: [ME, 'u7'], adminIds: [], unreadCount: 1 },
  { id: 'c7', type: 'direct', memberIds: [ME, 'u8'], adminIds: [], unreadCount: 0 },
];

const messages = {
  c1: makeMessages('c1', [ME, 'u2'], 60, 90),
  c2: makeMessages('c2', [ME, 'u3'], 10_000, 8),
  c3: makeMessages('c3', conversations[2].memberIds, 120, 45),
  c4: makeMessages('c4', conversations[3].memberIds, 40, 180),
  c5: [],
  c6: makeMessages('c6', [ME, 'u7'], 15, 300),
  c7: makeMessages('c7', [ME, 'u8'], 25, 600),
};

export const db = { users, conversations, messages };
