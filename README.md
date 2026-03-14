# UFuel BOM Steel Calculator

A portable bill-of-materials calculator for cylindrical steel tank manufacturing. Calculates optimal steel sheet requirements, weight, and waste for tank shells and end caps. Supports English and Spanish, and can export results as a printable PDF.

## Running Locally (No Installation Required)

The `dist/` folder contains a fully self-contained build. You only need a web browser.

### Option 1: Open Directly in Browser (Simplest)

Navigate into the `dist/` folder and double-click `index.html`. Most browsers will open it directly.

### Option 2: Use the Included Start Scripts (Recommended)

The start scripts serve the app over a local HTTP server, which avoids browser security restrictions that can affect some features.

**Windows:**
1. Open the `dist/` folder
2. Double-click `start.bat`
3. A browser tab will open automatically at `http://localhost:8000`

**macOS / Linux:**
1. Open a terminal in the `dist/` folder
2. Run: `./start.sh`
3. A browser tab will open automatically at `http://localhost:8000`

The scripts will use Python if available, or fall back to Node.js (`npx serve`). At least one of the following must be installed:
- [Python 3](https://www.python.org/downloads/) (recommended)
- [Node.js](https://nodejs.org/)

---

## Developer Setup

```bash
npm install
npm run dev      # Start development server with hot reload
npm run build    # Build for production (outputs to dist/)
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

The build script automatically post-processes `dist/index.html` for `file://` protocol compatibility.
