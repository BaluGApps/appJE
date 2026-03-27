# Question Translation Guide

This guide explains how to translate your 5021+ revision questions from English to 15 Indian languages.

## Overview

Two scripts are provided for translating questions:

1. **Python Script** (`translate_questions.py`) - Recommended for production use
2. **JavaScript Script** (`translate_questions.js`) - Alternative option

## Languages Supported

- **as** - Assamese
- **bn** - Bengali
- **gom** - Konkani (Goan)
- **gu** - Gujarati
- **hi** - Hindi
- **kn** - Kannada
- **ml** - Malayalam
- **mni** - Manipuri (Meitei)
- **mr** - Marathi
- **or** - Oriya (Odia)
- **pa** - Punjabi
- **ta** - Tamil
- **te** - Telugu
- **ur** - Urdu

## Data Structure

Both scripts work with JSON files in this format:

```json
[
  {
    "id": "r1",
    "q": "Question text in English",
    "a": "Answer text in English"
  }
]
```

## Option 1: Python Script (Recommended)

### Prerequisites

Python 3.7 or higher

### Setup

```bash
cd /Users/apple/Desktop/Project/appJE

# Install dependencies
pip install -r requirements.txt
```

### Google Cloud Credentials (For High Volume)

For production use with Google Cloud Translate:

1. Create a Google Cloud project
2. Enable the Translate API
3. Create a service account and download JSON key
4. Set environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

### Run Translation

```bash
python3 translate_questions.py
```

### Output

- Translated files will be created as `revision_[lang_code].json`
- Log file: `translation_log.txt`
- Summary will display on screen

## Option 2: JavaScript Script (No Credentials Needed)

### Prerequisites

- Node.js 14+ installed
- npm or yarn

### Setup

```bash
cd /Users/apple/Desktop/Project/appJE

# Install dependencies
npm install axios
# or
yarn add axios
```

### Run Translation

```bash
node translate_questions.js
```

### Features

- Uses **MyMemory Translation API** (free, no credentials needed)
- Automatic rate limiting
- Built-in retry mechanism
- Progress tracking for every 500 questions
- Colored console output
- Automatic caching to avoid duplicate translations

### Output

- Translated files will be created as `revision_[lang_code].json`
- Summary will display on screen with color-coded messages

## Script Features

### Quality Assurance

Both scripts include:

1. **Validation**: Ensures all questions are translated
2. **Verification**: Checks that all IDs match between original and translated
3. **Empty Check**: Detects any missing questions or answers
4. **Logging**: Detailed logs of all operations and errors
5. **Retry Logic**: Automatic retries with exponential backoff

### Performance

- **Python Script**: ~200-500 questions/minute (depending on API)
- **JavaScript Script**: ~100-300 questions/minute (free API)
- **Total Time for 5021 questions**: 30-60 minutes

### Error Handling

- Individual translation failures don't stop the process
- Failed items are logged for manual review
- Incomplete translations are reported at the end

## Troubleshooting

### Python Script Issues

**"Google Cloud Translate not available"**
- Install: `pip install google-cloud-translate`
- Set credentials: `export GOOGLE_APPLICATION_CREDENTIALS="..."`

**Rate Limiting Errors**
- Script automatically handles with exponential backoff
- Reduce request rate by modifying sleep intervals

### JavaScript Script Issues

**"axios is not installed"**
- Run: `npm install axios`

**Translation API Timeouts**
- Script includes 10-second timeout with retries
- If persistent, switch to Python script with official Google API

## Verification Steps

After translation completes:

1. Check created files:
   ```bash
   ls -lah /Users/apple/Desktop/Project/appJE/src/data/revision/revision_*.json
   ```

2. Verify file sizes are reasonable (should be similar to `revision_en.json`)

3. Check logs for any errors:
   ```bash
   tail -50 translation_log.txt  # For Python
   ```

4. Sample a translated file:
   ```bash
   head -50 /Users/apple/Desktop/Project/appJE/src/data/revision/revision_hi.json
   ```

5. Compare question counts:
   ```bash
   python3 -c "import json; print(len(json.load(open('/Users/apple/Desktop/Project/appJE/src/data/revision/revision_hi.json'))))"
   ```

## Manual Review

For high-quality assurance, randomly sample some translations:

1. **Open** `revision_hi.json`, `revision_ta.json`, etc.
2. **Compare** 10-20 random questions with English version
3. **Report** any inaccuracies

Note: Automated translation may have minor grammatical variations but should capture meaning accurately.

## Next Steps

1. **Commit Changes**: Git commit all new translation files
2. **Test in App**: Load translations in your app to verify display
3. **User Testing**: Have native speakers review sample translations
4. **Feedback Loop**: Identify common mistranslations and batch-correct

## Commands Reference

### Quick Start (JavaScript - Easiest)
```bash
cd /Users/apple/Desktop/Project/appJE
npm install axios
node translate_questions.js
```

### Production (Python - Most Reliable)
```bash
cd /Users/apple/Desktop/Project/appJE
pip install -r requirements.txt
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
python3 translate_questions.py
```

### Check Results
```bash
ls -1 /Users/apple/Desktop/Project/appJE/src/data/revision/revision_*.json | wc -l
# Should show 15 (one for each language including English)
```

## FAQ

**Q: Will this overwrite existing translation files?**
A: Yes. Back up existing files first if you want to preserve them.

**Q: Can I run both scripts simultaneously?**
A: Not recommended. They may cause rate limiting issues.

**Q: What if a translation is incorrect?**
A: Log will show failed translations. You can manually edit those entries.

**Q: How long will it take for 5021 questions?**
A: Approximately 30-60 minutes depending on API and internet speed.

**Q: Can I pause and resume?**
A: Currently, no. Scripts process all questions in one run.

**Q: What if internet disconnects?**
A: Retries are automatic. If complete failure occurs, script will stop and report.

---

**Support**: Check `translation_log.txt` for detailed error messages and contact support with log file if issues persist.
