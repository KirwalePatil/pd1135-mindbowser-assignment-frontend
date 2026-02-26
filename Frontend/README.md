# Knowledge Sharing Platform

A clean, scalable React frontend for a knowledge sharing platform with auth, protected routes, and Tailwind CSS.

## Stack

- **React 18** (functional components only)
- **React Router v6**
- **AuthContext** with JWT in `localStorage`
- **Axios** instance with request interceptor to attach JWT and 401 logout
- **Tailwind CSS v4** (Vite plugin)
- **Vite**

## Project structure

```
src/
├── api/
│   └── axios.js           # Axios instance + JWT interceptor
├── components/
│   ├── Navbar.jsx         # Reusable nav with auth links
│   └── ProtectedRoute.jsx # Redirects to /login when unauthenticated
├── context/
│   └── AuthContext.jsx    # login, logout, user, token, isAuthenticated
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── ArticleDetail.jsx
│   ├── CreateEditArticle.jsx  # New + Edit (by route param)
│   ├── Dashboard.jsx
│   └── index.js
├── utils/
│   └── authStorage.js     # localStorage helpers for JWT/user
├── App.jsx
├── main.jsx
└── index.css
```

## Scripts

- `npm install` – install dependencies
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview production build

## Auth and API

- **JWT** is stored in `localStorage` via `authStorage.js`; `AuthContext` exposes `login`, `logout`, `user`, `token`, `isAuthenticated`.
- **Axios** instance in `src/api/axios.js` attaches `Authorization: Bearer <token>` to requests and clears auth on 401.
- Set `VITE_API_BASE_URL` in `.env` for your API base URL (defaults to `/api`).

Login and Signup currently use mock auth (no backend). Replace the `handleSubmit` logic in those pages with real `api.post('/auth/login')` and `api.post('/auth/signup')` calls and pass the returned token and user into `login(token, user)`.

## Routes

| Path | Page | Protected |
|------|------|-----------|
| `/` | Home | No |
| `/login` | Login | No |
| `/signup` | Signup | No |
| `/articles/:id` | ArticleDetail | No |
| `/articles/new` | CreateEditArticle | Yes |
| `/articles/:id/edit` | CreateEditArticle | Yes |
| `/dashboard` | Dashboard | Yes |
