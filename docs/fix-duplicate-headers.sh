#!/bin/bash

# Script to remove duplicate headers from HTML pages

cd /Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-eds

echo "Fixing duplicate headers..."

# Function to find and delete duplicate header
fix_duplicate() {
  local file=$1
  local start_pattern="header-top-links"
  
  # Find the second occurrence of header-top-links and the line before actual page content
  local first_line=$(grep -n "$start_pattern" "$file" | head -1 | cut -d: -f1)
  local second_line=$(grep -n "$start_pattern" "$file" | tail -1 | cut -d: -f1)
  
  if [ "$first_line" != "$second_line" ]; then
    echo "  $file: Found duplicate at line $second_line"
    
    # Find where duplicate ends (look for breadcrumbs or main content)
    local end_line=$(awk -v start="$second_line" 'NR>start && /<!-- Breadcrumbs|<section|<div class="page-|<div class="container/ {print NR-1; exit}' "$file")
    
    if [ -n "$end_line" ] && [ "$end_line" -gt "$second_line" ]; then
      # Find the actual start of duplicate (a few lines before header-top-links, after first header closes)
      local delete_start=$((second_line - 2))
      echo "    Deleting lines $delete_start to $end_line"
      
      # Create backup
      cp "$file" "$file.backup"
      
      # Delete the duplicate lines
      sed -i.tmp "${delete_start},${end_line}d" "$file"
      rm "$file.tmp"
      
      echo "    ✓ Fixed!"
    else
      echo "    ✗ Could not determine end line"
    fi
  else
    echo "  $file: No duplicate found"
  fi
}

# Fix all affected files
fix_duplicate "pages/account.html"
fix_duplicate "pages/cart.html"
fix_duplicate "pages/login.html"
fix_duplicate "pages/order-history.html"
fix_duplicate "pages/product-detail.html"
fix_duplicate "pages/project-selector.html"

echo ""
echo "Done! Backup files created with .backup extension"

