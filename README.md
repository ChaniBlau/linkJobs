# LinkJobs

A robust backend system for managing **LinkedIn groups, job postings, keywords, and saved searches**. The platform provides secure user registration, authentication, and role-based access control.

## Key Features

* **LinkedIn Integration** – Automated scraping of LinkedIn groups and job postings using **Puppeteer**, enabling real-time content collection.
* **NLP-based Filtering** – Advanced **Natural Language Processing** algorithms to analyze posts, detect relevant job opportunities, and filter content per user-defined keywords.
* **Job Management** – CRUD operations for jobs, keywords, and saved searches with efficient database management via **PostgreSQL** and **Prisma ORM**.
* **Scalable Architecture** – Built with **Node.js**, **TypeScript**, and **Express.js**, supporting modular services, asynchronous tasks, and future API integrations.
* **Security & Roles** – JWT authentication and role-based authorization for secure access to sensitive operations.

## Overview

This backend serves as the core engine for intelligent job discovery from LinkedIn, combining web automation, AI-driven filtering, and structured data management.

---

## 🚀 Tech Stack

* **Node.js** + **TypeScript**
* **Express.js**
* **PostgreSQL** (via Docker)
* **Prisma ORM**
* **JWT** Authentication
* **Zod** Validation
* **Docker Compose**

---

## 📁 Project Structure

```
prisma/                # Prisma schema and migrations
├── schema.prisma
├── seed.ts
└── migrations/

src/
├── api/               # Route controllers (auth, group, etc.)
├── routes/            # Route definitions
├── services/          # Business logic
├── repositories/      # Database queries
├── middlewares/       # Auth and role checks
├── validations/       # Zod schemas
└── types/             # Global TypeScript types (e.g., AuthenticatedRequest)

.env                   # Environment variables
docker-compose.yml     # PostgreSQL container setup
package.json
README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone the repository and install dependencies

```bash
git clone https://github.com/ChaniBlau/linkJobs.git
cd linkjobs-backend
npm install
```

### 2️⃣ Create a `.env` file

Create a `.env` file at the root of the project. You can copy a template from `.env.example` if provided.

---

### 3️⃣ Start PostgreSQL using Docker

```bash
docker-compose up -d
```

This will run a PostgreSQL container on port `5432`.

---

### 4️⃣ Set up the database with Prisma

1. **Apply migrations:**

```bash
npx prisma migrate dev --name init
```

2. **(Optional) Seed initial data:**

```bash
npx tsx prisma/seed.ts
```

> Install `tsx` if needed:

```bash
npm install -D tsx
```

---

### 5️⃣ Run the development server

```bash
npm run dev
```

The server will start at:
[http://localhost:3000](http://localhost:3000)

---

## 🧪 Seeded Users (for testing)

| Name      | Email                                           | Password        | Role        |
| --------- | ----------------------------------------------- | --------------- | ----------- |
| Yohav Gal | [yoyohgg@gmail.com](mailto:yoyohgg@gmail.com)   | temp_password_1 | SUPER_ADMIN |
| Eden Bar  | [ede123dd@gmail.com](mailto:ede123dd@gmail.com) | temp_password_2 | RECRUITER   |

> Passwords are hashed using bcrypt and defined in `prisma/seed.ts`.

---

## 🛠 Useful Commands

| Purpose                | Command                  |
| ---------------------- | ------------------------ |
| Run development server | `npm run dev`            |
| Generate Prisma client | `npx prisma generate`    |
| Apply schema changes   | `npx prisma migrate dev` |
| Open Prisma Studio     | `npx prisma studio`      |
| Seed demo data         | `npx tsx prisma/seed.ts` |
| Run Docker database    | `docker-compose up -d`   |
| Stop Docker database   | `docker-compose down`    |

---

## 📌 Future Improvements

* Add tests with Jest
* CI/CD workflow (GitHub Actions)
* Production deployment on Render / Railway / Google Cloud
* Role-based permissions enforcement per route
* Integrate LinkedIn Jobs API (planned)

---

## 💬 Contact

Feel free to contribute, open issues, or ask questions!
Happy coding! 💻✨

---

### Optional Add-ons

If you want, I can also create for you:

* `.env.example` file
* Postman collection
* Swagger/OpenAPI documentation
