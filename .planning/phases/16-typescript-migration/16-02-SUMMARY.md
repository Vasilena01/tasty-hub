---
phase: 16-typescript-migration
plan: 02
subsystem: backend-models
tags: [typescript, backend, models, database, type-safety]
dependency_graph:
  requires:
    - typescript-backend-infrastructure
  provides:
    - typed-backend-models
    - model-interfaces
    - api-type-contracts
  affects:
    - backend-controllers
    - backend-routes
    - api-endpoints
tech_stack:
  added: []
  patterns:
    - typed-database-models
    - query-result-generics
    - interface-driven-design
    - input-output-type-separation
key_files:
  created:
    - backend/src/types/models.types.ts
    - backend/src/types/api.types.ts
  modified:
    - backend/src/models/User.ts
    - backend/src/models/Recipe.ts
    - backend/src/models/Rating.ts
    - backend/src/models/SavedRecipe.ts
    - backend/src/models/MealPlan.ts
    - backend/src/models/ShoppingList.ts
    - backend/src/models/Follower.ts
    - backend/src/models/Notification.ts
    - backend/src/models/Ingredient.ts
    - backend/src/models/RecipeIngredient.ts
    - backend/tsconfig.json
decisions:
  - title: Use separate interfaces for create/update input types
    rationale: Provides type safety at API boundaries and separates database entity shape from input payloads
    alternatives: [Single interface with all optional fields]
    chosen: Separate IModelCreateInput and IModelUpdateInput interfaces
  - title: Return Promise<IModel | undefined> for find operations
    rationale: Explicit undefined handling for missing database records; aligns with TypeScript best practices
    alternatives: [Promise<IModel | null>, Promise<IModel> with error throwing]
    chosen: Promise<IModel | undefined>
  - title: Use any[] for joined query results with extended properties
    rationale: Database JOIN queries return extended objects (e.g., recipe with user info) that don't match pure model interfaces; strict typing would require creating interfaces for every JOIN combination
    alternatives: [Create explicit interfaces for all JOIN result shapes]
    chosen: Use any[] for flexibility during migration; can be tightened in strict mode phase
  - title: Move ignoreDeprecations inside compilerOptions
    rationale: TypeScript 6.0 requires ignoreDeprecations flag to be inside compilerOptions to suppress moduleResolution=node deprecation warnings
    alternatives: []
    chosen: Place ignoreDeprecations inside compilerOptions
metrics:
  duration_minutes: 19
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 11
  commits: 3
  completed_date: "2026-05-12"
---

# Phase 16 Plan 02: Backend Models TypeScript Conversion Summary

**One-liner:** Converted all 10 backend models to TypeScript with explicit type annotations, created shared model/API type definitions (273 lines), and established type-safe database query interfaces.

## Objective Achieved

Successfully created type definition files for all database models and API contracts, then converted all 10 backend model files from JavaScript to TypeScript with explicit parameter types, return types, and QueryResult generics. All models now provide compile-time type safety for database operations and serve as the foundation for typed controllers and routes.

## Tasks Completed

| # | Task | Status | Commit | Duration |
|---|------|--------|--------|----------|
| 1 | Create Shared Type Definitions | ✅ | 472a8af | ~4 min |
| 2 | Convert Backend Models to TypeScript | ✅ | 9eedbe3 | ~12 min |
| 3 | Verify Model Compilation | ✅ | 67e498b | ~3 min |

**Total: 3/3 tasks completed in ~19 minutes**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Move ignoreDeprecations inside compilerOptions**
- **Found during:** Task 3 (TypeScript compilation verification)
- **Issue:** TypeScript 6.0 emits deprecation warning "Option 'moduleResolution=node10' is deprecated" when ignoreDeprecations is placed outside compilerOptions (from Plan 16-01 setup)
- **Fix:** Moved `"ignoreDeprecations": "6.0"` from root level to inside compilerOptions object in backend/tsconfig.json
- **Files modified:** backend/tsconfig.json
- **Commit:** 67e498b
- **Rationale:** TypeScript compiler only recognizes ignoreDeprecations flag when placed inside compilerOptions; this is critical for compilation to succeed without warnings

**2. [Rule 2 - Missing Critical Functionality] Added ISavedRecipeCreateInput interface**
- **Found during:** Task 1 (type definition creation)
- **Issue:** Plan did not specify ISavedRecipeCreateInput interface but SavedRecipe model's create method requires it
- **Fix:** Added ISavedRecipeCreateInput interface with user_id and recipe_id fields to models.types.ts
- **Files modified:** backend/src/types/models.types.ts
- **Commit:** 472a8af
- **Rationale:** Create input interface is essential for type safety on SavedRecipe.create() method calls

**3. [Rule 2 - Missing Critical Functionality] Added IShoppingListUpdateInput and INotificationUpdateInput interfaces**
- **Found during:** Task 1 (type definition creation)
- **Issue:** Plan did not specify update input interfaces for ShoppingList and Notification models
- **Fix:** Added IShoppingListUpdateInput and INotificationUpdateInput interfaces with optional fields matching update operations
- **Files modified:** backend/src/types/models.types.ts
- **Commit:** 472a8af
- **Rationale:** Update input interfaces needed for type-safe ShoppingList.update() and Notification.markAsRead() methods

**4. [Rule 2 - Missing Critical Functionality] Added IFollowerCreateInput interface**
- **Found during:** Task 1 (type definition creation)
- **Issue:** Plan did not specify IFollowerCreateInput interface but Follower model's create method requires it
- **Fix:** Added IFollowerCreateInput interface with follower_user_id and followed_user_id fields
- **Files modified:** backend/src/types/models.types.ts
- **Commit:** 472a8af
- **Rationale:** Create input interface is essential for type safety on Follower.create() method calls

**5. [Rule 2 - Missing Critical Functionality] Added interface types for query filters**
- **Found during:** Task 2 (model conversion)
- **Issue:** Recipe model's findAll, findByIngredients, and findFromFollowedUsers methods accept complex filter objects but plan did not specify interface types for these
- **Fix:** Added RecipeQueryFilters and IngredientSearchFilters interfaces in Recipe.ts; added SavedRecipeQueryOptions and NotificationQueryOptions interfaces in respective model files
- **Files modified:** backend/src/models/Recipe.ts, backend/src/models/SavedRecipe.ts, backend/src/models/Notification.ts
- **Commit:** 9eedbe3
- **Rationale:** Type safety requires explicit interfaces for complex parameter objects passed to model methods

## Verification Results

### Type Definitions Verification
```bash
✅ backend/src/types/models.types.ts created with 273 lines
✅ backend/src/types/api.types.ts created with 61 lines
✅ Exports IUser, IUserCreateInput, IUserUpdateInput interfaces
✅ Exports IRecipe, IRecipeCreateInput, IRecipeUpdateInput interfaces
✅ Exports interfaces for all 10 models (User, Recipe, Rating, SavedRecipe, MealPlan, ShoppingList, Follower, Notification, Ingredient, RecipeIngredient)
✅ Exports ApiResponse, PaginatedResponse, LoginRequest, RegisterRequest, AuthResponse interfaces
✅ All interfaces use proper TypeScript syntax
```

### Model Conversion Verification
```bash
✅ No .js model files remain in backend/src/models/
✅ All 10 .ts model files exist
✅ User.ts imports IUser, IUserCreateInput, IUserUpdateInput from '../types/models.types'
✅ User.ts contains Promise<IUser> return types
✅ User.ts contains QueryResult<IUser> type annotations
✅ User.ts uses export default User syntax
✅ All models import Pool and QueryResult from 'pg'
✅ All models have explicit parameter types
✅ All models have explicit return types
```

### Compilation Verification
```bash
✅ npx tsc --noEmit exits with code 0
✅ No TypeScript errors in model files
✅ All model imports resolve correctly
✅ All method signatures are properly typed
```

### Overall Success Criteria
- [x] backend/src/types/ directory contains models.types.ts and api.types.ts
- [x] All database model interfaces defined (User, Recipe, Rating, SavedRecipe, MealPlan, ShoppingList, Follower, Notification, Ingredient, RecipeIngredient)
- [x] All API request/response interfaces defined
- [x] All 10 model files converted to TypeScript
- [x] Models use explicit return types (Promise<IUser>, etc.)
- [x] TypeScript compilation succeeds with no errors
- [x] Controllers can import typed models in next phase

## Technical Decisions

### Separate Input Interfaces for Create/Update
**Decision:** Use IModelCreateInput and IModelUpdateInput interfaces instead of single interface with optional fields

**Context:** Database models have create() and update() methods that accept different sets of fields (e.g., User.create requires all fields, User.update only accepts optional profile fields)

**Reasoning:**
- Type safety at API boundaries: prevents passing wrong fields to create/update operations
- Clear contract: developers immediately know which fields are required for creation vs update
- Prevents bugs: TypeScript compiler catches attempts to pass update data to create methods
- Matches REST API patterns: POST (create) vs PATCH (update) have different payloads

**Alternative considered:** Single IUser interface with all optional fields — rejected because it loses type safety (create method could be called without required fields)

### Return Promise<IModel | undefined> for Find Operations
**Decision:** Use `Promise<IModel | undefined>` for findById, findByEmail, etc. instead of `Promise<IModel | null>`

**Reasoning:**
- TypeScript best practice: undefined represents "value not set", null represents "intentionally empty"
- Database query with no results returns undefined (result.rows[0] when rows is empty)
- Aligns with TypeScript's strict null checking expectations
- Forces caller to check for undefined before accessing properties

**Alternative considered:** Promise<IModel | null> — rejected because pg library returns undefined for missing rows, not null

### Use any[] for Joined Query Results
**Decision:** Return any[] for queries with JOINs that extend model interfaces with additional properties

**Context:** Many queries JOIN recipes with users (adds username, first_name, last_name to recipe results) or include aggregated data (match_count, matched_ingredients)

**Reasoning:**
- Creating explicit interfaces for every JOIN combination would create 20+ new interfaces
- During relaxed mode migration, flexibility is more important than strict typing
- These will be tightened in Phase 16-07 when enabling strict mode
- Pragmatic tradeoff: core model operations are typed, extended queries use any[]

**Alternative considered:** Create IRecipeWithUser, IRecipeWithIngredients, etc. interfaces — deferred to strict mode phase to reduce migration complexity

## Files Created

### backend/src/types/models.types.ts (273 lines)
Database model interfaces for all 10 entities:
- **User types:** IUser, IUserCreateInput, IUserUpdateInput
- **Recipe types:** IRecipe, IRecipeCreateInput, IRecipeUpdateInput
- **Rating types:** IRating, IRatingCreateInput
- **SavedRecipe types:** ISavedRecipe, ISavedRecipeCreateInput
- **MealPlan types:** IMealPlan, IMealPlanCreateInput
- **ShoppingList types:** IShoppingList, IShoppingListCreateInput, IShoppingListUpdateInput
- **Follower types:** IFollower, IFollowerCreateInput
- **Notification types:** INotification, INotificationCreateInput, INotificationUpdateInput
- **Ingredient types:** IIngredient, IIngredientCreateInput
- **RecipeIngredient types:** IRecipeIngredient, IRecipeIngredientCreateInput

### backend/src/types/api.types.ts (61 lines)
API request/response interfaces:
- **Generic responses:** ApiResponse<T>, PaginatedResponse<T>
- **Auth types:** LoginRequest, RegisterRequest, AuthResponse
- **Query types:** RecipeQueryParams, IngredientSearchParams

## Files Modified

### All Model Files (backend/src/models/*.ts)
Converted from JavaScript to TypeScript with:
1. Added imports: `import { Pool, QueryResult } from 'pg'`
2. Added type imports: `import { IModel, IModelCreateInput, ... } from '../types/models.types'`
3. Typed db constant: `const db: Pool = require('../config/database')`
4. Added parameter types: `static async create(data: IUserCreateInput)`
5. Added return types: `Promise<IUser>`, `Promise<IUser | undefined>`
6. Typed QueryResult: `const result: QueryResult<IUser> = await db.query(...)`
7. Changed exports: `module.exports = User` → `export default User`

**Example conversion pattern (User model):**
```typescript
// Before (JavaScript)
static async findById(id) {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0];
}

// After (TypeScript)
static async findById(id: number): Promise<IUser | undefined> {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result: QueryResult<IUser> = await db.query(query, [id]);
  return result.rows[0];
}
```

## Next Steps

With typed backend models in place, the project is ready for controller/route/middleware conversion:

1. **Wave 3 (Plan 03):** Convert backend controllers, routes, and middleware
   - Add Express Request/Response type annotations
   - Type route handlers with explicit req.body, req.params types
   - Convert middleware to typed functions
   - Update all imports from models (now typed)

2. **Wave 4 (Plan 04):** Convert frontend Redux store and types
   - Create typed Redux store with RootState and AppDispatch
   - Convert Redux slices with typed actions
   - Import backend API types from backend/src/types/api.types.ts

## Impact Assessment

### Type Safety Improvements
- **Database queries:** All model methods now return typed results (IUser instead of any)
- **Create/update operations:** TypeScript enforces correct input shapes at compile time
- **IDE support:** Autocomplete now works for all model properties
- **Refactoring safety:** Renaming fields is now caught by TypeScript compiler

### Migration Risk
- **Low risk:** Models converted incrementally, existing controllers still work (allowJs: true)
- **Rollback strategy:** Revert commits if needed; each model is independent
- **No runtime changes:** TypeScript compiles to same JavaScript code

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| 472a8af | feat | Create shared type definitions (models.types.ts, api.types.ts) |
| 9eedbe3 | feat | Convert all 10 backend models to TypeScript |
| 67e498b | fix | Move ignoreDeprecations to compilerOptions in backend tsconfig |

## Lessons Learned

1. **Always verify tsconfig flag placement:** ignoreDeprecations must be inside compilerOptions for TypeScript 6.0, not at root level
2. **Plan for input/output type separation:** Create/update operations need separate interfaces from entity types
3. **Pragmatic typing during migration:** Using any[] for complex JOIN queries is acceptable during relaxed mode; strict typing comes later
4. **Interface explosion tradeoff:** Creating explicit types for every query variant adds maintenance burden; balance between type safety and pragmatism

## Self-Check: PASSED

### Verification
```bash
✅ backend/src/types/models.types.ts exists and contains 273 lines
✅ backend/src/types/api.types.ts exists and contains 61 lines
✅ All 10 model files renamed from .js to .ts
✅ No .js model files remain (except in __tests__)
✅ User.ts imports from '../types/models.types'
✅ User.ts contains Promise<IUser> return types
✅ User.ts contains QueryResult<IUser> type annotations
✅ User.ts uses export default User
✅ Recipe.ts converted with all complex filter types
✅ All models compile without TypeScript errors
```

### Commits Verified
```bash
✅ 472a8af: feat(16-02): create shared type definitions
✅ 9eedbe3: feat(16-02): convert all backend models to TypeScript
✅ 67e498b: fix(16-02): move ignoreDeprecations to compilerOptions in backend tsconfig
```

All files created, all commits present, all verification commands pass. Plan 16-02 complete.
