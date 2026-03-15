# UFuel BOM Steel Calculator

A portable bill-of-materials calculator for cylindrical steel tank manufacturing. Enter tank diameter and length, and the calculator produces an optimal steel sheet order (minimum waste) for the shell and two end caps, including weights and a printable PDF requisition. Supports English and Spanish.

## How to Use

1. Enter the tank **outer diameter** (OD) and length in inches.
2. Click **Calculate**.

The calculator always assumes:
- **1/4" (6.3 mm)** A-36 steel plate
- **2 heads** (one per end)
- Standard supplier sheet widths: 36", 48", 60", 72", 96"
- Standard supplier sheet lengths: 96", 120", 240", 480", 560"

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
