# CodeStash 📦

### A Production-Grade Code Snippet Platform for Modern Developers

> **CodeStash is a full-stack, security-aware, feature-rich code snippet management platform** built to demonstrate real-world engineering skills: authentication, authorization, admin tooling, scalability, and polished UX.

**Designed, built, and deployed as a portfolio-ready application** — not a demo.

---

## 🔗 Live Demo

**[https://codestash-three.vercel.app/](https://codestash-three.vercel.app/)**

> ⚠️ Demo availability may be limited due to free-tier hosting constraints.

---

## 🎯 Why CodeStash Exists

Developers constantly rewrite the same logic across projects.
CodeStash solves this by providing a **centralized, searchable, and shareable snippet library** with:

- Strong authentication & authorization
- Real admin moderation tools
- Scalable data modeling
- Production-level UX & security considerations

This project was built to reflect **how real SaaS products are engineered**, not just how they look.

---

### 🔐 Authentication & Authorization

- Email/password + OAuth (GitHub, Google) via Supabase Auth
- Middleware-based route protection (App Router)
- Email verification & password recovery flows
- Admin access enforced via **server-side role validation**
- **Multi-Factor Authentication (MFA)** support

### 🛡️ Security & Abuse Prevention

- PostgreSQL **Row Level Security (RLS)** across all tables
- **IP Capture:** Stores `last_ip` on login for moderation and ban enforcement
- Rate limiting on sensitive endpoints
- Temporary & permanent user bans
- Service role key restricted to **Server Actions only**

### 🧑‍💼 Admin Console (Not a Mock)

> 🔒 Admin features are restricted to authorized accounts only.

A fully functional admin panel built with real moderation workflows:

- **User Management:** View users and execute bans based on captured IP/behavior.
- **Content Moderation:** Global snippet oversight.
- **Announcements:** System-wide banner system (Info / Warning / Critical).
- **Analytics:** Dashboard visualizing platform usage and growth.

---

## 🧩 Core Product Features

### 📦 Snippet Management

- Create, edit, and manage code snippets
- Multi-language support with syntax highlighting
- **Public / Private visibility toggles**
- Rich text descriptions

### 🏆 Dynamic Gamification

- **Rank System:** Users automatically earn titles based on their contribution count.
  - _Stash Explorer_ (New)
  - _Contributor_ (1+ snippets)
  - _Library Builder_ (10+ snippets)
  - _Code Architect_ (20+ snippets)
- **Badges:** Visual indicators for profile achievements.

### 🔍 Organization & Discovery

- Full-text search across titles and descriptions
- Language-based filtering
- Sorting by date and popularity
- Favorites system (likes)
- Public creator profiles (`/u/[username]`)

---

## 🎨 UX & Frontend Architecture

- **Mobile-First Design:** Responsive layout with bottom-sheet navigation for mobile.
- **Dark Mode:** Persistent theme state via `next-themes`.
- **Feature-First Architecture:** Code organized by domain (`features/auth`, `features/snippets`) for scalability.
- **Polished UI:** Built with Shadcn UI + Tailwind CSS for a consistent, accessible design system.

---

## 🖼️ Screenshots

### Desktop

| Auth                                          | Home                                         | Library                                         |
| --------------------------------------------- | -------------------------------------------- | ----------------------------------------------- |
| ![Login](https://i.ibb.co/4gw9qQWN/image.png) | ![Home](https://i.ibb.co/mVzMx9Rk/image.png) | ![Library](https://i.ibb.co/spwm4Kp1/image.png) |

| Profile                                         | Admin Dashboard                               |
| ----------------------------------------------- | --------------------------------------------- |
| ![Profile](https://i.ibb.co/ynWN1dzb/image.png) | ![Admin](https://i.ibb.co/5gjn95V7/image.png) |

---

## 🧱 Tech Stack

| Layer     | Tech                    | Why                                  |
| --------- | ----------------------- | ------------------------------------ |
| Framework | Next.js 16 (App Router) | Server Actions, routing, scalability |
| Language  | TypeScript              | Type safety across client & server   |
| Backend   | Supabase                | Auth, DB, Storage, RLS               |
| Database  | PostgreSQL              | Relational modeling, security        |
| Styling   | Tailwind + Shadcn       | Fast iteration, design consistency   |
| Forms     | React Hook Form + Zod   | Validation & DX                      |
| Charts    | Recharts                | Admin analytics                      |
| Icons     | Lucide React            | Lightweight & modern                 |

---

## 🗄️ Data Model & Architecture

- **Users ↔ Snippets** (1-to-many relationship)
- **RLS Policies:** Strictly enforce that users can only edit/delete their own data.
- **Admin Logic:** Server-side checks ensure only authorized personnel can access the `/admin` routes.
- **Storage:** Bucket isolation guarantees users can only upload avatars to their designated folders.

---

## ⚡ Getting Started (Local Development)

### Clone & Install

```bash
git clone https://github.com/chkimas/codestash.git
cd codestash
pnpm install

```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

```

> ⚠️ The service role key is required for admin actions (like banning users) and must never be exposed to the client.

---

## 🛠️ Database Setup (Supabase)

Run the following SQL queries in your Supabase SQL Editor to initialize the database schema.

### 1. Profiles & Auth Sync

Creates a public profile for every user and keeps it in sync with Supabase Auth.

```sql
-- Create Profiles Table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  username text unique,
  image text,
  bio text,
  website text,
  last_ip text,                 -- For Admin IP Ban/Tracking
  is_banned boolean default false,
  banned_until timestamptz,
  created_at timestamptz default now()
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, image, username)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'user_name'
  ) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

```

### 2. Core Tables (Snippets & Likes)

```sql
create table public.snippets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  code text not null,
  language text not null,
  description text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  snippet_id uuid references public.snippets(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, snippet_id)
);

```

### 3. Admin & Analytics Features

```sql
-- Announcements System
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  message text not null,
  type text default 'info', -- 'info', 'warning', 'critical'
  is_active boolean default false,
  created_at timestamptz default now()
);

-- Trending Search Stats
create table public.search_stats (
  term text not null primary key,
  count integer null default 1,
  last_searched_at timestamp with time zone null default now()
);

create index if not exists idx_search_stats_count on public.search_stats using btree (count desc);

```

```

```

---

## 📁 Project Structure

```bash
├── app/
│   ├── (main)/        # Core app routes (Layouts, Pages)
│   ├── admin/         # Protected Admin Console
│   ├── (auth)/        # Auth UI (Login, Register, Forgot Password)
│   └── auth/          # Auth API Routes (OAuth Callbacks)
├── features/          # Domain-driven features (Logic + Components)
│   ├── snippets/
│   ├── auth/
│   └── settings/
├── components/        # Shared UI Components
│   └── ui/            # Shadcn primitives (Button, Input, etc.)
├── lib/               # Utilities & Supabase Clients
├── types/             # Global Type Definitions
└── public/            # Static assets
```

---

## 🧪 What This Project Demonstrates

- **Real-World Auth:** Handling MFA, password resets, and secure sessions.
- **Backend Security:** Implementing Row Level Security (RLS) correctly.
- **Architecture:** Organizing code for maintainability (Feature-First).
- **Admin Tooling:** Building tools for platform operators, not just end-users.

**This is not a tutorial project. It’s a SaaS-grade system.**

---

## 🤝 Contributing

Contributions are welcome.
Open an issue or submit a PR following standard Git workflows.

---

## 📄 License

This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for details.
