# Initial phases

## Step 1: FastAPI Backend MVP
The goal here is to establish a "source of truth" and ensure your data integrity is rock-solid before touching the UI.

### Phase 1: Infrastructure & Database Schema
- ✅ Initialize the FastAPI project and environment variables (.env). 

- ✅ Configure the SQLAlchemy engine to connect to PostgreSQL.

- ✅ Define the core database models: User, Story, and Passage.

### Phase 2: Authentication & User Management
- ✅ Implement JWT (JSON Web Token) session authorization functionality.

- ✅ Create the /auth/register and /auth/login endpoints.

- ✅ Implement a "Current User" dependency to protect sensitive routes.

- ✅ Test user creation and token validation via the built-in Swagger UI (/docs).

### Phase 3: Story Lifecycle Endpoints
- ✅ Create POST /stories to allow users to start a new collaborative thread.

- ✅ Create GET /stories with basic pagination to list available stories.

- ✅ Implement logic to ensure every new story is initialized with its first initial passage.

### Phase 4: Passage Submission & Branching Logic
- ✅ Create POST /stories/{id}/passages to handle contributions.

- ✅ Implement logic to validate the parent_passage_id (ensuring the story is actually following a valid path).

- ✅ Develop a recursive (or flattened) GET endpoint to retrieve the story "tree" or a specific linear path.

### Phase 5: Validation & Error Handling
- ✅ Add Pydantic schemas for strict input validation (e.g., minimum character counts for passages).

- ✅ Implement custom exception handlers for common errors (e.g., "Story Not Found" or "Unauthorized Contribution").

- Finalize the API documentation and ensure all endpoints are typed for frontend consumption.

## Step 2: Next.js Frontend MVP
This step focuses on creating a clean, responsive interface that makes the collaborative process feel intuitive.

### Phase 1: Scaffolding & API Client
- Initialize the Next.js project with Tailwind CSS and TypeScript.

- Set up a centralized API client (using fetch or Axios) with base URLs and interceptors for JWT tokens.

- Configure React Query (TanStack Query) to manage server state and caching.

### Phase 2: Auth Pages & Protected Routes
- Build the Login and Registration forms with validation (using React Hook Form).

- Implement persistent session handling (storing the JWT in a secure cookie or local storage).

- Create a Higher-Order Component (HOC) or Middleware to redirect unauthenticated users away from "Contribute" pages.

### Phase 3: The Story Discovery Dashboard
- Build the main landing page that fetches and displays the list of active stories.

- Create "Story Cards" showing titles, descriptions, and metadata like the contributor count.

- Implement a "Start a New Story" modal or page that interfaces with your backend.

### Phase 4: The Narrative View & Contribution UI
- Build a dynamic page to render the story passages in order.

- Implement the "Contribute" form at the bottom of a story thread.

- Ensure the UI correctly identifies the parent_passage_id based on which branch the user is currently reading.

### Phase 5: UX Polish & Deployment
- Add loading skeletons and "optimistic updates" (making the UI feel instant when a user submits a passage).

- Ensure the design is fully responsive for mobile users (who might want to write on the go).

- Deploy the frontend to Vercel and connect it to your hosted FastAPI backend.