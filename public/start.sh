#!/bin/bash
echo "============================================"
echo "  UFuel BOM Steel Calculator"
echo "============================================"
echo ""
echo "Starting local server..."
echo ""

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Try Python 3
if command -v python3 &> /dev/null; then
    echo "Opening browser..."
    (sleep 1 && open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null) &
    echo ""
    echo "Server running at http://localhost:8000"
    echo "Press Ctrl+C to stop the server when done."
    echo ""
    python3 -m http.server 8000
    exit 0
fi

# Try Python 2
if command -v python &> /dev/null; then
    echo "Opening browser..."
    (sleep 1 && open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null) &
    echo ""
    echo "Server running at http://localhost:8000"
    echo "Press Ctrl+C to stop the server when done."
    echo ""
    python -m SimpleHTTPServer 8000
    exit 0
fi

# Try npx serve
if command -v npx &> /dev/null; then
    echo "Opening browser..."
    (sleep 2 && open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null) &
    echo ""
    echo "Press Ctrl+C to stop the server when done."
    echo ""
    npx serve -s . -l 3000
    exit 0
fi

echo "ERROR: No web server available."
echo "Please install Python or Node.js to run this application."
exit 1
