# LinkJobs Backend

A backend project for managing LinkedIn groups, job postings, keywords, and saved searches.  
Includes support for user registration, authentication, roles, and CRUD operations.

---

## 🚀 Tech Stack

- **Node.js** + **TypeScript**
- **Express.js**
- **PostgreSQL** (via Docker)
- **Prisma ORM**
- **JWT** Authentication
- **Zod** Validation
- **Docker Compose**

---

## 📁 Project Structure

├── prisma/ # Prisma schema and migrations
│ ├── schema.prisma
│ ├── seed.ts
│ └── migrations/
├── src/
│ ├── api/ # Route controllers (auth, group, etc.)
│ ├── routes/ # Route definitions
│ ├── services/ # Business logic
│ ├── repositories/ # Database queries
│ ├── middlewares/ # Auth and role checks
│ ├── validations/ # Zod schemas
│ └── types/ # Global TS types (e.g., AuthenticatedRequest)
├── .env # Environment variables
├── docker-compose.yml # PostgreSQL container setup
├── package.json
└── README.md

yaml
Copy
Edit

---

## ⚙️ Installation

### 1. Clone the repository and install dependencies


git clone https://github.com/ronTabachnik/LinkJobs-backend.git
cd linkjobs-backend
npm install
### 2. Create a .env file
Create a .env file at the root of the project:

---

### 🐘 Start PostgreSQL using Docker
docker-compose up -d
This will run a PostgreSQL container on port 5432.

### 🧱 Set up the database with Prisma
1. Create the database schema from Prisma

npx prisma migrate dev --name init
2. (Optional) Seed initial data

npx tsx prisma/seed.ts
Install tsx if needed:

npm install -D tsx
### 🚀 Run the development server
npm run dev
The server will start on:
http://localhost:3000

🧪 Seeded Users (for testing)
Name	Email	Password	Role
Yohav Gal	yoyohgg@gmail.com	temp_password_1	SUPER_ADMIN
Eden Bar	ede123dd@gmail.com	temp_password_2	RECRUITER

Passwords are hashed using bcrypt and defined in prisma/seed.ts.


### 🛠 Useful Commands
Purpose	Command
Run dev server	npm run dev
Generate Prisma client	npx prisma generate
Apply schema changes	npx prisma migrate dev
Open Prisma Studio	npx prisma studio
Seed demo data	npx tsx prisma/seed.ts
Run Docker database	docker-compose up -d
Stop Docker database	docker-compose down

### 📌 Future Improvements
Add tests with Jest

CI/CD workflow (GitHub Actions)

Production deployment on Render / Railway / Google Cloud

Role-based permissions enforcement per route

Integrate LinkedIn Jobs API (planned)

### 💬 Contact
Feel free to contribute, open issues, or ask questions!

Happy coding! 💻✨


---

Let me know if you also want:

- a matching `.env.example`
- a Postman collection
- Swagger/OpenAPI docs  
I'll be happy to help!