# RentEase – Furniture & Appliance Rental Platform

RentEase is a rental-first furniture and appliance platform. Customers can compare daily and monthly rates, choose a rental period, review refundable security deposits, and book delivery after signing in.

## Rental workflow

1. Browse available furniture and appliances with daily and monthly rental rates.
2. Select a rental duration (1, 3, 6, or 12 months) and add items to the rental basket.
3. Sign in or create an account before adding items to the saved basket.
4. Review rental charges, refundable deposits, and the one-time delivery fee.
5. Enter delivery information and complete the secure Stripe checkout.
6. View the confirmed booking and its rental details under **My Rentals**.

The server calculates rental charges and deposits from the product catalog; checkout totals sent by the browser are not trusted. Legacy product records without rental fields are assigned a fallback monthly rent of 5% of their stored product value, a daily rate derived from the monthly rate, and a refundable deposit of 15% of the stored value. New catalog entries should always specify rental prices and deposits directly.

## Features

### Customer storefront
- Furniture and appliance rental catalog
- Daily/monthly rental pricing and rental duration selection
- Refundable security deposit disclosure
- Sign-in-required, server-persisted rental basket with live item count
- Authenticated booking workflow and delivery details
- Stripe payment verification and customer booking history

### Admin dashboard and API
- Product catalog management with monthly and daily rent and refundable deposit
- Rental dashboard with booking, active rental, catalog, and refundable deposit summaries
- Product photo uploads with search, category filtering, item editing, and removal
- Booking search, payment visibility, delivery/customer details, and booking status updates
- First-admin setup, administrator sign-in, and authenticated product/booking management APIs
- JWT-based customer authentication
- MongoDB persistence and image uploads

## Tech stack

| Layer | Technologies |
| --- | --- |
| Customer storefront | React, Vite, React Router |
| Admin dashboard | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Payments | Stripe Checkout |
| Deployment | Render |

## Local setup

Requirements: Node.js 16+, npm, a MongoDB connection string, and Stripe test credentials.

### Backend

```powershell
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=4000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:5173
```

Use a valid Stripe secret key from your Stripe dashboard (a test key for development). Set the same key in the backend environment on your hosting provider, then redeploy the backend. Do not put the secret key in the customer storefront or commit it to source control.

For local storefront development, create `client/.env.local`:

```env
VITE_API_URL=http://localhost:4000
VITE_ADMIN_URL=http://localhost:5174
```

Set `VITE_API_URL` to the publicly reachable backend URL in the storefront's deployment environment, and `VITE_ADMIN_URL` to the deployed admin URL. Vite embeds these values at build time.

Run the API:

```powershell
npm start
```

### Customer storefront

```powershell
cd client
npm install
npm run dev
```

### Admin dashboard

```powershell
cd admin
npm install
npm run dev
```

The admin dashboard uses `VITE_API_URL` for its backend (defaults to `http://localhost:4000`) and `VITE_STOREFRONT_URL` for the storefront link (defaults to `http://localhost:5173`). On first launch, create the first administrator account from the admin sign-in screen. Public admin setup closes after that account exists; subsequent administrators must sign in with an existing account. Admin product mutations and booking list/status APIs require an administrator session.

The dashboard adapts to phones, tablets, desktop, and wide screens. It includes a keyboard-operable navigation drawer and phone bottom navigation, searchable/sortable catalog with confirmation before permanent removal, booking status filters and review warnings for invalid legacy totals, and validated item-photo upload. Admin HTML sets `noindex, nofollow`, `admin/public/robots.txt` disallows crawling, and `admin/public/_headers` contains an `X-Robots-Tag` rule for static hosts that support `_headers` files. For Render, configure `X-Robots-Tag: noindex, nofollow` in the admin static-site response headers as well; Render does not automatically read every host's `_headers` convention.

The storefront uses route-aware title/description, canonical, Open Graph, Twitter Card, and Product/Offer metadata. Product detail routes use `/products/<product-name>-<id-suffix>` while the existing `/product/:id` URLs remain supported and canonicalize to the clean route. The static sitemap and robots file currently use `http://localhost:5174/` as requested for local work. Set `VITE_SITE_URL` to the deployed storefront origin and update `client/public/robots.txt` and `client/public/sitemap.xml` before production deployment. Since this is a client-rendered Vite app, use SSR or prerendering for reliable indexing of route-specific product metadata.

## API routes

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/product/list` | List products with rental pricing |
| POST | `/api/user/register` | Register a customer |
| POST | `/api/user/login` | Sign in a customer |
| POST | `/api/cart/add` | Add an item to the authenticated rental basket |
| POST | `/api/cart/remove` | Decrease an item quantity |
| POST | `/api/cart/get` | Retrieve the authenticated rental basket |
| POST | `/api/cart/rental-term` | Save an item's rental term |
| POST | `/api/order/place` | Create a rental booking and Stripe checkout |
| POST | `/api/order/verify` | Verify Stripe payment and confirm booking |
| POST | `/api/order/userOrders` | List the authenticated customer's bookings |
| GET | `/api/admin/setup-status` | Check whether first-admin setup is available |
| POST | `/api/admin/register` | Create the first administrator account only |
| POST | `/api/admin/login` | Sign in an administrator |
| POST | `/api/product/add` | Add a rental item (admin session required) |
| PUT | `/api/product/update` | Update a rental item (admin session required) |
| POST | `/api/product/remove` | Remove a rental item (admin session required) |
| GET | `/api/order/list` | List bookings (admin session required) |
| PUT | `/api/order/status` | Update a paid booking status (admin session required) |

## Repository structure

```text
client/    Customer storefront
admin/     Admin dashboard
backend/   Express API, MongoDB models, and payment workflow
```
