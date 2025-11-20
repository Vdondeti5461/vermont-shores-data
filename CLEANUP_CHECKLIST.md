# Repository Cleanup Checklist

## Files to Remove from GitHub

These files should NOT be in the GitHub repository as they are server-specific or generated:

### Build Outputs and Dependencies
- [ ] `dist/` directory (if present)
- [ ] `node_modules/` directory (if accidentally committed)
- [ ] Any `*.tgz` or `*.tar.gz` package files

### Server Logs and Runtime Files
- [ ] `*.log` files (server.log, api.log, etc.)
- [ ] `*.pid` files (server.pid, watchdog.pid, etc.)
- [ ] Any backup directories (`backup*/`, `backup-root*/`, etc.)

### Environment and Secrets
- [ ] `.env` files (should never be in GitHub)
- [ ] Any files containing database credentials
- [ ] Any files with API keys or secrets

### Server-Specific Directories
- [ ] `www-root/` (deployment target, not source)
- [ ] `api/` (if it contains deployed files, not source)
- [ ] Any UVM-specific temporary files

## How to Remove Files from Git

### Remove files but keep locally
```bash
# Remove from git but keep on disk
git rm --cached <file>
git rm -r --cached <directory>

# Example:
git rm --cached *.log
git rm -r --cached dist/
git rm -r --cached node_modules/
```

### Remove completely
```bash
# Remove from git and disk
git rm <file>
git rm -r <directory>
```

### Commit the changes
```bash
git commit -m "chore: remove server-specific and build files from repository"
git push origin main
```

## Verify .gitignore

Ensure your `.gitignore` includes:

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment files
.env
.env.local
.env.production

# Logs
*.log
*.pid

# Server deployment directories
www-root/
backup*/
all_backups*.tar.gz

# Temporary files
*.tmp
phptemp/
oradiag_*/
```

## GitHub Repository Structure (After Cleanup)

Your GitHub repository should contain ONLY:

### Source Code
- [x] `src/` - Frontend source
- [x] `public/` - Static assets
- [x] `docs/` - Documentation
- [x] `supabase/` - Supabase config

### Configuration
- [x] `package.json` - Frontend dependencies
- [x] `production-package.json` - Backend dependencies
- [x] `vite.config.ts` - Build configuration
- [x] `tailwind.config.ts` - Styling configuration
- [x] `tsconfig.json` - TypeScript configuration
- [x] `.gitignore` - Git ignore rules

### Backend Source
- [x] `production-api-server.js` - Backend API source

### Deployment Scripts
- [x] `deploy.sh` - Single server deployment
- [x] `deploy-dual.sh` - Dual server deployment

### Documentation
- [x] `README.md`
- [x] `PROJECT_STRUCTURE.md`
- [x] `DEPLOYMENT_QUICK_REFERENCE.md`
- [x] `DUAL_DEPLOYMENT_GUIDE.md`
- [x] Other `*.md` documentation files

## Clean Repository Command Sequence

```bash
# 1. Review what will be removed
git status

# 2. Remove build outputs
git rm -r --cached dist/ 2>/dev/null || true

# 3. Remove node_modules if present
git rm -r --cached node_modules/ 2>/dev/null || true

# 4. Remove logs
git rm --cached *.log 2>/dev/null || true
git rm --cached *.pid 2>/dev/null || true

# 5. Remove backup directories
git rm -r --cached backup*/ 2>/dev/null || true

# 6. Remove server deployment directories
git rm -r --cached www-root/ 2>/dev/null || true

# 7. Commit cleanup
git commit -m "chore: clean up repository - remove build outputs, logs, and server-specific files"

# 8. Push changes
git push origin main
```

## Post-Cleanup Verification

After cleanup, verify your repository:

```bash
# Check repository size
du -sh .git

# List all tracked files
git ls-tree -r main --name-only

# Verify .gitignore is working
git status

# Should show clean working tree with no untracked build/log files
```

## Server Files (Not in GitHub)

These files exist on the server but should NEVER be in GitHub:

### On vdondeti.w3.uvm.edu
```
~/www-root/          # Built frontend (from dist/)
~/api/node_modules/  # Installed dependencies
~/api/server.log     # Runtime logs
~/api/*.pid          # Process IDs
~/backup*/           # Server backups
```

### On crrels2s.w3.uvm.edu
```
~/www-root/          # Built frontend (from dist/)
~/api/node_modules/  # Installed dependencies
~/api/server.log     # Runtime logs
~/api/*.pid          # Process IDs
~/backup*/           # Server backups
```

## Maintenance

### Regular Checks
- [ ] Review `.gitignore` before committing
- [ ] Run `git status` to check for unwanted files
- [ ] Verify `dist/` is not being committed
- [ ] Ensure no `.env` files in commits

### Before Each Deployment
- [ ] Commit only source code changes
- [ ] Push to GitHub
- [ ] Deploy to testing server
- [ ] Verify, then deploy to production

## Additional Resources

- See `PROJECT_STRUCTURE.md` for complete structure overview
- See `DEPLOYMENT_QUICK_REFERENCE.md` for deployment commands
- See `.gitignore` for complete ignore rules
