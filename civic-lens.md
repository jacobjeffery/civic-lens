# CivicLens Project Instructions

## Project Overview

CivicLens is a full-stack web application that allows people in a community to report and track local issues such as potholes, broken streetlights, graffiti, unsafe intersections, or abandoned property.

You will build this project in stages as you move through the course. Each stage adds a new layer to the same application. By the end, you will have built a real full-stack product with:

- an Express API  
- a PostgreSQL database  
- authentication and protected routes  
- a React front end  
- deployment with Docker, Caddy, and Fly.io  

This project is meant to help you practice building software the same way real teams do: one piece at a time.

---

## What You Are Building

Your final application should allow users to:

- create an account  
- log in  
- submit a community issue  
- view all submitted issues  
- view a single issue in detail  
- update or delete their own issues  
- filter issues by category or status  
- use a React interface to interact with the app  

---

## Project Structure

```text
civiclens/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── Caddyfile
├── Dockerfile
└── fly.toml
```

---

## Phase 1: Routes (API Foundations)

### Goal
Build a working Express API that can handle issue data.

### Step-by-Step

1. Initialize backend project
   - Create a `backend` folder
   - Run `npm init -y`
   - Install dependencies:
     - express
     - cors
     - dotenv

2. Create server setup
   - Create `server.js`
   - Import express
   - Create app
   - Use middleware:
     - express.json()
     - cors()

3. Create folder structure
   - src/routes
   - src/controllers

4. Create Issue Routes

Routes to implement:

- GET /issues  
- GET /issues/:id  
- POST /issues  
- PUT /issues/:id  
- DELETE /issues/:id  

5. Store data in memory (temporary)

Use an array like:

- issues = []

Each issue should have:
- id
- title
- description
- category
- status
- createdAt

6. Create controller functions
   - getAllIssues
   - getIssueById
   - createIssue
   - updateIssue
   - deleteIssue

7. Add basic validation
   - title is required
   - description is required

---

## Phase 2: Database (PostgreSQL + Sequelize)

### Goal
Replace in-memory data with a real database.

### Step-by-Step

1. Install dependencies
   - sequelize
   - pg
   - pg-hstore

2. Create database connection
   - Create config file
   - Connect to PostgreSQL

3. Create Issue model

Fields:
- id
- title
- description
- category
- status
- votes
- createdAt

4. Sync database

5. Replace all route logic
   - Use Sequelize instead of arrays

Examples:
- Issue.findAll()
- Issue.create()
- Issue.findByPk()
- Issue.update()
- Issue.destroy()

---

## Phase 3: Authentication

### Goal
Add user accounts and secure the application.

### Step-by-Step

1. Install dependencies
   - bcrypt
   - jsonwebtoken

2. Create User model

Fields:
- id
- email
- password

3. Create auth routes

- POST /auth/register  
- POST /auth/login  

4. Hash passwords using bcrypt

5. Generate JWT token on login

6. Create auth middleware
   - Verify token
   - Attach user to request

7. Protect routes
   - Only logged-in users can create issues
   - Users can only edit/delete their own issues

---

## Phase 4: React Frontend

### Goal
Build the user interface for CivicLens.

### Step-by-Step

1. Create React app
   - Use Vite or Create React App

2. Set up pages
   - Login page
   - Register page
   - Issue list page
   - Issue detail page
   - Create issue page

3. Create API service file
   - Use fetch or axios

4. Implement authentication
   - Store token in localStorage
   - Send token in headers

5. Fetch issues
   - Display list of issues
   - Show title, category, status

6. Create issue form
   - Controlled inputs
   - Submit to API

7. Add routing
   - Use react-router-dom

8. Protect routes
   - Redirect if not logged in

---

## Phase 5: Deployment (Docker + Caddy + Fly.io)

### Goal
Deploy your application to production.

### Step-by-Step

1. Create Dockerfile
   - Build backend
   - Build frontend

2. Create Caddyfile
   - Serve frontend
   - Proxy /api to backend

3. Build Docker image

4. Install Fly CLI

5. Run:
   - fly launch
   - fly deploy

6. Verify HTTPS works

---

## Phase 6: CI/CD (GitHub Actions)

### Goal
Automate testing and deployment.

### Step-by-Step

1. Create GitHub Actions workflow

2. Add steps:
   - Install dependencies
   - Run tests
   - Deploy to Fly.io

3. Add secret:
   - FLY_API_TOKEN

4. Ensure:
   - Tests must pass before deploy

---

## Final Expectations

By the end of this project, you should be able to:

- explain your backend API  
- describe your database schema  
- demonstrate authentication  
- show your React frontend  
- deploy your app  
- explain your CI/CD pipeline  

---

## Final Note

This project is designed to challenge you.

You are not expected to know everything immediately. Focus on building step by step, asking questions, and understanding how each part connects.

By the end, you will be able to say:

"I built a full-stack application from scratch."