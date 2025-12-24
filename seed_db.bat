@echo off
echo ==========================================
echo Seeding MongoDB with Restaurant Data
echo ==========================================

cd restaurant_service
call npm run seed
cd ..

echo.
echo Data seeding complete!
pause
