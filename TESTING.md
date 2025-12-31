# 🧪 Testing Guide - ResolveDesk

This document outlines the testing strategy and execution steps for the ResolveDesk application.

## Overview
We employ a two-tiered testing approach:
1.  **Backend Unit Tests**: Verified using **Jest**. Focuses on utility functions and critical business logic.
2.  **Frontend Unit Tests**: Verified using **Karma** and **Jasmine**. Focuses on services and component creation.

## Backend Testing

The backend tests are located in `backend/src/tests/`.

### Prerequisites
-   Ensure backend dependencies are installed (`cd backend && npm install`).

### Running Tests
To run the full suite of backend tests:

```bash
cd backend
npm test
```

### What is tested?
-   **ID Generation**: Ensures complaint IDs follow the `CMP-YYYY-XXXXXX` format and are unique.
-   **API Health**: (Manual check) Verifies the server responds to health checks.

## Frontend Testing

The frontend tests are located alongside components in `.spec.ts` files.

### Prerequisites
-   Ensure frontend dependencies are installed (`cd frontend && npm install`).
-   Chrome browser (for Headless Chrome execution).

### Running Tests
To run the frontend test suite:

```bash
cd frontend
npm test
```

### Configuration
-   **Karma Config**: `frontend/karma.conf.js`
-   **Browsers**: Configured to use `ChromeHeadless` for CI/CD compatibility.

## Future Testing Roadmap
-   **E2E Testing**: Plan to integrate Cypress for End-to-End user flow testing.
-   **Integration Tests**: Mocking database calls to test API endpoints fully.
