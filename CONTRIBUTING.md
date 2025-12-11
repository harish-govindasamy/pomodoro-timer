# Contributing to Pomofocus 🍅

First off, thanks for taking the time to contribute! ❤️

This document provides guidelines and steps for contributing to Pomofocus. Following these guidelines helps communicate that you respect the time of the developers managing and developing this open source project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guide](#code-style-guide)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

---

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

---

## Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9.x or later
- **Git**

### Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/pomodoro-timer.git
cd pomodoro-timer

# 3. Add upstream remote
git remote add upstream https://github.com/harish-govindasamy/pomodoro-timer.git

# 4. Install dependencies
npm install

# 5. Set up environment
cp .env.example .env

# 6. Initialize database
npm run db:push
npm run db:seed  # Optional: adds sample data

# 7. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Useful Commands

| Command              | Description               |
| -------------------- | ------------------------- |
| `npm run dev`        | Start development server  |
| `npm run build`      | Build for production      |
| `npm run lint`       | Run ESLint                |
| `npm run db:studio`  | Open Prisma Studio        |
| `npm run db:migrate` | Create database migration |

---

## Development Workflow

### 1. Create a Branch

```bash
# Sync with upstream first
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
# Or for bugs: git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the [Code Style Guide](#code-style-guide)
- Add tests for new functionality
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run tests (when available)
npm test

# Build to check for errors
npm run build
```

### 4. Commit Your Changes

Follow our [Commit Message Guidelines](#commit-message-guidelines).

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Code Style Guide

### TypeScript

- **Use strict TypeScript** - No `any` types unless absolutely necessary
- **Prefer interfaces** over type aliases for object shapes
- **Export types** from `src/types/` for reuse

```typescript
// ✅ Good
interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
}

// ❌ Avoid
type Task = any;
```

### React Components

- **Use functional components** with hooks
- **Handle loading and error states** explicitly
- **Use `"use client"` directive** only when needed

```tsx
// ✅ Good - Explicit states
function TaskList() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <Skeleton />;

  return <ul>{/* ... */}</ul>;
}

// ❌ Avoid - Missing hydration safety
function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);
  return <ul>{/* Direct render without hydration check */}</ul>;
}
```

### File Naming

| Type       | Convention                    | Example            |
| ---------- | ----------------------------- | ------------------ |
| Components | PascalCase                    | `TimerDisplay.tsx` |
| Hooks      | camelCase with `use` prefix   | `useTimer.ts`      |
| Stores     | camelCase with `Store` suffix | `timerStore.ts`    |
| Utilities  | camelCase                     | `storage.ts`       |
| Types      | PascalCase in `index.ts`      | `Task`, `Settings` |

### Styling

- **Use Tailwind CSS** utility classes
- **Prefer design tokens** (`bg-muted`, `text-foreground`) over raw colors
- **Keep components responsive** - Mobile-first approach

```tsx
// ✅ Good - Uses design tokens
<div className="bg-muted text-foreground rounded-xl p-4">

// ❌ Avoid - Hardcoded colors
<div className="bg-gray-100 text-black rounded-lg p-4">
```

### Zustand Stores

- **Keep stores focused** - One concern per store
- **Use selectors** to prevent unnecessary re-renders
- **SSR-safe** - Check `typeof window` before localStorage

```typescript
// ✅ Good - SSR safe
const loadTasks = (): Task[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("tasks");
  return stored ? JSON.parse(stored) : [];
};
```

### API Routes

- **Validate input** before processing
- **Return consistent response shapes**
- **Handle errors gracefully**

```typescript
// ✅ Good - Consistent response
return NextResponse.json({ success: true, data: task });
return NextResponse.json(
  { success: false, error: "Not found" },
  { status: 404 },
);
```

---

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type       | Description                        |
| ---------- | ---------------------------------- |
| `feat`     | New feature                        |
| `fix`      | Bug fix                            |
| `docs`     | Documentation only                 |
| `style`    | Formatting, no code change         |
| `refactor` | Code change, no new feature or fix |
| `perf`     | Performance improvement            |
| `test`     | Adding tests                       |
| `chore`    | Build process, dependencies        |

### Examples

```bash
feat(timer): add keyboard shortcuts for control

fix(tasks): prevent duplicate task creation on double-click

docs(readme): update installation instructions

refactor(store): extract timer logic into separate hook
```

### Rules

- Use **present tense** ("add feature" not "added feature")
- Use **imperative mood** ("move cursor" not "moves cursor")
- Keep subject line under **50 characters**
- Reference issues in footer: `Closes #123`

---

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guide
- [ ] Self-reviewed my code
- [ ] Added/updated tests if applicable
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### PR Title Format

Same as commit messages:

```
feat(timer): add pause/resume functionality
```

### PR Description Template

```markdown
## What does this PR do?

Brief description of changes.

## Why is this change needed?

Context and motivation.

## How to test?

Steps to verify the changes.

## Screenshots (if applicable)

Add screenshots for UI changes.

## Checklist

- [ ] Tests pass
- [ ] Lint passes
- [ ] Build succeeds
```

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge

---

## Project Structure

```
src/
├── app/           # Next.js App Router (pages + API)
├── components/    # React components
│   ├── ui/       # shadcn/ui primitives
│   ├── Timer/    # Timer-related components
│   └── Tasks/    # Task-related components
├── hooks/         # Custom React hooks
├── store/         # Zustand state stores
├── lib/           # Shared libraries (auth, sync)
├── utils/         # Utility functions
└── types/         # TypeScript type definitions
```

### Key Files

| File                  | Purpose              |
| --------------------- | -------------------- |
| `store/timerStore.ts` | Timer state machine  |
| `store/taskStore.ts`  | Task management      |
| `lib/sync.ts`         | Offline-first sync   |
| `utils/storage.ts`    | localStorage wrapper |

---

## Questions?

Feel free to open an issue or reach out:

- **Telegram**: [@G_Harish](https://t.me/G_Harish)
- **GitHub Issues**: [Open an issue](https://github.com/harish-govindasamy/pomodoro-timer/issues)

Thank you for contributing! 🚀
