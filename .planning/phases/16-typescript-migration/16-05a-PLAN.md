---
phase: 16-typescript-migration
plan: 05a
type: execute
wave: 5
depends_on: [16-04]
files_modified:
  - frontend/src/index.tsx
  - frontend/src/App.tsx
  - frontend/src/pages/*.tsx
autonomous: true
requirements: [NFR-5, NFR-6]

must_haves:
  truths:
    - "App compiles without type errors after entry point conversion"
    - "Page form submissions catch type mismatches at compile time"
    - "Redux state selections in pages detect shape mismatches"
    - "Route parameter access handles missing IDs safely"
  artifacts:
    - path: "frontend/src/App.tsx"
      provides: "Typed main App component with routing"
      contains: "const App: React.FC = ()"
    - path: "frontend/src/pages/LoginPage.tsx"
      provides: "Typed login page with form event handlers"
      contains: "FormEvent<HTMLFormElement>"
    - path: "frontend/src/index.tsx"
      provides: "Typed React root entry point"
      contains: "as HTMLElement"
  key_links:
    - from: "frontend/src/redux/hooks.ts"
      to: "frontend/src/pages/*.tsx"
      via: "Pages use typed Redux hooks"
      pattern: "import.*useAppSelector.*from.*redux/hooks"
    - from: "frontend/src/types/models.types.ts"
      to: "frontend/src/pages/*.tsx"
      via: "Page state uses model types"
      pattern: "import.*User.*Recipe.*from.*types/models.types"
---

<objective>
Convert React entry points and all page components from JavaScript to TypeScript with typed event handlers and Redux hooks.

Purpose: Migrate the core user-facing pages to TypeScript before converting reusable components and services. Pages are the primary integration points for Redux, routing, and user interactions.
Output: All page components (.tsx) with typed props, events, and Redux selectors.
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
</context>

<tasks>

<task type="auto">
  <name>Task 1: Convert Entry Points and Root Components</name>
  <files>frontend/src/index.tsx, frontend/src/App.tsx</files>
  <action>
Convert React root entry point and App router. Rename `.js` to `.tsx`, add DOM element type assertion for root, type App component with `React.FC`, replace `useSelector` with `useAppSelector` from typed hooks.

Key changes:
- `document.getElementById('root') as HTMLElement`
- `const App: React.FC = () => {`
- `import { useAppSelector } from './redux/hooks'`
  </action>
  <verify>
    <automated>
test ! -f frontend/src/index.js && \
test -f frontend/src/index.tsx && \
grep -q "as HTMLElement" frontend/src/index.tsx && \
grep -q "const App: React.FC" frontend/src/App.tsx && \
grep -q "useAppSelector" frontend/src/App.tsx && \
echo "✅ Entry points converted"
    </automated>
  </verify>
  <done>Entry points converted with typed root element and App component</done>
</task>

<task type="auto">
  <name>Task 2: Convert All Page Components to TypeScript</name>
  <files>frontend/src/pages/*.tsx</files>
  <action>
Convert all 13 page components: LoginPage, RegisterPage, DashboardPage, BrowseRecipesPage, CreateRecipePage, EditRecipePage, RecipeDetailPage, MyRecipesPage, SavedRecipesPage, MealPlannerPage, ShoppingListPage, UserProfilePage, DiscoverUsersPage.

Rename all `.jsx` to `.tsx`. Apply conversion pattern:
1. Import `FormEvent`, `ChangeEvent`, `MouseEvent` from 'react' for events
2. Import `useAppDispatch`, `useAppSelector` from '../redux/hooks'
3. Add `React.FC` type to component
4. Type useState: `useState<string>('')`, `useState<Recipe | null>(null)`
5. Type event handlers: `(e: FormEvent<HTMLFormElement>) => void`
6. For route params: `useParams<{ id: string }>()`

Example LoginPage.tsx:
```typescript
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };
  // ... JSX
};
```
  </action>
  <verify>
    <automated>
test -f frontend/src/pages/LoginPage.tsx && \
grep -q "FormEvent<HTMLFormElement>" frontend/src/pages/LoginPage.tsx && \
grep -q "useAppDispatch" frontend/src/pages/LoginPage.tsx && \
[ $(find frontend/src/pages -name "*.tsx" -type f | wc -l) -ge 13 ] && \
[ $(find frontend/src/pages -name "*.jsx" -type f | wc -l) -eq 0 ] && \
echo "✅ All page components converted"
    </automated>
  </verify>
  <done>All 13 page components converted with typed event handlers and Redux hooks</done>
</task>

</tasks>

<verification>
1. Entry points (index.tsx, App.tsx) converted with proper types
2. All 13 page components converted with React.FC and typed event handlers
3. Pages use typed Redux hooks (useAppSelector/useAppDispatch)
4. Route parameters properly typed with useParams
5. Form event handlers use FormEvent, ChangeEvent types
6. No .jsx files remain in pages/ directory
</verification>

<success_criteria>
- Frontend entry point and router compiled to TypeScript
- All page components use React.FC type
- All event handlers properly typed with React event types
- All pages use typed Redux hooks for state management
- Pages with route params type useParams correctly
- No JavaScript/JSX page files remain
</success_criteria>

<output>
After completion, create `.planning/phases/16-typescript-migration/16-05a-SUMMARY.md`
</output>
