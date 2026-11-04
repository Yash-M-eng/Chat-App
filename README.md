# Chat App

A chat application built for the Senior Frontend Developer take-home assignment. It works like a simplified WhatsApp Web: a list of chats on the left, the open conversation on the right, and a group info panel for group chats.

There is no real backend. A small Express server in the `server` folder returns mock data and keeps changes in memory, so things like edits, deletes and reactions stay until the server restarts. Incoming messages, typing indicators and message status changes are simulated on the frontend.

## Tech stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- Redux Toolkit for state
- React Hook Form for the message input and the add member form
- Lucide icons
- date-fns for dates
- Vitest + React Testing Library for tests
- Express for the mock API

## Getting started

You need Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

`npm install` in the root folder also installs the `server` and `client` packages. `npm run dev` starts both:

- App: http://localhost:5173
- Mock API: http://localhost:4000

Vite proxies every `/api` request to the Express server, so the frontend only calls relative URLs like `/api/conversations`.

### Other commands

```bash
npm test          # run the unit tests once
npm run build     # type check and build the client

cd client
npm test          # run tests in watch mode
```

To see how the app handles failed requests, start the server with a failure rate. For example, 30% of create/update/delete requests will fail:

```bash
FAIL_RATE=0.3 npm --prefix server run dev
```

On Windows (PowerShell): `$env:FAIL_RATE=0.3; npm --prefix server run dev`

## Features

**Sidebar**
- List of conversations sorted by the latest message
- Profile pictures with online / away / offline status
- Last message preview with time and an unread badge
- Search (debounced) and filters for All, Unread and Groups
- Shows "typing..." when someone is typing in that chat

**Chat window**
- Messages grouped by date (Today, Yesterday, then the full date)
- Optimistic sending: the message shows right away with a clock icon, then sent, delivered and read ticks
- Failed messages show a retry button
- Replies with a quoted preview (click the quote to jump to the original message)
- Edit, delete, copy and emoji reactions from the message menu
- Typing indicator in the header and at the bottom of the chat
- Auto scroll to the newest message when you are already at the bottom or when you send a message. If you scrolled up, a "New messages" button shows up instead
- "Load older messages" button for long chats (messages load 50 at a time)
- Search inside the open chat

**Groups**
- Group info panel with description, member list and member status
- Add and remove members (saved in the mock server)

**General**
- Responsive: one panel at a time on mobile, two columns on tablet, and the group panel on the side on desktop
- Loading skeletons, empty states and error states with a retry button
- Light and dark theme, saved in localStorage

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| Enter | Send the message (or save when editing) |
| Shift + Enter | New line |
| Esc | Cancel the reply or edit, close the message menu, close chat search |

## Things to try

- Open **Rahul Verma**. This chat has 10,000 messages; use "Load older messages" to page back through them.
- Open **Emma Wilson** to see the empty chat state.
- Send a message in any chat. After it is read, the other person sometimes starts typing and replies.
- Wait around 20 seconds. A random person will start typing and send a message, and the unread badge updates if that chat is not open.
- Stop the server and reload the page to see the error state, then start it again and press "Try again".

## Project structure

```
chat-app/
├── client/
│   └── src/
│       ├── app/              store, typed hooks, ui slice, App and layout
│       ├── features/
│       │   ├── users/        users slice
│       │   ├── conversations/ sidebar components, slice, selectors, helpers
│       │   ├── chat/         chat window components, messages slice, thunks for sending and simulation
│       │   ├── groups/       group info panel
│       │   └── theme/        theme toggle and the hook that applies it
│       ├── services/         API calls (fetch)
│       ├── shared/           reusable components, hooks and utils
│       ├── types/            TypeScript models
│       └── test/             test setup and helpers
├── server/
│   └── src/
│       ├── data.js           mock users, conversations and messages
│       └── index.js          Express routes
└── docs/
    └── ARCHITECTURE.md
```

More details about the architecture and state management are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Tests

Tests sit next to the files they cover. They check:

- The messages slice: optimistic send, replacing the temporary message, failed state, incoming messages
- Conversation selectors: unread and group filters, search
- `MessageInput`: Enter sends, Shift + Enter adds a new line, empty messages are blocked, reply and edit banners
- `ConversationItem`: name, preview, unread badge, typing state
- `Avatar` and `useDebounce`

## Assumptions and trade-offs

- **No login.** The current user is always `me` (Alex Carter). The same id is used on the server.
- **No message virtualization.** Messages load 50 at a time and older ones load on demand. This keeps the DOM small for normal use without adding a library. If someone loads thousands of messages into one chat, a virtualized list would be the next step.
- **Chat search only looks at loaded messages.** A real app would search on the server.
- **Status ticks and replies are simulated in the browser.** The server only stores messages as `sent`. Delivered and read are changed on the client with timers.
- **Simulated incoming messages are saved through the API.** The POST message endpoint takes an optional `senderId` so the simulator can create messages from other users. This way you can react to or reply to them like normal messages.
- **Reactions, edits and deletes wait for the server.** Only sending a new message is optimistic.
- **Deleted messages are soft deleted** so replies to them still show "This message was deleted".
- **No persistence except the theme.** Data lives in the server memory and resets when the server restarts.
- Avatars come from pravatar.cc. If the image does not load, the initials are shown.

## What I would add with more time

- A virtualized message list for very long chats
- Saving messages in IndexedDB and an offline queue for unsent messages
- WebSockets instead of the timer based simulation
- Attachments with a local preview
- End to end tests with Playwright
