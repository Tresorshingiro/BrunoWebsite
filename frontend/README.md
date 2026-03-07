# Bruno Iradukunda – Frontend

React + Vite + Tailwind frontend for the author website. Public site (Home, About, Books, Blog, Events, Contact), cart & Stripe checkout, and admin panel for managing content and orders.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set:
   - `VITE_API_URL` – leave empty in development (Vite proxies `/api` to the backend).
   - `VITE_STRIPE_PUBLISHABLE_KEY` – use the same value as `STRIPE_PUBLISHABLE_KEY` in the backend `.env` so checkout works.
3. Ensure the backend is running on port 5000.

## Run

- Development: `npm run dev` (frontend on http://localhost:5173)
- Build: `npm run build`
- Preview production build: `npm run preview`

## Admin

- Go to `/admin` and sign in with the admin account (create the first one via backend `POST /api/auth/register` if needed).
- From the admin panel you can add/edit/delete books, blog posts, and events, and view/update orders and contact messages.

## Images

Author and book images are in `public/images/` (e.g. `bruno-portrait.png`, `bruno-standing.png`, `book-cover.png`). Replace or add assets there as needed.
