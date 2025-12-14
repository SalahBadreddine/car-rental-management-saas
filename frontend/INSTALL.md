# Installing Dependencies

The TypeScript errors you're seeing are because `node_modules` is missing. 

## Quick Fix:

1. **Open a terminal in VS Code** (Ctrl + ` or Terminal → New Terminal)

2. **Navigate to the frontend folder** (if not already there):
   ```powershell
   cd frontend
   ```

3. **Install dependencies** using one of these methods:

   **Option A: Using npm** (if Node.js is installed):
   ```powershell
   npm install
   ```

   **Option B: Using bun** (if Bun is installed):
   ```powershell
   bun install
   ```

4. **After installation, restart the TypeScript server**:
   - Press `Ctrl+Shift+P`
   - Type "TypeScript: Restart TS Server"
   - Select it

5. **The errors should disappear!**

## If npm/bun is not found:

Install Node.js from: https://nodejs.org/ (includes npm)

Or install Bun from: https://bun.sh/

---

**Note:** The code itself is correct. These are just TypeScript language server errors that occur when dependencies aren't installed. Once you install the dependencies, everything will work perfectly!

