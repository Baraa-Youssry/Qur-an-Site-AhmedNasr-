@echo off
echo Starting ngrok tunnel to localhost:5173...
start "" "C:\Program Files\ngrok\ngrok.exe" http 5173
echo.
echo Ngrok is running! Check the ngrok window for your public URL.
echo Update backend CLIENT_URL with the ngrok URL (https://xxx.ngrok.io)
echo.
pause
