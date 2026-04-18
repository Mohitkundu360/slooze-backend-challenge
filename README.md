# 🍔 Slooze Food Ordering Backend

Role-based food ordering backend built with **NestJS + GraphQL + Prisma** for the Slooze take-home challenge.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Create database and run migrations
npx prisma db push

# 4. Seed mock data (restaurants, users)
npx ts-node prisma/seed.ts

# 5. Start the server
npx ts-node src/main.ts
```

Server runs at: `http://localhost:3000`  
GraphQL Playground: `http://localhost:3000/graphql`

---

## 🔑 Test Credentials

| Role | Email | Password | Country |
|------|-------|----------|---------|
| Admin | admin@slooze.com | admin123 | INDIA |
| Manager | manager@slooze.com | manager123 | INDIA |
| Member | member@slooze.com | member123 | INDIA |
| Admin (US) | admin.us@slooze.com | admin123 | AMERICA |

---

## 🏗️ Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS
- **API**: GraphQL (Apollo Server)
- **ORM**: Prisma
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Auth**: JWT + RBAC + Re-BAC

---

## 🎯 Role-Based Access Control

| Feature | Admin | Manager | Member |
|---------|-------|---------|--------|
| View restaurants & menu | ✅ | ✅ | ✅ |
| Add items to cart | ✅ | ✅ | ✅ |
| Create an order | ✅ | ✅ | ✅ |
| Checkout & pay | ✅ | ✅ | ❌ |
| Cancel an order | ✅ | ✅ | ❌ |
| Add/modify payment methods | ✅ | ❌ | ❌ |
| View all users | ✅ | ❌ | ❌ |
| View all orders | ✅ | ❌ | ❌ |

---

## 🌍 Re-BAC (Country-Based Access)

Users are restricted to resources within their assigned country:

- **INDIA users** can only see/order from Indian restaurants
- **AMERICA users** can only see/order from American restaurants  
- **ADMIN** can access all countries and filter by country

---

## 🍽️ Mock Data

### Indian Restaurants
- **Spice Garden** — Butter Chicken, Paneer Tikka, Biryani, Naan, Mango Lassi
- **Mumbai Street Eats** — Vada Pav, Pav Bhaji, Pani Puri, Samosa

### American Restaurants
- **The Burger Joint** — Cheeseburger, BBQ Bacon Burger, Fries, Milkshake
- **NYC Pizza Co.** — Margherita Pizza, Pepperoni Pizza, Caesar Salad, Garlic Bread

---

## 📡 GraphQL API

### Authentication
```graphql
# Register
mutation {
  register(
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
    role: "MEMBER"
    country: "INDIA"
  ) {
    token
    user { id email role country }
  }
}

# Login
mutation {
  login(email: "admin@slooze.com", password: "admin123") {
    token
    user { id email role country }
  }
}
```

### Restaurants (All roles)
```graphql
# View restaurants (auto-filtered by country for non-admins)
query {
  restaurants {
    id name cuisine country
    menuItems { id name price description }
  }
}

# Admin: filter by country
query {
  restaurants(country: "AMERICA") {
    id name cuisine
    menuItems { id name price }
  }
}
```

### Cart (All roles)
```graphql
# Add to cart
mutation {
  addToCart(menuItemId: 1, quantity: 2) {
    id
    items { id quantity menuItem { name price } }
  }
}

# View cart
query {
  myCart {
    id
    items { id quantity menuItem { name price } }
  }
}

# Remove from cart
mutation {
  removeFromCart(cartItemId: 1) {
    id items { id quantity }
  }
}

# Clear cart
mutation { clearCart }
```

### Orders (All roles can create)
```graphql
# Create order from cart
mutation {
  createOrder(restaurantId: 1) {
    id totalAmount status
    items { quantity price menuItem { name } }
  }
}

# View my orders
query {
  myOrders {
    id status totalAmount createdAt
    restaurant { name }
    items { quantity menuItem { name price } }
  }
}
```

### Checkout & Cancel (Admin + Manager only)
```graphql
# Checkout order
mutation {
  checkoutOrder(orderId: 1) {
    id status totalAmount
  }
}

# Cancel order
mutation {
  cancelOrder(orderId: 1) {
    id status
  }
}
```

### Payment Methods (Admin only)
```graphql
# Add payment method
mutation {
  addPaymentMethod(
    type: "CREDIT_CARD"
    details: "Visa ending 4242"
    isDefault: true
  ) {
    id type details isDefault
  }
}

# View payment methods
query {
  myPaymentMethods {
    id type details isDefault
  }
}

# Update payment method
mutation {
  updatePaymentMethod(id: 1, isDefault: true) {
    id type isDefault
  }
}

# Delete payment method
mutation { deletePaymentMethod(id: 1) }
```

---

## 🔐 Using Authentication

Add the JWT token to request headers:

```
Authorization: Bearer <your_token_here>
```

In GraphQL Playground, click "HTTP Headers" at the bottom:
```json
{
  "Authorization": "Bearer eyJhbGci..."
}
```

---

## 📁 Project Structure

```
slooze-backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Mock data seeder
│   └── dev.db             # SQLite database (auto-created)
├── src/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.resolver.ts   # login/register mutations
│   │   ├── auth.service.ts    # JWT logic
│   │   ├── jwt-auth.guard.ts  # Authentication guard
│   │   ├── roles.guard.ts     # RBAC guard
│   │   ├── roles.decorator.ts # @Roles decorator
│   │   └── country.guard.ts   # Re-BAC guard
│   ├── users/
│   │   ├── users.module.ts
│   │   └── users.resolver.ts  # me query, admin user list
│   ├── restaurants/
│   │   ├── restaurants.module.ts
│   │   └── restaurants.resolver.ts  # country-filtered queries
│   ├── cart/
│   │   ├── cart.module.ts
│   │   └── cart.resolver.ts   # add/remove/clear cart
│   ├── orders/
│   │   ├── orders.module.ts
│   │   └── orders.resolver.ts # create/checkout/cancel orders
│   ├── payment/
│   │   ├── payment.module.ts
│   │   └── payment.resolver.ts # admin-only payment methods
│   ├── app.module.ts
│   ├── main.ts
│   └── prisma.service.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 Testing the RBAC

### Test as Member (cannot checkout or cancel)
```bash
# 1. Login as member
# 2. Add items to cart
# 3. Create order ✅
# 4. Try checkoutOrder → ForbiddenException ❌
# 5. Try cancelOrder → ForbiddenException ❌
# 6. Try addPaymentMethod → ForbiddenException ❌
```

### Test Re-BAC (country restriction)
```bash
# 1. Login as manager@slooze.com (INDIA)
# 2. Query restaurants → only Indian restaurants returned
# 3. Try restaurant(id: 3) → Access denied (US restaurant) ❌
# 4. Login as admin.us@slooze.com (AMERICA, ADMIN)
# 5. Query restaurants(country: "INDIA") → All Indian restaurants ✅
```

---

## 👨‍💻 Author

**Mohit Kundu**  
Backend Software Engineer  
Email: mohitkundu2003@gmail.com  
GitHub: github.com/Mohitkundu360  
LinkedIn: linkedin.com/in/mohit-kundu-23071827a
