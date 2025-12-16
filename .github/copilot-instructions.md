## Project Structure

- `packages/ema`: The core and backend for the EverMindAgent framework.
- `packages/ema-ui`: The frontend for the EverMindAgent framework.

## Development

Both the core and UI packages are developed using TypeScript.

- All of the public classes, methods, and variables should be documented with JSDoc.
- Write tests (vitest) in the `**/*.spec.ts` files.

### Core Development

The core package focuses on providing the core functionality for the EverMindAgent frontend. It exposes REST APIs for the frontend to interact with. The backend server can be started by running `pnpm ema`.

The core functionality includes:

- Provides the agent that chats with the user.

### UI Development

The UI package focuses on providing the UI for the EverMindAgent framework. It is a Next.js application that can be started by running `pnpm ema:ui`.
