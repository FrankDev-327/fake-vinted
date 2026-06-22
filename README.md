# fake-vinted

A production-grade backend simulation of a Vinted-like marketplace, built with a microservices architecture using NestJS, PostgreSQL, Redis, RabbitMQ, Socket.io, and Docker.

> "System sustained 700 concurrent users (400 HTTP + 300 WebSocket) over 38 minutes with 0% failure rate, 289 req/s throughput and p95 response time of 49ms"

---

## Architecture

```
                          ┌─────────────────┐
                          │   API Gateway   │
                          │   (Port 5000)   │
                          └────────┬────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼───────┐  ┌────────▼───────┐  ┌────────▼───────┐
     │  Users Service │  │Listing Service │  │  Chat Service  │
     │  (Port 4000)   │  │  (Port 4001)   │  │  (Port 4002)   │
     └────────┬───────┘  └────────┬───────┘  └────────┬───────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                          ┌────────▼────────┐
                          │   PostgreSQL    │
                          │  (10.5.0.10)    │
                          └─────────────────┘

WebSocket (direct):           RabbitMQ (async events):
Client ──► Chat Service       Chat ──► notifications_queue ──► Notifications Service
```

---

## Services

| Service       | Port | Description                                            |
| ------------- | ---- | ------------------------------------------------------ |
| API Gateway   | 5000 | Single entry point, JWT auth, request routing          |
| Users         | 4000 | User registration, authentication, profile management  |
| Listing       | 4001 | Item listings CRUD + full-text search (tsvector + GIN) |
| Chat          | 4002 | Real-time messaging via WebSockets + Socket.io         |
| Notifications | 4003 | Async event consumer via RabbitMQ                      |

## Infrastructure

| Service       | Port         | Description                                |
| ------------- | ------------ | ------------------------------------------ |
| PostgreSQL    | 5432         | Primary database (separate DB per service) |
| Redis         | 6379         | Caching and pub/sub                        |
| RabbitMQ      | 5672 / 15672 | Async message broker                       |
| Prometheus    | 9090         | Metrics collection                         |
| Grafana       | 3000         | Metrics visualization                      |
| Loki          | 3100         | Log aggregation                            |
| Grafana Alloy | 12345        | Telemetry collector                        |  |
| Pushgateway   | 9091         | Prometheus push metrics                    |

---

## Tech **Stack**

- **Runtime:** Node.js
- **Framework:** NestJS + TypeScript
- **Databases:** PostgreSQL (TypeORM), Redis
- **Messaging:** RabbitMQ (AMQP)
- **Real-time:** Socket.io + WebSockets
- **Auth:** JWT (RS256)
- **Search:** PostgreSQL full-text search (tsvector + GIN indexes)
- **Observability:** Prometheus, Grafana, Loki, Grafana Alloy
- **Containerization:** Docker + Docker Compose
- **Load Testing:** k6 (custom build with Socket.io extension)
- **API Docs:** Swagger (available at `/vinted/docs`)

---

## Key Features

**Users Service**
- User registration and login
- JWT token issuance
- Profile management (avatar, bio, city, country, rating)
- Password hashing with bcrypt

**Listing Service**
- Full CRUD for marketplace listings
- Full-text search using PostgreSQL `tsvector` and `GIN` indexes
- Auto-updating search vector via database trigger
- Filters: category, brand, size, condition, price range, location
- Relevance ranking via `ts_rank`
- Pagination support

**Chat Service**
- Real-time messaging via Socket.io namespaced at `/chat`
- Conversation management (buyer ↔ seller per listing)
- Message history persistence in PostgreSQL
- Events emitted to RabbitMQ on new message for notifications
- Prometheus metrics for active connections, messages sent, and processing duration

**Notifications Service**
- RabbitMQ consumer listening on `notifications_queue`
- Handles events: `new_message`, `item_sold`, `item_shipped`, `offer_accepted`, `offer_rejected`
- JSONB metadata field for flexible event payloads
- Mark as read / mark all as read endpoints

**API Gateway**
- Routes all HTTP requests to respective microservices via Axios
- JWT guard protecting all private routes
- Global Prometheus interceptor measuring request duration for every endpoint automatically
- Swagger documentation

---

## Network Architecture

Each service communicates through isolated Docker networks. The gateway is the only service connected to all networks:

```
gateway:       [gateway_network, users_network, listing_network, chat_network, notifications_network]
users:         [users_network, db_network]
listing:       [listing_network, db_network]
chat:          [chat_network, db_network, notifications_network]
notifications: [notifications_network, db_network]
rabbitmq:      [notifications_network, users_network, gateway_network]
```

WebSocket connections from clients connect **directly** to the chat service (port 4002), bypassing the gateway to avoid unnecessary proxy overhead on real-time traffic.

---

## Database Design

Each microservice has its own isolated PostgreSQL database:

| Service       | Database                |
| ------------- | ----------------------- |
| Users         | vinted_users_db         |
| Listing       | vinted_listings_db      |
| Chat          | vinted_chat_db          |
| Notifications | vinted_notifications_db |

Migrations are managed with TypeORM CLI and run automatically on service startup.

---

## Full-Text Search

Listings use PostgreSQL native full-text search instead of Elasticsearch, demonstrating that PostgreSQL is more than capable for this use case:

```sql
-- GIN index on tsvector column
CREATE INDEX listings_search_idx ON listings USING GIN(search_vector);

-- Search query with relevance ranking
SELECT *, ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank
FROM listings
WHERE search_vector @@ plainto_tsquery('english', $1)
ORDER BY rank DESC;
```

Search is combined with filters (category, brand, size, condition, price range, location) using `QueryBuilder`.

---

## Observability

**Prometheus metrics collected:**
- HTTP request counter (method, endpoint, status code)
- HTTP request duration histogram (p50, p90, p95, p99)
- WebSocket active connections gauge
- WebSocket messages sent counter
- WebSocket message processing duration histogram
- Notification type counter

**Logs:**
- Structured logging via Winston
- Collected by Grafana Alloy and shipped to Loki
- Visualized in Grafana

---

## Load Test Results

Load tested with a custom k6 build including the Socket.io extension (`k6/x/socketio`).

### Run 1 — 30 minutes
| Metric                      | Value                   |
| --------------------------- | ----------------------- |
| Total checks                | 547,261                 |
| HTTP requests               | 481,320                 |
| Failure rate                | 0.00%                   |
| Throughput                  | 265 req/s               |
| Peak concurrent users       | 617 (400 HTTP + 300 WS) |
| p95 response time           | 36ms                    |
| WebSocket messages received | 43,964                  |

### Run 2 — 38 minutes (higher load)
| Metric                      | Value                   |
| --------------------------- | ----------------------- |
| Total checks                | 781,334                 |
| HTTP requests               | 668,605                 |
| Failure rate                | 0.00%                   |
| Throughput                  | 289 req/s               |
| Peak concurrent users       | 700 (400 HTTP + 300 WS) |
| p95 response time           | 49ms                    |
| WebSocket messages received | 75,156                  |

Both runs passed all thresholds:
- `http_req_duration p(95) < 500ms` ✅
- `http_req_failed rate < 5%` ✅
- `ws_connecting p(95) < 1000ms` ✅

### What the k6 test covers
- User registration and login
- JWT token management
- Create listing
- Get listing by ID
- Full-text search with random query variants
- Get user profile
- Update user profile
- Create conversation
- Real-time WebSocket messaging (join conversation → send message → receive message)
- Get notifications
- Mark notification as read
- Mark all notifications as read
- Teardown: truncate all tables

---

## Getting Started

### Prerequisites

- Docker + Docker Compose
- Node.js 20+
- pnpm

### Environment Variables

Each service has its own `.env` file. Required variables per service:

**gateway/.env**
```env
PORT=5000
MS_USER_URL=http://ms_users:4000
MS_LISTING_URL=http://ms_listing:4001
MS_CHAT_GATEWAY_URL=http://ms_chat:4002
MS_NOTIFICATION_URL=http://ms_notifications:4003
KEY_SECRET=your_jwt_secret
NODE_ENV=dev
```

**users/.env**
```env
PORT=4000
DATABASE_IP=10.5.0.10
DATABASE=vinted_users_db
DATABASE_PORT=5432
DB_USER_NAME=your_db_user
DB_USER_PASSWORD=your_db_password
KEY_SECRET=your_jwt_secret
NODE_ENV=dev
```

**listing/.env**
```env
PORT=4001
DATABASE_IP=10.5.0.10
DATABASE=vinted_listings_db
DATABASE_PORT=5432
DB_USER_NAME=your_db_user
DB_USER_PASSWORD=your_db_password
NODE_ENV=dev
```

**chat_vinted/.env**
```env
PORT=4002
DATABASE_IP=10.5.0.10
DATABASE=vinted_chat_db
DATABASE_PORT=5432
DB_USER_NAME=your_db_user
DB_USER_PASSWORD=your_db_password
RABBITMQ_URL=amqp://admin:admin@fake-vinted-rabbitmq:5672
NODE_ENV=dev
```

**notifications/.env**
```env
PORT=4003
DATABASE_IP=10.5.0.10
DATABASE=vinted_notifications_db
DATABASE_PORT=5432
DB_USER_NAME=your_db_user
DB_USER_PASSWORD=your_db_password
RABBITMQ_URL=amqp://admin:admin@fake-vinted-rabbitmq:5672
NODE_ENV=dev
```

### Run

```bash
# clone the repo
git clone https://github.com/FrankDev-327/fake-vinted.git
cd fake-vinted

# create the required databases in PostgreSQL
# vinted_users_db, vinted_listings_db, vinted_chat_db, vinted_notifications_db

# start all services
docker compose up --build
```

Migrations run automatically on service startup.

### API Documentation

Swagger UI is available at:
```
http://localhost:5000/vinted/docs
```

### Run Load Tests

```bash
# build custom k6 with socket.io extension
xk6 build --with github.com/romain-h/k6-plugin-socket.io@latest

# run the test
./k6 run k6.test.fake.vinted.js
```

---

## Project Structure

```
fake-vinted/
├── gateway/              # API Gateway (NestJS)
├── users/                # Users microservice (NestJS)
├── listing/              # Listings microservice (NestJS)
├── chat_vinted/          # Chat microservice (NestJS + Socket.io)
├── notifications/        # Notifications microservice (NestJS + RabbitMQ)
├── prometheus/           # Prometheus config
├── grafana/              # Grafana config and dashboards
├── loki/                 # Loki config
├── alloy/                # Grafana Alloy config
├── docker-compose.yaml   # Full infrastructure definition
├── k6.test.fake.vinted.js # Load test script
└── README.md
```

---

## API Endpoints

### Auth
| Method | Endpoint    | Auth | Description             |
| ------ | ----------- | ---- | ----------------------- |
| POST   | /auth/login | ❌    | Login and get JWT token |

### Users
| Method | Endpoint   | Auth | Description         |
| ------ | ---------- | ---- | ------------------- |
| POST   | /users     | ❌    | Register user       |
| GET    | /users/:id | ✅    | Get user by ID      |
| PATCH  | /users/:id | ✅    | Update user profile |

### Listings
| Method | Endpoint              | Auth | Description                           |
| ------ | --------------------- | ---- | ------------------------------------- |
| POST   | /listing              | ✅    | Create listing                        |
| GET    | /listing              | ✅    | Get all listings                      |
| GET    | /listing/search       | ✅    | Search listings (full-text + filters) |
| GET    | /listing/:id          | ✅    | Get listing by ID                     |
| GET    | /listing/user/:userId | ✅    | Get listings by user                  |
| PATCH  | /listing/:id          | ✅    | Update listing                        |
| DELETE | /listing/:id          | ✅    | Delete listing                        |

### Chat (HTTP)
| Method | Endpoint                                    | Auth | Description               |
| ------ | ------------------------------------------- | ---- | ------------------------- |
| POST   | /chat-vinted/conversations                  | ✅    | Start a conversation      |
| GET    | /chat-vinted/conversations/:userId          | ✅    | Get user conversations    |
| GET    | /chat-vinted/conversations/:id/messages     | ✅    | Get conversation messages |
| PATCH  | /chat-vinted/conversations/:id/read/:userId | ✅    | Mark messages as read     |

### Chat (WebSocket)
Connect directly to `ws://localhost:4002` with namespace `/chat`

| Event (emit)     | Payload                                 | Description              |
| ---------------- | --------------------------------------- | ------------------------ |
| joinConversation | conversationId                          | Join a conversation room |
| sendMessage      | { conversation_id, sender_id, content } | Send a message           |

| Event (on)         | Description                      |
| ------------------ | -------------------------------- |
| joinedConversation | Fired when successfully joined   |
| newMessage         | Fired when a new message arrives |

### Notifications
| Method | Endpoint                             | Auth | Description               |
| ------ | ------------------------------------ | ---- | ------------------------- |
| GET    | /notifications/user/:userId          | ✅    | Get user notifications    |
| PATCH  | /notifications/:id/read              | ✅    | Mark notification as read | **** |
| PATCH  | /notifications/user/:userId/read-all | ✅    | Mark all as read          |

---

## Grafana Dashboard

Real-time observability dashboard monitoring all microservices during load testing — HTTP request rates, response time percentiles, WebSocket active connections, message processing duration, and notification counters.

![Grafana Dashboard](./FakeVintendGrafanaDashboard.png)

---

## Load Test Report (HTML)

The k6 test can create an interactive HTML report with detailed charts and graphs using the [k6-reporter](https://github.com/benc-uk/k6-reporter) plugin.

After running the load test, the report is generated at:

```
chat_fake_vinted.html
```

Open it in any browser to visualize:

- HTTP request duration over time (p50, p90, p95, p99)
- Request rate (req/s) over time
- Virtual users ramp up/down curve
- Failure rate over time
- Per-group breakdown (listing creation, search, chat, notifications etc.)
- Custom counters (messages sent, notifications, conversations created etc.)
- WebSocket connection times

The report is committed to the repo so you can view it directly without running the tests:

👉 [View Load Test Report](./chat_fake_vinted.html)

---

## Author

Francisco — Backend Developer
[GitHub](https://github.com/FrankDev-327)