# Bruno Iradukunda – Frontend

React + Vite + Tailwind frontend for the author website. Public site (Home, About, Books, Blog, Events, Contact), cart & Flutterwave checkout, and admin panel for managing content and orders.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set:
   - `VITE_API_URL` – leave empty in development (Vite proxies `/api` to the backend).
   - `VITE_FLW_PUBLIC_KEY` – the same value as `FLW_PUBLIC_KEY` in the backend `.env`. The checkout normally uses the key the server returns from `POST /api/payment/initiate`; this is the fallback that keeps the page working if the server has none.
3. Ensure the backend is running on port 5000.

## Payments (Flutterwave test mode)

Checkout runs on Flutterwave v3, in RWF, with whole-number amounts — never
multiply by 100. Prices are recomputed server-side on every `initiate`, so a
stale cart price is never what gets charged.

1. Sign up at [flutterwave.com](https://flutterwave.com) and stay in **test mode**.
2. Copy the test keys into the backend `.env`: `FLW_PUBLIC_KEY`, `FLW_SECRET_KEY`,
   `FLW_ENCRYPTION_KEY`, and a `FLW_WEBHOOK_HASH` you invent and paste into the
   dashboard's webhook config.
3. In the dashboard, **uncheck "Enable Dashboard Payment Options"**. While it is
   on, the `payment_options` we send is ignored and every method is shown
   regardless of the tile the customer picked.
4. Rwandan mobile money auto-authorizes after a few seconds in test mode — no
   phone prompt to approve. Card payments use Flutterwave's published test cards.

Only `card` and `mobilemoneyrwanda` are supported for RWF. Bank transfer is
Nigeria-only, which is why the checkout does not offer it.

## Run

- Development: `npm run dev` (frontend on http://localhost:5173)
- Build: `npm run build`
- Preview production build: `npm run preview`

## Admin

- Go to `/admin` and sign in with the admin account (create the first one via backend `POST /api/auth/register` if needed).
- From the admin panel you can add/edit/delete books, blog posts, and events, and view/update orders and contact messages.

## Images

Author and book images are in `public/images/` (e.g. `bruno-portrait.png`, `bruno-standing.png`, `book-cover.png`). Replace or add assets there as needed.
