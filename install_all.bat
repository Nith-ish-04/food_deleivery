@echo off
echo ==========================================
echo Installing Dependencies for All Services
echo ==========================================

echo.
echo [1/4] Installing Gateway dependencies...
cd gateway
call npm install
cd ..

echo.
echo [2/4] Installing Communication Hub dependencies...
cd communication_hub
call npm install
cd ..

echo.
echo [3/4] Installing Restaurant Service dependencies...
cd restaurant_service
call npm install
cd ..

echo.
echo [4/4] Installing Order Service dependencies...
cd order_service
pip install -r requirements.txt
cd ..

echo.
echo ==========================================
echo All dependencies installed successfully!
echo ==========================================
pause
