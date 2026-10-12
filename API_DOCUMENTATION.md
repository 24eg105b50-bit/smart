# ShopSphere Campus - REST API Documentation

This document provides a reference for all RESTful endpoints exposed by the ShopSphere Campus Spring Boot backend (`http://localhost:8080/api`).

All endpoints return a uniform JSON envelope structure:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-10-12T09:30:00Z"
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register New Student Account
- **Method & Path**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul.sharma@shopsphere.edu",
  "password": "Password@123",
  "phoneNumber": "+91 98765 43210"
}
```
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "user": {
      "id": 3,
      "email": "rahul.sharma@shopsphere.edu",
      "fullName": "Rahul Sharma",
      "role": "CUSTOMER"
    }
  }
}
```

### 1.2 User Login
- **Method & Path**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "student@shopsphere.edu",
  "password": "Student@123"
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "user": {
      "id": 2,
      "email": "student@shopsphere.edu",
      "fullName": "Ananya Rao",
      "role": "CUSTOMER"
    }
  }
}
```

### 1.3 Get Current User Profile
- **Method & Path**: `GET /api/auth/me`
- **Access**: Authenticated (`CUSTOMER` or `ADMIN`)
- **Headers**: `Authorization: Bearer <jwt_token>`

---

## 2. Product Catalog (`/api/products` & `/api/categories`)

### 2.1 Get All Categories
- **Method & Path**: `GET /api/categories`
- **Access**: Public (Cached via Caffeine)

### 2.2 Get Filtered Products
- **Method & Path**: `GET /api/products`
- **Access**: Public
- **Query Parameters**:
  - `page` (default: 0)
  - `size` (default: 12)
  - `category` (slug string)
  - `keyword` (search title & description)
  - `minPrice` (numeric)
  - `maxPrice` (numeric)
  - `sortBy` (`price_asc`, `price_desc`, `rating`, `newest`)
  - `inStock` (`true` or `false`)

### 2.3 Get Product by Slug
- **Method & Path**: `GET /api/products/slug/{slug}`
- **Access**: Public

### 2.4 Get Related Products
- **Method & Path**: `GET /api/products/{id}/related?limit=4`
- **Access**: Public

---

## 3. Cart & Wishlist Operations (`/api/cart` & `/api/wishlist`)

### 3.1 Get Student Cart
- **Method & Path**: `GET /api/cart`
- **Access**: Authenticated (`CUSTOMER`)
- **Response Data**:
```json
{
  "items": [
    {
      "id": 1,
      "productId": 5,
      "productTitle": "Arduino Uno R3 Starter Kit",
      "productSlug": "arduino-uno-r3-starter-kit",
      "productImageUrl": "https://...",
      "price": 1499.00,
      "quantity": 1,
      "itemTotal": 1499.00
    }
  ],
  "subtotal": 1499.00,
  "totalItems": 1
}
```

### 3.2 Add Item to Cart
- **Method & Path**: `POST /api/cart/items`
- **Request Body**: `{"productId": 5, "quantity": 1}`

### 3.3 Update Item Quantity
- **Method & Path**: `PUT /api/cart/items/{itemId}?quantity=2`

### 3.4 Move Item from Wishlist to Cart
- **Method & Path**: `POST /api/wishlist/items/{productId}/move-to-cart`

---

## 4. Addresses & Orders (`/api/addresses` & `/api/orders`)

### 4.1 Save Campus Hostel Address
- **Method & Path**: `POST /api/addresses`
- **Access**: Authenticated (`CUSTOMER`)
- **Request Body**:
```json
{
  "fullName": "Ananya Rao",
  "phoneNumber": "+91 98765 43210",
  "campusHostel": "Ganga Girls Hostel, Block B, Room 304",
  "streetAddress": "Campus North Gate Road",
  "city": "Visakhapatnam",
  "state": "Andhra Pradesh",
  "postalCode": "530003",
  "isDefault": true
}
```

### 4.2 Create Order (Atomic Transaction)
- **Method & Path**: `POST /api/orders`
- **Access**: Authenticated (`CUSTOMER`)
- **Request Body**:
```json
{
  "addressId": 1,
  "paymentMethod": "COD",
  "couponCode": "STUDENT10"
}
```
- **Response Data**:
```json
{
  "id": 101,
  "trackingNumber": "SHP-20261012-A87F",
  "totalAmount": 1349.10,
  "subtotal": 1499.00,
  "discountAmount": 149.90,
  "status": "PLACED",
  "paymentMethod": "COD",
  "items": [ ... ]
}
```

### 4.3 Get Student Orders
- **Method & Path**: `GET /api/orders/my?page=0&size=10`

---

## 5. Grounded AI Shopping Assistant (`/api/ai`)

### 5.1 Send Message to Campus AI Advisor
- **Method & Path**: `POST /api/ai/chat`
- **Access**: Authenticated (`CUSTOMER`)
- **Request Body**:
```json
{
  "message": "Which textbook is recommended for AU 3rd year Data Structures, and what is the return policy?",
  "sessionId": "ses_4b8a1c9e"
}
```
- **Response Data**:
```json
{
  "sessionId": "ses_4b8a1c9e",
  "reply": "For Data Structures, we recommend 'Data Structures & Algorithms in Java' by Robert Lafore (priced at ₹650, currently in stock with 15 copies). According to campus policy, you can exchange any textbook within 7 days, or return it at the semester end for a 50% buyback credit!",
  "recommendedProducts": [
    {
      "id": 2,
      "title": "Data Structures & Algorithms in Java",
      "price": 650.00,
      "slug": "data-structures-algorithms-java"
    }
  ]
}
```

---

## 6. Admin Control Center (`/api/admin`)

*All endpoints in this section require `Authorization: Bearer <token>` with `ROLE_ADMIN`.*

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/admin/dashboard` | `GET` | Retrieve total revenue, active orders, low stock alerts, and category distributions |
| `/api/admin/products` | `GET` | View paginated products for catalog administration |
| `/api/admin/products` | `POST` | Create a new catalog product with specs and stock |
| `/api/admin/products/{id}` | `PUT` | Update existing product details and pricing |
| `/api/admin/products/{id}/stock`| `PATCH` | Update inventory stock level directly |
| `/api/admin/products/{id}` | `DELETE` | Soft-deactivate a product from active student catalog |
| `/api/admin/categories` | `GET` | List all academic categories |
| `/api/admin/categories` | `POST` | Add a new category |
| `/api/admin/orders` | `GET` | List all campus orders for fulfillment |
| `/api/admin/orders/{id}/status`| `PATCH` | Update order status (`PLACED`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |
| `/api/admin/customers` | `GET` | Retrieve registered student customer directory |
