# Repository Guidelines

## Project Structure & Module Organization

This repository contains two independent applications:

- `frontend/`: React 19 and TypeScript UI built with Vite. Code lives in `frontend/src/`, static files in `frontend/public/`, and imported images in `frontend/src/assets/`.
- `backend/`: Spring Boot 4 application using Java 25 and Maven. Production code follows the package path under `backend/src/main/java/`; configuration is in `backend/src/main/resources/`; tests mirror production packages under `backend/src/test/java/`.

Generated directories such as `frontend/dist/`, `frontend/node_modules/`, and `backend/target/` should not be committed.

## Build, Test, and Development Commands

Run commands from the relevant module directory.

The frontend requires Node.js 20.19 or newer.

```bash
cd frontend && npm install   # Install locked frontend dependencies
npm run dev                  # Start the Vite development server with HMR
npm run lint                 # Check TypeScript and React code with ESLint
npm test                     # Run frontend unit and component tests
npm run build                # Type-check and create a production build
npm run preview              # Serve the production build locally

cd backend && ./mvnw spring-boot:run  # Start the backend
./mvnw test                           # Run the JUnit test suite
./mvnw clean package                  # Test and build the executable JAR
```

On Windows, use `mvnw.cmd` instead of `./mvnw`.

## Coding Style & Naming Conventions

Frontend code uses two-space indentation, single quotes, extensionless relative imports, and functional components. Name components and their files in `PascalCase`, hooks with a `use` prefix, and variables/functions in `camelCase`. Keep CSS near the code it styles. Run `npm run lint` before submitting changes.

Backend code uses Java conventions: four-space indentation, `PascalCase` classes, `camelCase` methods and fields, and lowercase package names rooted at `com.nikola.algorithmvisualizer`. Keep controllers, services, and domain types in focused subpackages as the application grows.

## Testing Guidelines

Backend tests use JUnit 5 with Spring Boot test support. Name test classes `*Tests.java` and use descriptive method names such as `returnsSortedValues()`. Add unit tests for algorithm behavior and integration tests only where Spring wiring matters. The frontend currently has no test runner; when adding one, colocate tests as `*.test.tsx` and document the new command.

## Commit & Pull Request Guidelines

The repository has no existing commits from which to infer a convention. Use short, imperative subjects, optionally with Conventional Commit prefixes, for example `feat: add merge sort animation` or `fix: handle empty input`.

Pull requests should explain the change, list verification commands, and link relevant issues. Include screenshots for visual changes and call out API or configuration changes. Keep each pull request narrowly scoped and ensure lint, build, and tests pass.
