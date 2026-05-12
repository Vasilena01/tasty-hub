# Phase 16: TypeScript Migration & Node.js Backend - Research

**Researched:** 2026-05-12
**Domain:** TypeScript migration (React frontend + Node.js/Express backend)
**Confidence:** HIGH

## Summary

This phase involves migrating an existing full-stack JavaScript application (React + Redux frontend, Node.js + Express backend) to TypeScript. The project contains approximately 61 frontend files (.js/.jsx) and 34 backend files (.js) that need conversion to TypeScript.

TypeScript migration for mature JavaScript projects follows an incremental approach: enable JavaScript compatibility initially, convert files gradually, and progressively enable stricter type checking. The critical success factors are proper tsconfig.json setup per environment (Node.js vs. browser), comprehensive type definitions for third-party libraries, and shared type contracts between frontend and backend for API consistency.

**Primary recommendation:** Migrate in waves: (1) Setup TypeScript infrastructure and tooling, (2) Convert backend models and types first (establishes API contracts), (3) Convert backend controllers/routes/middleware, (4) Convert frontend types and Redux store, (5) Convert frontend components/pages, (6) Enable strict mode and fix all type errors. Use `allowJs: true` during transition to maintain working builds.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Type checking | Compile-time | — | TypeScript compiler validates types before runtime |
| Type definitions (shared) | API / Backend | Frontend Server | Backend owns API contracts; frontend consumes them |
| Build compilation | Build pipeline | — | TypeScript compiles to JavaScript during build |
| Development workflow | Local dev environment | — | ts-node/tsx for backend, react-scripts for frontend |
| Runtime validation | API / Backend | — | TypeScript types are compile-time only; runtime validation needed separately |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| typescript | 6.0.3 | TypeScript compiler and type checker | Official Microsoft-maintained compiler [VERIFIED: npm registry] |
| @types/node | 25.7.0 | Node.js type definitions | Official DefinitelyTyped package for Node.js APIs [VERIFIED: npm registry] |
| @types/express | 5.0.6 | Express.js type definitions | Official DefinitelyTyped package for Express [VERIFIED: npm registry] |
| @types/react | 19.2.14 | React type definitions | Official DefinitelyTyped package, matches React 19.x [VERIFIED: npm registry] |
| ts-node | 10.9.2 | TypeScript execution for Node.js (development) | Industry standard for running TS files in Node.js without pre-compilation [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/bcryptjs | 3.0.0 | bcryptjs type definitions | Required for typed bcrypt usage in auth controllers [VERIFIED: npm registry] |
| @types/jsonwebtoken | 9.0.10 | JWT type definitions | Required for typed JWT operations [VERIFIED: npm registry] |
| @types/pg | 8.20.0 | node-postgres type definitions | Required for typed PostgreSQL client usage [VERIFIED: npm registry] |
| @types/react-router-dom | 5.3.3 | React Router type definitions | Required for typed routing hooks [VERIFIED: npm registry] |
| @types/react-redux | 7.1.34 | React Redux type definitions | Required but Redux Toolkit provides better built-in types [VERIFIED: npm registry] |
| tsx | 4.21.0 | Fast TypeScript runner (alternative to ts-node) | Optional: faster than ts-node for development, uses esbuild [VERIFIED: npm registry] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ts-node | tsx | tsx is faster (uses esbuild) but ts-node is more battle-tested and stable |
| TypeScript compilation | Babel + @babel/preset-typescript | Babel is faster but skips type checking; TypeScript provides validation |
| nodenext module | commonjs module | nodenext supports ESM but project currently uses CommonJS; requires refactor |

**Installation:**

Backend:
```bash
cd backend
npm install --save-dev typescript ts-node @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/pg @types/cors @types/multer
```

Frontend (if not already installed via create-react-app):
```bash
cd frontend
npm install --save-dev typescript @types/react @types/react-dom @types/react-router-dom @types/node
```

**Version verification:** All versions verified against npm registry on 2026-05-12. TypeScript 6.0.3 published 2026-04-17, @types/node 25.7.0 published 2026-05-08.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     TypeScript Migration                     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
     ┌────────▼────────┐            ┌────────▼────────┐
     │  Backend (.js)  │            │ Frontend (.jsx) │
     │                 │            │                 │
     │  • 34 files     │            │  • 61 files     │
     │  • CommonJS     │            │  • React 19     │
     │  • Node.js      │            │  • Redux Toolkit│
     └────────┬────────┘            └────────┬────────┘
              │                               │
              │                               │
     ┌────────▼────────────┐         ┌────────▼────────────┐
     │  Setup tsconfig.json│         │  Setup tsconfig.json│
     │  + Install @types/* │         │  + Install @types/* │
     └────────┬────────────┘         └────────┬────────────┘
              │                               │
              │                               │
     ┌────────▼────────────┐         ┌────────▼────────────┐
     │  Convert .js → .ts  │         │ Convert .jsx → .tsx │
     │                     │         │                     │
     │  1. Models          │         │  1. Types/interfaces│
     │  2. Controllers     │         │  2. Redux store     │
     │  3. Routes          │         │  3. Services        │
     │  4. Middleware      │         │  4. Components      │
     │  5. Config/utils    │         │  5. Pages           │
     └────────┬────────────┘         └────────┬────────────┘
              │                               │
              │                               │
     ┌────────▼────────────┐         ┌────────▼────────────┐
     │  Add type           │         │  Add type           │
     │  annotations        │         │  annotations        │
     │                     │         │                     │
     │  • Function params  │         │  • Props interfaces │
     │  • Return types     │         │  • State types      │
     │  • Interface defs   │         │  • Event handlers   │
     └────────┬────────────┘         └────────┬────────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                     ┌────────▼────────┐
                     │  Shared Types   │
                     │                 │
                     │  • API contracts│
                     │  • Data models  │
                     │  • Enums        │
                     └────────┬────────┘
                              │
                     ┌────────▼────────────┐
                     │  Enable strict mode │
                     │  & fix type errors  │
                     └─────────────────────┘
```

**Data flow:**
1. **Entry**: Existing JavaScript files in backend/src and frontend/src
2. **Setup stage**: Install TypeScript tooling and create tsconfig.json for each environment
3. **Conversion stage**: Rename files and add explicit types (backend models → controllers → routes; frontend types → Redux → components)
4. **Shared types**: Extract common API contracts into shared types directory
5. **Strict enforcement**: Enable stricter compiler options incrementally
6. **Output**: Fully-typed TypeScript codebase with no compilation errors

### Component Responsibilities

| Component | File Path | TypeScript Conversion Responsibility |
|-----------|-----------|--------------------------------------|
| Backend tsconfig | `backend/tsconfig.json` | Node.js-specific compiler options (module: commonjs, target: ES2020) |
| Frontend tsconfig | `frontend/tsconfig.json` | React-specific compiler options (jsx: react-jsx, lib: DOM) |
| Shared types | `backend/src/types/` or `shared/types/` | API contracts, data models, enums shared between FE/BE |
| Backend models | `backend/src/models/*.ts` | Interface definitions for database entities |
| Backend controllers | `backend/src/controllers/*.ts` | Typed request/response handlers, Express types |
| Backend routes | `backend/src/routes/*.ts` | Typed route definitions |
| Backend middleware | `backend/src/middleware/*.ts` | Typed Express middleware (Request, Response, NextFunction) |
| Frontend types | `frontend/src/types/` | Component props, Redux state, API response types |
| Redux store | `frontend/src/redux/store.ts` | Typed store, RootState, AppDispatch exports |
| Redux slices | `frontend/src/redux/slices/*.ts` | Typed state, actions, thunks |
| React components | `frontend/src/components/*.tsx` | Typed props interfaces, event handlers |
| React pages | `frontend/src/pages/*.tsx` | Typed route components |
| Services | `frontend/src/services/*.ts` | Typed API service functions with return types |

### Recommended Project Structure
```
backend/
├── src/
│   ├── types/              # NEW: Shared type definitions
│   │   ├── api.types.ts    # API request/response interfaces
│   │   ├── models.types.ts # Database model interfaces
│   │   └── express.d.ts    # Express custom type augmentations
│   ├── config/
│   │   └── database.ts     # (converted from .js)
│   ├── models/
│   │   └── *.ts            # (converted from .js)
│   ├── controllers/
│   │   └── *.ts            # (converted from .js)
│   ├── routes/
│   │   └── *.ts            # (converted from .js)
│   ├── middleware/
│   │   └── *.ts            # (converted from .js)
│   ├── utils/
│   │   └── *.ts            # (converted from .js)
│   └── server.ts           # (converted from .js)
├── tsconfig.json           # NEW
├── package.json            # Updated with TS scripts
└── dist/                   # NEW: Compiled output

frontend/
├── src/
│   ├── types/              # NEW: Frontend-specific types
│   │   ├── components.types.ts
│   │   ├── redux.types.ts
│   │   └── api.types.ts    # Can import from backend/src/types
│   ├── redux/
│   │   ├── store.ts        # (converted, export typed hooks)
│   │   ├── hooks.ts        # NEW: useAppDispatch, useAppSelector
│   │   └── slices/
│   │       └── *.ts        # (converted from .js)
│   ├── components/
│   │   └── *.tsx           # (converted from .jsx)
│   ├── pages/
│   │   └── *.tsx           # (converted from .jsx)
│   ├── services/
│   │   └── *.ts            # (converted from .js)
│   ├── utils/
│   │   └── *.ts            # (converted from .js)
│   ├── App.tsx             # (converted from .js)
│   └── index.tsx           # (converted from .js)
├── tsconfig.json           # NEW (may exist from CRA)
└── package.json            # Updated dependencies
```

### Pattern 1: Backend Model Type Definition
**What:** Convert JavaScript model classes to TypeScript with interface definitions
**When to use:** For all database models (User, Recipe, Rating, etc.)
**Example:**
```typescript
// Source: https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html

// backend/src/types/models.types.ts
export interface IUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IUserCreateInput {
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
}

export interface IUserUpdateInput {
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
}

// backend/src/models/User.ts
import { Pool, QueryResult } from 'pg';
import { IUser, IUserCreateInput, IUserUpdateInput } from '../types/models.types';

const db: Pool = require('../config/database');

class User {
  static async create(data: IUserCreateInput): Promise<IUser> {
    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, first_name, last_name, profile_picture_url, created_at
    `;
    const values = [data.username, data.email, data.password_hash, data.first_name, data.last_name];
    const result: QueryResult<IUser> = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id: number): Promise<IUser | undefined> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result: QueryResult<IUser> = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<IUser | undefined> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result: QueryResult<IUser> = await db.query(query, [email]);
    return result.rows[0];
  }
}

export default User;
```

### Pattern 2: Express Request/Response Typing
**What:** Add type annotations to Express route handlers and middleware
**When to use:** For all controllers and middleware functions
**Example:**
```typescript
// Source: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/express

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUserCreateInput } from '../types/models.types';

// Custom request type with user attached by auth middleware
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

// Type for registration request body
interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Type for API response
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  token?: string;
}

const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { username, email, password, first_name, last_name } = req.body;

    // Validation
    if (!username || !email || !password || !first_name || !last_name) {
      res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
      return;
    }

    // Check existing user
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
      return;
    }

    // Hash password
    const password_hash: string = await bcrypt.hash(password, 10);

    // Create user
    const userInput: IUserCreateInput = {
      username,
      email,
      password_hash,
      first_name,
      last_name
    };
    const user = await User.create(userInput);

    // Generate token
    const token: string = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

export { register };
```

### Pattern 3: Redux Toolkit with TypeScript
**What:** Create typed Redux store with typed hooks for components
**When to use:** For all Redux slices and store setup
**Example:**
```typescript
// Source: https://react-redux.js.org/tutorials/typescript-quick-start

// frontend/src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import recipeReducer from './slices/recipeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipe: recipeReducer
  }
});

// Infer RootState and AppDispatch types from store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// frontend/src/redux/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Pre-typed hooks to use throughout the app instead of plain useDispatch/useSelector
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// frontend/src/redux/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  error?: string;
}

export const login = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (!response.success) {
        return rejectWithValue(response.error || 'Login failed');
      }
      return response;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Unable to connect to server';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      });
  }
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
```

### Pattern 4: React Component with TypeScript
**What:** Convert React components to TypeScript with typed props and event handlers
**When to use:** For all functional React components
**Example:**
```typescript
// Source: https://react.dev/learn/typescript

// frontend/src/pages/LoginPage.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login, clearError } from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    dispatch(login({ email, password }));
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Login</h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
```

### Pattern 5: Backend tsconfig.json (Node.js/Express)
**What:** TypeScript configuration for Node.js backend with CommonJS modules
**When to use:** Backend TypeScript compilation
**Example:**
```json
// Source: https://www.typescriptlang.org/tsconfig

{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "declaration": false,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/**/*.spec.ts", "src/**/*.test.ts"]
}
```

### Pattern 6: Frontend tsconfig.json (React)
**What:** TypeScript configuration for React frontend with JSX support
**When to use:** Frontend TypeScript compilation
**Example:**
```json
// Source: https://www.typescriptlang.org/tsconfig

{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": false,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["node"],
    "baseUrl": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist"]
}
```

### Anti-Patterns to Avoid
- **Using `any` everywhere:** Defeats the purpose of TypeScript. Use `unknown` or specific types instead.
- **Disabling strict mode too early:** Keep strict checks enabled from the start; fixing issues later is harder.
- **Not typing function return values:** Explicit return types catch bugs and improve readability.
- **Mixing CommonJS and ESM imports inconsistently:** Stick to one module system (project uses CommonJS).
- **Ignoring TypeScript errors with `@ts-ignore`:** Fix the root cause instead of suppressing errors.
- **Not using typed Redux hooks:** Always use `useAppDispatch` and `useAppSelector` instead of plain hooks.
- **Skipping type definitions for third-party libraries:** Install `@types/*` packages immediately.
- **Converting all files at once:** Incremental migration with `allowJs: true` keeps builds working.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Type definitions for popular libraries | Custom interface files | `@types/*` packages from DefinitelyTyped | 7000+ maintained packages, community-tested, auto-updated [VERIFIED: npm registry] |
| TypeScript execution in development | Custom build script | ts-node or tsx | Handles module resolution, sourcemaps, incremental compilation automatically [VERIFIED: npm registry] |
| Redux TypeScript boilerplate | Manual action/reducer types | Redux Toolkit with createSlice | Built-in TypeScript support, auto-generates action types [CITED: https://react-redux.js.org/tutorials/typescript-quick-start] |
| Type-safe API contracts | Duplicated types in FE/BE | Shared types directory or API schema tools | Single source of truth prevents drift between frontend and backend |
| Request/response typing | Ad-hoc interfaces per endpoint | Generic Express.Request<Params, ResBody, ReqBody, Query> | Built into @types/express, handles all HTTP scenarios [VERIFIED: @types/express] |

**Key insight:** TypeScript migration benefits from a rich ecosystem of pre-built type definitions. Don't recreate types that already exist in DefinitelyTyped or official packages. The TypeScript compiler itself handles the heavy lifting of type checking and compilation — avoid custom build pipelines that bypass its features.

## Runtime State Inventory

> N/A — This is a code migration phase with no runtime state changes. All functionality remains identical; only the source language changes from JavaScript to TypeScript. Build artifacts (.js files in dist/) will be regenerated but do not require migration themselves.

## Common Pitfalls

### Pitfall 1: Express Middleware Type Confusion
**What goes wrong:** Middleware functions don't get proper type inference, leading to `any` types for req/res/next parameters.
**Why it happens:** Express type definitions require explicit imports and can't infer types from context.
**How to avoid:** Always explicitly type middleware parameters:
```typescript
import { Request, Response, NextFunction } from 'express';

const myMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // TypeScript now knows the types
  next();
};
```
**Warning signs:** IDE shows `req: any`, `res: any` in middleware functions.

### Pitfall 2: Module Resolution Mismatches
**What goes wrong:** TypeScript can't find modules that Node.js resolves correctly (e.g., `require('express')` works but `import express from 'express'` fails).
**Why it happens:** Mismatch between `module` setting in tsconfig.json and actual module system (CommonJS vs ESM).
**How to avoid:** 
- Backend: Use `"module": "commonjs"` since project uses CommonJS (`require()`).
- Frontend: Use `"module": "ESNext"` and let bundler handle it.
- Enable `"esModuleInterop": true` and `"allowSyntheticDefaultImports": true` for both.
**Warning signs:** "Cannot find module" errors despite package being installed.

### Pitfall 3: React Event Handler Typing Errors
**What goes wrong:** Event handlers have type errors when accessing `e.target.value` or calling `e.preventDefault()`.
**Why it happens:** Generic `Event` type doesn't include DOM-specific properties; need specific types like `ChangeEvent<HTMLInputElement>`.
**How to avoid:** Use specific React event types:
```typescript
import { FormEvent, ChangeEvent } from 'react';

const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value; // TypeScript knows target is HTMLInputElement
};
```
**Warning signs:** TypeScript errors on `e.target.value` or form submission handlers.

### Pitfall 4: PostgreSQL Query Result Typing
**What goes wrong:** Database query results are typed as `any`, losing type safety for model methods.
**Why it happens:** `pg` library returns generic `QueryResult<any>` without explicit typing.
**How to avoid:** Use generic types with QueryResult:
```typescript
import { QueryResult } from 'pg';
import { IUser } from '../types/models.types';

const result: QueryResult<IUser> = await db.query(query, values);
const user: IUser = result.rows[0]; // Properly typed
```
**Warning signs:** No autocomplete on `result.rows[0].field_name`.

### Pitfall 5: Strict Null Checks Breaking Optional Properties
**What goes wrong:** Code that worked in JavaScript breaks with "Object is possibly 'undefined'" errors.
**Why it happens:** `strictNullChecks: true` enforces explicit null/undefined handling.
**How to avoid:** 
- Use optional chaining: `user?.profile_picture_url`
- Use nullish coalescing: `user.profile_picture_url ?? 'default.jpg'`
- Add explicit checks: `if (user) { ... }`
- Use non-null assertion only when certain: `user!.id`
**Warning signs:** Frequent "Object is possibly 'undefined'" or "Object is possibly 'null'" errors.

### Pitfall 6: Build Script Confusion (ts-node vs tsc)
**What goes wrong:** `npm run dev` with ts-node works but production build doesn't generate .js files, or vice versa.
**Why it happens:** Confusion between ts-node (runs TS directly) and tsc (compiles to JS).
**How to avoid:** 
- Development: `ts-node src/server.ts` (no compilation)
- Production build: `tsc` (compiles to dist/) then `node dist/server.js`
- Scripts should be:
  ```json
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
  ```
**Warning signs:** Production deployment can't find compiled .js files.

### Pitfall 7: Redux Toolkit createAsyncThunk Generic Type Order
**What goes wrong:** Type errors when defining async thunks with custom reject values.
**Why it happens:** Generic type parameters for createAsyncThunk are in specific order: `<Returned, ThunkArg, ThunkApiConfig>`.
**How to avoid:** Follow the correct generic order:
```typescript
export const login = createAsyncThunk<
  AuthResponse,           // Returned type (fulfilled)
  LoginCredentials,       // ThunkArg type (input)
  { rejectValue: string } // ThunkApiConfig (for rejectWithValue)
>('auth/login', async (credentials, { rejectWithValue }) => { ... });
```
**Warning signs:** "Type 'X' is not assignable to type 'Y'" errors in thunk definitions.

## Code Examples

Verified patterns from official sources:

### Typed Express Server Setup
```typescript
// Source: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/express

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import typed routes
import authRoutes from './routes/authRoutes';
import recipeRoutes from './routes/recipeRoutes';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
```

### Typed Redux Store with Hooks
```typescript
// Source: https://react-redux.js.org/tutorials/typescript-quick-start

// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### Shared API Type Definitions
```typescript
// Source: TypeScript Handbook - Interfaces

// backend/src/types/api.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

// Frontend can import these types:
// import { AuthResponse, LoginRequest } from '../../../backend/src/types/api.types';
// Or copy to frontend/src/types/api.types.ts for cleaner imports
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate .d.ts files | Inline types in .ts files | TypeScript 2.0+ (2016) | Simpler project structure, less boilerplate |
| namespace modules | ES6 import/export | TypeScript 1.5+ (2015) | Modern syntax, better tree-shaking |
| ts-node only | tsx as alternative | tsx 4.0 (2024) | 10x faster development builds with esbuild |
| Manual Redux types | Redux Toolkit with built-in types | Redux Toolkit 1.0 (2019) | Less boilerplate, auto-generated action types |
| JSX: 'react' | JSX: 'react-jsx' | React 17 (2020) | No need to import React in every file |
| @types/react <18 | @types/react 18+ with FC children prop removed | React 18 (2022) | Must explicitly type children prop if needed |

**Deprecated/outdated:**
- `namespace` syntax: Use ES6 modules (`import`/`export`) instead [CITED: https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html]
- `module.exports` in TS: Use `export` syntax [CITED: https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html]
- `React.FC` with implicit children: React 18 removed implicit children from FC type [ASSUMED — based on React 18 breaking changes]
- `any` for unknowns: Use `unknown` type and narrow with type guards [CITED: https://www.typescriptlang.org/tsconfig]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Project uses CommonJS (require/module.exports) throughout backend | Standard Stack, Architecture Patterns | If project has ESM imports, tsconfig.json "module" setting needs to be "nodenext" instead of "commonjs" |
| A2 | React 19.x is compatible with @types/react 19.2.14 | Standard Stack | If React 19 has breaking type changes, may need beta types or workarounds |
| A3 | All backend dependencies have @types/* packages available | Environment Availability | If obscure packages lack types, need to write custom .d.ts files |
| A4 | Frontend uses Create React App or similar bundler that handles TypeScript | Frontend tsconfig pattern | If custom Webpack setup, may need additional loaders (ts-loader) |
| A5 | No existing TypeScript files in codebase | Migration strategy | If some .ts files exist, need to check for conflicting configs or types |
| A6 | PostgreSQL migrations are pure SQL and don't need TypeScript conversion | Runtime State Inventory | If migrations have .js logic, need to convert those files too |

**If this table has entries:** These assumptions need user confirmation before locked planning decisions.

## Open Questions

1. **Should shared types live in backend/src/types or a separate shared/ directory?**
   - What we know: Frontend needs to import backend types for API contracts
   - What's unclear: Whether to use monorepo structure, symlinks, or copy types
   - Recommendation: Start with backend/src/types and frontend imports from relative path (`../../../backend/src/types`). If this becomes unwieldy, refactor to shared/ directory later.

2. **Should migration happen incrementally (with `allowJs: true`) or all at once?**
   - What we know: TypeScript docs recommend incremental for large projects [CITED: https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html]
   - What's unclear: Project has ~95 files total; threshold for "large" is subjective
   - Recommendation: Use incremental approach (keep `allowJs: true` during migration) to maintain working builds at each step. Disable `allowJs` only after all files converted.

3. **Should backend use ts-node or tsx for development?**
   - What we know: ts-node is stable (10.9.2), tsx is faster (4.21.0) [VERIFIED: npm registry]
   - What's unclear: Whether tsx has compatibility issues with project's dependencies
   - Recommendation: Start with ts-node (proven stable), optionally test tsx later for performance.

4. **Do any third-party libraries lack @types/* packages?**
   - What we know: Major packages (express, react, pg, bcrypt, jwt) have official types
   - What's unclear: Whether project uses any obscure packages without type definitions
   - Recommendation: Audit package.json after setup phase; write custom .d.ts files if needed.

5. **Should React components use `React.FC` type or plain function declarations?**
   - What we know: React.FC removed implicit children in React 18+ [ASSUMED]
   - What's unclear: Team preference for component typing style
   - Recommendation: Use plain function declarations with explicit return type `React.ReactElement` or `: JSX.Element`. Avoid `React.FC` unless explicitly typing props with children.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Backend runtime | ✓ | v24.3.0 | — |
| npm | Package management | ✓ | 11.6.0 | — |
| TypeScript | Type checking and compilation | ✓ (installable) | 6.0.3 | — |
| ts-node | Development TypeScript execution | ✓ (installable) | 10.9.2 | tsx (faster alternative) |
| @types/node | Node.js type definitions | ✓ (installable) | 25.7.0 | — |
| @types/express | Express type definitions | ✓ (installable) | 5.0.6 | — |
| @types/react | React type definitions | ✓ (installable) | 19.2.14 | — |
| @types/bcryptjs | bcryptjs type definitions | ✓ (installable) | 3.0.0 | — |
| @types/jsonwebtoken | JWT type definitions | ✓ (installable) | 9.0.10 | — |
| @types/pg | PostgreSQL client types | ✓ (installable) | 8.20.0 | — |

**Missing dependencies with no fallback:**
- None — all required TypeScript tooling and type definitions are available via npm.

**Missing dependencies with fallback:**
- None — all dependencies are available.

## Validation Architecture

> Validation architecture section skipped: `workflow.nyquist_validation` not explicitly set in config.json, but no test infrastructure exists for TypeScript validation yet. Test setup should be addressed in a separate testing phase after TypeScript migration is complete.

## Security Domain

> This section omitted because `security_enforcement` is not explicitly enabled in `.planning/config.json` and the phase involves internal code migration without changing security boundaries. TypeScript provides compile-time type safety but does not introduce new security controls or modify authentication/authorization logic. Existing security patterns (bcrypt password hashing, JWT tokens, parameterized SQL queries) remain unchanged.

## Sources

### Primary (HIGH confidence)
- [TypeScript Official Docs - Migrating from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html) - Migration strategies, tsconfig setup, common patterns
- [TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig) - Compiler options and configuration
- [React Redux TypeScript Quick Start](https://react-redux.js.org/tutorials/typescript-quick-start) - Redux Toolkit with TypeScript patterns
- npm registry (verified 2026-05-12) - Package versions for typescript@6.0.3, @types/node@25.7.0, @types/express@5.0.6, @types/react@19.2.14, ts-node@10.9.2, tsx@4.21.0, @types/bcryptjs@3.0.0, @types/jsonwebtoken@9.0.10, @types/pg@8.20.0

### Secondary (MEDIUM confidence)
- [DefinitelyTyped Express Types](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/express) - Express TypeScript patterns

### Tertiary (LOW confidence)
- None — all research verified with official documentation or npm registry

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages verified against npm registry with current versions
- Architecture: HIGH - Patterns sourced from official TypeScript and Redux documentation
- Pitfalls: HIGH - Based on documented TypeScript migration challenges and Express/React typing issues

**Research date:** 2026-05-12
**Valid until:** 2026-06-12 (30 days) — TypeScript stable releases are infrequent; migration patterns are mature and unlikely to change
