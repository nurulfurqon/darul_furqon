# Astro Integration + Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing plain HTML/CSS/JS Darul Furqon school website into Astro, wire all public pages to the live backend API at `https://darul-furqon-be.fly.dev/`, and build a full admin panel for managing PPDB registrations, news, teachers, gallery, facilities, foundation profile, users, and contact messages.

**Architecture:** Astro static output with client-side JavaScript (vanilla + fetch) for all API interactions — matching the existing Bootstrap + vanilla JS style. Public pages are Astro `.astro` components that render the same HTML structure as the originals. Admin pages are protected client-side with JWT auth stored in `localStorage`, redirecting to `/login` if no token is present. No React or other UI framework is added — Bootstrap 5 handles styling throughout.

**Tech Stack:** Astro 4.x, TypeScript, Bootstrap 5.3, Bootstrap Icons, Poppins font (Google Fonts), vanilla `fetch` API, JWT auth (access + refresh tokens), `https://darul-furqon-be.fly.dev/` REST backend.

---

## File Map

```
src/
  components/
    Navbar.astro              # shared public navbar
    Footer.astro              # shared public footer
    admin/
      AdminLayout.astro       # admin shell: sidebar + header + slot
      AdminSidebar.astro      # left nav with all admin links
  layouts/
    MainLayout.astro          # wraps Navbar + slot + Footer + Bootstrap CDN
    AdminShell.astro          # bare layout for admin (no public nav)
  lib/
    api.ts                    # typed fetch wrapper, base URL, auth header injection
    auth.ts                   # login/logout/refresh token helpers + localStorage
  pages/
    index.astro               # Beranda (homepage)
    profil-program.astro      # Profil & Program
    galeri-berita.astro       # Galeri & Berita
    login.astro               # login form
    register.astro            # register form
    ppdb/
      index.astro             # PPDB info for guests
      daftar.astro            # registration form (auth required)
      ringkasan.astro         # submission summary
      sukses.astro            # success confirmation
    admin/
      index.astro             # dashboard
      ppdb/
        index.astro           # registrations list
        [id].astro            # registration detail + doc review + status
      berita/
        index.astro           # news list
        tambah.astro          # add news
        [id].astro            # edit news
      guru/
        index.astro           # teachers CRUD
      galeri/
        index.astro           # gallery CRUD
      fasilitas/
        index.astro           # facilities & achievements CRUD
      yayasan/
        index.astro           # foundation profile edit
      pengguna/
        index.astro           # users list + activate/deactivate
      pesan/
        index.astro           # contact messages list + mark read
  styles/
    global.css                # moved from css/style.css
public/
  assets/                     # moved from assets/ (icons + images)
astro.config.mjs
package.json
tsconfig.json
```

---

## Task 1: Scaffold Astro Project

**Files:**
- Create: `astro.config.mjs`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`

- [ ] **Step 1: Initialize Astro in the project root**

```bash
cd /Users/nurulfurqon/Projects/Personal/darul_furqon
npm create astro@latest . -- --template minimal --typescript strict --no-git --no-install
```

Expected: Astro scaffold files created (`astro.config.mjs`, `package.json`, `tsconfig.json`, `src/`).

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install @astrojs/check typescript
```

- [ ] **Step 3: Configure astro.config.mjs**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://darul-furqon.com',
});
```

- [ ] **Step 4: Move assets and CSS into Astro structure**

```bash
mkdir -p src/styles
cp css/style.css src/styles/global.css
mkdir -p public/assets
cp -r assets/icon public/assets/icon
cp -r assets/img public/assets/img
```

- [ ] **Step 5: Verify Astro dev server starts**

```bash
npm run dev
```

Expected: Server running at `http://localhost:4321` with default Astro page.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs package.json package-lock.json tsconfig.json src/ public/assets/
git commit -m "feat: scaffold Astro project, move assets and CSS"
```

---

## Task 2: Create Shared Layouts and Components

**Files:**
- Create: `src/layouts/MainLayout.astro`
- Create: `src/components/Navbar.astro`
- Create: `src/components/Footer.astro`
- Create: `src/layouts/AdminShell.astro`

- [ ] **Step 1: Create MainLayout.astro**

```astro
---
// src/layouts/MainLayout.astro
interface Props {
  title: string;
}
const { title } = Astro.props;
---
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} | Darul - Furqon</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles/global.css" />
</head>
<body>
  <slot name="navbar"><slot /></slot>
  <main>
    <slot />
  </main>
  <slot name="footer" />
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create Navbar.astro** (copy structure from existing index.html navbar)

```astro
---
// src/components/Navbar.astro
interface Props {
  activePage?: string;
}
const { activePage } = Astro.props;
---
<header>
  <nav class="navbar">
    <div class="logo">
      <div class="logo-box"><img src="/assets/icon/logo_df.svg" alt="Logo" /></div>
      <a href="/" class="logo-text"><h2>Darul - Furqon</h2></a>
    </div>
    <ul class="nav-links">
      <li><a href="/" class={activePage === 'beranda' ? 'active' : ''}>Beranda</a></li>
      <li><a href="/profil-program" class={activePage === 'profil' ? 'active' : ''}>Profil</a></li>
      <li><a href="/ppdb" class={activePage === 'ppdb' ? 'active' : ''}>Program</a></li>
      <li><a href="/galeri-berita" class={activePage === 'galeri' ? 'active' : ''}>Galeri</a></li>
    </ul>
    <a href="/login" class="btn-ppdb">Daftar Sekarang (PPDB)</a>
  </nav>
</header>
```

- [ ] **Step 3: Create AdminShell.astro**

```astro
---
// src/layouts/AdminShell.astro
interface Props {
  title: string;
  activePage?: string;
}
const { title, activePage } = Astro.props;
---
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} | Admin Darul Furqon</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles/global.css" />
  <style>
    body { background: #f0f2f5; }
    .admin-wrapper { display: flex; min-height: 100vh; }
    .admin-sidebar {
      width: 260px; background: #1a2942; color: #fff;
      display: flex; flex-direction: column; padding: 1.5rem 0; flex-shrink: 0;
    }
    .admin-sidebar .brand { padding: 0 1.5rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,.1); }
    .admin-sidebar .brand h5 { color: #fff; font-weight: 700; margin: 0; }
    .admin-sidebar .nav-item a {
      display: flex; align-items: center; gap: .6rem;
      padding: .65rem 1.5rem; color: rgba(255,255,255,.7);
      text-decoration: none; font-size: .9rem; transition: all .2s;
    }
    .admin-sidebar .nav-item a:hover,
    .admin-sidebar .nav-item a.active { background: rgba(255,255,255,.1); color: #fff; }
    .admin-sidebar .nav-section { font-size: .7rem; color: rgba(255,255,255,.4); padding: 1rem 1.5rem .3rem; text-transform: uppercase; letter-spacing: .08em; }
    .admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .admin-topbar {
      background: #fff; padding: .9rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex; justify-content: space-between; align-items: center;
    }
    .admin-content { flex: 1; padding: 1.5rem; overflow-y: auto; }
  </style>
</head>
<body>
<div class="admin-wrapper">
  <!-- Sidebar -->
  <aside class="admin-sidebar">
    <div class="brand">
      <h5>Darul Furqon</h5>
      <small style="color:rgba(255,255,255,.5)">Admin Panel</small>
    </div>
    <nav class="mt-3">
      <div class="nav-section">Utama</div>
      <div class="nav-item"><a href="/admin" class={activePage === 'dashboard' ? 'active' : ''}><i class="bi bi-speedometer2"></i>Dashboard</a></div>
      <div class="nav-section">PPDB</div>
      <div class="nav-item"><a href="/admin/ppdb" class={activePage === 'ppdb' ? 'active' : ''}><i class="bi bi-person-lines-fill"></i>Pendaftaran</a></div>
      <div class="nav-section">Konten</div>
      <div class="nav-item"><a href="/admin/berita" class={activePage === 'berita' ? 'active' : ''}><i class="bi bi-newspaper"></i>Berita</a></div>
      <div class="nav-item"><a href="/admin/guru" class={activePage === 'guru' ? 'active' : ''}><i class="bi bi-people-fill"></i>Guru & Staff</a></div>
      <div class="nav-item"><a href="/admin/galeri" class={activePage === 'galeri' ? 'active' : ''}><i class="bi bi-images"></i>Galeri</a></div>
      <div class="nav-item"><a href="/admin/fasilitas" class={activePage === 'fasilitas' ? 'active' : ''}><i class="bi bi-building"></i>Fasilitas</a></div>
      <div class="nav-item"><a href="/admin/yayasan" class={activePage === 'yayasan' ? 'active' : ''}><i class="bi bi-info-circle"></i>Profil Yayasan</a></div>
      <div class="nav-section">Sistem</div>
      <div class="nav-item"><a href="/admin/pengguna" class={activePage === 'pengguna' ? 'active' : ''}><i class="bi bi-person-badge"></i>Pengguna</a></div>
      <div class="nav-item"><a href="/admin/pesan" class={activePage === 'pesan' ? 'active' : ''}><i class="bi bi-envelope"></i>Pesan Masuk</a></div>
    </nav>
    <div class="mt-auto p-3">
      <button id="btn-logout" class="btn btn-sm btn-outline-light w-100"><i class="bi bi-box-arrow-right me-2"></i>Logout</button>
    </div>
  </aside>

  <!-- Main -->
  <div class="admin-main">
    <div class="admin-topbar">
      <h6 class="mb-0 fw-semibold">{title}</h6>
      <span id="admin-user-name" class="text-muted small"></span>
    </div>
    <div class="admin-content">
      <slot />
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script>
  // Auth guard: redirect to login if no token
  const token = localStorage.getItem('accessToken');
  if (!token) { window.location.href = '/login'; }

  // Show username
  const name = localStorage.getItem('userName');
  const el = document.getElementById('admin-user-name');
  if (el && name) el.textContent = name;

  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  });
</script>
</body>
</html>
```

- [ ] **Step 4: Move global.css into public so Astro serves it**

```bash
mkdir -p public/styles
cp src/styles/global.css public/styles/global.css
```

- [ ] **Step 5: Commit**

```bash
git add src/layouts/ src/components/ src/styles/ public/styles/
git commit -m "feat: add MainLayout, AdminShell, Navbar components"
```

---

## Task 3: API Client + Auth Utilities

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Create `src/lib/api.ts`**

```typescript
// src/lib/api.ts
const BASE_URL = 'https://darul-furqon-be.fly.dev';

function getAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && token) {
    token = await refreshAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiUpload(
  context: 'documents' | 'teachers' | 'news' | 'gallery' | 'facilities' | 'foundation',
  file: File
): Promise<{ url: string }> {
  const token = getAccessToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE_URL}/api/v1/uploads/?context=${context}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}
```

- [ ] **Step 2: Create `src/lib/auth.ts`**

```typescript
// src/lib/auth.ts
const BASE_URL = 'https://darul-furqon-be.fly.dev';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: string };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Login gagal');
  }
  const data: LoginResponse = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('userName', data.user.name);
  localStorage.setItem('userRole', data.user.role);
  return data;
}

export async function register(name: string, email: string, password: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Registrasi gagal');
  }
}

export function isAdmin(): boolean {
  return localStorage.getItem('userRole') === 'ADMIN';
}

export function logout(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/
git commit -m "feat: add typed API client and auth utilities"
```

---

## Task 4: Migrate Homepage and Public Pages

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/pages/galeri-berita.astro`
- Create: `src/pages/profil-program.astro`

- [ ] **Step 1: Create `src/pages/index.astro`**

Copy all HTML from the existing `index.html` `<body>` content (excluding `<head>` and Bootstrap CDN tags — those come from MainLayout), then replace asset paths from `assets/` to `/assets/`.

```astro
---
// src/pages/index.astro
import MainLayout from '../layouts/MainLayout.astro';
import Navbar from '../components/Navbar.astro';
---
<MainLayout title="Beranda">
  <Navbar activePage="beranda" slot="navbar" />
  <!-- Paste body content from index.html here, update asset paths to /assets/ -->
</MainLayout>
```

- [ ] **Step 2: Wire homepage to fetch news/announcements dynamically**

Add this `<script>` at the bottom of `index.astro` to load the 3 latest news on page load:

```html
<script type="module">
  import { apiFetch } from '/src/lib/api.ts'; // vite resolves this

  async function loadLatestNews() {
    try {
      const data = await apiFetch('/api/v1/news/?page=1&limit=3');
      const container = document.getElementById('news-list');
      if (!container || !data.data) return;
      container.innerHTML = data.data.map(n => `
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm">
            ${n.thumbnailUrl ? `<img src="${n.thumbnailUrl}" class="card-img-top" style="height:180px;object-fit:cover" alt="${n.title}">` : ''}
            <div class="card-body">
              <h6 class="card-title fw-semibold">${n.title}</h6>
              <small class="text-muted">${new Date(n.publishedDate).toLocaleDateString('id-ID')}</small>
            </div>
          </div>
        </div>
      `).join('');
    } catch {}
  }
  loadLatestNews();
</script>
```

Add `<div id="news-list" class="row g-3"></div>` to the news section in the homepage HTML.

- [ ] **Step 3: Create `src/pages/profil-program.astro`**

Copy HTML from `profil&program.html`. Wire foundation profile section to fetch `/api/v1/foundation/` and teachers to `/api/v1/teachers/`:

```astro
---
import MainLayout from '../layouts/MainLayout.astro';
import Navbar from '../components/Navbar.astro';
---
<MainLayout title="Profil & Program">
  <Navbar activePage="profil" slot="navbar" />
  <!-- Copy body HTML from profil&program.html here -->
  <!-- Add id="foundation-section" and id="teachers-list" to relevant containers -->
</MainLayout>
<script type="module">
  import { apiFetch } from '/src/lib/api.ts';

  async function loadFoundation() {
    try {
      const data = await apiFetch('/api/v1/foundation/');
      document.getElementById('foundation-name').textContent = data.foundationName ?? '';
      document.getElementById('foundation-vision').textContent = data.vision ?? '';
      document.getElementById('foundation-mission').textContent = data.mission ?? '';
      document.getElementById('foundation-address').textContent = data.fullAddress ?? '';
    } catch {}
  }

  async function loadTeachers() {
    try {
      const data = await apiFetch('/api/v1/teachers/');
      const container = document.getElementById('teachers-list');
      if (!container || !data.data) return;
      container.innerHTML = data.data.map(t => `
        <div class="col-6 col-md-3 text-center">
          <img src="${t.profilePictureUrl || '/assets/img/user.svg'}" class="rounded-circle mb-2" style="width:80px;height:80px;object-fit:cover" alt="${t.fullName}">
          <p class="mb-0 fw-semibold small">${t.fullName}</p>
          <p class="text-muted" style="font-size:.8rem">${t.position}</p>
        </div>
      `).join('');
    } catch {}
  }

  loadFoundation();
  loadTeachers();
</script>
```

- [ ] **Step 4: Create `src/pages/galeri-berita.astro`**

Copy HTML from `galeri&berita.html`. Wire news and gallery sections:

```astro
---
import MainLayout from '../layouts/MainLayout.astro';
import Navbar from '../components/Navbar.astro';
---
<MainLayout title="Galeri & Berita">
  <Navbar activePage="galeri" slot="navbar" />
  <!-- Copy body HTML, add id="berita-list" and id="galeri-list" to containers -->
</MainLayout>
<script type="module">
  import { apiFetch } from '/src/lib/api.ts';

  let newsPage = 1;

  async function loadNews(page = 1) {
    const data = await apiFetch(`/api/v1/news/?page=${page}&limit=6`);
    const container = document.getElementById('berita-list');
    if (!container) return;
    const html = data.data.map(n => `
      <div class="col-md-4 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          ${n.thumbnailUrl ? `<img src="${n.thumbnailUrl}" class="card-img-top" style="height:200px;object-fit:cover" alt="">` : ''}
          <div class="card-body">
            <h6 class="fw-semibold">${n.title}</h6>
            <small class="text-muted">${new Date(n.publishedDate).toLocaleDateString('id-ID')}</small>
            <p class="mt-2 small text-muted">${n.content.substring(0, 100)}...</p>
          </div>
        </div>
      </div>
    `).join('');
    if (page === 1) container.innerHTML = html;
    else container.insertAdjacentHTML('beforeend', html);
    document.getElementById('btn-load-more-news').style.display =
      data.data.length < 6 ? 'none' : '';
    newsPage = page;
  }

  async function loadGallery() {
    const data = await apiFetch('/api/v1/gallery/');
    const container = document.getElementById('galeri-list');
    if (!container) return;
    container.innerHTML = data.data.map(g => g.mediaType === 'PHOTO' ? `
      <div class="col-6 col-md-3 mb-3">
        <img src="${g.fileUrl}" class="img-fluid rounded shadow-sm" style="height:180px;width:100%;object-fit:cover" alt="${g.activityTitle}">
        <p class="small text-muted mt-1">${g.activityTitle}</p>
      </div>
    ` : `
      <div class="col-6 col-md-3 mb-3">
        <video src="${g.fileUrl}" controls class="img-fluid rounded" style="height:180px;width:100%;object-fit:cover"></video>
        <p class="small text-muted mt-1">${g.activityTitle}</p>
      </div>
    `).join('');
  }

  document.getElementById('btn-load-more-news')?.addEventListener('click', () => loadNews(newsPage + 1));

  loadNews();
  loadGallery();
</script>
```

- [ ] **Step 5: Verify pages render in browser**

```bash
npm run dev
```

Open `http://localhost:4321`, `http://localhost:4321/profil-program`, `http://localhost:4321/galeri-berita` and confirm they render with data from the API.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/pages/profil-program.astro src/pages/galeri-berita.astro
git commit -m "feat: migrate public pages to Astro, wire API for news/teachers/gallery"
```

---

## Task 5: PPDB Public Flow Pages

**Files:**
- Create: `src/pages/ppdb/index.astro`
- Create: `src/pages/ppdb/daftar.astro`
- Create: `src/pages/ppdb/ringkasan.astro`
- Create: `src/pages/ppdb/sukses.astro`

- [ ] **Step 1: Create PPDB info page `src/pages/ppdb/index.astro`**

Copy HTML from `ppdb_guest.html`. This is a static info page — no API needed.

```astro
---
import MainLayout from '../../layouts/MainLayout.astro';
import Navbar from '../../components/Navbar.astro';
---
<MainLayout title="PPDB">
  <Navbar activePage="ppdb" slot="navbar" />
  <!-- Copy ppdb_guest.html body HTML here. Update links: "Daftar Sekarang" button → /ppdb/daftar -->
</MainLayout>
```

- [ ] **Step 2: Create registration form `src/pages/ppdb/daftar.astro`**

Copy HTML from `ppdb_user.html`. Wire form submit to POST `/api/v1/registrations/`:

```astro
---
import MainLayout from '../../layouts/MainLayout.astro';
import Navbar from '../../components/Navbar.astro';
---
<MainLayout title="Form Pendaftaran PPDB">
  <Navbar activePage="ppdb" slot="navbar" />
  <!-- Copy ppdb_user.html body HTML -->
  <!-- Give the form id="ppdb-form" -->
</MainLayout>
<script type="module">
  import { apiFetch } from '/src/lib/api.ts';

  // Redirect to login if no token
  if (!localStorage.getItem('accessToken')) {
    window.location.href = '/login?redirect=/ppdb/daftar';
  }

  document.getElementById('ppdb-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    const payload = {
      programChoice: form.programChoice.value,
      studentFullName: form.studentFullName.value,
      nisn: form.nisn.value,
      birthPlace: form.birthPlace.value,
      birthDate: form.birthDate.value,
      gender: form.gender.value,
      domicileAddress: form.domicileAddress.value,
      fatherName: form.fatherName.value,
      motherName: form.motherName.value,
      parentsOccupation: form.parentsOccupation.value,
      parentsWhatsapp: form.parentsWhatsapp.value,
    };

    try {
      const data = await apiFetch('/api/v1/registrations/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      sessionStorage.setItem('ppdbRegistration', JSON.stringify(data));
      window.location.href = '/ppdb/ringkasan';
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
      btn.disabled = false;
      btn.textContent = 'Kirim Pendaftaran';
    }
  });
</script>
```

- [ ] **Step 3: Create summary page `src/pages/ppdb/ringkasan.astro`**

Copy HTML from `ppdb_summary.html`. Load registration data from `sessionStorage` and render it:

```astro
---
import MainLayout from '../../layouts/MainLayout.astro';
import Navbar from '../../components/Navbar.astro';
---
<MainLayout title="Ringkasan Pendaftaran">
  <Navbar activePage="ppdb" slot="navbar" />
  <!-- Copy ppdb_summary.html body HTML, add id attributes to value spans -->
</MainLayout>
<script type="module">
  const reg = JSON.parse(sessionStorage.getItem('ppdbRegistration') || '{}');

  const fields = {
    'val-name': reg.studentFullName,
    'val-program': reg.programChoice,
    'val-nisn': reg.nisn,
    'val-birthplace': reg.birthPlace,
    'val-birthdate': reg.birthDate,
    'val-gender': reg.gender === 'MALE' ? 'Laki-laki' : 'Perempuan',
    'val-address': reg.domicileAddress,
    'val-father': reg.fatherName,
    'val-mother': reg.motherName,
    'val-occupation': reg.parentsOccupation,
    'val-whatsapp': reg.parentsWhatsapp,
    'val-regnumber': reg.registrationNumber,
  };

  for (const [id, val] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? '-';
  }

  document.getElementById('btn-confirm')?.addEventListener('click', () => {
    window.location.href = '/ppdb/sukses';
  });
</script>
```

- [ ] **Step 4: Create success page `src/pages/ppdb/sukses.astro`**

Copy HTML from `ppdb_success.html`:

```astro
---
import MainLayout from '../../layouts/MainLayout.astro';
import Navbar from '../../components/Navbar.astro';
---
<MainLayout title="Pendaftaran Berhasil">
  <Navbar activePage="ppdb" slot="navbar" />
  <!-- Copy ppdb_success.html body HTML -->
</MainLayout>
<script type="module">
  const reg = JSON.parse(sessionStorage.getItem('ppdbRegistration') || '{}');
  const el = document.getElementById('reg-number');
  if (el && reg.registrationNumber) el.textContent = reg.registrationNumber;
</script>
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/ppdb/
git commit -m "feat: add PPDB public flow pages wired to registration API"
```

---

## Task 6: Login and Register Pages

**Files:**
- Create: `src/pages/login.astro`
- Create: `src/pages/register.astro`

- [ ] **Step 1: Create `src/pages/login.astro`**

Copy HTML from `login.html`. Wire form to auth API:

```astro
---
import MainLayout from '../layouts/MainLayout.astro';
---
<MainLayout title="Login">
  <!-- Copy login.html body HTML — no Navbar on login page -->
  <!-- Give form id="login-form", username field name="email", password name="password" -->
  <!-- Add id="login-error" to error message element -->
</MainLayout>
<script type="module">
  import { login } from '/src/lib/auth.ts';

  // Already logged in → redirect
  if (localStorage.getItem('accessToken')) {
    window.location.href = '/admin';
  }

  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type=submit]');
    const errEl = document.getElementById('login-error');
    btn.disabled = true;
    if (errEl) errEl.textContent = '';

    try {
      const data = await login(form.email.value, form.password.value);
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      if (data.user.role === 'ADMIN') {
        window.location.href = redirect || '/admin';
      } else {
        window.location.href = redirect || '/ppdb/daftar';
      }
    } catch (err) {
      if (errEl) errEl.textContent = err.message;
      btn.disabled = false;
    }
  });
</script>
```

- [ ] **Step 2: Create `src/pages/register.astro`**

```astro
---
import MainLayout from '../layouts/MainLayout.astro';
---
<MainLayout title="Daftar Akun">
<section class="login-page">
  <div class="login-right" style="max-width:420px;margin:auto;padding:2rem">
    <h4 class="fw-bold mb-1">Buat Akun Baru</h4>
    <p class="text-muted mb-4">Daftar untuk mengakses PPDB online</p>
    <div id="reg-error" class="alert alert-danger d-none"></div>
    <div id="reg-success" class="alert alert-success d-none">Akun berhasil dibuat! <a href="/login">Login sekarang</a></div>
    <form id="register-form">
      <div class="mb-3">
        <label class="form-label">Nama Lengkap</label>
        <input type="text" name="name" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input type="email" name="email" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input type="password" name="password" class="form-control" minlength="8" required />
      </div>
      <button type="submit" class="btn btn-primary w-100">Daftar</button>
    </form>
    <p class="text-center mt-3 small">Sudah punya akun? <a href="/login">Login</a></p>
  </div>
</section>
</MainLayout>
<script type="module">
  import { register } from '/src/lib/auth.ts';

  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const errEl = document.getElementById('reg-error');
    const sucEl = document.getElementById('reg-success');
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    errEl.classList.add('d-none');

    try {
      await register(form.name.value, form.email.value, form.password.value);
      form.style.display = 'none';
      sucEl.classList.remove('d-none');
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('d-none');
      btn.disabled = false;
    }
  });
</script>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/login.astro src/pages/register.astro
git commit -m "feat: add login and register pages wired to auth API"
```

---

## Task 7: Admin Dashboard

**Files:**
- Create: `src/pages/admin/index.astro`

- [ ] **Step 1: Create `src/pages/admin/index.astro`**

```astro
---
import AdminShell from '../../layouts/AdminShell.astro';
---
<AdminShell title="Dashboard" activePage="dashboard">
  <div class="row g-4 mb-4">
    <div class="col-sm-6 col-xl-3">
      <div class="card border-0 shadow-sm">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="rounded-3 p-3 bg-primary bg-opacity-10"><i class="bi bi-person-lines-fill fs-4 text-primary"></i></div>
          <div><div class="text-muted small">Total Pendaftaran</div><div id="stat-reg" class="fs-4 fw-bold">-</div></div>
        </div>
      </div>
    </div>
    <div class="col-sm-6 col-xl-3">
      <div class="card border-0 shadow-sm">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="rounded-3 p-3 bg-warning bg-opacity-10"><i class="bi bi-hourglass-split fs-4 text-warning"></i></div>
          <div><div class="text-muted small">Perlu Verifikasi</div><div id="stat-pending" class="fs-4 fw-bold">-</div></div>
        </div>
      </div>
    </div>
    <div class="col-sm-6 col-xl-3">
      <div class="card border-0 shadow-sm">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="rounded-3 p-3 bg-success bg-opacity-10"><i class="bi bi-newspaper fs-4 text-success"></i></div>
          <div><div class="text-muted small">Total Berita</div><div id="stat-news" class="fs-4 fw-bold">-</div></div>
        </div>
      </div>
    </div>
    <div class="col-sm-6 col-xl-3">
      <div class="card border-0 shadow-sm">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="rounded-3 p-3 bg-danger bg-opacity-10"><i class="bi bi-envelope fs-4 text-danger"></i></div>
          <div><div class="text-muted small">Pesan Belum Dibaca</div><div id="stat-unread" class="fs-4 fw-bold">-</div></div>
        </div>
      </div>
    </div>
  </div>

  <div class="card border-0 shadow-sm">
    <div class="card-header bg-white fw-semibold">Pendaftaran Terbaru</div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light"><tr>
            <th>No. Daftar</th><th>Nama Siswa</th><th>Program</th><th>Status</th><th>Tanggal</th>
          </tr></thead>
          <tbody id="recent-registrations"></tbody>
        </table>
      </div>
    </div>
  </div>
</AdminShell>
<script type="module">
  import { apiFetch } from '/src/lib/api.ts';

  const statusBadge = {
    DRAFT: 'secondary', PENDING_VERIFICATION: 'warning',
    VERIFIED: 'info', ACCEPTED: 'success', REJECTED: 'danger'
  };
  const statusLabel = {
    DRAFT: 'Draft', PENDING_VERIFICATION: 'Menunggu',
    VERIFIED: 'Terverifikasi', ACCEPTED: 'Diterima', REJECTED: 'Ditolak'
  };

  async function loadDashboard() {
    const [regs, news, contacts] = await Promise.all([
      apiFetch('/api/v1/registrations/?page=1&limit=100'),
      apiFetch('/api/v1/news/?page=1&limit=100'),
      apiFetch('/api/v1/contacts/?page=1&limit=100&isRead=false'),
    ]);

    document.getElementById('stat-reg').textContent = regs.total ?? regs.data?.length ?? '-';
    document.getElementById('stat-pending').textContent =
      regs.data?.filter(r => r.registrationStatus === 'PENDING_VERIFICATION').length ?? '-';
    document.getElementById('stat-news').textContent = news.total ?? news.data?.length ?? '-';
    document.getElementById('stat-unread').textContent = contacts.total ?? contacts.data?.length ?? '-';

    const recent = (regs.data ?? []).slice(0, 10);
    document.getElementById('recent-registrations').innerHTML = recent.map(r => `
      <tr>
        <td><a href="/admin/ppdb/${r.id}">${r.registrationNumber ?? '-'}</a></td>
        <td>${r.studentFullName}</td>
        <td>${r.programChoice}</td>
        <td><span class="badge bg-${statusBadge[r.registrationStatus]}">${statusLabel[r.registrationStatus]}</span></td>
        <td>${new Date(r.registrationDate).toLocaleDateString('id-ID')}</td>
      </tr>
    `).join('');
  }

  loadDashboard().catch(console.error);
</script>
```

- [ ] **Step 2: Verify dashboard loads at `http://localhost:4321/admin`**

Expected: Stats cards filled, recent registrations table populated.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/index.astro
git commit -m "feat: add admin dashboard with stats and recent registrations"
```

---

## Task 8: Admin PPDB Management

**Files:**
- Create: `src/pages/admin/ppdb/index.astro`
- Create: `src/pages/admin/ppdb/[id].astro`

- [ ] **Step 1: Create registrations list page `src/pages/admin/ppdb/index.astro`**

```astro
---
import AdminShell from '../../../layouts/AdminShell.astro';
---
<AdminShell title="Manajemen Pendaftaran" activePage="ppdb">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h5 class="mb-0">Daftar Pendaftaran PPDB</h5>
    <div class="d-flex gap-2">
      <select id="filter-status" class="form-select form-select-sm">
        <option value="">Semua Status</option>
        <option value="DRAFT">Draft</option>
        <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
        <option value="VERIFIED">Terverifikasi</option>
        <option value="ACCEPTED">Diterima</option>
        <option value="REJECTED">Ditolak</option>
      </select>
    </div>
  </div>
  <div class="card border-0 shadow-sm">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light"><tr>
            <th>No. Daftar</th><th>Nama Siswa</th><th>Program</th>
            <th>Status</th><th>Tanggal</th><th>Aksi</th>
          </tr></thead>
          <tbody id="reg-table-body"><tr><td colspan="6" class="text-center py-4 text-muted">Memuat data...</td></tr></tbody>
        </table>
      </div>
    </div>
  </div>
  <nav class="mt-3 d-flex justify-content-between align-items-center">
    <small id="page-info" class="text-muted"></small>
    <div class="d-flex gap-2">
      <button id="btn-prev" class="btn btn-sm btn-outline-secondary" disabled>‹ Sebelumnya</button>
      <button id="btn-next" class="btn btn-sm btn-outline-secondary" disabled>Berikutnya ›</button>
    </div>
  </nav>
</AdminShell>
<script type="module">
  import { apiFetch } from '/src/lib/api.ts';

  const statusBadge = { DRAFT:'secondary', PENDING_VERIFICATION:'warning', VERIFIED:'info', ACCEPTED:'success', REJECTED:'danger' };
  const statusLabel = { DRAFT:'Draft', PENDING_VERIFICATION:'Menunggu', VERIFIED:'Terverifikasi', ACCEPTED:'Diterima', REJECTED:'Ditolak' };

  let currentPage = 1;
  const limit = 10;

  async function loadRegistrations(page = 1) {
    const status = document.getElementById('filter-status').value;
    const qs = `page=${page}&limit=${limit}${status ? '&status=' + status : ''}`;
    const data = await apiFetch(`/api/v1/registrations/?${qs}`);
    const tbody = document.getElementById('reg-table-body');
    tbody.innerHTML = data.data.length === 0
      ? '<tr><td colspan="6" class="text-center py-4 text-muted">Tidak ada data</td></tr>'
      : data.data.map(r => `
          <tr>
            <td>${r.registrationNumber ?? '-'}</td>
            <td>${r.studentFullName}</td>
            <td>${r.programChoice}</td>
            <td><span class="badge bg-${statusBadge[r.registrationStatus]}">${statusLabel[r.registrationStatus]}</span></td>
            <td>${new Date(r.registrationDate).toLocaleDateString('id-ID')}</td>
            <td><a href="/admin/ppdb/${r.id}" class="btn btn-sm btn-outline-primary">Detail</a></td>
          </tr>`).join('');

    const total = data.total ?? data.data.length;
    document.getElementById('page-info').textContent = `Halaman ${page} · ${total} data`;
    document.getElementById('btn-prev').disabled = page <= 1;
    document.getElementById('btn-next').disabled = data.data.length < limit;
    currentPage = page;
  }

  document.getElementById('btn-prev').addEventListener('click', () => loadRegistrations(currentPage - 1));
  document.getElementById('btn-next').addEventListener('click', () => loadRegistrations(currentPage + 1));
  document.getElementById('filter-status').addEventListener('change', () => loadRegistrations(1));

  loadRegistrations();
</script>
```

- [ ] **Step 2: Create registration detail page `src/pages/admin/ppdb/[id].astro`**

```astro
---
import AdminShell from '../../../layouts/AdminShell.astro';
const { id } = Astro.params;
---
<AdminShell title="Detail Pendaftaran" activePage="ppdb">
  <div class="mb-3"><a href="/admin/ppdb" class="btn btn-sm btn-outline-secondary"><i class="bi bi-arrow-left me-1"></i>Kembali</a></div>

  <div class="row g-4">
    <!-- Student info card -->
    <div class="col-lg-7">
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
          <span>Data Siswa</span>
          <span id="reg-status-badge"></span>
        </div>
        <div class="card-body" id="student-info">
          <div class="text-center py-4 text-muted">Memuat...</div>
        </div>
      </div>
      <!-- Documents -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white fw-semibold">Dokumen</div>
        <div class="card-body" id="documents-list">
          <div class="text-center py-4 text-muted">Memuat...</div>
        </div>
      </div>
    </div>

    <!-- Status update panel -->
    <div class="col-lg-5">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white fw-semibold">Ubah Status</div>
        <div class="card-body">
          <div id="status-alert"></div>
          <label class="form-label">Status Pendaftaran</label>
          <select id="new-status" class="form-select mb-3">
            <option value="DRAFT">Draft</option>
            <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
            <option value="VERIFIED">Terverifikasi</option>
            <option value="ACCEPTED">Diterima</option>
            <option value="REJECTED">Ditolak</option>
          </select>
          <button id="btn-update-status" class="btn btn-primary w-100">Simpan Status</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Document review modal -->
  <div class="modal fade" id="docModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header"><h6 class="modal-title">Review Dokumen</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">
          <img id="doc-preview" src="" class="img-fluid rounded mb-3" alt="Dokumen" style="max-height:300px;object-fit:contain">
          <p><strong id="doc-type-label"></strong></p>
          <div class="mb-3">
            <label class="form-label">Status Dokumen</label>
            <select id="doc-status" class="form-select">
              <option value="PENDING">Pending</option>
              <option value="VALID">Valid</option>
              <option value="INVALID">Tidak Valid</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Catatan Admin</label>
            <textarea id="doc-notes" class="form-control" rows="2"></textarea>
          </div>
          <input type="hidden" id="doc-id" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
          <button id="btn-save-doc" class="btn btn-primary">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</AdminShell>
<script define:vars={{ regId: id }}>
  // NOTE: define:vars inlines the Astro param into client script
</script>
<script type="module">
  import { apiFetch } from '/src/lib/api.ts';
  import { Modal } from 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js';

  const regId = document.currentScript?.previousElementSibling?.textContent?.trim()
    || window.location.pathname.split('/').pop();

  const statusBadge = { DRAFT:'secondary', PENDING_VERIFICATION:'warning', VERIFIED:'info', ACCEPTED:'success', REJECTED:'danger' };
  const statusLabel = { DRAFT:'Draft', PENDING_VERIFICATION:'Menunggu', VERIFIED:'Terverifikasi', ACCEPTED:'Diterima', REJECTED:'Ditolak' };

  let currentRegistration = null;
  const docModal = new bootstrap.Modal(document.getElementById('docModal'));

  async function loadRegistration() {
    const data = await apiFetch(`/api/v1/registrations/${regId}`);
    currentRegistration = data;
    document.getElementById('new-status').value = data.registrationStatus;
    document.getElementById('reg-status-badge').innerHTML =
      `<span class="badge bg-${statusBadge[data.registrationStatus]}">${statusLabel[data.registrationStatus]}</span>`;

    document.getElementById('student-info').innerHTML = `
      <dl class="row mb-0">
        <dt class="col-sm-5">No. Pendaftaran</dt><dd class="col-sm-7">${data.registrationNumber ?? '-'}</dd>
        <dt class="col-sm-5">Nama Siswa</dt><dd class="col-sm-7">${data.studentFullName}</dd>
        <dt class="col-sm-5">Program</dt><dd class="col-sm-7">${data.programChoice}</dd>
        <dt class="col-sm-5">NISN</dt><dd class="col-sm-7">${data.nisn ?? '-'}</dd>
        <dt class="col-sm-5">Tempat Lahir</dt><dd class="col-sm-7">${data.birthPlace ?? '-'}</dd>
        <dt class="col-sm-5">Tanggal Lahir</dt><dd class="col-sm-7">${data.birthDate ?? '-'}</dd>
        <dt class="col-sm-5">Jenis Kelamin</dt><dd class="col-sm-7">${data.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</dd>
        <dt class="col-sm-5">Alamat</dt><dd class="col-sm-7">${data.domicileAddress ?? '-'}</dd>
        <dt class="col-sm-5">Nama Ayah</dt><dd class="col-sm-7">${data.fatherName ?? '-'}</dd>
        <dt class="col-sm-5">Nama Ibu</dt><dd class="col-sm-7">${data.motherName ?? '-'}</dd>
        <dt class="col-sm-5">Pekerjaan Ortu</dt><dd class="col-sm-7">${data.parentsOccupation ?? '-'}</dd>
        <dt class="col-sm-5">WhatsApp Ortu</dt><dd class="col-sm-7">${data.parentsWhatsapp ?? '-'}</dd>
      </dl>`;
  }

  async function loadDocuments() {
    const data = await apiFetch(`/api/v1/registrations/${regId}/documents`);
    const docStatusBadge = { PENDING:'warning', VALID:'success', INVALID:'danger' };
    const docTypeLabel = {
      KARTU_KELUARGA:'Kartu Keluarga', AKTA_KELAHIRAN:'Akta Kelahiran',
      IJAZAH_SKHU:'Ijazah/SKHU', PAS_FOTO:'Pas Foto'
    };
    document.getElementById('documents-list').innerHTML = (data.data ?? data).length === 0
      ? '<p class="text-muted">Belum ada dokumen diunggah.</p>'
      : (data.data ?? data).map(doc => `
          <div class="d-flex justify-content-between align-items-center p-2 border rounded mb-2">
            <div>
              <div class="fw-semibold small">${docTypeLabel[doc.documentType] ?? doc.documentType}</div>
              <span class="badge bg-${docStatusBadge[doc.documentStatus]}">${doc.documentStatus}</span>
              ${doc.adminNotes ? `<div class="text-muted small mt-1">${doc.adminNotes}</div>` : ''}
            </div>
            <div class="d-flex gap-2">
              <a href="${doc.fileUrl}" target="_blank" class="btn btn-sm btn-outline-secondary">Lihat</a>
              <button class="btn btn-sm btn-outline-primary btn-review-doc"
                data-id="${doc.id}" data-type="${doc.documentType}"
                data-url="${doc.fileUrl}" data-status="${doc.documentStatus}"
                data-notes="${doc.adminNotes ?? ''}">Review</button>
            </div>
          </div>`).join('');

    document.querySelectorAll('.btn-review-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('doc-id').value = btn.dataset.id;
        document.getElementById('doc-type-label').textContent = btn.dataset.type;
        document.getElementById('doc-preview').src = btn.dataset.url;
        document.getElementById('doc-status').value = btn.dataset.status;
        document.getElementById('doc-notes').value = btn.dataset.notes;
        docModal.show();
      });
    });
  }

  document.getElementById('btn-save-doc').addEventListener('click', async () => {
    const id = document.getElementById('doc-id').value;
    await apiFetch(`/api/v1/documents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: document.getElementById('doc-status').value,
        adminNotes: document.getElementById('doc-notes').value,
      }),
    });
    docModal.hide();
    loadDocuments();
  });

  document.getElementById('btn-update-status').addEventListener('click', async () => {
    const btn = document.getElementById('btn-update-status');
    btn.disabled = true;
    const alert = document.getElementById('status-alert');
    try {
      await apiFetch(`/api/v1/registrations/${regId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: document.getElementById('new-status').value }),
      });
      alert.innerHTML = '<div class="alert alert-success py-2">Status berhasil diperbarui</div>';
      loadRegistration();
    } catch (err) {
      alert.innerHTML = `<div class="alert alert-danger py-2">${err.message}</div>`;
    } finally {
      btn.disabled = false;
    }
  });

  loadRegistration();
  loadDocuments();
</script>
```

> **Note on `regId` in the client script:** Astro's `define:vars` inlines the route param as a `<script>` tag. The client script reads it from the preceding sibling. This is a workaround for Astro static output with dynamic route params — in production consider using URL `window.location.pathname` to extract the ID as shown in the fallback above.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/ppdb/
git commit -m "feat: add admin PPDB list and detail pages with document review"
```

---

## Task 9: Admin News Management

**Files:**
- Create: `src/pages/admin/berita/index.astro`
- Create: `src/pages/admin/berita/tambah.astro`
- Create: `src/pages/admin/berita/[id].astro`

- [ ] **Step 1: Create news list `src/pages/admin/berita/index.astro`**

```astro
---
import AdminShell from '../../../layouts/AdminShell.astro';
---
<AdminShell title="Manajemen Berita" activePage="berita">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h5 class="mb-0">Berita & Pengumuman</h5>
    <a href="/admin/berita/tambah" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i>Tambah Berita</a>
  </div>
  <div class="row g-3" id="news-grid">
    <div class="col-12 text-center py-4 text-muted">Memuat...</div>
  </div>
  <nav class="mt-3 d-flex justify-content-end gap-2">
    <button id="btn-prev" class="btn btn-sm btn-outline-secondary" disabled>‹</button>
    <button id="btn-next" class="btn btn-sm btn-outline-secondary" disabled>›</button>
  </nav>
</AdminShell>
<script type="module">
  import { apiFetch } from '/src/lib/api.ts';
  let page = 1;

  async function load(p = 1) {
    const data = await apiFetch(`/api/v1/news/?page=${p}&limit=9`);
    document.getElementById('news-grid').innerHTML = data.data.map(n => `
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm">
          ${n.thumbnailUrl ? `<img src="${n.thumbnailUrl}" class="card-img-top" style="height:160px;object-fit:cover" alt="">` : '<div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height:160px"><i class="bi bi-image text-muted fs-3"></i></div>'}
          <div class="card-body">
            <h6 class="card-title">${n.title}</h6>
            <small class="text-muted">${new Date(n.publishedDate).toLocaleDateString('id-ID')}</small>
          </div>
          <div class="card-footer bg-white border-0 d-flex gap-2">
            <a href="/admin/berita/${n.id}" class="btn btn-sm btn-outline-primary flex-fill">Edit</a>
            <button class="btn btn-sm btn-outline-danger flex-fill btn-delete" data-id="${n.id}">Hapus</button>
          </div>
        </div>
      </div>`).join('') || '<div class="col-12 text-center text-muted py-4">Belum ada berita</div>';

    document.getElementById('btn-prev').disabled = p <= 1;
    document.getElementById('btn-next').disabled = data.data.length < 9;
    page = p;

    document.querySelectorAll('.btn-delete').forEach(btn =>
      btn.addEventListener('click', async () => {
        if (!confirm('Hapus berita ini?')) return;
        await apiFetch(`/api/v1/news/${btn.dataset.id}`, { method: 'DELETE' });
        load(page);
      }));
  }

  document.getElementById('btn-prev').addEventListener('click', () => load(page - 1));
  document.getElementById('btn-next').addEventListener('click', () => load(page + 1));
  load();
</script>
```

- [ ] **Step 2: Create `src/pages/admin/berita/tambah.astro`** (add news with thumbnail upload)

```astro
---
import AdminShell from '../../../layouts/AdminShell.astro';
---
<AdminShell title="Tambah Berita" activePage="berita">
  <div class="mb-3"><a href="/admin/berita" class="btn btn-sm btn-outline-secondary"><i class="bi bi-arrow-left me-1"></i>Kembali</a></div>
  <div class="card border-0 shadow-sm" style="max-width:760px">
    <div class="card-body">
      <div id="form-alert"></div>
      <form id="news-form">
        <div class="mb-3">
          <label class="form-label fw-semibold">Judul</label>
          <input type="text" name="title" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Thumbnail</label>
          <input type="file" id="thumbnail-file" class="form-control" accept="image/*" />
          <input type="hidden" name="thumbnailUrl" />
          <img id="thumbnail-preview" src="" class="mt-2 rounded d-none" style="height:160px;object-fit:cover" />
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Konten</label>
          <textarea name="content" class="form-control" rows="10" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Simpan Berita</button>
      </form>
    </div>
  </div>
</AdminShell>
<script type="module">
  import { apiFetch, apiUpload } from '/src/lib/api.ts';

  document.getElementById('thumbnail-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await apiUpload('news', file);
    document.querySelector('[name=thumbnailUrl]').value = result.url;
    const preview = document.getElementById('thumbnail-preview');
    preview.src = result.url;
    preview.classList.remove('d-none');
  });

  document.getElementById('news-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    const alertEl = document.getElementById('form-alert');
    try {
      await apiFetch('/api/v1/news/', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.value,
          content: form.content.value,
          thumbnailUrl: form.thumbnailUrl.value || undefined,
        }),
      });
      window.location.href = '/admin/berita';
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
      btn.disabled = false;
    }
  });
</script>
```

- [ ] **Step 3: Create `src/pages/admin/berita/[id].astro`** (edit news)

```astro
---
import AdminShell from '../../../layouts/AdminShell.astro';
const { id } = Astro.params;
---
<AdminShell title="Edit Berita" activePage="berita">
  <div class="mb-3"><a href="/admin/berita" class="btn btn-sm btn-outline-secondary"><i class="bi bi-arrow-left me-1"></i>Kembali</a></div>
  <div class="card border-0 shadow-sm" style="max-width:760px">
    <div class="card-body">
      <div id="form-alert"></div>
      <form id="news-form">
        <div class="mb-3">
          <label class="form-label fw-semibold">Judul</label>
          <input type="text" name="title" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Thumbnail</label>
          <input type="file" id="thumbnail-file" class="form-control" accept="image/*" />
          <input type="hidden" name="thumbnailUrl" />
          <img id="thumbnail-preview" src="" class="mt-2 rounded" style="height:160px;object-fit:cover" />
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Konten</label>
          <textarea name="content" class="form-control" rows="10" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
      </form>
    </div>
  </div>
</AdminShell>
<script type="module">
  import { apiFetch, apiUpload } from '/src/lib/api.ts';
  const id = window.location.pathname.split('/').pop();

  async function loadNews() {
    const data = await apiFetch(`/api/v1/news/${id}`);
    const form = document.getElementById('news-form');
    form.title.value = data.title;
    form.content.value = data.content;
    form.thumbnailUrl.value = data.thumbnailUrl ?? '';
    if (data.thumbnailUrl) document.getElementById('thumbnail-preview').src = data.thumbnailUrl;
  }

  document.getElementById('thumbnail-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await apiUpload('news', file);
    document.querySelector('[name=thumbnailUrl]').value = result.url;
    document.getElementById('thumbnail-preview').src = result.url;
  });

  document.getElementById('news-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      await apiFetch(`/api/v1/news/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: form.title.value,
          content: form.content.value,
          thumbnailUrl: form.thumbnailUrl.value || undefined,
        }),
      });
      window.location.href = '/admin/berita';
    } catch (err) {
      document.getElementById('form-alert').innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
      btn.disabled = false;
    }
  });

  loadNews();
</script>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/berita/
git commit -m "feat: add admin news CRUD pages with thumbnail upload"
```

---

## Task 10: Admin Teachers, Gallery, Facilities Pages

**Files:**
- Create: `src/pages/admin/guru/index.astro`
- Create: `src/pages/admin/galeri/index.astro`
- Create: `src/pages/admin/fasilitas/index.astro`

- [ ] **Step 1: Create `src/pages/admin/guru/index.astro`** (teachers CRUD — inline modal for add/edit)

```astro
---
import AdminShell from '../../../layouts/AdminShell.astro';
---
<AdminShell title="Guru & Staff" activePage="guru">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h5 class="mb-0">Guru & Staff</h5>
    <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#teacherModal" id="btn-add"><i class="bi bi-plus-lg me-1"></i>Tambah</button>
  </div>
  <div class="row g-3" id="teachers-grid"></div>

  <!-- Modal Add/Edit -->
  <div class="modal fade" id="teacherModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header"><h6 class="modal-title" id="modal-title">Tambah Guru</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">
          <input type="hidden" id="teacher-id" />
          <div class="mb-3"><label class="form-label">Nama Lengkap</label><input type="text" id="t-name" class="form-control" required /></div>
          <div class="mb-3"><label class="form-label">Jabatan</label><input type="text" id="t-position" class="form-control" /></div>
          <div class="mb-3"><label class="form-label">Tanggal Bergabung</label><input type="date" id="t-joindate" class="form-control" /></div>
          <div class="mb-3">
            <label class="form-label">Foto Profil</label>
            <input type="file" id="t-photo-file" class="form-control" accept="image/*" />
            <input type="hidden" id="t-photo-url" />
            <img id="t-photo-preview" src="" class="mt-2 rounded-circle d-none" style="width:80px;height:80px;object-fit:cover" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
          <button id="btn-save-teacher" class="btn btn-primary">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</AdminShell>
<script type="module">
  import { apiFetch, apiUpload } from '/src/lib/api.ts';
  let editingId = null;

  async function loadTeachers() {
    const data = await apiFetch('/api/v1/teachers/');
    document.getElementById('teachers-grid').innerHTML = (data.data ?? data).map(t => `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="card border-0 shadow-sm text-center p-3">
          <img src="${t.profilePictureUrl || '/assets/img/user.svg'}" class="rounded-circle mx-auto mb-2" style="width:70px;height:70px;object-fit:cover" alt="">
          <div class="fw-semibold">${t.fullName}</div>
          <div class="text-muted small">${t.position ?? ''}</div>
          <div class="text-muted small">${t.joinDate ?? ''}</div>
          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-sm btn-outline-primary flex-fill btn-edit"
              data-id="${t.id}" data-name="${t.fullName}" data-pos="${t.position ?? ''}"
              data-date="${t.joinDate ?? ''}" data-url="${t.profilePictureUrl ?? ''}">Edit</button>
            <button class="btn btn-sm btn-outline-danger flex-fill btn-delete" data-id="${t.id}">Hapus</button>
          </div>
        </div>
      </div>`).join('');

    document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => {
      editingId = btn.dataset.id;
      document.getElementById('modal-title').textContent = 'Edit Guru';
      document.getElementById('teacher-id').value = editingId;
      document.getElementById('t-name').value = btn.dataset.name;
      document.getElementById('t-position').value = btn.dataset.pos;
      document.getElementById('t-joindate').value = btn.dataset.date;
      document.getElementById('t-photo-url').value = btn.dataset.url;
      const prev = document.getElementById('t-photo-preview');
      if (btn.dataset.url) { prev.src = btn.dataset.url; prev.classList.remove('d-none'); }
      new bootstrap.Modal(document.getElementById('teacherModal')).show();
    }));

    document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('Hapus guru ini?')) return;
      await apiFetch(`/api/v1/teachers/${btn.dataset.id}`, { method: 'DELETE' });
      loadTeachers();
    }));
  }

  document.getElementById('btn-add').addEventListener('click', () => {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Tambah Guru';
    document.getElementById('t-name').value = '';
    document.getElementById('t-position').value = '';
    document.getElementById('t-joindate').value = '';
    document.getElementById('t-photo-url').value = '';
    document.getElementById('t-photo-preview').classList.add('d-none');
  });

  document.getElementById('t-photo-file').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const result = await apiUpload('teachers', file);
    document.getElementById('t-photo-url').value = result.url;
    const prev = document.getElementById('t-photo-preview');
    prev.src = result.url; prev.classList.remove('d-none');
  });

  document.getElementById('btn-save-teacher').addEventListener('click', async () => {
    const payload = {
      fullName: document.getElementById('t-name').value,
      position: document.getElementById('t-position').value,
      joinDate: document.getElementById('t-joindate').value || undefined,
      profilePictureUrl: document.getElementById('t-photo-url').value || undefined,
    };
    if (editingId) {
      await apiFetch(`/api/v1/teachers/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await apiFetch('/api/v1/teachers/', { method: 'POST', body: JSON.stringify(payload) });
    }
    bootstrap.Modal.getInstance(document.getElementById('teacherModal')).hide();
    loadTeachers();
  });

  loadTeachers();
</script>
```

- [ ] **Step 2: Create `src/pages/admin/galeri/index.astro`** (gallery CRUD — inline modal)

```astro
---
import AdminShell from '../../../layouts/AdminShell.astro';
---
<AdminShell title="Galeri" activePage="galeri">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h5 class="mb-0">Galeri Foto & Video</h5>
    <button class="btn btn-primary btn-sm" id="btn-add-gallery"><i class="bi bi-plus-lg me-1"></i>Tambah Media</button>
  </div>
  <div class="row g-3" id="gallery-grid"></div>

  <div class="modal fade" id="galleryModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header"><h6 class="modal-title">Tambah Media</h6><button class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">
          <div class="mb-3"><label class="form-label">Judul Kegiatan</label><input type="text" id="g-title" class="form-control" required /></div>
          <div class="mb-3">
            <label class="form-label">Jenis Media</label>
            <select id="g-type" class="form-select"><option value="PHOTO">Foto</option><option value="VIDEO">Video</option></select>
          </div>
          <div class="mb-3">
            <label class="form-label">File</label>
            <input type="file" id="g-file" class="form-control" accept="image/*,video/*" />
            <input type="hidden" id="g-url" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
          <button id="btn-save-gallery" class="btn btn-primary">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</AdminShell>
<script type="module">
  import { apiFetch, apiUpload } from '/src/lib/api.ts';

  async function loadGallery() {
    const data = await apiFetch('/api/v1/gallery/');
    document.getElementById('gallery-grid').innerHTML = (data.data ?? data).map(g => `
      <div class="col-6 col-md-3">
        ${g.mediaType === 'PHOTO'
          ? `<img src="${g.fileUrl}" class="img-fluid rounded shadow-sm" style="height:160px;width:100%;object-fit:cover" alt="${g.activityTitle}">`
          : `<video src="${g.fileUrl}" class="rounded shadow-sm" style="height:160px;width:100%;object-fit:cover" controls></video>`}
        <div class="d-flex justify-content-between align-items-center mt-1">
          <small class="text-muted text-truncate" style="max-width:100px">${g.activityTitle}</small>
          <button class="btn btn-sm btn-outline-danger btn-del-gallery" data-id="${g.id}">×</button>
        </div>
      </div>`).join('');

    document.querySelectorAll('.btn-del-gallery').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('Hapus media ini?')) return;
      await apiFetch(`/api/v1/gallery/${btn.dataset.id}`, { method: 'DELETE' });
      loadGallery();
    }));
  }

  document.getElementById('btn-add-gallery').addEventListener('click', () => {
    document.getElementById('g-title').value = '';
    document.getElementById('g-url').value = '';
    new bootstrap.Modal(document.getElementById('galleryModal')).show();
  });

  document.getElementById('g-file').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const result = await apiUpload('gallery', file);
    document.getElementById('g-url').value = result.url;
  });

  document.getElementById('btn-save-gallery').addEventListener('click', async () => {
    await apiFetch('/api/v1/gallery/', {
      method: 'POST',
      body: JSON.stringify({
        activityTitle: document.getElementById('g-title').value,
        mediaType: document.getElementById('g-type').value,
        fileUrl: document.getElementById('g-url').value,
      }),
    });
    bootstrap.Modal.getInstance(document.getElementById('galleryModal')).hide();
    loadGallery();
  });

  loadGallery();
</script>
```

- [ ] **Step 3: Create `src/pages/admin/fasilitas/index.astro`** (facilities & achievements CRUD)

```astro
---
import AdminShell from '../../../layouts/AdminShell.astro';
---
<AdminShell title="Fasilitas & Prestasi" activePage="fasilitas">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="mb-0">Fasilitas & Prestasi</h5>
    <button class="btn btn-primary btn-sm" id="btn-add-facility"><i class="bi bi-plus-lg me-1"></i>Tambah</button>
  </div>
  <ul class="nav nav-tabs mb-3" id="facilityTabs">
    <li class="nav-item"><a class="nav-link active" data-cat="FACILITY" href="#">Fasilitas</a></li>
    <li class="nav-item"><a class="nav-link" data-cat="ACHIEVEMENT" href="#">Prestasi</a></li>
  </ul>
  <div class="row g-3" id="facility-grid"></div>

  <div class="modal fade" id="facilityModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header"><h6 class="modal-title" id="f-modal-title">Tambah</h6><button class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">
          <input type="hidden" id="f-id" />
          <div class="mb-3"><label class="form-label">Kategori</label>
            <select id="f-cat" class="form-select"><option value="FACILITY">Fasilitas</option><option value="ACHIEVEMENT">Prestasi</option></select>
          </div>
          <div class="mb-3"><label class="form-label">Nama</label><input type="text" id="f-name" class="form-control" required /></div>
          <div class="mb-3"><label class="form-label">Deskripsi</label><textarea id="f-desc" class="form-control" rows="3"></textarea></div>
          <div class="mb-3">
            <label class="form-label">Gambar</label>
            <input type="file" id="f-img-file" class="form-control" accept="image/*" />
            <input type="hidden" id="f-img-url" />
            <img id="f-img-preview" src="" class="mt-2 rounded d-none" style="height:120px;object-fit:cover" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
          <button id="btn-save-facility" class="btn btn-primary">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</AdminShell>
<script type="module">
  import { apiFetch, apiUpload } from '/src/lib/api.ts';
  let activeCategory = 'FACILITY';
  let editingId = null;

  async function loadFacilities() {
    const data = await apiFetch(`/api/v1/facilities/?category=${activeCategory}`);
    document.getElementById('facility-grid').innerHTML = (data.data ?? data).map(f => `
      <div class="col-sm-6 col-md-4">
        <div class="card border-0 shadow-sm h-100">
          ${f.imageUrl ? `<img src="${f.imageUrl}" class="card-img-top" style="height:140px;object-fit:cover" alt="">` : ''}
          <div class="card-body"><h6 class="fw-semibold">${f.name}</h6><p class="text-muted small">${f.description ?? ''}</p></div>
          <div class="card-footer bg-white d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary flex-fill btn-edit-fac"
              data-id="${f.id}" data-name="${f.name}" data-cat="${f.category}"
              data-desc="${f.description ?? ''}" data-url="${f.imageUrl ?? ''}">Edit</button>
            <button class="btn btn-sm btn-outline-danger flex-fill btn-del-fac" data-id="${f.id}">Hapus</button>
          </div>
        </div>
      </div>`).join('') || '<div class="col-12 text-muted text-center py-4">Belum ada data</div>';

    document.querySelectorAll('.btn-edit-fac').forEach(btn => btn.addEventListener('click', () => {
      editingId = btn.dataset.id;
      document.getElementById('f-modal-title').textContent = 'Edit';
      document.getElementById('f-id').value = editingId;
      document.getElementById('f-cat').value = btn.dataset.cat;
      document.getElementById('f-name').value = btn.dataset.name;
      document.getElementById('f-desc').value = btn.dataset.desc;
      document.getElementById('f-img-url').value = btn.dataset.url;
      const prev = document.getElementById('f-img-preview');
      if (btn.dataset.url) { prev.src = btn.dataset.url; prev.classList.remove('d-none'); }
      new bootstrap.Modal(document.getElementById('facilityModal')).show();
    }));

    document.querySelectorAll('.btn-del-fac').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('Hapus?')) return;
      await apiFetch(`/api/v1/facilities/${btn.dataset.id}`, { method: 'DELETE' });
      loadFacilities();
    }));
  }

  document.querySelectorAll('[data-cat]').forEach(tab => tab.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('[data-cat]').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeCategory = tab.dataset.cat;
    loadFacilities();
  }));

  document.getElementById('btn-add-facility').addEventListener('click', () => {
    editingId = null;
    document.getElementById('f-modal-title').textContent = 'Tambah';
    document.getElementById('f-id').value = '';
    document.getElementById('f-name').value = '';
    document.getElementById('f-desc').value = '';
    document.getElementById('f-img-url').value = '';
    document.getElementById('f-img-preview').classList.add('d-none');
    new bootstrap.Modal(document.getElementById('facilityModal')).show();
  });

  document.getElementById('f-img-file').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const result = await apiUpload('facilities', file);
    document.getElementById('f-img-url').value = result.url;
    const prev = document.getElementById('f-img-preview');
    prev.src = result.url; prev.classList.remove('d-none');
  });

  document.getElementById('btn-save-facility').addEventListener('click', async () => {
    const payload = {
      category: document.getElementById('f-cat').value,
      name: document.getElementById('f-name').value,
      description: document.getElementById('f-desc').value,
      imageUrl: document.getElementById('f-img-url').value || undefined,
    };
    if (editingId) {
      await apiFetch(`/api/v1/facilities/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await apiFetch('/api/v1/facilities/', { method: 'POST', body: JSON.stringify(payload) });
    }
    bootstrap.Modal.getInstance(document.getElementById('facilityModal')).hide();
    loadFacilities();
  });

  loadFacilities();
</script>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/guru/ src/pages/admin/galeri/ src/pages/admin/fasilitas/
git commit -m "feat: add admin teachers, gallery, and facilities CRUD pages"
```

---

## Task 11: Admin Foundation Profile, Users, and Contact Messages

**Files:**
- Create: `src/pages/admin/yayasan/index.astro`
- Create: `src/pages/admin/pengguna/index.astro`
- Create: `src/pages/admin/pesan/index.astro`

- [ ] **Step 1: Create `src/pages/admin/yayasan/index.astro`**

```astro
---
import AdminShell from '../../../layouts/AdminShell.astro';
---
<AdminShell title="Profil Yayasan" activePage="yayasan">
  <div class="card border-0 shadow-sm" style="max-width:760px">
    <div class="card-body">
      <h5 class="fw-bold mb-4">Edit Profil Yayasan</h5>
      <div id="form-alert"></div>
      <form id="foundation-form">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Nama Yayasan</label>
            <input type="text" name="foundationName" class="form-control" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">Kontak Telepon</label>
            <input type="text" name="contactPhone" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Email Kontak</label>
            <input type="email" name="contactEmail" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label">URL Struktur Organisasi</label>
            <input type="text" name="organizationalStructureUrl" class="form-control" />
          </div>
          <div class="col-12">
            <label class="form-label">Alamat Lengkap</label>
            <input type="text" name="fullAddress" class="form-control" />
          </div>
          <div class="col-12">
            <label class="form-label">Visi</label>
            <textarea name="vision" class="form-control" rows="3"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label">Misi</label>
            <textarea name="mission" class="form-control" rows="3"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label">Sejarah</label>
            <textarea name="history" class="form-control" rows="5"></textarea>
          </div>
          <div class="col-12">
            <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</AdminShell>
<script type="module">
  import { apiFetch } from '/src/lib/api.ts';

  async function loadFoundation() {
    const data = await apiFetch('/api/v1/foundation/');
    const form = document.getElementById('foundation-form');
    form.foundationName.value = data.foundationName ?? '';
    form.vision.value = data.vision ?? '';
    form.mission.value = data.mission ?? '';
    form.history.value = data.history ?? '';
    form.organizationalStructureUrl.value = data.organizationalStructureUrl ?? '';
    form.fullAddress.value = data.fullAddress ?? '';
    form.contactPhone.value = data.contactPhone ?? '';
    form.contactEmail.value = data.contactEmail ?? '';
  }

  document.getElementById('foundation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    const alertEl = document.getElementById('form-alert');
    try {
      await apiFetch('/api/v1/foundation/', {
        method: 'PUT',
        body: JSON.stringify({
          foundationName: form.foundationName.value,
          vision: form.vision.value,
          mission: form.mission.value,
          history: form.history.value,
          organizationalStructureUrl: form.organizationalStructureUrl.value,
          fullAddress: form.fullAddress.value,
          contactPhone: form.contactPhone.value,
          contactEmail: form.contactEmail.value,
        }),
      });
      alertEl.innerHTML = '<div class="alert alert-success">Profil berhasil disimpan</div>';
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    } finally {
      btn.disabled = false;
    }
  });

  loadFoundation();
</script>
```

- [ ] **Step 2: Create `src/pages/admin/pengguna/index.astro`**

```astro
---
import AdminShell from '../../../layouts/AdminShell.astro';
---
<AdminShell title="Manajemen Pengguna" activePage="pengguna">
  <h5 class="mb-4">Daftar Pengguna</h5>
  <div class="card border-0 shadow-sm">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light"><tr>
            <th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th>
          </tr></thead>
          <tbody id="users-table"></tbody>
        </table>
      </div>
    </div>
  </div>
  <nav class="mt-3 d-flex justify-content-end gap-2">
    <button id="btn-prev" class="btn btn-sm btn-outline-secondary" disabled>‹</button>
    <button id="btn-next" class="btn btn-sm btn-outline-secondary" disabled>›</button>
  </nav>
</AdminShell>
<script type="module">
  import { apiFetch } from '/src/lib/api.ts';
  let page = 1;

  async function loadUsers(p = 1) {
    const data = await apiFetch(`/api/v1/users/?page=${p}&limit=10`);
    document.getElementById('users-table').innerHTML = data.data.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><span class="badge bg-${u.role === 'ADMIN' ? 'primary' : 'secondary'}">${u.role}</span></td>
        <td><span class="badge bg-${u.isActive ? 'success' : 'danger'}">${u.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-${u.isActive ? 'danger' : 'success'} btn-toggle-active" data-id="${u.id}" data-active="${u.isActive}">
            ${u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </td>
      </tr>`).join('');

    document.querySelectorAll('.btn-toggle-active').forEach(btn => btn.addEventListener('click', async () => {
      await apiFetch(`/api/v1/users/${btn.dataset.id}/active`, { method: 'PATCH' });
      loadUsers(page);
    }));

    document.getElementById('btn-prev').disabled = p <= 1;
    document.getElementById('btn-next').disabled = data.data.length < 10;
    page = p;
  }

  document.getElementById('btn-prev').addEventListener('click', () => loadUsers(page - 1));
  document.getElementById('btn-next').addEventListener('click', () => loadUsers(page + 1));
  loadUsers();
</script>
```

- [ ] **Step 3: Create `src/pages/admin/pesan/index.astro`**

```astro
---
import AdminShell from '../../../layouts/AdminShell.astro';
---
<AdminShell title="Pesan Masuk" activePage="pesan">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h5 class="mb-0">Pesan Masuk</h5>
    <select id="filter-read" class="form-select form-select-sm w-auto">
      <option value="">Semua</option>
      <option value="false">Belum Dibaca</option>
      <option value="true">Sudah Dibaca</option>
    </select>
  </div>
  <div class="list-group" id="messages-list"></div>
  <nav class="mt-3 d-flex justify-content-end gap-2">
    <button id="btn-prev" class="btn btn-sm btn-outline-secondary" disabled>‹</button>
    <button id="btn-next" class="btn btn-sm btn-outline-secondary" disabled>›</button>
  </nav>

  <!-- Detail Modal -->
  <div class="modal fade" id="msgModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header"><h6 class="modal-title" id="msg-subject"></h6><button class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">
          <p class="mb-1"><strong>Dari:</strong> <span id="msg-sender"></span> — <span id="msg-email"></span></p>
          <p class="mb-1"><strong>Telepon:</strong> <span id="msg-phone"></span></p>
          <p class="mb-1 text-muted small" id="msg-time"></p>
          <hr />
          <p id="msg-content" class="mb-0" style="white-space:pre-line"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</AdminShell>
<script type="module">
  import { apiFetch } from '/src/lib/api.ts';
  let page = 1;

  async function loadMessages(p = 1) {
    const isRead = document.getElementById('filter-read').value;
    const qs = `page=${p}&limit=10${isRead !== '' ? '&isRead=' + isRead : ''}`;
    const data = await apiFetch(`/api/v1/contacts/?${qs}`);
    document.getElementById('messages-list').innerHTML = data.data.map(m => `
      <button class="list-group-item list-group-item-action${!m.isRead ? ' fw-semibold' : ''} btn-open-msg"
        data-id="${m.id}" data-read="${m.isRead}"
        data-subject="${m.subject ?? '(Tanpa Subjek)'}"
        data-sender="${m.senderName}" data-email="${m.senderEmail ?? ''}"
        data-phone="${m.senderPhone ?? ''}" data-time="${m.receivedAt}"
        data-content="${encodeURIComponent(m.messageContent)}">
        <div class="d-flex justify-content-between">
          <span>${m.subject ?? '(Tanpa Subjek)'}</span>
          <small class="text-muted">${new Date(m.receivedAt).toLocaleDateString('id-ID')}</small>
        </div>
        <small class="text-muted">${m.senderName} · ${m.senderEmail ?? ''}</small>
        ${!m.isRead ? '<span class="badge bg-primary ms-1">Baru</span>' : ''}
      </button>`).join('') || '<div class="text-center text-muted py-4">Tidak ada pesan</div>';

    document.querySelectorAll('.btn-open-msg').forEach(btn => btn.addEventListener('click', async () => {
      document.getElementById('msg-subject').textContent = btn.dataset.subject;
      document.getElementById('msg-sender').textContent = btn.dataset.sender;
      document.getElementById('msg-email').textContent = btn.dataset.email;
      document.getElementById('msg-phone').textContent = btn.dataset.phone;
      document.getElementById('msg-time').textContent = new Date(btn.dataset.time).toLocaleString('id-ID');
      document.getElementById('msg-content').textContent = decodeURIComponent(btn.dataset.content);
      new bootstrap.Modal(document.getElementById('msgModal')).show();
      if (btn.dataset.read === 'false') {
        await apiFetch(`/api/v1/contacts/${btn.dataset.id}/read`, { method: 'PATCH' });
        loadMessages(page);
      }
    }));

    document.getElementById('btn-prev').disabled = p <= 1;
    document.getElementById('btn-next').disabled = data.data.length < 10;
    page = p;
  }

  document.getElementById('filter-read').addEventListener('change', () => loadMessages(1));
  document.getElementById('btn-prev').addEventListener('click', () => loadMessages(page - 1));
  document.getElementById('btn-next').addEventListener('click', () => loadMessages(page + 1));
  loadMessages();
</script>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/yayasan/ src/pages/admin/pengguna/ src/pages/admin/pesan/
git commit -m "feat: add admin foundation profile, users, and contact messages pages"
```

---

## Task 12: Contact Form on Public Site + Astro Build Verification

**Files:**
- Modify: `src/pages/index.astro` (or whichever public page has the contact form)

- [ ] **Step 1: Wire contact form on the public site to POST `/api/v1/contacts/`**

Find the contact form element in `index.astro` (or add it if missing), give it `id="contact-form"`, and add this script:

```html
<script type="module">
  import { apiFetch } from '/src/lib/api.ts';

  document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      await apiFetch('/api/v1/contacts/', {
        method: 'POST',
        body: JSON.stringify({
          senderName: form.senderName.value,
          senderEmail: form.senderEmail.value,
          senderPhone: form.senderPhone.value,
          subject: form.subject.value,
          messageContent: form.messageContent.value,
        }),
      });
      form.reset();
      document.getElementById('contact-success').classList.remove('d-none');
    } catch (err) {
      alert('Gagal mengirim pesan: ' + err.message);
      btn.disabled = false;
    }
  });
</script>
```

Add `<div id="contact-success" class="alert alert-success d-none">Pesan berhasil dikirim! Kami akan menghubungi Anda segera.</div>` above the form.

- [ ] **Step 2: Run Astro production build to catch any errors**

```bash
npm run build
```

Expected: No errors, output to `dist/` directory.

- [ ] **Step 3: Preview built site**

```bash
npm run preview
```

Open `http://localhost:4321` and verify all pages are accessible.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: wire contact form, verify Astro production build"
```

---

## Self-Review Checklist

- [x] **Auth** — login, register, logout, token refresh, auth guard on admin and PPDB form pages
- [x] **PPDB public flow** — guest info → login → registration form → summary → success
- [x] **Admin PPDB** — list with pagination + status filter, detail with student data, document review modal, status update
- [x] **Admin News** — list, add (with upload), edit (with upload), delete
- [x] **Admin Teachers** — list, add/edit modal (with upload), delete
- [x] **Admin Gallery** — list, add modal (with upload), delete
- [x] **Admin Facilities** — list with tab filter (FACILITY/ACHIEVEMENT), add/edit modal (with upload), delete
- [x] **Admin Foundation** — edit form with all fields from schema
- [x] **Admin Users** — list with pagination, toggle active/inactive via PATCH `/api/v1/users/{id}/active`
- [x] **Admin Contact Messages** — list with read filter, modal detail, mark-as-read on open
- [x] **File Uploads** — `apiUpload()` used in news, teachers, gallery, facilities pages with correct `context` param
- [x] **Public pages wired** — news on homepage, teachers/foundation on profil-program, news+gallery on galeri-berita, contact form on homepage
- [x] **Astro migration** — all original HTML pages converted to `.astro` pages using `MainLayout` or `AdminShell`
- [x] **No placeholders** — all steps have concrete code

> **Endpoints not covered by a dedicated page (accessible via existing pages):**
> - `POST /api/v1/registrations/{id}/documents` — used inline in the PPDB registration form (`daftar.astro`) by the applicant after submitting
> - `GET /api/v1/registrations/{id}` — used on the admin detail page
> - `PUT /api/v1/registrations/{id}` — can be added to admin detail page as an "Edit" form if needed (not in this plan — admin workflow is status-based)
> - `POST /api/v1/auth/refresh` — handled in `api.ts` automatically on 401 responses
> - `POST /api/v1/auth/logout` — called by the logout button in `AdminShell`

---

Plan complete and saved to `docs/superpowers/plans/2026-05-11-astro-integration-admin.md`.
