# Summit2Shore Documentation Index

## Essential Documentation (Start Here)

### For New Developers
📖 **[GETTING_STARTED.md](GETTING_STARTED.md)** - Your first stop. Learn how to set up, run, and develop.

📖 **[README.md](README.md)** - Project overview, quick links, and deployment info.

### For Deployment
🚀 **[DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md)** - Quick commands for both testing and production servers.

🚀 **[DUAL_DEPLOYMENT_GUIDE.md](DUAL_DEPLOYMENT_GUIDE.md)** - Detailed frontend deployment guide.

🚀 **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete architecture and file organization.

### For Troubleshooting
🔧 **[SERVER_VERIFICATION_CHECKLIST.md](SERVER_VERIFICATION_CHECKLIST.md)** - Step-by-step server verification and troubleshooting.

🔧 **[CLEANUP_CHECKLIST.md](CLEANUP_CHECKLIST.md)** - Guide to clean up and organize the repository.

## Technical Documentation

### Backend
📡 **[BACKEND_API_ENDPOINTS.md](BACKEND_API_ENDPOINTS.md)** - Complete API endpoint documentation.

📡 **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database configuration and schema information.

📡 **[DATABASE_PERFORMANCE_GUIDE.md](DATABASE_PERFORMANCE_GUIDE.md)** - Database optimization strategies.

### Features
✨ **[DATA_DOWNLOAD_FEATURE.md](DATA_DOWNLOAD_FEATURE.md)** - Data download functionality documentation.

✨ **[AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md)** - Authentication system setup (if implemented).

## Project Planning

### Requirements & Design
📋 **[docs/BRD_Summit2Shore.md](docs/BRD_Summit2Shore.md)** - Business Requirements Document

📋 **[docs/FRD_Summit2Shore.md](docs/FRD_Summit2Shore.md)** - Functional Requirements Document

📋 **[docs/TRD_Summit2Shore.md](docs/TRD_Summit2Shore.md)** - Technical Requirements Document

### Future Work
📝 **[TODO.md](TODO.md)** - Planned features, improvements, and technical debt.

## Quick Navigation

### I want to...

**...set up the project locally**
→ [GETTING_STARTED.md](GETTING_STARTED.md) → Installation section

**...deploy to testing server**
→ [DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md) → Testing Server section

**...deploy to production server**
→ [DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md) → Production Server section

**...understand the project structure**
→ [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

**...fix a deployment issue**
→ [SERVER_VERIFICATION_CHECKLIST.md](SERVER_VERIFICATION_CHECKLIST.md)

**...understand the API**
→ [BACKEND_API_ENDPOINTS.md](BACKEND_API_ENDPOINTS.md)

**...clean up the repository**
→ [CLEANUP_CHECKLIST.md](CLEANUP_CHECKLIST.md)

**...know what to build next**
→ [TODO.md](TODO.md)

**...understand the database**
→ [DATABASE_SETUP.md](DATABASE_SETUP.md)

## File Organization

### Documentation Files (Keep in GitHub)
```
summit2shore/
├── README.md                           # Project overview
├── GETTING_STARTED.md                  # Setup and development guide
├── DOCUMENTATION_INDEX.md              # This file
├── TODO.md                             # Future tasks and improvements
│
├── PROJECT_STRUCTURE.md                # Architecture and organization
├── DEPLOYMENT_QUICK_REFERENCE.md       # Deployment commands
├── DUAL_DEPLOYMENT_GUIDE.md            # Frontend deployment details
├── SERVER_VERIFICATION_CHECKLIST.md    # Troubleshooting guide
├── CLEANUP_CHECKLIST.md                # Repository cleanup guide
│
├── BACKEND_API_ENDPOINTS.md            # API documentation
├── DATABASE_SETUP.md                   # Database documentation
├── DATABASE_PERFORMANCE_GUIDE.md       # DB optimization
├── DATA_DOWNLOAD_FEATURE.md            # Feature documentation
├── AUTHENTICATION_SETUP.md             # Auth documentation
│
└── docs/                               # Project requirements
    ├── BRD_Summit2Shore.md            # Business requirements
    ├── FRD_Summit2Shore.md            # Functional requirements
    └── TRD_Summit2Shore.md            # Technical requirements
```

### Files NOT in GitHub
```
# These are generated or server-specific:
dist/                  # Build output
node_modules/          # Dependencies
*.log                  # Log files
*.pid                  # Process IDs
backup*/               # Backup directories
www-root/              # Deployment target
```

## Documentation Standards

### When to Update Documentation

**After every deployment**:
- Update TODO.md if tasks were completed
- Update README.md if URLs or structure changed

**When adding features**:
- Document in appropriate feature doc (e.g., DATA_DOWNLOAD_FEATURE.md)
- Update API docs if backend changes
- Add to TODO.md if incomplete

**When fixing bugs**:
- Update troubleshooting sections
- Document the fix in relevant guide

**When changing architecture**:
- Update PROJECT_STRUCTURE.md
- Document reasons in TODO.md or separate ADR

### Documentation Review Schedule

- **Weekly**: Check TODO.md for completed tasks
- **Monthly**: Review all deployment docs for accuracy
- **Quarterly**: Complete documentation audit
- **Annually**: Archive outdated documentation

## Contributing to Documentation

### Style Guide
- Use clear, concise language
- Include code examples where helpful
- Use emoji for visual navigation (📖 = docs, 🚀 = deployment, 🔧 = troubleshooting)
- Keep line length under 120 characters
- Use relative links between docs

### File Naming
- Use SCREAMING_SNAKE_CASE.md for major docs
- Use kebab-case.md for feature-specific docs
- Keep filenames descriptive but concise

### Structure
- Start with clear title
- Include table of contents for long docs
- Use ## for main sections, ### for subsections
- End with "Related Documentation" links

## External Resources

- **Lovable Project**: https://lovable.dev/projects/5d5ff90d-8cee-4075-81bd-555a25d8e14f
- **Testing Site**: https://vdondeti.w3.uvm.edu
- **Production Site**: https://crrels2s.w3.uvm.edu

## Need Help?

If you can't find what you're looking for:

1. Check the [GETTING_STARTED.md](GETTING_STARTED.md) guide
2. Search the documentation using your editor's search
3. Check the [TODO.md](TODO.md) to see if it's planned
4. Review relevant technical docs (BRD, FRD, TRD)
5. Contact the development team

---

**Last Updated**: 2025-01-20  
**Maintained by**: Summit2Shore Development Team
