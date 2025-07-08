# DevContainer Troubleshooting Summary

## Issues Fixed

### 1. **Base Image Compatibility**
- **Problem**: Alpine Linux base image caused conflicts with DevContainer features
- **Solution**: Switched to `node:20-bullseye` (Debian-based) for better compatibility

### 2. **User Creation Commands**
- **Problem**: Alpine-specific user creation commands (`addgroup -S`, `adduser -S`) failed on Debian
- **Solution**: Updated to Debian commands (`groupadd`, `useradd`) with proper flags

### 3. **Package Installation**
- **Problem**: `apk` package manager commands don't work on Debian
- **Solution**: Switched to `apt-get` with proper cleanup (`rm -rf /var/lib/apt/lists/*`)

### 4. **DevContainer Features Conflicts**
- **Problem**: Multiple features conflicting during build
- **Solution**: Simplified to only essential features (`git:1`)

### 5. **Build Target Specification**
- **Problem**: DevContainer build system expecting specific target stage
- **Solution**: Added `AS dev_containers_target_stage` to FROM instruction

### 6. **Workspace Folder Configuration**
- **Problem**: `postCreateCommand` failed because `package.json` not found in `/workspace`
- **Solution**: Use `${containerWorkspaceFolder}` variable for mounts and let DevContainer handle workspace location automatically

### 7. **File Mounting Issues**
- **Problem**: Git repository files not visible in DevContainer
- **Solution**: Switched from custom Dockerfile to standard Microsoft DevContainer image with features for better workspace mounting

### 8. **npm Permission Issues**
- **Problem**: `EACCES: permission denied` when running `npm install` in postCreateCommand
- **Solution**: Removed volume mount for node_modules to avoid permission conflicts between host and container

## Current Configuration

### DevContainer.json
- Base image: `mcr.microsoft.com/devcontainers/typescript-node:20-bullseye`
- Features: git, github-cli
- User: `node` (default from base image)
- Workspace: `/workspaces/${localWorkspaceFolderBasename}`
- Ports: 3000, 3001, 5000, 5555, 8080
- Volume mount: none (to avoid permission issues)
- OnCreate: Install global dev tools
- PostCreate: npm install

### Tools Installed
- Global packages: typescript, ts-node, nodemon, prisma, vercel, etc.
- Pre-configured VS Code extensions for Next.js development
- Git and GitHub CLI integration

## Testing
Run `./validate-devcontainer.sh` to verify setup before opening in VS Code.

## Next Steps
1. Open VS Code in project directory
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Dev Containers: Reopen in Container"
4. Wait for container to build and VS Code to reopen
