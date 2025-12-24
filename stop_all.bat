@echo off
echo ==========================================
echo Stopping All Food Delivery Services
echo ==========================================

echo Killing Node.js processes (Gateway, Hub, Restaurant Service)...
taskkill /F /IM node.exe /T

echo Killing Python processes (Order Service)...
taskkill /F /IM python.exe /T

echo.
echo All services stopped. Ports should be free now.
pause
