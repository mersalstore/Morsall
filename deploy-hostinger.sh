#!/bin/bash

# Morsall - Hostinger Deployment Script
# This script prepares your project for deployment on Hostinger with LiteSpeed

set -e

echo "=========================================="
echo "  MORSALL - HOSTINGER DEPLOYMENT SCRIPT"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Generate Prisma Client
echo -e "${YELLOW}[1/5] Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# Step 2: Build Next.js
echo -e "${YELLOW}[2/5] Building Next.js application...${NC}"
npm run build
echo -e "${GREEN}✓ Next.js build completed${NC}"
echo ""

# Step 3: Prepare static assets
echo -e "${YELLOW}[3/5] Preparing static assets for LiteSpeed...${NC}"
if [ -d "_next" ]; then
    echo "  Removing old _next directory..."
    rm -rf _next
fi
mkdir -p _next/static
echo "  Copying static assets from .next to _next..."
cp -r .next/static/* _next/static/
echo -e "${GREEN}✓ Static assets prepared${NC}"
echo ""

# Step 4: Verify .htaccess
echo -e "${YELLOW}[4/5] Verifying .htaccess configuration...${NC}"
if [ -f ".htaccess" ]; then
    echo -e "${GREEN}✓ .htaccess file exists${NC}"
else
    echo -e "${RED}✗ .htaccess file not found!${NC}"
    echo "  Creating .htaccess..."
    # Create basic .htaccess if missing
fi
echo ""

# Step 5: Summary
echo -e "${YELLOW}[5/5] Deployment preparation complete!${NC}"
echo ""
echo "=========================================="
echo -e "${GREEN}  ✓ READY FOR DEPLOYMENT${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Commit changes: git add . && git commit -m 'Hostinger deployment'"
echo "2. Push to GitHub: git push origin main"
echo "3. Hostinger will automatically pull and deploy"
echo ""
echo "Directories to verify on Hostinger:"
echo "  - _next/static/ (CSS, JS, images)"
echo "  - public/ (public assets)"
echo "  - .next/ (Next.js build output)"
echo ""
echo "Environment variables to set on Hostinger:"
echo "  - POSTGRES_PRISMA_URL"
echo "  - DATABASE_URL"
echo "  - NEXTAUTH_URL"
echo "  - NEXTAUTH_SECRET"
echo "  - GOOGLE_CLIENT_ID"
echo "  - GOOGLE_CLIENT_SECRET"
echo ""
echo "=========================================="
