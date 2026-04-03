# Recipe Hub - Full-Stack Web Application

## Project Overview

**Recipe Hub** is a comprehensive full-stack web application that enables users to discover, create, and share recipes while simplifying meal planning and grocery shopping. Built as a Single Page Application (SPA) using modern web technologies for an academic project/exam.

**Project Author**: Vasilena Stanoyska (4MI0600290)  
**Project Name**: Recipe Hub (also referenced as Tasty Hub)  
**Course**: Fullstack Application Development with Node.js + Express.js + React.js - 2026

## Business Goals

1. **Recipe Discovery & Sharing**: Enable users to browse, search, and share recipes in a community-driven platform
2. **Smart Search**: Allow ingredient-based search to help users cook with what they have at home
3. **Meal Planning**: Provide weekly meal planning calendar to organize cooking
4. **Shopping List Automation**: Auto-generate shopping lists from meal plans with smart ingredient aggregation
5. **Quality & Ratings**: Implement rating system to highlight quality recipes
6. **Educational Purpose**: Demonstrate full-stack development skills for exam evaluation

## Technical Architecture

### Frontend
- **Framework**: React.js (SPA)
- **State Management**: Redux
- **Routing**: React Router (client-side routing)
- **UI**: Responsive design with grid/list views for recipes
- **Image Handling**: Drag-and-drop upload with preview

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **API Style**: RESTful JSON API
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: Bcrypt hashing

### Database
- **DBMS**: PostgreSQL
- **Data Format**: Relational with proper normalization
- **Key Entities**: Users, Recipes, Ingredients, Ratings, MealPlans, SavedRecipes, Followers, Notifications

### Development Requirements
- **Git Strategy**: Atomic commits per subtask for maximum traceability
- **Commit Frequency**: After each small functionality implementation
- **Purpose**: Demonstrate iterative development process for exam evaluation

## User Roles

### Anonymous User
- Browse all public recipes
- View recipe details (ingredients, instructions, ratings)
- Search recipes by:
  - Title/description text
  - Ingredients available at home
  - Filters: category, difficulty, rating
- Sort results by: highest rated, newest, quickest cooking time
- View user profiles (read-only)
- **Cannot**: Save recipes, create recipes, rate recipes, access meal planning

### Authenticated User (Home Cook)
All Anonymous User capabilities, plus:
- **Recipe Management**:
  - Create and publish recipes with images
  - Edit and delete own recipes
  - View recipe statistics (views, saves)
- **Personal Collection**:
  - Save favorite recipes from other users
  - Organize saved recipes by category
- **Rating System**:
  - Rate recipes 1-5 stars
  - Update or delete own ratings
  - One rating per recipe per user
- **Meal Planning**:
  - Plan weekly meals (Breakfast, Lunch, Dinner for Mon-Sun)
  - Add recipes from own or saved collections
  - Edit/remove meals from calendar
  - Navigate between weeks
- **Shopping Lists**:
  - Auto-generate from weekly meal plan
  - Smart ingredient aggregation (e.g., "2 cups rice" + "1 cup rice" = "3 cups rice")
  - Group by category (Vegetables, Proteins, Dairy, Grains)
  - Check off items while shopping
  - Manual editing of quantities
  - Print or export list
- **Social Features**:
  - Follow other users
  - Receive notifications when followed users publish recipes
  - View following list
- **Profile Management**:
  - Update profile picture, name, password
  - View personal statistics (recipes created, saved, average rating)

## Core Features & Use Cases

### 1. User Registration & Authentication (UC 2.1)
- Registration with username (unique), email (unique), password, first/last name
- Password strength indicator, confirmation field
- Terms of service acceptance
- Login with email/password, "Remember me" option
- JWT token generation and validation
- Secured routes for authenticated actions

### 2. Recipe Browsing & Search (UC 2.2)
- Grid/list view of all public recipes
- Recipe cards showing: image, title, cooking time, difficulty, rating
- Filter sidebar: category dropdown, difficulty filter, minimum rating filter
- Sort dropdown: highest rated, newest, quickest
- Pagination controls
- Full recipe detail page with all information

### 3. Smart Ingredient Search (UC 2.3)
- Dedicated ingredient search page
- Text input with autocomplete for ingredient suggestions
- Tag-based ingredient selection (add/remove)
- Search finds recipes containing ALL specified ingredients
- Results sorted by rating (best match)
- Highlight matching ingredients in recipe cards
- Empty state messaging

### 4. Create & Share Recipes (UC 2.4)
- Multi-section form:
  - **Basic Info**: Title, description, category, difficulty, cooking time, servings
  - **Ingredients**: Dynamic list (name, quantity, unit), add/remove rows
  - **Instructions**: Step-by-step textarea or multiple inputs
  - **Image Upload**: Drag-and-drop, preview, max 5MB JPG/PNG
- Form validation before submission
- Recipe published to public feed immediately

### 5. Save & Organize Favorites (UC 2.5)
- "Save Recipe" button on detail pages (authenticated only)
- Saved recipes page with grid display
- Sort by: recently saved, highest rated, quickest
- Filter by category within saved collection
- "Unsave" button to remove
- Empty state encouragement

### 6. Rate Recipes (UC 2.6)
- Star rating component (1-5) on detail pages
- Display current average rating
- One rating per user per recipe (create or update)
- Immediate recalculation of average
- Option to update or delete own rating later

### 7. Weekly Meal Planning (UC 2.7)
- Calendar grid: 7 columns (days) × 3 rows (meal types)
- Week navigation: previous/next week buttons
- Current week display (e.g., "Week of April 3-9, 2026")
- Each cell shows recipe image/title if assigned, "Add Recipe" button if empty
- Recipe selection modal with search and tabs (My Recipes | Saved Recipes)
- Edit/remove icons for assigned meals
- Persistence per week

### 8. Shopping List Generation (UC 2.8)
- Week selector dropdown
- "Generate Shopping List" button
- Retrieves all recipes from selected week's meal plan
- Extracts all ingredients
- Aggregates duplicates with quantity addition
- Groups by category (Vegetables, Proteins, Dairy, Grains, etc.)
- Collapsible category headers
- Checkboxes for each item
- Strikethrough when checked
- Progress indicator: "5 of 23 items purchased"
- Manual editing: add/remove items, adjust quantities
- "Clear Checked Items" button
- "Regenerate List" button (overwrites)
- Print and export options

### 9. Edit & Delete Recipes (UC 2.9)
- "Edit Recipe" button on own recipes (My Recipes section)
- Pre-filled form with existing data
- "Save Changes" to update
- "Delete Recipe" button with confirmation modal
- Deletion cascades: removes from all users' saved collections, removes ratings, removes from meal plans

### 10. User Profile & Statistics (UC 2.10)
- Profile page with:
  - Profile picture (editable)
  - Username, email, full name, member since date
  - Statistics: recipes created, recipes saved, average rating on own recipes
  - Most popular recipe (highest rated)
- Edit Profile button:
  - Update first/last name
  - Upload new profile picture
- Change Password section:
  - Current password verification
  - New password + confirm
- Delete Account button (bottom, with confirmation)

### 11. User Following (UC 2.11)
- "Follow" button on user profile pages
- Following page shows:
  - List of followed users with profile pictures, usernames, recipe counts
  - Sort by: recently followed, most recipes, alphabetical
  - "Unfollow" button per user (with confirmation)
  - Search/filter bar
- Empty state suggestions

### 12. Real-Time Notifications (UC 2.12)
- Notification icon in navbar (bell icon)
- Badge showing unread count
- Dropdown panel showing recent notifications
- Notification types:
  - "[Username] published a new recipe: [Recipe Title]"
- Mark as read (individually or all)
- Navigate to recipe/user on click
- Pagination for notification history

### 13. My Recipes Page
- Grid of user's created recipes
- Sort by: newest, highest rated, most saved
- Recipe cards with edit/delete buttons
- View statistics per recipe (views, saves)
- Empty state: "You haven't created any recipes yet. Share your first recipe!"

## Main Views (SPA Routes)

| Route | View | Description |
|-------|------|-------------|
| `/` | Home | Landing page with featured/popular recipes, search bar, category filters |
| `/recipes` | Browse All Recipes | Comprehensive recipe browsing with filters, sorting, pagination |
| `/recipes/:id` | Recipe Detail | Full recipe view with ingredients, instructions, ratings, creator info |
| `/register` | User Registration | New user registration form |
| `/login` | Login | User authentication form |
| `/dashboard` | User Dashboard | Personal hub with quick stats, recent recipes, saved recipes preview, meal planner/shopping list shortcuts |
| `/recipes/create` | Create Recipe | Multi-section form to publish new recipe |
| `/recipes/:id/edit` | Edit Recipe | Pre-filled form to modify existing recipe (creator only) |
| `/search-by-ingredients` | Ingredient Search | Find recipes based on available ingredients |
| `/meal-planner` | Meal Planner | Weekly calendar for meal planning |
| `/shopping-list` | Shopping List | Auto-generated and editable shopping list |
| `/saved-recipes` | Saved Recipes | User's bookmarked favorite recipes |
| `/profile` | User Profile | View/edit own profile and statistics |
| `/my-recipes` | My Recipes | User's created recipes with edit/delete options |
| `/following` | User Following | List of followed users |
| `/notifications` | Notifications | Notification history (optional full page) |

## API Endpoints (RESTful)

### Authentication
- `POST /api/auth/register` - Create new user account, receive JWT
- `POST /api/auth/login` - Authenticate user, receive JWT

### Recipes
- `GET /api/recipes?sortBy=rating&limit=8` - Fetch featured/popular recipes
- `GET /api/recipes?page=1&limit=12&category={id}&difficulty={level}&minRating={rating}&search={term}&sortBy={field}` - Get filtered/sorted recipes with pagination
- `GET /api/recipes/:id` - Fetch complete recipe details with ratings
- `GET /api/recipes?category={categoryId}&limit=4` - Fetch related recipes
- `POST /api/recipes` - Submit new recipe (auth required, with image upload)
- `PUT /api/recipes/:id` - Update recipe (auth required, creator only)
- `DELETE /api/recipes/:id` - Delete recipe (auth required, creator only)

### Ingredient Search
- `GET /api/ingredients/search?query={text}` - Autocomplete ingredient suggestions
- `GET /api/recipes/search?ingredients={ingredient1,ingredient2,...}` - Search recipes containing specified ingredients
- `GET /api/categories` - Load category options for filters

### Saved Recipes
- `POST /api/saved-recipes/:recipeId` - Save recipe to collection (auth required)
- `GET /api/saved-recipes` - Fetch user's saved recipes (auth required)
- `DELETE /api/saved-recipes/:recipeId` - Remove recipe from collection (auth required)

### Ratings
- `POST /api/ratings` - Submit rating for recipe (auth required)
- `PUT /api/ratings/:recipeId` - Update existing rating (auth required)

### User Dashboard
- `GET /api/auth/me` - Get current user information (auth required)
- `GET /api/recipes/user/:userId` - Fetch user's created recipes
- `GET /api/saved-recipes` - Fetch user's saved recipes (auth required)

### Meal Plans
- `GET /api/meal-plans/week/:date` - Load meal plan for specific week (auth required)
- `GET /api/recipes/user/:userId` - Load user's recipes for selection modal
- `GET /api/saved-recipes` - Load saved recipes for selection modal
- `POST /api/meal-plans` - Add recipe to day/meal slot (auth required)
- `PUT /api/meal-plans/:id` - Update meal plan entry (auth required)
- `DELETE /api/meal-plans/:id` - Remove recipe from meal plan (auth required)

### Shopping Lists
- `GET /api/shopping-lists/week/:date` - Load shopping list for selected week (auth required)
- `POST /api/shopping-lists/generate` - Generate shopping list from meal plan for specified week (auth required)
- `PUT /api/shopping-lists/:id` - Update shopping list (check items, edit quantities) (auth required)
- `DELETE /api/shopping-lists/:id` - Delete shopping list (auth required)

### User Profile
- `GET /api/auth/me` - Get current user profile data (auth required)
- `GET /api/recipes/user/:userId` - Get user's created recipe count
- `GET /api/saved-recipes` - Get user's saved recipe count (auth required)
- `PUT /api/users/:id` - Update user profile (name, profile picture) (auth required)
- `DELETE /api/users/:id` - Delete user account (auth required)

### My Recipes
- `GET /api/recipes/user/:userId` - Fetch all recipes created by current user (auth required)
- `DELETE /api/recipes/:id` - Delete selected recipe (auth required)

### User Following
- `POST /api/users/:userId/follow` - Follow a user (auth required)
- `DELETE /api/users/:userId/follow` - Unfollow a user (auth required)
- `GET /api/users/:userId/followers` - Get user's followers list
- `GET /api/users/:userId/following` - Get users that the user is following
- `GET /api/users/me/following` - Get current user's following list with details (auth required)

### Notifications
- `GET /api/notifications?page={number}&limit={num}&unread={boolean}` - Fetch user's notifications with pagination and filters (auth required)
- `GET /api/notifications/unread/count` - Get count of unread notifications (auth required)
- `PUT /api/notifications/:id/read` - Mark specific notification as read (auth required)
- `PUT /api/notifications/read-all` - Mark all notifications as read (auth required)
- `DELETE /api/notifications/:id` - Delete specific notification (auth required)
- `POST /api/notifications/settings` - Update notification preferences (auth required)
- `GET /api/notifications/settings` - Get current notification preferences (auth required)

## Database Schema (PostgreSQL)

### Users Table
```sql
- id (PK)
- username (unique, indexed)
- email (unique, indexed)
- password_hash
- first_name
- last_name
- profile_picture_url
- created_at
- updated_at
```

### Recipes Table
```sql
- id (PK)
- user_id (FK → Users)
- title (indexed)
- description
- category (enum or FK to Categories)
- difficulty (enum: easy, medium, hard)
- cooking_time (minutes)
- servings
- image_url
- instructions (text)
- average_rating (calculated, indexed)
- total_ratings (count)
- total_saves (count)
- created_at
- updated_at
```

### Ingredients Table
```sql
- id (PK)
- name (unique, indexed)
```

### RecipeIngredients Table (Junction)
```sql
- id (PK)
- recipe_id (FK → Recipes)
- ingredient_id (FK → Ingredients)
- quantity
- unit
```

### Ratings Table
```sql
- id (PK)
- user_id (FK → Users)
- recipe_id (FK → Recipes)
- rating (1-5)
- created_at
- updated_at
- UNIQUE(user_id, recipe_id)
```

### SavedRecipes Table
```sql
- id (PK)
- user_id (FK → Users)
- recipe_id (FK → Recipes)
- saved_at
- UNIQUE(user_id, recipe_id)
```

### MealPlans Table
```sql
- id (PK)
- user_id (FK → Users)
- recipe_id (FK → Recipes)
- week_start_date (indexed)
- day_of_week (0-6 for Sun-Sat)
- meal_type (enum: breakfast, lunch, dinner)
- created_at
```

### ShoppingLists Table
```sql
- id (PK)
- user_id (FK → Users)
- week_start_date (indexed)
- ingredient_name
- quantity
- unit
- category
- is_checked (boolean)
- created_at
- updated_at
```

### Followers Table
```sql
- id (PK)
- follower_user_id (FK → Users) -- the user who follows
- followed_user_id (FK → Users) -- the user being followed
- created_at
- UNIQUE(follower_user_id, followed_user_id)
```

### Notifications Table
```sql
- id (PK)
- user_id (FK → Users) -- recipient
- sender_user_id (FK → Users) -- who triggered the notification
- type (enum: new_recipe, etc.)
- recipe_id (FK → Recipes, nullable)
- message (text)
- is_read (boolean, default false)
- created_at
```

## Key Technical Considerations

### Security
- Password hashing with bcrypt (salt rounds: 10+)
- JWT secret stored in environment variables
- Token expiration (e.g., 7 days)
- Protected routes requiring valid JWT
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (proper escaping)

### File Uploads
- Image storage: local filesystem or cloud (e.g., AWS S3)
- Validation: file type (JPG/PNG), max size (5MB)
- Unique filename generation (UUIDs)
- Image optimization/resizing (optional)

### Performance
- Database indexing on frequently queried fields (username, email, recipe title, category, rating)
- Pagination for large result sets
- Efficient N+1 query prevention (JOIN operations)
- Caching strategy for popular recipes (optional)

### Real-Time Features
- WebSocket implementation for notifications (e.g., Socket.io)
- Event-driven notification system
- Notification polling fallback

### Data Validation
- Frontend: React form validation with error messages
- Backend: Express middleware validation (e.g., express-validator)
- Database: constraints (UNIQUE, NOT NULL, CHECK)

## Development Workflow

### Iterative Feature Development
1. **Planning Phase**: Define feature scope and requirements
2. **Implementation Phase**:
   - Backend: Create database schema, API endpoints, business logic
   - Frontend: Build React components, Redux actions/reducers, API integration
   - Integration: Connect frontend to backend API
3. **Testing Phase**: Manual testing of each feature
4. **Commit Phase**: Atomic commit after each subtask completion
5. **Documentation Phase**: Explain implementation details (especially React concepts)
6. **Review Phase**: Verify feature completeness before moving to next

### Git Commit Strategy
- **Atomic commits**: Each small subtask gets its own commit
- **Commit message format**: `<type>: <description>`
  - Examples:
    - `feat: Add User model and schema`
    - `feat: Create POST /api/auth/register endpoint`
    - `feat: Build registration form component`
    - `feat: Connect registration form to API`
    - `fix: Add password validation to registration`
- **Traceability**: Clear commit history for exam evaluation
- **Push frequency**: After every commit to GitHub

### Learning & Documentation
- After each feature implementation:
  - **React Explanations**: How components work, state management, hooks used
  - **Architecture Overview**: How frontend and backend communicate
  - **Code Walkthrough**: Key implementation decisions
  - **Troubleshooting Tips**: Common issues and solutions

## Project Structure

```
tasty-hub/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # PostgreSQL connection
│   │   ├── models/                 # Database models
│   │   ├── controllers/            # Route controllers
│   │   ├── routes/                 # API routes
│   │   ├── middleware/             # Auth, validation
│   │   ├── utils/                  # Helper functions
│   │   └── server.js               # Express app entry
│   ├── uploads/                    # Recipe images
│   ├── package.json
│   └── .env                        # Environment variables
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   ├── pages/                  # Route-based page components
│   │   ├── redux/                  # State management
│   │   │   ├── actions/
│   │   │   ├── reducers/
│   │   │   └── store.js
│   │   ├── services/               # API service layer
│   │   ├── utils/                  # Helper functions
│   │   ├── App.js                  # Main app component
│   │   └── index.js                # React entry point
│   ├── package.json
│   └── .env                        # Environment variables
├── .planning/                      # GSD workflow artifacts
├── package.json                    # Root package manager
└── README.md
```

## Success Criteria

### Functional Requirements
- ✅ All 12 use cases implemented and working
- ✅ Anonymous users can browse and search recipes
- ✅ Authenticated users can create, save, rate recipes
- ✅ Meal planning and shopping list generation functional
- ✅ User following and notifications working
- ✅ Responsive UI with good UX

### Technical Requirements
- ✅ SPA with React + Redux + React Router
- ✅ RESTful API with Express + PostgreSQL
- ✅ JWT authentication and authorization
- ✅ Proper error handling and validation
- ✅ Atomic commits with clear history

### Educational Goals
- ✅ Demonstrate full-stack development skills
- ✅ Show understanding of React concepts
- ✅ Prove ability to integrate frontend and backend
- ✅ Exhibit version control proficiency
- ✅ Document learning journey

## Constraints & Assumptions

### Constraints
- Timeline: Exam-driven deadline
- Scope: Full feature set as per specification
- Technology: Must use React, Node.js, Express, PostgreSQL
- Deliverables: Working application + Git history

### Assumptions
- Single-language support (English)
- Recipe images hosted locally initially
- Basic UI styling (no advanced CSS framework required)
- Manual testing (no automated tests required for exam)
- Development environment only (no production deployment needed)
- Browser compatibility: Modern browsers (Chrome, Firefox, Safari)

## Next Steps

1. **Environment Setup**: Install Node.js, PostgreSQL, create project structure
2. **Database Design**: Create PostgreSQL database and tables
3. **Backend Foundation**: Setup Express server, database connection, basic middleware
4. **Authentication System**: Implement user registration and login (backend + frontend)
5. **Recipe CRUD**: Build recipe creation, viewing, editing, deletion
6. **Search & Browse**: Implement recipe browsing, filtering, and ingredient search
7. **Ratings & Favorites**: Add rating system and saved recipes functionality
8. **Meal Planning**: Build weekly meal planner calendar
9. **Shopping Lists**: Implement shopping list generation and management
10. **Social Features**: Add user following functionality
11. **Notifications**: Implement real-time notification system
12. **Polish & Testing**: Refine UI, fix bugs, comprehensive testing
13. **Documentation**: Final README and code documentation

---

**Project Status**: Initialized  
**Current Phase**: Planning Complete  
**Next Action**: `/gsd:plan-phase 1` to start implementation
