#!/bin/bash

# Define old and new names
OLD_NAMES=("tball" "tballpay" "tball-pay" "TBALL" "TBall")
NEW_NAME="nyxpay"

# 1. Replace text content in files
echo "🔁 Replacing identifiers inside files..."
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.json" -o -name "*.md" -o -name "*.html" -o -name "*.css" \) | while read -r file; do
  for OLD in "${OLD_NAMES[@]}"; do
    if grep -qi "$OLD" "$file"; then
      sed -i.bak "s/$OLD/$NEW_NAME/gI" "$file" && rm "$file.bak"
      echo "✅ Updated: $file"
    fi
  done
done

# 2. Rename files and directories
echo "📁 Renaming files and folders..."
find . -depth | while read -r path; do
  for OLD in "${OLD_NAMES[@]}"; do
    basename=$(basename "$path")
    dirname=$(dirname "$path")
    if [[ "$basename" =~ $OLD ]]; then
      newbase=$(echo "$basename" | sed "s/$OLD/$NEW_NAME/I")
      newpath="$dirname/$newbase"
      mv "$path" "$newpath"
      echo "📦 Renamed: $path → $newpath"
      break
    fi
  done
done

echo "🎉 Rebrand complete."
