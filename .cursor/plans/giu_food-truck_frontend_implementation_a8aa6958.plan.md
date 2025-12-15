---
name: GIU Food-truck Frontend Implementation
overview: Complete frontend rebuild for GIU Food-truck System Milestone 4, implementing a modern glass/gradient UI theme with role-based navigation, shared utilities, and all required customer and owner pages using Hogan templates, Bootstrap, and jQuery AJAX.
todos: []
---

# GIU Food-truck System - Milestone 4 Frontend Implementation Plan

## Architecture Overview

The frontend will be rebuilt with a clean structure using:

- **Templates**: Hogan (.hjs) with shared partials
- **Styling**: Bootstrap + custom glass/gradient theme in `public/styles/style.css`
- **Frontend Logic**: jQuery + AJAX with shared utilities
- **Authentication**: Role-based routing (Customer → `/dashboard`, Owner → `/ownerDashboard`)

## Directory Structure

```
views/
  ├── partials/
  │   ├── head.hjs          (CSS imports + meta tags)
  │   ├── navbar.hjs        (Role-aware navigation)
  │   └── footerScripts.hjs (jQuery/Bootstrap + shared utils)
  ├── login.hjs
  ├── register.hjs
  ├── customerHomepage.hjs  (Customer Dashboard)
  ├── trucks.hjs           (Browse Trucks)
  ├── truckMenu.hjs         (Truck Menu with category filter)
  ├── cart.hjs              (Cart management)
  ├── myOrders.hjs          (Customer Orders)
  ├── ownerDashboard.hjs    (Owner Dashboard)
  ├── menuItems.hjs         (Menu Items Management)
  ├── addMenuItem.hjs       (Add Menu Item Form)
  └── truckOrders.hjs       (Truck Orders Management)

public/src/
  ├── apiClient.js          (AJAX wrapper with error handling)
  ├── ui.js                 (Toast/alerts, loaders, empty states)
  ├── authGuard.js          (Redirect if not logged in/wrong role)
  ├── login.js
  ├── register.js
  ├── customerHomepage.js
  ├── trucks.js
  ├── truckMenu.js
  ├── cart.js
  ├── myOrders.js
  ├── ownerDashboard.js
  ├── menuItems.js
  ├── addMenuItem.js
  └── truckOrders.js
```

## Implementation Phases

### Phase 0: Reset & Foundation (Teammate A)

**Files to create/modify:**

- `views/partials/head.hjs` - Shared head with Bootstrap + custom CSS
- `views/partials/navbar.hjs` - Role-aware navbar (Customer vs Owner menus)
- `views/partials/footerScripts.hjs` - jQuery, Bootstrap, shared JS utilities
- `public/src/apiClient.js` - AJAX wrapper with automatic error handling
- `public/src/ui.js` - Toast notifications, loading spinners, empty states
- `public/src/authGuard.js` - Client-side auth/role checking
- `public/styles/style.css` - Modern glass/gradient theme

**Key Features:**

- Glass cards: `backdrop-filter: blur(10px)`, rounded 16-20px, soft shadows
- Gradient background: dark → purple gradient
- Color scheme: Primary violet/purple, Accent orange for CTAs
- Status badges: pending (yellow), preparing (blue), ready (green), completed (gray), cancelled (red)
- Responsive Bootstrap components with custom overrides

**API Client (`apiClient.js`):**

```javascript
// Wrapper around $.ajax with:
// - Automatic error handling
// - Loading state management
// - Toast notifications for errors
// - Cookie-based auth (session_token)
```

**UI Utilities (`ui.js`):**

```javascript
// Functions:
// - showToast(message, type) - success/error/info
// - showLoader(element) / hideLoader()
// - showEmptyState(container, message)
// - formatCurrency(amount)
// - formatDate(date)
```

**Auth Guard (`authGuard.js`):**

```javascript
// Functions:
// - checkAuth() - redirect to / if not logged in
// - checkRole(expectedRole) - redirect to correct dashboard if wrong role
// - getCurrentUser() - fetch user info from session
```

### Phase 1: Authentication Pages (Teammate A)

**Files:**

- `views/login.hjs` - Refactor to use partials, modern styling
- `views/register.hjs` - Refactor to use partials, modern styling
- `public/src/login.js` - Enhanced with apiClient, role-based redirect
- `public/src/register.js` - Enhanced with apiClient, validation

**Routes:**

- `/` → `login.hjs` (POST `/api/v1/user/login`)
- `/register` → `register.hjs` (POST `/api/v1/user`)

**After login redirect:**

- Customer → `/dashboard`
- Truck Owner → `/ownerDashboard`

### Phase 2: Customer Flow (Teammate B)

**Customer Dashboard (`/dashboard`):**

- File: `views/customerHomepage.hjs`, `public/src/customerHomepage.js`
- Features: Quick action cards, "How it works" section, logout button
- Route: Already exists in `routes/private/view.js`

**Browse Trucks (`/trucks`):**

- Files: `views/trucks.hjs`, `public/src/trucks.js`
- API: `GET /api/v1/trucks/view`
- Features: Truck cards with "View Menu" buttons, empty state
- Route: Add to `routes/private/view.js`

**Truck Menu (`/truckMenu/:truckId`):**

- Files: `views/truckMenu.hjs`, `public/src/truckMenu.js`
- APIs: 
  - `GET /api/v1/menuItem/truck/:truckId` (all items)
  - `GET /api/v1/menuItem/truck/:truckId/category/:category` (filtered)
  - `POST /api/v1/cart/new` (add to cart)
- Features: Category filter buttons, quantity selector, add-to-cart with success toast
- Route: Add to `routes/private/view.js`

### Phase 3: Cart & Customer Orders (Teammate C)

**Cart (`/cart`):**

- Files: `views/cart.hjs`, `public/src/cart.js`
- APIs:
  - `GET /api/v1/cart/view` (load cart)
  - `PUT /api/v1/cart/edit/:cartId` (update quantity)
  - `DELETE /api/v1/cart/delete/:cartId` (remove item)
  - `POST /api/v1/order/new` (place order)
- Features: 
  - View items with +/- quantity controls
  - Remove item button
  - Total price calculation
  - Pickup time selector (datetime-local input)
  - Place order button with validation
- Route: Add to `routes/private/view.js`

**My Orders (`/myOrders`):**

- Files: `views/myOrders.hjs`, `public/src/myOrders.js`
- APIs:
  - `GET /api/v1/order/myOrders` (list orders)
  - `GET /api/v1/order/details/:orderId` (order details)
- Features:
  - Orders sorted newest first
  - Status color badges (pending/preparing/ready/completed/cancelled)
  - Order details modal/section
  - Empty state when no orders
- Route: Add to `routes/private/view.js`

### Phase 4: Owner Portal (Teammate D)

**Owner Dashboard (`/ownerDashboard`):**

- Files: `views/ownerDashboard.hjs`, `public/src/ownerDashboard.js`
- APIs:
  - `GET /api/v1/trucks/myTruck` (truck info)
  - `GET /api/v1/order/truckOrders` (recent orders summary)
  - `PUT /api/v1/trucks/updateOrderStatus` (availability toggle)
- Features:
  - Truck information display
  - Stats cards (total orders, pending orders, etc.)
  - Availability toggle (available/unavailable)
  - Recent orders summary table
- Route: Update `routes/private/view.js` (currently renders `truckOwnerHomePage`)

**Menu Items (`/menuItems`):**

- Files: `views/menuItems.hjs`, `public/src/menuItems.js`
- APIs:
  - `GET /api/v1/menuItem/view` (list items)
  - `GET /api/v1/menuItem/view/:itemId` (view details)
  - `PUT /api/v1/menuItem/edit/:itemId` (edit)
  - `DELETE /api/v1/menuItem/delete/:itemId` (delete with confirm)
- Features:
  - Table view of all menu items
  - View details modal/section
  - Edit button (navigate to edit form or inline edit)
  - Delete button with confirmation dialog
- Route: Add to `routes/private/view.js`

**Add Menu Item (`/addMenuItem`):**

- Files: `views/addMenuItem.hjs`, `public/src/addMenuItem.js`
- API: `POST /api/v1/menuItem/new`
- Features:
  - Form with validation (name, price, category, description)
  - Success toast + redirect to `/menuItems`
- Route: Add to `routes/private/view.js`

**Truck Orders (`/truckOrders`):**

- Files: `views/truckOrders.hjs`, `public/src/truckOrders.js`
- APIs:
  - `GET /api/v1/order/truckOrders` (list orders)
  - `GET /api/v1/order/truckOwner/:orderId` (order details)
  - `PUT /api/v1/order/updateStatus/:orderId` (update status)
- Features:
  - Filter tabs (All, Pending, Preparing, Ready, Completed, Cancelled)
  - Order cards/table with status badges
  - View details modal/section
  - Update status dropdown with estimated pickup time input
- Route: Add to `routes/private/view.js`

## Route Updates Required

**In `routes/private/view.js`, add:**

```javascript
// Customer routes
app.get('/trucks', async (req, res) => {
  const user = await getUser(req);
  if (user.role !== 'customer') return res.redirect('/dashboard');
  return res.render('trucks');
});

app.get('/truckMenu/:truckId', async (req, res) => {
  const user = await getUser(req);
  if (user.role !== 'customer') return res.redirect('/dashboard');
  return res.render('truckMenu', { truckId: req.params.truckId });
});

app.get('/cart', async (req, res) => {
  const user = await getUser(req);
  if (user.role !== 'customer') return res.redirect('/dashboard');
  return res.render('cart');
});

app.get('/myOrders', async (req, res) => {
  const user = await getUser(req);
  if (user.role !== 'customer') return res.redirect('/dashboard');
  return res.render('myOrders');
});

// Owner routes
app.get('/ownerDashboard', async (req, res) => {
  const user = await getUser(req);
  if (user.role !== 'truckOwner') return res.redirect('/dashboard');
  return res.render('ownerDashboard', { name: user.name });
});

app.get('/menuItems', async (req, res) => {
  const user = await getUser(req);
  if (user.role !== 'truckOwner') return res.redirect('/dashboard');
  return res.render('menuItems');
});

app.get('/addMenuItem', async (req, res) => {
  const user = await getUser(req);
  if (user.role !== 'truckOwner') return res.redirect('/dashboard');
  return res.render('addMenuItem');
});

app.get('/truckOrders', async (req, res) => {
  const user = await getUser(req);
  if (user.role !== 'truckOwner') return res.redirect('/dashboard');
  return res.render('truckOrders');
});
```

**Update `/dashboard` route:**

```javascript
app.get('/dashboard', async (req, res) => {
  const user = await getUser(req);
  if (user.role === 'truckOwner') {
    return res.redirect('/ownerDashboard');
  }
  return res.render('customerHomepage', { name: user.name });
});
```

## Navbar Menu Structure

**Customer Navbar (`views/partials/navbar.hjs`):**

- Dashboard
- Trucks
- Cart
- My Orders
- Logout

**Owner Navbar:**

- Owner Dashboard
- Menu Items
- Add Menu Item
- Truck Orders
- Logout

## Styling Guidelines

**Glass Card Style:**

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

**Status Badges:**

- `.badge-pending` - yellow background
- `.badge-preparing` - blue background
- `.badge-ready` - green background
- `.badge-completed` - gray background
- `.badge-cancelled` - red background

**Gradient Background:**

```css
body {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #533483 100%);
  min-height: 100vh;
}
```

## Testing Checklist

- [ ] All AJAX calls visible in Network tab
- [ ] Redirects work correctly (unauth → login, wrong role → correct dashboard)
- [ ] No duplicate HTML IDs across pages
- [ ] Loading states show during API calls
- [ ] Error handling displays user-friendly messages
- [ ] Empty states display when no data
- [ ] Toast notifications appear for success/error
- [ ] Role-based navbar shows correct menu items
- [ ] All forms validate before submission
- [ ] Status badges display correct colors

## Cleanup Tasks

**Files to remove/refactor:**

- Remove duplicate/unused view files
- Consolidate CSS into `style.css`
- Remove inline styles from templates
- Ensure all templates use partials

**Files to keep:**

- `views/login.hjs` (refactor)
- `views/register.hjs` (refactor)
- `views/customerHomepage.hjs` (refactor)
- `views/truckOwnerHomePage.hjs` (replace with ownerDashboard.hjs)