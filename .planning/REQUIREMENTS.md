# Requirements Specification - Recipe Hub

## Functional Requirements

### FR-1: User Authentication & Authorization

**FR-1.1: User Registration**
- System SHALL allow new users to register with username, email, password, first name, and last name
- Username and email MUST be unique across the system
- Password MUST include strength indicator during input
- System SHALL require password confirmation matching
- System SHALL require terms of service acceptance
- System SHALL validate input and display error messages for invalid data
- System SHALL display success message upon successful registration
- System SHALL generate JWT token upon successful registration

**FR-1.2: User Login**
- System SHALL authenticate users with email and password
- System SHALL provide "Remember me" functionality
- System SHALL generate and return JWT token upon successful authentication
- System SHALL display error messages for invalid credentials
- System SHALL provide link to registration page for new users
- System MAY provide password reset link (future feature)
- System MAY provide social login options (future feature)

### FR-2: Recipe Browsing & Discovery

**FR-2.1: Browse All Recipes**
- System SHALL display all public recipes in grid or list format
- System SHALL show recipe cards with: image, title, cooking time, difficulty, and rating
- System SHALL provide category filter dropdown (Breakfast, Lunch, Dinner, Dessert)
- System SHALL provide difficulty filter (Easy, Medium, Hard)
- System SHALL provide minimum rating filter (1-5 stars)
- System SHALL provide search bar for title/description text search
- System SHALL provide sort options: Highest Rated, Newest, Quickest cooking time
- System SHALL implement pagination controls
- System SHALL allow clicking recipe card to view full details

**FR-2.2: View Recipe Details**
- System SHALL display full recipe information including:
  - Large recipe image
  - Recipe title and description
  - Creator information (username, profile picture)
  - Average rating display
  - Category badge and difficulty badge
  - Cooking time and servings
  - Ingredients list with quantities (formatted)
  - Step-by-step instructions (numbered)
- System SHALL show "Save Recipe" button for authenticated users
- System SHALL show star rating component for authenticated users
- System SHALL display related recipes section (same category)

**FR-2.3: Search Recipes by Ingredients**
- System SHALL provide ingredient search page for authenticated users
- System SHALL display instruction text: "Enter ingredients you have at home"
- System SHALL provide text input with autocomplete for ingredient suggestions
- System SHALL display added ingredients as removable tags
- System SHALL provide "Add" button and remove (X) button per tag
- System SHALL provide "Search Recipes" button to execute search
- System SHALL search recipes containing ALL specified ingredients
- System SHALL display matching recipes in grid format
- System SHALL highlight matching ingredients in each recipe card
- System SHALL sort results by "Best Match" (most ingredients matched) or "Highest Rated"
- System SHALL allow filtering results by category even within search results
- System SHALL display empty state message: "No recipes found with these ingredients. Try different ingredients or create your own recipe!"
- System SHALL show number of results found

### FR-3: Recipe Management (Authenticated Users)

**FR-3.1: Create Recipe**
- System SHALL provide multi-section recipe creation form with:
  - **Basic Info Section**:
    - Title input
    - Description textarea
    - Category dropdown (Breakfast, Lunch, Dinner, Dessert)
    - Difficulty radio buttons (Easy, Medium, Hard)
    - Cooking time number input (minutes)
    - Servings number input
  - **Ingredients Section**:
    - Dynamic ingredient list
    - Each row: ingredient name + quantity + unit + remove button
    - "Add Ingredient" button to add new rows
  - **Instructions Section**:
    - Step-by-step textarea or multiple text inputs
    - Option to add/remove steps
  - **Image Upload Section**:
    - Drag-and-drop image upload
    - Image preview
    - File size/format validation message (max 5MB, JPG/PNG)
  - "Publish Recipe" button
  - "Cancel" button
- System SHALL validate all form inputs before submission
- System SHALL display validation error messages
- System SHALL create recipe and publish to public feed immediately upon submission
- System SHALL make recipe searchable and visible to all users
- System SHALL associate recipe with creator's user ID

**FR-3.2: Edit Recipe**
- System SHALL allow users to edit ONLY recipes they created
- System SHALL provide "Edit Recipe" button in "My Recipes" section
- System SHALL load pre-filled form with existing recipe data
- System SHALL use same form as Create Recipe page
- System SHALL provide "Save Changes" button to update recipe
- System SHALL provide "Cancel" button to discard changes
- System SHALL validate updated data before saving
- System SHALL update recipe and refresh display

**FR-3.3: Delete Recipe**
- System SHALL allow users to delete ONLY recipes they created
- System SHALL provide "Delete Recipe" button with confirmation modal
- System SHALL display warning: "Are you sure? This cannot be undone."
- System SHALL require user confirmation before deletion
- System SHALL remove recipe from database upon confirmation
- System SHALL remove recipe from all users' saved collections (cascade delete)
- System SHALL remove associated ratings and meal plan entries (cascade delete)

**FR-3.4: View My Recipes**
- System SHALL provide "My Recipes" page showing all recipes created by current user
- System SHALL display recipe count: "You have created [count] recipes"
- System SHALL show recipe grid with recipe cards
- System SHALL include edit and delete buttons per recipe
- System SHALL provide sort options: "Newest", "Highest Rated", "Most Saved"
- System SHALL display recipe statistics (views count, saves count)
- System SHALL show empty state message: "You haven't created any recipes yet. Share your first recipe!"

### FR-4: Saved Recipes (Authenticated Users)

**FR-4.1: Save Recipe**
- System SHALL provide "Save Recipe" button on recipe detail pages for authenticated users
- System SHALL add recipe to user's saved recipes collection when clicked
- System SHALL prevent duplicate saves (one save per recipe per user)
- System SHALL update button to indicate saved status

**FR-4.2: View Saved Recipes**
- System SHALL provide "Saved Recipes" page showing all bookmarked recipes
- System SHALL display page title: "My Saved Recipes"
- System SHALL show recipe count: "You have saved [count] recipes"
- System SHALL provide filter/sort options:
  - Sort by: "Recently Saved", "Highest Rated", "Quickest"
  - Filter by category
- System SHALL display recipe grid with recipe cards showing: image, title, rating, cooking time
- System SHALL provide "Unsave" button (heart icon) on each card
- System SHALL provide link to recipe detail page
- System SHALL show empty state message: "You haven't saved any recipes yet. Browse recipes to get started!"

**FR-4.3: Unsave Recipe**
- System SHALL allow users to remove recipes from saved collection
- System SHALL provide "Remove" button on saved recipes page
- System SHALL remove recipe from user's collection when clicked
- System SHALL update display immediately

### FR-5: Recipe Ratings (Authenticated Users)

**FR-5.1: Rate Recipe**
- System SHALL provide star rating component (1-5 stars) on recipe detail pages for authenticated users
- System SHALL display current average rating
- System SHALL allow user to click on star to submit rating
- System SHALL validate: one user can rate a recipe only once
- System SHALL create new rating if first time
- System SHALL update existing rating if user previously rated

**FR-5.2: Update Rating**
- System SHALL recalculate average rating for recipe immediately after rating submission
- System SHALL update total ratings count
- System SHALL display updated average rating to all users
- System SHALL allow user to update or delete their own rating later

### FR-6: Meal Planning (Authenticated Users)

**FR-6.1: View Weekly Meal Plan**
- System SHALL provide "Meal Planner" page with weekly calendar
- System SHALL display week navigation:
  - "Previous Week" button
  - Current week display (e.g., "Week of April 3-9, 2026")
  - "Next Week" button
- System SHALL display calendar grid:
  - 7 columns for days (Monday-Sunday)
  - 3 rows per day for meal types (Breakfast, Lunch, Dinner)
- System SHALL show for each cell:
  - Recipe image thumbnail if assigned
  - Recipe title if assigned
  - "Add Recipe" button if empty
  - Edit/Remove icons if assigned

**FR-6.2: Add Recipe to Meal Plan**
- System SHALL provide "Add Recipe" button for empty calendar slots
- System SHALL open recipe selection modal when clicked
- System SHALL display modal with search bar and tabs:
  - Tab 1: "My Recipes"
  - Tab 2: "Saved Recipes"
- System SHALL show recipe list with thumbnails
- System SHALL provide "Select" button per recipe
- System SHALL add recipe to calendar slot when selected
- System SHALL save meal plan entry with: user_id, recipe_id, week_start_date, day_of_week, meal_type

**FR-6.3: Edit/Remove Meal Plan Entry**
- System SHALL provide edit and remove icons for assigned meal slots
- System SHALL allow user to change recipe by opening selection modal
- System SHALL allow user to remove recipe by clicking remove icon
- System SHALL prompt confirmation before removing
- System SHALL update meal plan immediately

**FR-6.4: Navigate Between Weeks**
- System SHALL allow users to navigate to previous/next weeks
- System SHALL save meal plan state for current week before navigating
- System SHALL load meal plan for selected week
- System SHALL allow planning ahead for future weeks

### FR-7: Shopping List (Authenticated Users)

**FR-7.1: Generate Shopping List**
- System SHALL provide "Shopping List" page
- System SHALL display week selector dropdown
- System SHALL provide "Generate Shopping List" button
- System SHALL retrieve all recipes from selected week's meal plan when clicked
- System SHALL extract all ingredients from retrieved recipes
- System SHALL aggregate duplicate ingredients with quantity addition
  - Example: "2 cups rice" + "1 cup rice" = "3 cups rice"
- System SHALL group ingredients by category (Vegetables, Proteins, Dairy, Grains, etc.)
- System SHALL display shopping list with:
  - Collapsible category headers
  - Ingredient name, quantity (aggregated), unit
  - Checkbox per ingredient (to mark as purchased)
  - Strikethrough when checked
- System SHALL show progress indicator: "5 of 23 items purchased"

**FR-7.2: Manage Shopping List**
- System SHALL allow users to check/uncheck items as they shop
- System SHALL apply strikethrough styling to checked items
- System SHALL update progress indicator in real-time
- System SHALL allow manual editing of quantities or adding/removing items
- System SHALL provide "Clear Checked Items" button to remove checked items
- System SHALL provide "Regenerate List" button to overwrite current list with fresh generation
- System SHALL prompt confirmation before regenerating
- System SHALL provide "Print List" button for printing
- System SHALL provide "Export to Email" button (optional)

### FR-8: User Profile & Statistics (Authenticated Users)

**FR-8.1: View Profile**
- System SHALL provide "Profile" page with profile section:
  - Profile picture with edit icon (click to upload new)
  - Username
  - Email (read-only or editable)
  - Full name (editable)
  - Member since date
- System SHALL display statistics section:
  - Recipes created count
  - Recipes saved count
  - Average rating on own recipes
  - Most popular recipe (highest rated)

**FR-8.2: Edit Profile**
- System SHALL provide "Edit Profile" button
- System SHALL open edit form with fields:
  - Update first name, last name
  - Upload new profile picture
- System SHALL provide "Save Changes" button
- System SHALL validate and update profile information

**FR-8.3: Change Password**
- System SHALL provide "Change Password" section with:
  - Current password input
  - New password input
  - Confirm new password input
- System SHALL provide "Update Password" button
- System SHALL validate current password before allowing change
- System SHALL validate new password strength
- System SHALL update password with new hash

**FR-8.4: Delete Account**
- System SHALL provide "Delete Account" button at bottom of page
- System SHALL display confirmation modal with warning
- System SHALL require user confirmation before deletion
- System SHALL remove user account and all associated data (recipes, ratings, saved recipes, meal plans, shopping lists, followers, following, notifications)

### FR-9: User Following (Authenticated Users)

**FR-9.1: Follow User**
- System SHALL provide "Follow" button on other users' profile pages
- System SHALL add follower relationship when clicked
- System SHALL update button to show "Following" with checkmark
- System SHALL prevent users from following themselves

**FR-9.2: View Following List**
- System SHALL provide "Following" page showing all users current user is following
- System SHALL display page title: "Following"
- System SHALL show user count: "You are following [count] users"
- System SHALL provide search bar to filter followed users
- System SHALL display user grid/list with user cards showing:
  - Profile picture
  - Username
  - Full name
  - Recipe count: "[X] recipes"
  - "Following" button with checkmark
  - "View Profile" link
- System SHALL provide sort dropdown: "Recently Followed", "Most Recipes", "Alphabetical"
- System SHALL show empty state message: "You're not following anyone yet. Discover recipe creators to follow!"
- System SHALL provide link to "Discover Users" page

**FR-9.3: Unfollow User**
- System SHALL provide "Unfollow" button per user on following page
- System SHALL prompt confirmation: "Are you sure you want to unfollow [username]?"
- System SHALL remove follower relationship when confirmed
- System SHALL update display immediately

### FR-10: Notifications (Authenticated Users)

**FR-10.1: Receive Notifications**
- System SHALL send notification to all followers when user publishes a new recipe
- Notification message: "[Username] published a new recipe: [Recipe Title]"
- System SHALL mark notifications as unread by default

**FR-10.2: View Notifications**
- System SHALL provide notification icon in navigation bar (bell icon)
- System SHALL display badge with unread notification count
- System SHALL display dropdown panel showing recent notifications when icon clicked
- System SHALL show notification list with:
  - Sender profile picture
  - Notification message
  - Time ago (e.g., "2 hours ago")
  - Read/unread indicator
- System SHALL provide "Mark as Read" button per notification
- System SHALL provide "Mark All as Read" button
- System SHALL allow clicking notification to navigate to related recipe or user profile

**FR-10.3: Manage Notifications**
- System SHALL provide pagination for notification history
- System SHALL allow filtering by unread/read status
- System SHALL allow deleting individual notifications
- System SHALL provide notification settings page to update preferences (email, in-app)

### FR-11: User Dashboard (Authenticated Users)

**FR-11.1: Dashboard Overview**
- System SHALL provide "Dashboard" page as personal hub
- System SHALL display welcome message: "Welcome back, [Username]!"
- System SHALL show quick statistics cards:
  - Recipes Created: [count]
  - Saved Recipes: [count]
  - Average Rating: [rating]
- System SHALL display "My Recipes" section:
  - Grid of user's created recipes
  - "Create New Recipe" button
  - Edit/Delete options per recipe
- System SHALL display "Saved Recipes" preview (first 6):
  - Link to full saved recipes page
- System SHALL provide quick navigation cards:
  - "Plan Your Meals" → Meal Planner
  - "View Shopping List" → Shopping List
  - "Browse Recipes" → Recipe browsing

## Non-Functional Requirements

### NFR-1: Performance
- System SHALL load home page within 2 seconds
- System SHALL load recipe detail page within 1.5 seconds
- System SHALL return search results within 1 second for typical queries
- System SHALL support pagination for large result sets (12-24 items per page)

### NFR-2: Usability
- System SHALL provide responsive design working on desktop and mobile devices
- System SHALL display clear error messages for invalid input
- System SHALL provide visual feedback for user actions (loading spinners, success messages)
- System SHALL maintain consistent navigation across all pages
- System SHALL use intuitive UI components and patterns

### NFR-3: Security
- System SHALL hash passwords using bcrypt with minimum 10 salt rounds
- System SHALL store JWT secret in environment variables (not hardcoded)
- System SHALL set JWT token expiration (e.g., 7 days)
- System SHALL validate JWT tokens on all protected routes
- System SHALL sanitize and validate all user inputs
- System SHALL prevent SQL injection using parameterized queries
- System SHALL prevent XSS attacks through proper output escaping

### NFR-4: Data Integrity
- System SHALL enforce UNIQUE constraints on username and email
- System SHALL enforce NOT NULL constraints on required fields
- System SHALL enforce foreign key relationships for data consistency
- System SHALL cascade delete related records when user or recipe is deleted
- System SHALL validate data types and ranges (e.g., rating 1-5, cooking time > 0)

### NFR-5: Scalability
- System SHALL use database indexing on frequently queried fields (username, email, recipe title, category, rating)
- System SHALL implement efficient JOIN operations to prevent N+1 queries
- System MAY implement caching for popular recipes (future optimization)

### NFR-6: Maintainability
- System SHALL follow RESTful API design principles
- System SHALL use modular code structure with separation of concerns
- System SHALL use environment variables for configuration
- System SHALL provide clear commit messages in Git history
- System SHALL follow consistent naming conventions

### NFR-7: Compatibility
- System SHALL work on modern browsers (Chrome, Firefox, Safari, Edge)
- System SHALL work with Node.js version 16 or higher
- System SHALL work with PostgreSQL version 12 or higher

### NFR-8: Educational Requirements
- System SHALL demonstrate atomic Git commit strategy
- System SHALL provide clear Git history showing iterative development
- System SHALL commit after each subtask completion
- System SHALL push all commits to GitHub for traceability

## Data Requirements

### DR-1: User Data
- Username: 3-30 characters, alphanumeric + underscore, unique
- Email: Valid email format, unique
- Password: Minimum 8 characters, must include uppercase, lowercase, number
- First Name: 1-50 characters
- Last Name: 1-50 characters
- Profile Picture: JPG/PNG, max 5MB

### DR-2: Recipe Data
- Title: 3-200 characters, required
- Description: 10-1000 characters, required
- Category: Enum (Breakfast, Lunch, Dinner, Dessert), required
- Difficulty: Enum (Easy, Medium, Hard), required
- Cooking Time: Positive integer (minutes), required
- Servings: Positive integer, required
- Image: JPG/PNG, max 5MB, required
- Instructions: Text, required
- Ingredients: At least 1 ingredient required

### DR-3: Ingredient Data
- Ingredient Name: 1-100 characters
- Quantity: Positive number
- Unit: String (e.g., "cups", "grams", "pieces")

### DR-4: Rating Data
- Rating Value: Integer 1-5, required
- One rating per user per recipe

### DR-5: Meal Plan Data
- Week Start Date: Date format (YYYY-MM-DD)
- Day of Week: Integer 0-6 (Sunday-Saturday)
- Meal Type: Enum (Breakfast, Lunch, Dinner)

### DR-6: Shopping List Data
- Week Start Date: Date format (YYYY-MM-DD)
- Ingredient Name: String
- Quantity: Positive number
- Unit: String
- Category: String (Vegetables, Proteins, Dairy, Grains, etc.)
- Is Checked: Boolean

### DR-7: Notification Data
- Type: Enum (new_recipe, etc.)
- Message: Text
- Is Read: Boolean
- Created At: Timestamp

## Constraints

### Technical Constraints
- MUST use React for frontend
- MUST use Redux for state management
- MUST use React Router for routing
- MUST use Node.js + Express for backend
- MUST use PostgreSQL for database
- MUST use JWT for authentication
- MUST use bcrypt for password hashing

### Business Constraints
- Project is for academic/exam purposes
- Must demonstrate full-stack development skills
- Must show iterative development process
- Must maintain clear Git history

### Timeline Constraints
- Development must be completed before exam date
- All features must be implemented as per specification

## Acceptance Criteria

### AC-1: User Authentication
- [ ] Users can register with valid credentials
- [ ] Users can login with email/password
- [ ] JWT token is generated and validated
- [ ] Protected routes require authentication

### AC-2: Recipe Management
- [ ] Users can create recipes with all required fields
- [ ] Users can edit their own recipes
- [ ] Users can delete their own recipes
- [ ] Recipe images are uploaded and displayed

### AC-3: Recipe Discovery
- [ ] Anonymous users can browse all recipes
- [ ] Users can filter recipes by category, difficulty, rating
- [ ] Users can search recipes by title/description
- [ ] Users can search recipes by ingredients
- [ ] Recipe detail page shows all information

### AC-4: Ratings & Favorites
- [ ] Authenticated users can rate recipes 1-5 stars
- [ ] Average rating is calculated and displayed
- [ ] Users can save recipes to favorites
- [ ] Saved recipes page shows all bookmarked recipes

### AC-5: Meal Planning
- [ ] Users can view weekly meal plan calendar
- [ ] Users can add recipes to specific day/meal slots
- [ ] Users can edit/remove meal plan entries
- [ ] Users can navigate between weeks

### AC-6: Shopping Lists
- [ ] System generates shopping list from meal plan
- [ ] Duplicate ingredients are aggregated with quantity addition
- [ ] Ingredients are grouped by category
- [ ] Users can check off items while shopping
- [ ] Users can manually edit shopping list

### AC-7: Social Features
- [ ] Users can follow other users
- [ ] Users can view following list
- [ ] Users can unfollow users

### AC-8: Notifications
- [ ] Followers receive notifications when user publishes recipe
- [ ] Notification icon shows unread count
- [ ] Users can view notification history
- [ ] Users can mark notifications as read

### AC-9: User Profile
- [ ] Users can view their profile and statistics
- [ ] Users can edit profile information
- [ ] Users can change password
- [ ] Users can delete account

### AC-10: Git History
- [ ] Each feature has atomic commits
- [ ] Commit messages are clear and descriptive
- [ ] All commits are pushed to GitHub
- [ ] Git history shows iterative development

---

**Total Requirements**: 10 Functional Requirement Categories, 7 Non-Functional Requirements, 7 Data Requirements  
**Total Use Cases**: 12 main use cases from specification  
**Estimated Features**: 25+ distinct features to implement
