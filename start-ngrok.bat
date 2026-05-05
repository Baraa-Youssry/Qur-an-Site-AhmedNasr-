@echo off
echo Starting ngrok tunnels...
echo.
echo Frontend will be available at the ngrok URL shown below (port 5173)
echo Backend will be available at the ngrok URL shown below (port 4000)
echo.
echo Run this command to start both tunnels:
echo ngrok start --all
echo.
echo Or start them separately:
echo Terminal 1: ngrok http 5173
echo Terminal 2: ngrok http 4000
echo.
pause
