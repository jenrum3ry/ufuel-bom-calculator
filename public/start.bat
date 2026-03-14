@echo off
title UFuel BOM Calculator
echo ============================================
echo   UFuel BOM Steel Calculator
echo ============================================
echo.
echo Starting local server...
echo.

:: Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Opening browser...
    start http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server when done.
    echo.
    python -m http.server 8000
    goto :end
)

:: Check if Python3 is available
where python3 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Opening browser...
    start http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server when done.
    echo.
    python3 -m http.server 8000
    goto :end
)

:: Check if Node.js npx is available
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Opening browser...
    start http://localhost:3000
    echo.
    echo Press Ctrl+C to stop the server when done.
    echo.
    npx serve -s . -l 3000
    goto :end
)

:: No server available - try PowerShell
echo No Python or Node.js found. Trying PowerShell server...
start http://localhost:8080
powershell -ExecutionPolicy Bypass -Command "& { $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8080/'); $listener.Start(); Write-Host 'Server running at http://localhost:8080'; Write-Host 'Press Ctrl+C to stop'; while ($listener.IsListening) { $context = $listener.GetContext(); $response = $context.Response; $file = $context.Request.Url.LocalPath.TrimStart('/'); if ($file -eq '') { $file = 'index.html' }; $path = Join-Path $PWD $file; if (Test-Path $path) { $content = [System.IO.File]::ReadAllBytes($path); $response.ContentLength64 = $content.Length; $response.OutputStream.Write($content, 0, $content.Length) } else { $response.StatusCode = 404 }; $response.Close() } }"

:end
pause
