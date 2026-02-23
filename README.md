# NotionClone — A Block-Based Note Taking App

A minimal, modern block-based note-taking application inspired by Notion. Built as a real-world full-stack project using Next.js 16 with MongoDB, featuring JWT authentication and a clean, extensible block editor architecture.

---

## Why This Project Exists

This project serves as a practical, intern-level full-stack application that demonstrates:

- **JWT-based authentication** — Simple, explicit auth flow without OAuth or third-party providers
- **Block-based content architecture** — The foundation of modern note-taking apps like Notion, Craft, and Coda
- **Auto-save functionality** — A seamless UX pattern that eliminates manual save actions
- **Extensible editor design** — Simple textarea/input blocks now, easily replaceable with TipTap later
- **Full-stack Next.js** — Using App Router for both frontend and API routes (MERN-aligned)

The goal is to build a functional MVP that can be extended into a more feature-rich application over time.

---

## MVP Feature List

### Authentication
- [x] User signup with email and password
- [x] User login with JWT token generation
- [x] Protected routes requiring valid JWT
- [x] Token stored in HTTP-only cookie or localStorage
- [x] No OAuth, NextAuth, or third-party auth providers

### Pages
- [x] Create a new page with a title
- [x] List all pages belonging to the logged-in user in a sidebar
- [x] Open/select a page to view its content
- [x] Delete a page (and its associated blocks)

### Blocks
- [x] Text block — basic paragraph content
- [x] Heading block — styled as H1/H2/H3
- [x] Add new blocks to a page
- [x] Edit block content inline
- [x] Delete a block
- [x] Auto-save block changes (debounced, no save button)

### UI/UX
- [x] Dark theme with glassmorphism design
- [x] Sidebar navigation for pages
- [x] Main content area for blocks
- [x] Responsive layout for desktop (mobile optimization is post-MVP)

---

## Tech Stack

| Layer           | Technology                              |
|-----------------|------------------------------------------|
| **Framework**   | Next.js 16 (App Router)                  |
| **Frontend**    | React 18 (via Next.js)                   |
| **Backend**     | Next.js API Routes                       |
| **Styling**     | Tailwind CSS (glassmorphism, dark theme) |
| **Database**    | MongoDB + Mongoose                       |
| **Auth**        | JWT (JSON Web Tokens) — no OAuth/NextAuth|

> **Note:** This project follows the MERN stack concept (MongoDB, Express-style routing, React, Node.js), but implements both frontend and backend within Next.js 16 using App Router and API routes instead of a separate Express server.

---

## Technical Assumptions

1. **Next.js 16 App Router** — Both frontend pages and API routes are handled within a single Next.js application. No separate Express server.

2. **JWT-only authentication** — Auth is implemented manually using JWT. Tokens are signed server-side and verified on protected API routes. No OAuth, NextAuth, or third-party auth libraries.

3. **Single-user workspace** — Each user has their own isolated set of pages. No sharing, collaboration, or team workspaces.

4. **Swappable editor architecture** — The MVP uses simple `<textarea>` and `<input>` components for block editing. However, block rendering and block state management are abstracted into dedicated components and hooks, so that a rich-text editor like **TipTap** can be swapped in later without changing:
   - Backend schema
   - API routes
   - Auto-save logic

5. **Blocks are ordered** — Each block has an `order` field to maintain sequence within a page.

6. **Auto-save uses debouncing** — Changes are saved 500–1000ms after the user stops typing, reducing API calls.

---

## High-Level Data Model

### Collections Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                           USERS                                 │
│  _id, email, passwordHash, createdAt                            │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ 1:N
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                           PAGES                                 │
│  _id, userId (ref), title, createdAt, updatedAt                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ 1:N
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                           BLOCKS                                │
│  _id, pageId (ref), type, content, order, createdAt, updatedAt  │
└─────────────────────────────────────────────────────────────────┘
```

### Collection Details

#### `users`
| Field         | Type     | Description                          |
|---------------|----------|--------------------------------------|
| `_id`         | ObjectId | Primary key                          |
| `email`       | String   | Unique, indexed                      |
| `passwordHash`| String   | bcrypt-hashed password               |
| `createdAt`   | Date     | Account creation timestamp           |

#### `pages`
| Field       | Type     | Description                            |
|-------------|----------|----------------------------------------|
| `_id`       | ObjectId | Primary key                            |
| `userId`    | ObjectId | Reference to `users._id`               |
| `title`     | String   | Page title (shown in sidebar)          |
| `createdAt` | Date     | Page creation timestamp                |
| `updatedAt` | Date     | Last modification timestamp            |

#### `blocks`
| Field       | Type     | Description                            |
|-------------|----------|----------------------------------------|
| `_id`       | ObjectId | Primary key                            |
| `pageId`    | ObjectId | Reference to `pages._id`               |
| `type`      | String   | `"text"` or `"heading"`                |
| `content`   | String   | The actual text content                |
| `order`     | Number   | Position within the page (0, 1, 2...)  |
| `createdAt` | Date     | Block creation timestamp               |
| `updatedAt` | Date     | Last modification timestamp            |

> **Note:** For heading blocks, an optional `level` field (1, 2, or 3) can be added to distinguish H1/H2/H3. For MVP, we use `type` values like `"heading1"`, `"heading2"`, `"heading3"`.

---

## Basic User Flow

### 1. Authentication Flow

```
┌──────────────┐      POST /api/auth/signup       ┌──────────────┐
│   Signup     │ ──────────────────────────────▶  │  Next.js API │
│   Form       │                                  │   Route      │
│              │  ◀────────────────────────────── │              │
│              │      { token, user }             │  Creates     │
└──────────────┘                                  │  User + JWT  │
                                                  └──────────────┘

┌──────────────┐      POST /api/auth/login        ┌──────────────┐
│   Login      │ ──────────────────────────────▶  │  Next.js API │
│   Form       │                                  │   Route      │
│              │  ◀────────────────────────────── │              │
│              │      { token, user }             │  Validates   │
└──────────────┘                                  │  + Signs JWT │
                                                  └──────────────┘
```

- JWT is signed using a secret stored in environment variables
- Token is stored client-side (localStorage or HTTP-only cookie)
- All protected API routes verify the JWT before processing requests

---

### 2. Loading a Page

```
User clicks page       GET /api/pages/:pageId        Render blocks
in sidebar        ──────────────────────────────▶   in editor
      │                                                  │
      │                                                  ▼
      │           ◀─────────────────────────────  [ Block 1 ]
      │                 { page, blocks }          [ Block 2 ]
      │                                           [ Block 3 ]
```

**API Response Example:**
```json
{
  "page": {
    "_id": "abc123",
    "title": "My First Page"
  },
  "blocks": [
    { "_id": "b1", "type": "heading1", "content": "Welcome", "order": 0 },
    { "_id": "b2", "type": "text", "content": "This is a paragraph.", "order": 1 }
  ]
}
```

---

### 3. Auto-Save Flow

```
User types in       Debounce           PATCH /api/blocks/:blockId       Update DB
a block         ───────────────▶   ─────────────────────────────▶   ───────────────
   │               (500ms)                                               │
   │                                                                     ▼
   │            ◀──────────────────────────────────────────────   { success: true }
   │                        (silent, no UI feedback)
```

**Key Points:**
- No "Save" button in the UI
- Changes are debounced (wait until user stops typing for ~500ms)
- Backend receives `{ content: "updated text" }` and updates the block
- Optionally show a subtle "Saving..." / "Saved" indicator

---

## Editor Architecture

The MVP block editor is intentionally simple, using native HTML elements:

```
┌─────────────────────────────────────────────────────────────────┐
│                        BlockEditor                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  useBlocks() hook — manages block state, order, CRUD ops  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│       ┌───────────┐   ┌───────────┐   ┌───────────┐            │
│       │ TextBlock │   │HeadingBlock│  │ AddBlock  │            │
│       │ <textarea>│   │  <input>  │   │  Button   │            │
│       └───────────┘   └───────────┘   └───────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### Abstraction for Future TipTap Integration

| Layer              | MVP Implementation     | Future (TipTap)            |
|--------------------|------------------------|----------------------------|
| Block component    | `<textarea>` / `<input>` | TipTap `<EditorContent>` |
| Content format     | Plain text string      | TipTap JSON or HTML        |
| State management   | `useBlocks()` hook     | Same hook (unchanged)      |
| Auto-save trigger  | `onChange` + debounce  | Same logic (unchanged)     |
| Backend schema     | `content: String`      | Same (store JSON as string)|

> **Swap-in strategy:** Replace only the `TextBlock` and `HeadingBlock` components with TipTap-based components. The `useBlocks()` hook, API calls, and backend remain unchanged.

---

## Project Structure

```
notionclone/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   │   └── page.jsx
│   │   └── signup/
│   │       └── page.jsx
│   ├── (dashboard)/              # Protected route group
│   │   ├── layout.jsx            # Sidebar + main layout
│   │   └── page/
│   │       └── [id]/
│   │           └── page.jsx      # Page editor view
│   ├── api/                      # API routes (backend)
│   │   ├── auth/
│   │   │   ├── signup/
│   │   │   │   └── route.js
│   │   │   ├── login/
│   │   │   │   └── route.js
│   │   │   └── me/
│   │   │       └── route.js
│   │   ├── pages/
│   │   │   ├── route.js          # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       └── route.js      # GET, PATCH, DELETE
│   │   └── blocks/
│   │       ├── route.js          # POST (create)
│   │       └── [id]/
│   │           └── route.js      # PATCH, DELETE
│   ├── layout.jsx                # Root layout
│   └── page.jsx                  # Landing/home page
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Base components (Button, Input, Card)
│   ├── blocks/                   # Block components (TextBlock, HeadingBlock)
│   ├── Sidebar.jsx
│   └── BlockEditor.jsx
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.js
│   ├── useBlocks.js
│   └── useDebounce.js
│
├── lib/                          # Utilities and helpers
│   ├── db.js                     # MongoDB connection
│   ├── auth.js                   # JWT sign/verify helpers
│   └── api.js                    # Fetch wrapper for API calls
│
├── models/                       # Mongoose schemas
│   ├── User.js
│   ├── Page.js
│   └── Block.js
│
├── middleware.js                 # Next.js middleware (route protection)
├── tailwind.config.js
├── next.config.js
├── .env.example
├── package.json
└── README.md
```

---

## API Endpoints

All API routes are implemented as Next.js API routes under `/app/api/`.

### Auth
| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| POST   | `/api/auth/signup`  | Register a new user      |
| POST   | `/api/auth/login`   | Login and receive JWT    |
| GET    | `/api/auth/me`      | Get current user profile |

### Pages
| Method | Endpoint            | Description                     |
|--------|---------------------|---------------------------------|
| GET    | `/api/pages`        | List all pages for current user |
| POST   | `/api/pages`        | Create a new page               |
| GET    | `/api/pages/:id`    | Get a single page with blocks   |
| PATCH  | `/api/pages/:id`    | Update page title               |
| DELETE | `/api/pages/:id`    | Delete page and its blocks      |

### Blocks
| Method | Endpoint            | Description                     |
|--------|---------------------|---------------------------------|
| POST   | `/api/blocks`       | Create a new block in a page    |
| PATCH  | `/api/blocks/:id`   | Update block content/type       |
| DELETE | `/api/blocks/:id`   | Delete a block                  |

---

## UI Design Guidelines

### Theme: Dark Glassmorphism

- **Background:** Deep charcoal (`#0f0f0f` to `#1a1a2e`)
- **Glass panels:** Semi-transparent with blur (`bg-white/5 backdrop-blur-md`)
- **Borders:** Subtle, soft borders (`border border-white/10`)
- **Text:** Light gray to white (`text-gray-100`, `text-white`)
- **Accent:** Minimal — a single accent color for interactive elements (e.g., `#6366f1` indigo)

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│  ┌──────────┐                                                  │
│  │  Logo    │                Header (optional)                 │
│  └──────────┘                                                  │
├──────────────┬─────────────────────────────────────────────────┤
│              │                                                 │
│   Sidebar    │              Main Content Area                  │
│              │                                                 │
│  ┌────────┐  │   ┌───────────────────────────────────────┐     │
│  │ Page 1 │  │   │  Page Title                           │     │
│  ├────────┤  │   ├───────────────────────────────────────┤     │
│  │ Page 2 │  │   │  [ Heading Block ]                    │     │
│  ├────────┤  │   │  [ Text Block ]                       │     │
│  │ Page 3 │  │   │  [ Text Block ]                       │     │
│  └────────┘  │   │  [ + Add Block ]                      │     │
│              │   └───────────────────────────────────────┘     │
│  [+ New Page]│                                                 │
│              │                                                 │
└──────────────┴─────────────────────────────────────────────────┘
```

---

## Getting Started

```bash
# Navigate to project directory
cd notionclone

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret:
# MONGODB_URI=mongodb://localhost:27017/notionclone
# JWT_SECRET=your-secret-key

# Run development server
npm run dev
# App runs on http://localhost:3000
```

---

## Out of Scope for MVP

The following features are intentionally excluded to keep the MVP focused:

- ❌ Collaboration / real-time editing
- ❌ Sharing pages publicly or with other users
- ❌ Image/media blocks
- ❌ Drag-and-drop block reordering
- ❌ Nested pages / sub-pages
- ❌ Rich-text formatting within blocks (bold, italic, etc.) — *deferred to TipTap integration*
- ❌ Mobile-optimized UI
- ❌ Full-text search
- ❌ Version history / undo
- ❌ OAuth, NextAuth, or third-party authentication

---

## Future Enhancements

After MVP completion, the following can be added incrementally:

1. **TipTap Integration** — Replace textarea/input blocks with TipTap for rich-text editing
2. **Block Reordering** — Drag-and-drop with libraries like `@dnd-kit`
3. **More Block Types** — Images, code blocks, lists, to-dos
4. **Real-time Collaboration** — Using WebSockets or Liveblocks
5. **Mobile UI** — Responsive design for tablet and phone

---

## License

MIT

---

*Built with ☕ and curiosity.*
