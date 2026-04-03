# Project Roadmap - Recipe Hub

## Milestone 1: MVP - Full Feature Set

### Phase 1: Project Foundation & Environment Setup
**Goal**: Setup project structure, development environment, and database foundation

**Deliverables**:
- Project directory structure (frontend/ and backend/)
- Package.json files with dependencies
- PostgreSQL database created
- Environment configuration files
- Git repository initialized with .gitignore

**Requirements Covered**: Infrastructure setup

**Success Criteria**:
- ✅ Frontend React app runs on localhost:3000
- ✅ Backend Express server runs on localhost:5000
- ✅ PostgreSQL database connection successful
- ✅ All dependencies installed

**Estimated Tasks**: 5-8 tasks

---

### Phase 2: Database Schema & Models
**Goal**: Design and implement complete PostgreSQL database schema with all tables and relationships

**Deliverables**:
- Database schema design
- SQL migration scripts
- Database models (User, Recipe, Ingredient, Rating, SavedRecipe, MealPlan, ShoppingList, Follower, Notification)
- Database indexes for performance

**Requirements Covered**: 
- DR-1: User Data
- DR-2: Recipe Data
- DR-3: Ingredient Data
- DR-4: Rating Data
- DR-5: Meal Plan Data
- DR-6: Shopping List Data
- DR-7: Notification Data

**Success Criteria**:
- ✅ All tables created with proper constraints
- ✅ Foreign key relationships established
- ✅ Indexes created on frequently queried fields
- ✅ Database seeded with test data (optional)

**Estimated Tasks**: 10-12 tasks

---

### Phase 3: User Authentication System
**Goal**: Implement complete user registration and login with JWT authentication

**Deliverables**:
- Backend:
  - User model and controller
  - POST /api/auth/register endpoint
  - POST /api/auth/login endpoint
  - JWT generation and validation middleware
  - Password hashing with bcrypt
- Frontend:
  - Registration page with form validation
  - Login page with form validation
  - Auth service for API calls
  - Redux actions/reducers for auth state
  - Protected route component

**Requirements Covered**:
- FR-1.1: User Registration
- FR-1.2: User Login
- NFR-3: Security (password hashing, JWT)
- AC-1: User Authentication

**Success Criteria**:
- ✅ Users can register with valid credentials
- ✅ Users can login and receive JWT token
- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens are validated on protected routes
- ✅ Form validation works with clear error messages
- ✅ Atomic commits for each subtask

**Estimated Tasks**: 12-15 tasks

---

### Phase 4: Recipe CRUD Operations
**Goal**: Implement create, read, update, delete operations for recipes

**Deliverables**:
- Backend:
  - Recipe model and controller
  - POST /api/recipes - Create recipe with image upload
  - GET /api/recipes/:id - Get recipe details
  - PUT /api/recipes/:id - Update recipe (creator only)
  - DELETE /api/recipes/:id - Delete recipe (creator only)
  - GET /api/recipes/user/:userId - Get user's recipes
  - File upload middleware (multer)
  - Image storage setup
- Frontend:
  - Create Recipe page with multi-section form
  - Recipe Detail page
  - Edit Recipe page
  - My Recipes page with edit/delete buttons
  - Recipe card component (reusable)
  - Redux actions/reducers for recipes
  - Recipe service for API calls

**Requirements Covered**:
- FR-3.1: Create Recipe
- FR-3.2: Edit Recipe
- FR-3.3: Delete Recipe
- FR-3.4: View My Recipes
- DR-2: Recipe Data
- DR-3: Ingredient Data
- AC-2: Recipe Management

**Success Criteria**:
- ✅ Users can create recipes with all fields and image upload
- ✅ Recipe images are stored and served correctly
- ✅ Users can view recipe details
- ✅ Users can edit only their own recipes
- ✅ Users can delete own recipes with confirmation
- ✅ Cascade delete removes ratings, saved recipes, meal plans
- ✅ Form validation works for all fields

**Estimated Tasks**: 20-25 tasks

---

### Phase 5: Recipe Browsing & Search
**Goal**: Implement recipe discovery features including browsing, filtering, and searching

**Deliverables**:
- Backend:
  - GET /api/recipes - Get all recipes with filters, sorting, pagination
  - GET /api/categories - Get category list
  - Query parameter handling (category, difficulty, minRating, search, sortBy, page, limit)
- Frontend:
  - Home page with featured recipes
  - Browse All Recipes page
  - Filter sidebar component (category, difficulty, rating)
  - Sort dropdown component
  - Search bar component
  - Pagination component
  - Recipe grid/list toggle
  - Redux actions/reducers for recipe browsing

**Requirements Covered**:
- FR-2.1: Browse All Recipes
- FR-2.2: View Recipe Details
- NFR-1: Performance (pagination)
- NFR-5: Scalability (indexing, efficient queries)
- AC-3: Recipe Discovery (partial)

**Success Criteria**:
- ✅ Anonymous users can browse all recipes
- ✅ Filters work correctly (category, difficulty, rating)
- ✅ Sort options work (highest rated, newest, quickest)
- ✅ Search by title/description works
- ✅ Pagination displays 12 recipes per page
- ✅ Recipe cards show all required information
- ✅ Clicking recipe navigates to detail page

**Estimated Tasks**: 15-18 tasks

---

### Phase 6: Ingredient-Based Search
**Goal**: Implement smart search feature to find recipes by available ingredients

**Deliverables**:
- Backend:
  - GET /api/ingredients/search?query={text} - Autocomplete suggestions
  - GET /api/recipes/search?ingredients={list} - Search by ingredients
  - Ingredient matching algorithm
  - Highlighting logic for matched ingredients
- Frontend:
  - Ingredient Search page
  - Autocomplete ingredient input component
  - Tag display for selected ingredients
  - Search results with highlighted ingredients
  - Sort by "Best Match" or "Highest Rated"
  - Filter results by category
  - Empty state messaging
  - Redux actions/reducers for ingredient search

**Requirements Covered**:
- FR-2.3: Search Recipes by Ingredients
- AC-3: Recipe Discovery (ingredient search)

**Success Criteria**:
- ✅ Autocomplete suggests ingredients as user types
- ✅ Users can add/remove ingredient tags
- ✅ Search returns recipes containing ALL ingredients
- ✅ Matching ingredients are highlighted in results
- ✅ Results can be sorted and filtered
- ✅ Empty state displays helpful message

**Estimated Tasks**: 12-15 tasks

---

### Phase 7: Ratings & Saved Recipes
**Goal**: Implement recipe rating system and saved recipes functionality

**Deliverables**:
- Backend:
  - POST /api/ratings - Submit or update rating
  - GET /api/recipes/:id/ratings - Get recipe ratings
  - Rating aggregation logic (average calculation)
  - POST /api/saved-recipes/:recipeId - Save recipe
  - GET /api/saved-recipes - Get user's saved recipes
  - DELETE /api/saved-recipes/:recipeId - Unsave recipe
- Frontend:
  - Star rating component on recipe detail page
  - "Save Recipe" button with saved state indicator
  - Saved Recipes page with grid display
  - Sort/filter options for saved recipes
  - Empty state messaging
  - Redux actions/reducers for ratings and saved recipes

**Requirements Covered**:
- FR-4.1: Save Recipe
- FR-4.2: View Saved Recipes
- FR-4.3: Unsave Recipe
- FR-5.1: Rate Recipe
- FR-5.2: Update Rating
- DR-4: Rating Data
- AC-4: Ratings & Favorites

**Success Criteria**:
- ✅ Authenticated users can rate recipes 1-5 stars
- ✅ One rating per user per recipe (create or update)
- ✅ Average rating recalculates immediately
- ✅ Users can save/unsave recipes
- ✅ Saved recipes page shows all bookmarked recipes
- ✅ Sort and filter options work

**Estimated Tasks**: 15-18 tasks

---

### Phase 8: User Dashboard
**Goal**: Create personalized dashboard showing user's recipes, stats, and quick navigation

**Deliverables**:
- Backend:
  - GET /api/auth/me - Get current user info with stats
  - GET /api/recipes/user/:userId/stats - Get recipe statistics
- Frontend:
  - Dashboard page layout
  - Welcome message with username
  - Statistics cards (recipes created, saved, average rating)
  - "My Recipes" section with grid
  - "Saved Recipes" preview (first 6)
  - Quick navigation cards (meal planner, shopping list, browse recipes)
  - Redux actions/reducers for dashboard data

**Requirements Covered**:
- FR-11.1: Dashboard Overview
- AC-9: User Profile (statistics display)

**Success Criteria**:
- ✅ Dashboard displays welcome message with username
- ✅ Statistics cards show correct counts
- ✅ "My Recipes" section shows user's recipes
- ✅ Saved recipes preview displays first 6 recipes
- ✅ Quick navigation cards link to correct pages

**Estimated Tasks**: 10-12 tasks

---

### Phase 9: Meal Planning System
**Goal**: Implement weekly meal planner calendar with recipe assignment

**Deliverables**:
- Backend:
  - GET /api/meal-plans/week/:date - Get meal plan for week
  - POST /api/meal-plans - Add recipe to meal slot
  - PUT /api/meal-plans/:id - Update meal plan entry
  - DELETE /api/meal-plans/:id - Remove recipe from meal plan
  - GET /api/recipes/user/:userId - Load user's recipes for modal
  - GET /api/saved-recipes - Load saved recipes for modal
- Frontend:
  - Meal Planner page with calendar grid (7×3)
  - Week navigation (previous/next buttons, current week display)
  - Calendar cells with recipe thumbnail or "Add Recipe" button
  - Recipe selection modal with search and tabs (My Recipes | Saved Recipes)
  - Edit/remove icons for assigned meals
  - Redux actions/reducers for meal plans

**Requirements Covered**:
- FR-6.1: View Weekly Meal Plan
- FR-6.2: Add Recipe to Meal Plan
- FR-6.3: Edit/Remove Meal Plan Entry
- FR-6.4: Navigate Between Weeks
- DR-5: Meal Plan Data
- AC-5: Meal Planning

**Success Criteria**:
- ✅ Calendar displays 7 days × 3 meals
- ✅ Users can navigate between weeks
- ✅ Users can add recipes to meal slots
- ✅ Recipe selection modal shows user's and saved recipes
- ✅ Users can edit/remove meal plan entries
- ✅ Meal plan state persists per week

**Estimated Tasks**: 18-22 tasks

---

### Phase 10: Shopping List Generation
**Goal**: Implement automatic shopping list generation from meal plans with smart aggregation

**Deliverables**:
- Backend:
  - GET /api/shopping-lists/week/:date - Get shopping list for week
  - POST /api/shopping-lists/generate - Generate list from meal plan
  - PUT /api/shopping-lists/:id - Update shopping list (check items, edit quantities)
  - DELETE /api/shopping-lists/:id - Delete shopping list
  - Ingredient aggregation algorithm (quantity addition)
  - Category grouping logic
- Frontend:
  - Shopping List page
  - Week selector dropdown
  - "Generate Shopping List" button
  - Collapsible category sections (Vegetables, Proteins, Dairy, Grains)
  - Checkbox per ingredient with strikethrough
  - Progress indicator ("5 of 23 items purchased")
  - Manual editing controls (add/remove items, adjust quantities)
  - "Clear Checked Items" button
  - "Regenerate List" button with confirmation
  - "Print List" button
  - Redux actions/reducers for shopping lists

**Requirements Covered**:
- FR-7.1: Generate Shopping List
- FR-7.2: Manage Shopping List
- DR-6: Shopping List Data
- AC-6: Shopping Lists

**Success Criteria**:
- ✅ System retrieves all recipes from week's meal plan
- ✅ Duplicate ingredients are aggregated correctly (e.g., "2 cups + 1 cup = 3 cups")
- ✅ Ingredients are grouped by category
- ✅ Users can check/uncheck items
- ✅ Progress indicator updates in real-time
- ✅ Users can manually edit quantities
- ✅ "Clear Checked Items" removes checked ingredients
- ✅ "Regenerate" overwrites with confirmation
- ✅ Print functionality works

**Estimated Tasks**: 20-25 tasks

---

### Phase 11: User Profile Management
**Goal**: Implement user profile viewing, editing, password change, and account deletion

**Deliverables**:
- Backend:
  - GET /api/users/:id - Get user profile (public info)
  - GET /api/auth/me - Get current user profile with full info
  - PUT /api/users/:id - Update user profile (name, picture)
  - PUT /api/users/:id/password - Change password
  - DELETE /api/users/:id - Delete account with cascade
  - Profile picture upload handling
- Frontend:
  - User Profile page (view mode)
  - Profile section (picture, username, email, full name, member since)
  - Statistics section (recipes created, saved, average rating, most popular recipe)
  - "Edit Profile" form (update name, upload picture)
  - "Change Password" section (current, new, confirm)
  - "Delete Account" button with confirmation modal
  - Redux actions/reducers for profile management

**Requirements Covered**:
- FR-8.1: View Profile
- FR-8.2: Edit Profile
- FR-8.3: Change Password
- FR-8.4: Delete Account
- DR-1: User Data (profile picture)
- AC-9: User Profile

**Success Criteria**:
- ✅ Profile page displays all user information and statistics
- ✅ Users can edit first/last name
- ✅ Users can upload new profile picture (JPG/PNG, max 5MB)
- ✅ Users can change password with current password verification
- ✅ Users can delete account with confirmation
- ✅ Account deletion cascades to all related data

**Estimated Tasks**: 15-18 tasks

---

### Phase 12: User Following System
**Goal**: Implement social following feature allowing users to follow other users

**Deliverables**:
- Backend:
  - POST /api/users/:userId/follow - Follow a user
  - DELETE /api/users/:userId/follow - Unfollow a user
  - GET /api/users/:userId/followers - Get followers list
  - GET /api/users/:userId/following - Get following list
  - GET /api/users/me/following - Get current user's following with details
  - Prevent self-following logic
- Frontend:
  - "Follow" button on user profile pages
  - Following page showing followed users
  - User cards with profile picture, username, recipe count
  - Sort dropdown (Recently Followed, Most Recipes, Alphabetical)
  - Search/filter bar
  - "Unfollow" button with confirmation
  - Empty state messaging
  - Redux actions/reducers for following

**Requirements Covered**:
- FR-9.1: Follow User
- FR-9.2: View Following List
- FR-9.3: Unfollow User
- AC-7: Social Features

**Success Criteria**:
- ✅ Users can follow other users
- ✅ Users cannot follow themselves
- ✅ Following page displays all followed users
- ✅ Sort options work correctly
- ✅ Search/filter works
- ✅ Users can unfollow with confirmation
- ✅ Following count updates immediately

**Estimated Tasks**: 12-15 tasks

---

### Phase 13: Real-Time Notifications
**Goal**: Implement notification system for recipe publishing events

**Deliverables**:
- Backend:
  - Notification model and controller
  - POST /api/notifications - Create notification (internal)
  - GET /api/notifications - Get user's notifications with pagination
  - GET /api/notifications/unread/count - Get unread count
  - PUT /api/notifications/:id/read - Mark as read
  - PUT /api/notifications/read-all - Mark all as read
  - DELETE /api/notifications/:id - Delete notification
  - POST /api/notifications/settings - Update preferences
  - GET /api/notifications/settings - Get preferences
  - Notification trigger on recipe creation (send to all followers)
  - WebSocket implementation (Socket.io) for real-time delivery (optional)
- Frontend:
  - Notification bell icon in navbar
  - Unread count badge
  - Notification dropdown panel
  - Notification list with sender info, message, time ago
  - "Mark as Read" and "Mark All as Read" buttons
  - Click to navigate to recipe/user
  - Notification settings page (optional)
  - Redux actions/reducers for notifications
  - WebSocket client setup (optional)

**Requirements Covered**:
- FR-10.1: Receive Notifications
- FR-10.2: View Notifications
- FR-10.3: Manage Notifications
- DR-7: Notification Data
- AC-8: Notifications

**Success Criteria**:
- ✅ Notification sent to all followers when user publishes recipe
- ✅ Notification bell icon shows unread count
- ✅ Dropdown panel displays recent notifications
- ✅ Users can mark notifications as read
- ✅ Users can mark all notifications as read
- ✅ Clicking notification navigates to recipe or user profile
- ✅ Pagination works for notification history
- ✅ (Optional) Real-time delivery via WebSocket

**Estimated Tasks**: 18-22 tasks

---

### Phase 14: UI/UX Polish & Responsive Design
**Goal**: Refine user interface, improve user experience, and ensure responsive design

**Deliverables**:
- Responsive layout for all pages (mobile, tablet, desktop)
- Loading spinners and progress indicators
- Success/error toast notifications
- Empty state illustrations and messaging
- Form validation with inline error messages
- Confirmation modals for destructive actions
- Consistent navigation (navbar, footer)
- Breadcrumbs for navigation context
- Accessibility improvements (ARIA labels, keyboard navigation)
- Performance optimizations (lazy loading, code splitting)

**Requirements Covered**:
- NFR-2: Usability (responsive design, clear messages, visual feedback)
- NFR-1: Performance (loading times)

**Success Criteria**:
- ✅ All pages work on mobile, tablet, and desktop
- ✅ Loading states provide visual feedback
- ✅ Error messages are clear and helpful
- ✅ Empty states guide users to next action
- ✅ Confirmation modals prevent accidental actions
- ✅ Navigation is intuitive and consistent

**Estimated Tasks**: 15-20 tasks

---

### Phase 15: Testing, Bug Fixes & Documentation
**Goal**: Comprehensive manual testing, bug fixes, and final documentation

**Deliverables**:
- Manual testing checklist for all features
- Bug fixes identified during testing
- README.md with project overview and setup instructions
- API documentation (endpoints, request/response formats)
- Database schema diagram
- User guide / feature documentation
- Code cleanup and refactoring
- Final Git commit history review

**Requirements Covered**:
- All acceptance criteria (AC-1 through AC-10)
- NFR-6: Maintainability (documentation, clean code)
- AC-10: Git History

**Success Criteria**:
- ✅ All features tested and working
- ✅ No critical bugs remain
- ✅ README provides clear setup instructions
- ✅ API documentation is complete
- ✅ Git history shows clear iterative development
- ✅ Code is clean and well-organized

**Estimated Tasks**: 10-15 tasks

---

## Summary

**Total Phases**: 15  
**Estimated Total Tasks**: 225-285 tasks  
**Estimated Timeline**: 6-10 weeks (depending on daily hours)

**Key Milestones**:
- **Week 1-2**: Foundation, Database, Authentication (Phases 1-3)
- **Week 3-4**: Recipe CRUD, Browsing, Search (Phases 4-6)
- **Week 5-6**: Ratings, Dashboard, Meal Planning (Phases 7-9)
- **Week 7-8**: Shopping Lists, Profile, Following (Phases 10-12)
- **Week 9**: Notifications, UI Polish (Phases 13-14)
- **Week 10**: Testing, Documentation (Phase 15)

**Next Steps**:
1. Review and approve roadmap
2. Run `/gsd:plan-phase 1` to create detailed plan for Phase 1
3. Begin implementation with iterative development and atomic commits

---

**Roadmap Status**: ✅ Complete  
**Ready for**: Phase Planning
