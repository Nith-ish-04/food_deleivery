@echo off
echo ==========================================
echo Starting All Services
echo ==========================================

echo Starting Communication Hub...
start "Communication Hub" cmd /k "cd communication_hub && npm start"

echo Starting Gateway...
start "Frontend Gateway" cmd /k "cd gateway && npm start"

echo Starting Restaurant Service...
start "Restaurant Service" cmd /k "cd restaurant_service && npm start"

echo Starting Order Service (Instance 1)...
start "Order Service 1" cmd /k "cd order_service && python app.py 5001"

echo Starting Order Service (Instance 2)...
start "Order Service 2" cmd /k "cd order_service && python app.py 5002"

echo.
echo All services are launching in separate windows.
echo Please wait a moment for them to initialize.
echo.
echo Access the Gateway at: http://localhost:3000
pause
