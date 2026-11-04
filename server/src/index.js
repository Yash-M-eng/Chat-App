import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { db, ME } from './data.js';

const app = express();
const PORT = process.env.PORT || 4000;
const FAIL_RATE = Number(process.env.FAIL_RATE ?? 0);

app.use(cors());
app.use(express.json());

app.use((_req, _res, next) => setTimeout(next, 150 + Math.random() * 350));

app.use((req, res, next) => {
  if (req.method !== 'GET' && Math.random() < FAIL_RATE) {
    return res.status(503).json({ message: 'Simulated network failure' });
  }
  next();
});

const findConversation = (id) => db.conversations.find((c) => c.id === id);
const findMessage = (id) => {
  for (const list of Object.values(db.messages)) {
    const m = list.find((x) => x.id === id);
    if (m) return m;
  }
  return null;
};
const withLastMessage = (c) => ({ ...c, lastMessage: db.messages[c.id]?.at(-1) ?? null });
const notFound = (res, what) => res.status(404).json({ message: `${what} not found` });

app.get('/api/me', (_req, res) => res.json(db.users.find((u) => u.id === ME)));
app.get('/api/users', (_req, res) => res.json(db.users));

app.get('/api/conversations', (_req, res) => {
  const list = db.conversations
    .map(withLastMessage)
    .sort((a, b) => (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? ''));
  res.json(list);
});

app.post('/api/conversations/:id/read', (req, res) => {
  const c = findConversation(req.params.id);
  if (!c) return notFound(res, 'Conversation');
  c.unreadCount = 0;
  res.json(withLastMessage(c));
});

app.get('/api/conversations/:id/messages', (req, res) => {
  const all = db.messages[req.params.id];
  if (!all) return notFound(res, 'Conversation');
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  let end = all.length;
  if (req.query.before) {
    const idx = all.findIndex((m) => m.id === req.query.before);
    if (idx >= 0) end = idx;
  }
  const start = Math.max(0, end - limit);
  res.json({ messages: all.slice(start, end), hasMore: start > 0 });
});

app.post('/api/conversations/:id/messages', (req, res) => {
  const list = db.messages[req.params.id];
  if (!list) return notFound(res, 'Conversation');
  const { text, replyToId = null, clientId, senderId = ME } = req.body ?? {};
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ message: 'Text is required' });
  }
  const message = {
    id: randomUUID(),
    clientId,
    conversationId: req.params.id,
    senderId,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    editedAt: null,
    deleted: false,
    replyToId,
    status: 'sent',
    reactions: [],
  };
  list.push(message);
  res.status(201).json(message);
});

app.patch('/api/messages/:id', (req, res) => {
  const m = findMessage(req.params.id);
  if (!m) return notFound(res, 'Message');
  if (m.senderId !== ME) return res.status(403).json({ message: 'Can only edit your own messages' });
  const text = req.body?.text?.trim();
  if (!text) return res.status(400).json({ message: 'Text is required' });
  Object.assign(m, { text, editedAt: new Date().toISOString() });
  res.json(m);
});

app.delete('/api/messages/:id', (req, res) => {
  const m = findMessage(req.params.id);
  if (!m) return notFound(res, 'Message');
  if (m.senderId !== ME) return res.status(403).json({ message: 'Can only delete your own messages' });
  Object.assign(m, { deleted: true, text: '', reactions: [] });
  res.json(m);
});

app.post('/api/messages/:id/reactions', (req, res) => {
  const m = findMessage(req.params.id);
  if (!m) return notFound(res, 'Message');
  const { emoji } = req.body ?? {};
  if (!emoji) return res.status(400).json({ message: 'Emoji is required' });
  const r = m.reactions.find((x) => x.emoji === emoji);
  if (!r) m.reactions.push({ emoji, userIds: [ME] });
  else if (r.userIds.includes(ME)) r.userIds = r.userIds.filter((u) => u !== ME);
  else r.userIds.push(ME);
  m.reactions = m.reactions.filter((x) => x.userIds.length > 0);
  res.json(m);
});

app.post('/api/conversations/:id/members', (req, res) => {
  const c = findConversation(req.params.id);
  if (!c || c.type !== 'group') return notFound(res, 'Group');
  const { userId } = req.body ?? {};
  if (!db.users.some((u) => u.id === userId)) return notFound(res, 'User');
  if (!c.memberIds.includes(userId)) c.memberIds.push(userId);
  res.json(withLastMessage(c));
});

app.delete('/api/conversations/:id/members/:userId', (req, res) => {
  const c = findConversation(req.params.id);
  if (!c || c.type !== 'group') return notFound(res, 'Group');
  c.memberIds = c.memberIds.filter((id) => id !== req.params.userId);
  c.adminIds = c.adminIds.filter((id) => id !== req.params.userId);
  res.json(withLastMessage(c));
});

app.listen(PORT, () => console.log(`Mock API running on http://localhost:${PORT}`));
