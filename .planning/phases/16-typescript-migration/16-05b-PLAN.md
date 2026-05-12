---
phase: 16-typescript-migration
plan: 05b
type: execute
wave: 6
depends_on: [16-05a]
files_modified:
  - frontend/src/components/*.tsx
  - frontend/src/services/*.ts
  - frontend/src/utils/*.ts
  - frontend/src/config/*.ts
autonomous: true
requirements: [NFR-6]

must_haves:
  truths:
    - "Reusable components compile with typed props interfaces"
    - "API service calls return typed responses"
    - "Utility functions catch incorrect argument types"
    - "Config constants are statically typed"
  artifacts:
    - path: "frontend/src/components/ProtectedRoute.tsx"
      provides: "Typed route guard component"
      contains: "const ProtectedRoute: React.FC"
    - path: "frontend/src/services/authService.ts"
      provides: "Typed API service with Promise return types"
      contains: "Promise<AuthResponse>"
    - path: "frontend/src/utils/dateUtils.ts"
      provides: "Typed utility functions"
      contains: "formatDate = (date: Date | string): string"
  key_links:
    - from: "frontend/src/types/api.types.ts"
      to: "frontend/src/services/*.ts"
      via: "Services use API response types"
      pattern: "import.*AuthResponse.*from.*types/api.types"
    - from: "frontend/src/types/models.types.ts"
      to: "frontend/src/components/*.tsx"
      via: "Component props use model types"
      pattern: "import.*Recipe.*from.*types/models.types"
---

<objective>
Convert all reusable React components, API services, utilities, and configuration files from JavaScript to TypeScript.

Purpose: Complete frontend TypeScript migration by typing the shared infrastructure layer. Components, services, and utilities are consumed by pages and must provide typed interfaces.
Output: Fully-typed components with props interfaces, services with explicit return types, typed utilities and config.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/16-typescript-migration/16-RESEARCH.md
@.planning/phases/16-typescript-migration/16-01-SUMMARY.md
@.planning/phases/16-typescript-migration/16-02-SUMMARY.md
@.planning/phases/16-typescript-migration/16-03-SUMMARY.md
@.planning/phases/16-typescript-migration/16-04-SUMMARY.md
@.planning/phases/16-typescript-migration/16-05a-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Convert Components with Props Interfaces</name>
  <files>frontend/src/components/*.tsx</files>
  <action>
Convert all reusable components (RecipeCard, Navbar, FilterSidebar, etc.). Rename `.jsx` to `.tsx`. For each component:

1. Add `React.FC<PropsType>` type annotation
2. Define props interface above component
3. Use `useAppSelector` instead of `useSelector`

Example with props:
```typescript
import { Recipe } from '../types/models.types';

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (recipeId: number) => void;
  showEdit?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSave, showEdit = false }) => {
  // ... implementation
};
```

Example without props (ProtectedRoute):
```typescript
import { useAppSelector } from '../redux/hooks';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
```
  </action>
  <verify>
    <automated>
test -f frontend/src/components/ProtectedRoute.tsx && \
grep -q "React.FC" frontend/src/components/ProtectedRoute.tsx && \
[ $(find frontend/src/components -name "*.tsx" -type f | wc -l) -ge 5 ] && \
[ $(find frontend/src/components -name "*.jsx" -type f | wc -l) -eq 0 ] && \
echo "✅ Components converted"
    </automated>
  </verify>
  <done>All components converted with typed props interfaces</done>
</task>

<task type="auto">
  <name>Task 2: Convert Services and Utilities</name>
  <files>frontend/src/services/*.ts, frontend/src/utils/*.ts, frontend/src/config/*.ts</files>
  <action>
**Services:** Rename `.js` to `.ts`. Add explicit return types using types from `../types/api.types.ts`.

Example authService.ts:
```typescript
import axios, { AxiosResponse } from 'axios';
import { LoginRequest, AuthResponse } from '../types/api.types';

const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response: AxiosResponse<AuthResponse> = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};
```

**Utilities:** Rename `.js` to `.ts`. Type all parameters and return values.

Example dateUtils.ts:
```typescript
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const getDaysOfWeek = (weekStart: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};
```

**Config:** Rename `.js` to `.ts`. Type all exports.

Example api.ts:
```typescript
export const API_URL: string = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

Example constants.ts:
```typescript
export const MEAL_TYPES: readonly string[] = ['Breakfast', 'Lunch', 'Dinner'] as const;
export type MealType = typeof MEAL_TYPES[number];
```
  </action>
  <verify>
    <automated>
[ $(find frontend/src/services -name "*.ts" -type f | wc -l) -ge 3 ] && \
[ $(find frontend/src/services -name "*.js" -type f | wc -l) -eq 0 ] && \
[ $(find frontend/src/utils -name "*.ts" -type f | wc -l) -ge 1 ] && \
[ $(find frontend/src/config -name "*.ts" -type f | wc -l) -ge 1 ] && \
echo "✅ Services, utilities, and config converted"
    </automated>
  </verify>
  <done>All services, utilities, and config files converted with typed functions</done>
</task>

<task type="auto">
  <name>Task 3: Verify Frontend TypeScript Compilation</name>
  <files>N/A</files>
  <action>
Run TypeScript compiler to verify all frontend files compile without errors:

```bash
cd frontend
npx tsc --noEmit
```

Common errors to fix:
1. Event handler types: Use `FormEvent<HTMLFormElement>`, `ChangeEvent<HTMLInputElement>`
2. useParams typing: `useParams<{ id: string }>()`
3. Optional chaining: `user?.name` for nullable objects
4. Array typing: `const items: Recipe[] = []` for empty arrays
5. Axios responses: `axios.get<Recipe[]>(url)`

If errors found, fix by adding type annotations, correcting event signatures, and adding null checks. Re-run until zero errors.

Then test dev server starts:
```bash
timeout 10 npm start
```

Server should compile and start without errors. Press Ctrl+C after verification.
  </action>
  <verify>
    <automated>
cd frontend && npx tsc --noEmit 2>&1 | tee /tmp/tsc-frontend-check.log && \
if grep -q "error TS" /tmp/tsc-frontend-check.log; then \
  echo "❌ TypeScript errors found" && exit 1; \
else \
  echo "✅ Frontend TypeScript compilation successful"; \
fi
    </automated>
  </verify>
  <done>Frontend compiles successfully with TypeScript, all components and services type-safe</done>
</task>

</tasks>

<verification>
1. All component .jsx files converted to .tsx with props interfaces
2. All service .js files converted to .ts with explicit return types
3. All utility .js files converted to .ts with typed functions
4. All config .js files converted to .ts with typed exports
5. Components use typed Redux hooks (useAppSelector/useAppDispatch)
6. Frontend compiles successfully with TypeScript
</verification>

<success_criteria>
- All components use React.FC type with props interfaces where needed
- All services have explicit Promise return types
- All utilities have typed parameters and return values
- All config exports are typed
- Frontend compiles with `npx tsc --noEmit`
- Development server starts successfully
- No TypeScript errors in frontend codebase
</success_criteria>

<output>
After completion, create `.planning/phases/16-typescript-migration/16-05b-SUMMARY.md`
</output>
