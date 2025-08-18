# Use Node.js 24 Debian as base image for better DevContainer compatibility
FROM node:24.6.0-bullseye AS dev_containers_target_stage

# Update package lists and install additional development tools
RUN apt-get update && apt-get install -y \
    git \
    bash \
    curl \
    wget \
    vim \
    nano \
    openssh-client \
    ca-certificates \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory (DevContainer will override this)
WORKDIR /workspaces

# Create a non-root user and add to sudo group
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs && \
    echo 'nextjs ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Install global development tools
RUN npm install -g \
    typescript \
    ts-node \
    nodemon \
    @next/codemod \
    prisma \
    create-next-app \
    vercel \
    eslint \
    prettier

# Set up shell configuration
RUN mkdir -p /home/nextjs && \
    echo 'alias ll="ls -la"' > /home/nextjs/.bashrc && \
    echo 'alias la="ls -la"' >> /home/nextjs/.bashrc && \
    echo 'alias ..="cd .."' >> /home/nextjs/.bashrc && \
    echo 'alias ...="cd ../.."' >> /home/nextjs/.bashrc && \
    echo 'alias npmls="npm ls --depth=0"' >> /home/nextjs/.bashrc && \
    echo 'alias npmg="npm list -g --depth=0"' >> /home/nextjs/.bashrc && \
    chown -R nextjs:nodejs /home/nextjs

# Set environment variables for development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Create directories with proper permissions
RUN mkdir -p /workspaces && \
    chown -R nextjs:nodejs /workspaces && \
    chmod -R 755 /workspaces

# Switch to non-root user
USER nextjs

# Set default shell to bash
SHELL ["/bin/bash", "-c"]
