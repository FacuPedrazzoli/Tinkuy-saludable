# Contributing to Tinkuy

Thank you for your interest in contributing to Tinkuy! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Development Setup](#development-setup)
- [Contribution Guidelines](#contribution-guidelines)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)

---

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-fork/tinkuy.git
cd tinkuy

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## Contribution Guidelines

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your forked repository:
   ```bash
   git clone https://github.com/your-username/tinkuy.git
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/original-owner/tinkuy.git
   ```

### Branch Naming Conventions

Use descriptive branch names with the following prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/user-authentication` |
| `fix/` | Bug fixes | `fix/cart-calculation-error` |
| `docs/` | Documentation | `docs/api-endpoints` |
| `refactor/` | Code refactoring | `refactor/state-management` |
| `test/` | Test additions | `test/checkout-flow` |

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |
| `chore` | Maintenance tasks |

**Examples:**

```bash
git commit -m "feat(cart): add wishlist functionality"
git commit -m "fix(checkout): resolve price calculation error"
git commit -m "docs(api): update product endpoints documentation"
git commit -m "refactor(auth): migrate to new supabase client"
git commit -m "test(payment): add E2E tests for checkout flow"
```

---

## Code Standards

### TypeScript Strict Mode

This project uses TypeScript with strict mode enabled. All code must pass type checking:

```bash
npm run typecheck
```

Guidelines:
- Avoid using `any` type
- Use explicit type annotations for function parameters and return types
- Prefer interfaces over type aliases for object shapes
- Use generic types when applicable

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `userData`, `isLoading` |
| Functions | camelCase | `fetchProducts`, `handleClick` |
| Classes | PascalCase | `ProductCard`, `CartDrawer` |
| Interfaces | PascalCase | `User`, `ProductResponse` |
| Constants | UPPER_SNAKE_CASE | `MAX_ITEMS`, `API_URL` |
| Files (components) | PascalCase | `ProductCard.tsx` |
| Files (utilities) | kebab-case | `cart-utils.ts`, `api-helpers.ts` |

### No Magic Numbers

Define meaningful constants instead of hardcoded values:

```typescript
// Bad
if (userAge > 18) { ... }

// Good
const LEGAL_AGE = 18;
if (userAge > LEGAL_AGE) { ... }
```

### Component Guidelines

- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for component props

---

## Testing Requirements

### Coverage Requirements

- Minimum **70% code coverage** for all new code
- Coverage reports are generated with `npm test`

### Test Structure

Tests are located in the `tests/` directory, mirroring the `src/` structure:

```
tests/
├── components/
│   ├── ProductCard.test.tsx
│   └── Header.test.tsx
├── hooks/
│   └── useAuth.test.ts
└── setup.ts
```

### Test Conventions

- Use Vitest as the testing framework
- Use `@testing-library/react` for component tests
- Use `@testing-library/jest-dom` for assertions

Example test:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Product Name')).toBeInTheDocument();
  });
});
```

### Required Tests

| Change Type | Requirement |
|-------------|-------------|
| New features | Unit tests required |
| Bug fixes | Tests that reproduce the bug and verify the fix |
| Critical features | E2E tests required (checkout, auth, payments) |

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

---

## Pull Request Process

### Before Submitting

1. Ensure all tests pass:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

2. Update documentation if needed

3. Commit using conventional commits

### PR Checklist

- [ ] Branch is named correctly (`feature/`, `fix/`, `docs/`, etc.)
- [ ] Commit messages follow conventional commits format
- [ ] Code passes `npm run lint` and `npm run typecheck`
- [ ] All tests pass with minimum 70% coverage
- [ ] New features include unit tests
- [ ] Bug fixes include tests that reproduce and verify the fix
- [ ] Documentation is updated if necessary
- [ ] No console.log statements or debug code

### Code Review Checklist

**Functionality:**
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] No breaking changes to existing functionality

**Code Quality:**
- [ ] TypeScript strict mode compliance
- [ ] Meaningful variable and function names
- [ ] No magic numbers
- [ ] Code is modular and reusable

**Testing:**
- [ ] Unit tests for new functionality
- [ ] Bug fix tests that prevent regression
- [ ] Coverage meets 70% minimum

**Documentation:**
- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] README or docs updated if needed

---

## Getting Help

If you have questions or need help:

- Open an issue for bugs or feature requests
- Check existing issues and PRs before duplicating
- Follow the code of conduct in all interactions

---

## License

By contributing to Tinkuy, you agree that your contributions will be licensed under the project's license.
