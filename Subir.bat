@echo off
echo ==========================
echo Subiendo cambios a Git...
echo ==========================

git add .
git commit -m "auto update"
git push

echo ==========================
echo Listo 🚀
pause