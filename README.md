<!-- <div align="center">
  <h1>🗓️ DutyPlanner</h1>
</div> -->
<h1 align="center">🗓️ DutyPlanner</h1>

### ✨ Features

- **Staff workspace** — Request morning, afternoon or night shifts, see team requests, and browse published months.
- **Admin tools** — Create plans, set deadlines, preview schedules, edit drafts, and publish.
- **Workload balance** — Admins generate schedules using shift weights, preferences, and two months of history. Users without requests are included.
- **Account access** — Sign-up, login, JWT cookies, session refresh, and separate user/admin permissions.
- **The flow:** Collect requests → Preview → Save draft → Review → Publish.

## 🛠️ Tech stack

**Frontend**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)
![daisyUI](https://img.shields.io/badge/daisyUI-1AD1A5?style=for-the-badge&logo=daisyui&logoColor=black)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)

**Backend**

![Node.js](https://img.shields.io/badge/Node.js-417E38?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-20232A?style=for-the-badge&logo=express&logoColor=white)
![Neon PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=111827)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-20232A?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

TypeScript on both sides. Axios handles API calls; bcrypt hashes passwords.

<br>
<h1 align="center">📁 Project structure</h1>

<!-- ## 📁 Project structure -->

```text
Front/src/      React pages, shared calendar, components and API hooks
Back/src/       Express routes, services, validation and Drizzle schema
```

## 🚀 Run locally

You need **Node.js 22.12+**, **npm**, and a **Neon PostgreSQL development database**.
Clone or download the project, then open its root folder.

**1. Create `Back/.env`:**

```dotenv
DATABASE_URL="your-neon-postgres-connection-string"
ACCESS_JWT_SECRET="replace-with-a-long-random-secret"
REFRESH_JWT_SECRET="replace-with-a-different-long-random-secret"
ACCESS_TOKEN_TTL=900
REFRESH_TOKEN_TTL=604800
PORT=3000
NODE_ENV=development
```

**2. Install, create the database tables, and start the backend:**

```bash
cd Back
npm ci
node --env-file=.env ./node_modules/drizzle-kit/bin.cjs push
npm run dev
```

**3. Open another terminal at the project root and start the frontend:**

```bash
cd Front
npm ci
npm run dev
```

Open [localhost:5173](http://localhost:5173). The API runs on port **3000**.

## API

All routes below require authentication and an active account. `/admin/*` also requires an administrator.

| Method     | Path                                         | Purpose                                            |
| ---------- | -------------------------------------------- | -------------------------------------------------- |
| GET        | `/planer`                                    | Published plans                                    |
| GET        | `/planer/:id`                                | Published assignments                              |
| GET        | `/open-plans`                                | Collecting plans (expired windows are read-only)   |
| GET        | `/open-plans/:id`                            | Plan and team requests                             |
| POST       | `/open-plans/:id/requests`                   | Add own request: `{ date, shiftType }`             |
| DELETE     | `/open-plans/:id/requests/:requestId`        | Remove own request                                 |
| GET / POST | `/admin/plans`                               | List / create plans                                |
| GET        | `/admin/plans/:id`                           | Plan, requests and assignments                     |
| DELETE     | `/admin/plans/:id`                           | Delete a plan and its requests and assignments     |
| GET        | `/admin/users`                               | Active users for manual assignment                 |
| PATCH      | `/admin/plans/:id/deadline`                  | Update collecting deadline                         |
| POST       | `/admin/plans/:id/calculate`                 | Preview before deadline; save draft after deadline |
| POST       | `/admin/plans/:id/assignments`               | Add `{ userId, date, shiftType }`                  |
| DELETE     | `/admin/plans/:id/assignments/:assignmentId` | Remove a draft assignment                          |
| POST       | `/admin/plans/:id/publish`                   | Publish draft                                      |
