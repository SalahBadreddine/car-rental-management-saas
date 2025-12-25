# Quick Fix for TypeScript Errors

## The Problem
TypeScript errors appear because `node_modules` is missing (dependencies aren't installed).

## The Solution - Choose ONE method:

### Method 1: Use VS Code's Integrated Terminal (Recommended)
1. In VS Code, press **Ctrl + `** (backtick) to open the integrated terminal
2. Make sure you're in the `frontend` folder
3. Type: `npm install`
4. Wait for installation to complete
5. Press **Ctrl+Shift+P** → Type "TypeScript: Restart TS Server" → Press Enter

### Method 2: Install Node.js (if npm is not available)
1. Download Node.js from: https://nodejs.org/
2. Install it (this will add npm to your PATH)
3. Restart VS Code
4. Open terminal in VS Code (Ctrl + `)
5. Run: `npm install` in the `frontend` folder
6. Restart TypeScript server

### Method 3: Use PowerShell with Full Path
If Node.js is installed but not in PATH:
```powershell
& "C:\Program Files\nodejs\npm.cmd" install
```

---

**After installation, all TypeScript errors will disappear!**

The code is correct - it just needs the dependencies installed.

