#!/bin/bash
# Batch Translation Script for Question Database
# Simple wrapper to run the translation with proper setup

set -e

PROJECT_DIR="/Users/apple/Desktop/Project/appJE"
REVISION_DIR="$PROJECT_DIR/src/data/revision"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$REVISION_DIR/backups_$TIMESTAMP"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     QUESTION TRANSLATION SYSTEM - BATCH EXECUTION              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Project Directory: $PROJECT_DIR"
echo "📁 Revision Directory: $REVISION_DIR"
echo ""

# Check if revision_en.json exists
if [ ! -f "$REVISION_DIR/revision_en.json" ]; then
    echo "❌ Error: revision_en.json not found in $REVISION_DIR"
    exit 1
fi

# Count questions
QUESTION_COUNT=$(python3 -c "import json; print(len(json.load(open('$REVISION_DIR/revision_en.json'))))" 2>/dev/null || echo "unknown")
echo "📊 English Questions Found: $QUESTION_COUNT"
echo ""

# Create backup
echo "🔄 Creating backup of existing translation files..."
mkdir -p "$BACKUP_DIR"
cp "$REVISION_DIR"/revision_*.json "$BACKUP_DIR"/ 2>/dev/null || true
echo "✓ Backup created at: $BACKUP_DIR"
echo ""

# Choose translation method
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          SELECT TRANSLATION METHOD                             ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║ [1] Python Optimized (Recommended - Fastest, Multi-threaded)   ║"
echo "║ [2] Python Standard (Reliable, Single-threaded)                ║"
echo "║ [3] JavaScript (No Python needed, Uses Free API)               ║"
echo "║ [0] Cancel                                                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
read -p "Enter choice (0-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting Optimized Python Translation..."
        echo "⏱️  Estimated time: 20-40 minutes for $QUESTION_COUNT questions"
        echo ""
        python3 "$PROJECT_DIR/translate_questions_optimized.py"
        ;;
    2)
        echo ""
        echo "🚀 Starting Standard Python Translation..."
        echo "⏱️  Estimated time: 40-60 minutes for $QUESTION_COUNT questions"
        echo ""
        python3 "$PROJECT_DIR/translate_questions.py"
        ;;
    3)
        echo ""
        echo "🚀 Starting JavaScript Translation..."
        echo "⏱️  Estimated time: 40-90 minutes for $QUESTION_COUNT questions"
        echo ""
        
        # Check if axios is installed
        if ! npm list axios &>/dev/null; then
            echo "📦 Installing axios..."
            npm install axios --quiet
        fi
        
        node "$PROJECT_DIR/translate_questions.js"
        ;;
    0)
        echo "❌ Translation cancelled"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              TRANSLATION PROCESS COMPLETE                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verify results
echo "📋 Verification Results:"
echo ""

cd "$REVISION_DIR"
TOTAL_FILES=$(ls -1 revision_*.json | wc -l)
echo "✓ Translation files created: $TOTAL_FILES"
echo ""

echo "File sizes:"
ls -lh revision_*.json | awk '{print "  " $9 ": " $5}'
echo ""

# Count questions in each file
echo "Question counts per language:"
for file in revision_*.json; do
    COUNT=$(python3 -c "import json; print(len(json.load(open('$file'))))" 2>/dev/null)
    LANG=$(echo "$file" | sed 's/revision_//' | sed 's/.json//')
    printf "  %-4s: %5d questions\n" "$LANG" "$COUNT"
done

echo ""
echo "✓ Translation completed successfully!"
echo "✓ Backup saved at: $BACKUP_DIR"
echo ""
echo "📖 Check TRANSLATION_GUIDE.md for next steps"
echo "📊 View detailed logs: tail -100 translation_log.txt"
