# CRM System

A CRM for processing course-enrollment requests ("orders"). Monorepo of two apps: a Django + DRF REST API and a Next.js web client, orchestrated with Docker Compose.

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.13, Django 5.2, Django REST Framework 3.17 |
| Auth | djangorestframework-simplejwt 5.5 (RS256, httpOnly cookies) |
| Database | MySQL (external; configured via `MYSQL_*`) |
| Filtering | django-filter 25.2 |
| Async tasks | Celery 5.4 + Redis 7 (broker and result backend) |
| Excel export | openpyxl 3.1 |
| API docs | drf-spectacular (OpenAPI 3 + Swagger UI) |
| WSGI server | gunicorn 26 (3 workers) |
| Frontend | Next.js 16.1.6 (App Router), React 19.2, TypeScript 5 |
| Forms | react-hook-form 7.71, zod 4.3 |
| Styling | Sass modules |
| Dependencies | uv (`uv.lock`) for Python, yarn for frontend |
| Lint | ruff (backend), eslint (frontend) |
| Tests | pytest + pytest-django (backend), vitest + Testing Library (frontend) |

## Prerequisites

- Docker Desktop with Docker Compose v2.
- A `.env` file in the repo root (copy from `.env.example` and fill in).
- Access to an external MySQL server — the stack does **not** run a local MySQL container.

## Configuration

Copy the template and fill in the values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for local development, `False` otherwise |
| `JWT_PRIVATE_KEY_B64` | RSA private key (base64-encoded PEM) for signing JWTs |
| `JWT_PUBLIC_KEY_B64` | RSA public key (base64-encoded PEM) for verifying JWTs |
| `MYSQL_USER` | MySQL user |
| `MYSQL_PASSWORD` | MySQL password |
| `MYSQL_DATABASE` | Database name |
| `MYSQL_HOST` | MySQL host |
| `MYSQL_PORT` | MySQL port (default `3306`) |
| `REDIS_URL` | Redis URL for Celery broker/result backend (e.g. `redis://redis:6379/0`) |
| `BACKEND_PORT` | Host port for the backend (e.g. `8000`) |
| `FRONTEND_PORT` | Host port for the frontend (e.g. `3000`) |
| `NEXT_PUBLIC_FRONTEND_URL` | Public frontend URL (e.g. `http://localhost:3000`) |
| `INTERNAL_API_URL` | Backend URL for the frontend's server-side requests (e.g. `http://crm:8000`) |

## Running with Docker Compose

### Development

Uses `docker-compose.yml` (base) plus `docker-compose.override.yml` (dev frontend), which Compose picks up automatically.

```bash
docker compose up --build        # foreground
docker compose up --build -d     # detached
```

Services:

| Service | Role |
|---------|------|
| `crm` | Backend (gunicorn) — `http://localhost:${BACKEND_PORT}` |
| `frontend` | Next.js — `http://localhost:${FRONTEND_PORT}` (published in dev) |
| `redis` | Celery broker and result backend |
| `celery-worker` | Background tasks (Excel export) |
| `celery-beat` | Scheduled tasks (hourly export cleanup) |

The `crm` service has a Docker healthcheck probing `GET /health`, so `docker compose ps` reports its health; the frontend waits for `crm` to become healthy before starting.

### Production

Uses `docker-compose.yml` (base) plus `docker-compose.prod.yml`, which builds the frontend from `Dockerfile_prod` (multi-stage standalone build, `NODE_ENV=production`).

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### Stopping and logs

```bash
docker compose down              # add the -f flags above to stop the prod stack
docker compose logs -f crm       # follow a single service (crm | frontend | celery-worker | ...)
```

## Initial data

Database migrations run automatically on backend startup (`migrate --noinput`), after `wait_db` blocks until MySQL is reachable. The following management commands seed data and are idempotent:

```bash
# Default admin: admin@gmail.com / admin
docker compose exec crm python manage.py create_default_admin

# Import the order dump from backend/extra_data/base_data_for_db/orders.json
docker compose exec crm python manage.py import_orders
```

## Authentication and roles

Authentication is JWT (RS256) delivered via httpOnly cookies (`access_token`, `refresh_token`); the login and set-password responses also return the tokens in the body. A middleware copies the access-token cookie into the `Authorization` header for DRF.

| Role | Condition | Capabilities |
|------|-----------|--------------|
| **admin** | `is_staff=True` | Manage managers, view all orders and statistics |
| **manager** | active non-staff user | View and update orders, add comments |

A new manager is created by an admin via `POST /users/create_user`; the response returns a one-time link the manager uses to set a password.

### Permission matrix

The DRF default is `IsAuthenticated` + `IsUnbannedUser`. Specific groups tighten this:

| Access level | Permission classes | Endpoints |
|--------------|--------------------|-----------|
| Public | `AllowAny` | `GET /health`, `POST /users/set_password/{token}` |
| Login / refresh | throttled, `auth` scope (10/min) | `POST /auth`, `POST /auth/refresh` |
| Authenticated (default) | `IsAuthenticated`, `IsUnbannedUser` | `GET /auth/me`, `POST /auth/logout`, all `GET` reads under `/orders/*` and `/users/*` |
| Active manager | `IsAuthenticated`, `IsActiveUser`, `IsUnbannedUser` | `PATCH /orders/{pk}/update`, `POST /orders/{pk}/comment`, `POST /orders/groups/create` |
| Admin | `IsAdminUser`, `IsActiveUser`, `IsUnbannedUser` | `POST /users/create_user`, `PATCH /users/{pk}/active_toggle`, `PATCH /users/{pk}/ban_toggle`, `PATCH /users/{pk}/restore_password`, `GET /users/statistic`, `GET /users/{pk}/statistic` |

Only login and refresh are throttled (10/min, `auth` scope); there is no global throttle.

## Features

### Excel export

`GET /orders/export` exports the currently filtered order list (same `OrderFilter` as `GET /orders`, no pagination) to `.xlsx`. It is a hybrid endpoint:

- if the row count is `≤ EXPORT_SYNC_MAX_ROWS` (default **1000**), the file is built synchronously and returned inline (`200`);
- otherwise a Celery task is dispatched (`202 {task_id}`); poll `GET /orders/export/{task_id}` for state/progress, then download via `GET /orders/export/{task_id}/download`.

Generated files live in the `exports_media` volume and are purged hourly by a Celery-beat task (1-hour TTL). The Next.js proxy at `/api/orders/export` hides the sync/async split from the browser.

### Order statistics

Admin-only aggregation of orders by status:

- `GET /users/statistic` — across all orders;
- `GET /users/{pk}/statistic` — for one manager.

Response: `{ total, new, in_work, agree, disagree, dubbing }` (rows with `status=null` count as `new`).

## Testing and code quality

Backend — pytest + pytest-django (isolated in-memory SQLite, Celery in eager mode, no Redis required):

```bash
uv run pytest backend
uv run ruff check backend
```

Frontend:

```bash
cd frontend
yarn test          # vitest
yarn lint          # eslint
npx tsc --noEmit   # type check
```

## Repository layout

```
CRM_system/
├── .env.example
├── docker-compose.yml            # base: crm + frontend + redis + celery-worker + celery-beat
├── docker-compose.override.yml   # dev frontend override
├── docker-compose.prod.yml       # prod frontend override
├── pyproject.toml, uv.lock       # Python dependencies (uv)
├── backend/
│   ├── Dockerfile
│   ├── manage.py
│   ├── config/                   # Django project (settings, urls, wsgi, celery, extra_conf)
│   ├── core/                     # shared infra (permissions, pagination, health, handlers)
│   ├── apps/
│   │   ├── auth/                 # /auth, /auth/refresh, /auth/logout, /auth/me
│   │   ├── crm/                  # /orders/* (orders, comments, groups, choices, export) + tasks.py
│   │   └── users/                # /users/* (manager CRUD, active/ban toggle, statistics)
│   └── extra_data/
│       ├── base_data_for_db/orders.json   # seed data
│       └── keys/                 # RSA keys for JWT
├── frontend/
│   ├── Dockerfile                # dev
│   ├── Dockerfile_prod           # multi-stage standalone
│   └── src/                      # Feature-Sliced Design (app, pages, widgets, features, entities, shared)
└── postman/
    └── CRM_system.postman_collection.json
```

## API reference

Interactive documentation (OpenAPI 3 via drf-spectacular):

- `GET /api/schema` — OpenAPI schema
- `GET /api/docs` — Swagger UI

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/health` | Health probe: `200 {"status":"ok"}`, `503` if the database is unreachable |
| GET | `/api/schema` | OpenAPI schema |
| GET | `/api/docs` | Swagger UI |
| POST | `/auth` | Login (email + password) — throttled 10/min |
| POST | `/auth/refresh` | Refresh access token (from cookie) — throttled 10/min |
| POST | `/auth/logout` | Logout (blacklist refresh token, clear cookies) |
| GET | `/auth/me` | Current user |
| GET | `/orders` | List orders (filtering, pagination 25, ordering) |
| GET | `/orders/export` | Excel export by filters (hybrid sync/async) |
| GET | `/orders/export/{task_id}` | Async export status/progress |
| GET | `/orders/export/{task_id}/download` | Download a finished export |
| GET | `/orders/groups` | List groups |
| POST | `/orders/groups/create` | Create a group |
| GET | `/orders/choices` | Enum choices for order fields |
| GET | `/orders/{pk}` | Order detail (with comments) |
| PATCH | `/orders/{pk}/update` | Update an order |
| POST | `/orders/{pk}/comment` | Add a comment |
| GET | `/users` | List managers (paginated) |
| POST | `/users/create_user` | Create a manager (admin) |
| GET | `/users/statistic` | Global order statistics (admin) |
| GET | `/users/{pk}` | Manager detail |
| GET | `/users/{pk}/statistic` | Manager order statistics (admin) |
| PATCH | `/users/{pk}/active_toggle` | Toggle `is_active` (admin) |
| PATCH | `/users/{pk}/ban_toggle` | Toggle `is_banned` (admin) |
| PATCH | `/users/{pk}/restore_password` | Reset password, issue a one-time token (admin) |
| POST | `/users/set_password/{token}` | Set a password via one-time token |

### `GET /orders` filters (query params)

Text (icontains): `name_contains`, `surname_contains`, `email_contains`, `phone_contains`, `group_name_contains`. Group by id: `group`. Choices: `course`, `course_type`, `course_format`, `status`. Numeric (exact): `age_eq`, `sum_eq`, `already_paid_eq`. Date range: `created_at_gte`, `created_at_lte`. `my=true` limits to the current manager's orders. `order` sets ordering (prefix `-` for descending). `page` / `size` control pagination (default 25, max 100). `GET /orders/export` accepts the same parameters.

### Postman

Import `postman/CRM_system.postman_collection.json` (schema v2.1.0). All variables (`base_url`, credentials, `order_id`, `user_id`, `task_id`, `set_password_token`) are collection-scoped, so no external environment is needed — override `base_url` in the collection's **Variables** tab if required.
