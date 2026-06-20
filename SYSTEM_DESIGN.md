# System Design: Scalable Google Sheets CRUD Application

**Scenario:** 1 million+ records in Google Sheet, 10,000 daily active users.

---

## 1. Proposed Architecture

At scale, Google Sheets cannot serve as the primary database. The architecture shifts it to a **sync/export layer** while PostgreSQL handles all real traffic.

```
Users → CDN (static frontend)
            ↓
     Load Balancer (NGINX)
            ↓
   FastAPI Servers (3+ replicas)
     ↙           ↘
Redis Cache    PostgreSQL (primary DB)
                    ↓
            Background Sync Worker
                    ↓
            Google Sheets (export/view layer)
```

**Key principle:** All reads/writes go through PostgreSQL. A background worker keeps Google Sheets in sync for stakeholders who need spreadsheet access.

---

## 2. Database Choice

**Primary: PostgreSQL**

| Criteria | Google Sheets | PostgreSQL |
|----------|--------------|------------|
| Max records | ~200K rows (10M cell limit) | Billions |
| Query speed (1M rows) | 5–30 seconds | <50ms with indexes |
| Concurrent writes | Breaks under load | Thousands/sec |
| ACID transactions | ❌ | ✅ |
| Indexing | ❌ | ✅ |

**Schema:**
```sql
CREATE TABLE records (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    department  VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_records_email ON records(email);
CREATE INDEX idx_records_department ON records(department);
```

---

## 3. Caching Strategy

**3-layer approach:**

**Layer 1 — Redis (server-side):**
- Cache `GET /records` responses with a 60s TTL
- Cache individual records for 5 minutes
- Invalidate on every write (POST/PUT/DELETE)

**Layer 2 — HTTP Caching:**
- Return `ETag` headers on GET endpoints
- Clients send `If-None-Match` → server returns `304 Not Modified` if unchanged

**Layer 3 — CDN:**
- Serve the React frontend (static JS/CSS) from a CDN (CloudFlare/AWS CloudFront)
- Aggressive caching with content-hashed filenames

---

## 4. Authentication and Security

**Authentication: JWT (JSON Web Tokens)**
- Access token: 15-minute expiry, stored in memory
- Refresh token: 7-day expiry, stored in HTTP-only cookie
- Token rotation on every refresh

**Authorization: Role-Based Access Control (RBAC)**
- `viewer` → read only
- `editor` → read + create + update
- `admin` → full access including delete

**Security measures:**
- Input validation via Pydantic (server) and form validation (client)
- Rate limiting: 100 requests/minute per IP
- HTTPS enforced (TLS at load balancer)
- CORS restricted to known frontend origins
- `credentials.json` stored in a secret manager (AWS Secrets Manager / GCP Secret Manager), never in code
- SQL injection prevented via ORM parameterized queries

---

## 5. Deployment Approach

**Containerized with Docker, orchestrated with Kubernetes:**

```
Docker Images → Container Registry → Kubernetes Cluster
```

**Services:**
| Service | Setup |
|---------|-------|
| FastAPI | Deployment, 3+ replicas, auto-scales on CPU |
| PostgreSQL | Managed (AWS RDS / Cloud SQL) with read replica |
| Redis | Managed (ElastiCache / Memorystore) |
| Sync Worker | Kubernetes CronJob, runs every 5 minutes |
| Frontend | Served via CDN (CloudFront / CloudFlare) |

**CI/CD:**
```
GitHub Push → GitHub Actions → Tests → Docker Build → Push to Registry → Deploy to Kubernetes
```

---

## 6. Limitations of Google Sheets and How to Overcome Them

| Limitation | Problem | Solution |
|------------|---------|----------|
| **Cell limit** | Max ~10M cells (~200K rows with 5 columns) | PostgreSQL as primary DB; Sheets is just an export view |
| **API rate limits** | 100 requests/100s per user; easily exceeded at 10K DAU | All traffic hits PostgreSQL; only the sync worker calls the Sheets API using batched `batch_update` |
| **No indexing** | Searching 1M rows takes 10–30 seconds (full scan) | PostgreSQL B-tree indexes enable <50ms queries |
| **No ACID transactions** | Concurrent writes cause data races and corruption | PostgreSQL handles all concurrent writes with full ACID guarantees |
| **No real-time concurrency** | Multiple users editing simultaneously corrupts data | Only the background sync worker writes to Sheets (serialized); users write to PostgreSQL |
| **No data validation** | Sheets accepts anything — no types, constraints, or foreign keys | Pydantic enforces types at API layer; PostgreSQL enforces constraints at DB layer |

---

## Summary

| Aspect | Current | At Scale |
|--------|---------|----------|
| Data store | Google Sheets (direct) | PostgreSQL + Sheets (synced) |
| Caching | None | Redis + HTTP + CDN |
| API servers | 1 instance | 3+ behind load balancer |
| Auth | None | JWT + RBAC |
| Deployment | Local uvicorn | Docker + Kubernetes + CI/CD |
| Query speed (1M rows) | 5–30s | <50ms |
| Google Sheets role | Primary database | Export/view layer only |
