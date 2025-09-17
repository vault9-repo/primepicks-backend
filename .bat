@echo off
SET /P commitMsg=Enter commit message: 

echo ⏳ Pulling latest changes from remote...
git pull origin main

echo ✅ Adding all changes...
git add .

echo ✅ Committing changes...
git commit -m "%commitMsg%"

echo ⏳ Pushing to GitHub...
git push origin main

echo 🎉 Backend updated successfully!
pause
