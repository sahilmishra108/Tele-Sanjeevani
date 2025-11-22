@echo off
echo Checking for processes using port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo Killing process %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
)
echo Port 3000 is now free.
