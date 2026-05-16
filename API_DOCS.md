# API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Routes

### POST /auth/register

Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "sales"
}
```

**Response (201):**
```json
{
  "token": "eyJ...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "sales"
  }
}
```

---

### POST /auth/login

Login with existing credentials.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response (200):**
```json
{
  "token": "eyJ...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "sales"
  }
}
```

---

### GET /auth/me

Get the currently logged-in user's info.

**Response (200):**
```json
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "sales"
  }
}
```

---

## Lead Routes

All lead routes require authentication.

---

### GET /leads

Get a paginated list of leads. Supports multiple filters simultaneously.

**Query Params:**

| Param | Type | Description | Default |
|-------|------|-------------|---------|
| page | number | Page number | 1 |
| limit | number | Results per page | 10 |
| sort | string | `latest` or `oldest` | latest |
| status | string | New, Contacted, Qualified, Lost | - |
| source | string | Website, Instagram, Referral | - |
| search | string | Search by name or email | - |

**Example:**
```
GET /leads?status=Qualified&source=Instagram&search=rahul&sort=latest&page=1
```

**Response (200):**
```json
{
  "leads": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

---

### GET /leads/stats

Get lead counts grouped by status.

**Response (200):**
```json
{
  "total": 42,
  "New": 10,
  "Contacted": 15,
  "Qualified": 12,
  "Lost": 5
}
```

---

### GET /leads/export

Download all leads as a CSV file.

**Response:** CSV file download (`leads_export.csv`)

---

### POST /leads

Create a new lead.

**Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "New",
  "source": "Instagram",
  "notes": "Met at conference"
}
```

**Response (201):**
```json
{
  "lead": { ... },
  "message": "Lead created successfully"
}
```

---

### GET /leads/:id

Get a single lead by ID.

**Response (200):**
```json
{
  "lead": {
    "_id": "...",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "status": "Qualified",
    "source": "Instagram",
    "notes": "Met at conference",
    "createdBy": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2025-01-10T10:30:00.000Z",
    "updatedAt": "2025-01-10T10:30:00.000Z"
  }
}
```

---

### PUT /leads/:id

Update a lead. Sales users can only update their own leads.

**Body:** (any subset of lead fields)
```json
{
  "status": "Contacted",
  "notes": "Called them, will follow up next week"
}
```

**Response (200):**
```json
{
  "lead": { ... },
  "message": "Lead updated successfully"
}
```

---

### DELETE /leads/:id

Delete a lead. **Admin only.**

**Response (200):**
```json
{
  "message": "Lead deleted successfully"
}
```

---

## Common Error Responses

**400 Bad Request** — Missing or invalid fields  
**401 Unauthorized** — No token or invalid token  
**403 Forbidden** — Insufficient permissions  
**404 Not Found** — Resource doesn't exist  
**500 Server Error** — Something went wrong on the server  

Error format:
```json
{
  "message": "A human-readable error message"
}
```
