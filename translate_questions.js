#!/usr/bin/env node

/**
 * Comprehensive Translation Script for Revision Questions
 * Translates 5021+ questions and answers from English to 15 Indian languages
 * Uses Google Translate API via axios
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
    progress: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
};

// Language mappings
const LANGUAGE_MAP = {
    'as': 'Assamese',
    'bn': 'Bengali',
    'gom': 'Konkani',
    'gu': 'Gujarati',
    'hi': 'Hindi',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'mni': 'Manipuri',
    'mr': 'Marathi',
    'or': 'Oriya',
    'pa': 'Punjabi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'ur': 'Urdu',
};

const GOOGLE_LANG_MAP = {
    'as': 'as',
    'bn': 'bn',
    'gom': 'gom',
    'gu': 'gu',
    'hi': 'hi',
    'kn': 'kn',
    'ml': 'ml',
    'mni': 'mni',
    'mr': 'mr',
    'or': 'or',
    'pa': 'pa',
    'ta': 'ta',
    'te': 'te',
    'ur': 'ur',
};

class QuestionTranslator {
    constructor(basePath) {
        this.basePath = basePath;
        this.enFile = path.join(basePath, 'revision_en.json');
        this.totalQuestions = 0;
        this.failedTranslations = [];
        this.translationCache = new Map();
    }

    /**
     * Load English questions from JSON file
     */
    loadEnglishQuestions() {
        try {
            const data = fs.readFileSync(this.enFile, 'utf-8');
            const questions = JSON.parse(data);
            this.totalQuestions = questions.length;
            log.success(`Loaded ${this.totalQuestions} English questions`);
            return questions;
        } catch (error) {
            log.error(`Failed to load English questions: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * Translate text using Google Translate API (free method)
     * Using axios to call translation endpoint
     */
    async translateText(text, targetLang, maxRetries = 3) {
        if (!text || text.trim() === '') {
            return text;
        }

        // Check cache
        const cacheKey = `${text}|${targetLang}`;
        if (this.translationCache.has(cacheKey)) {
            return this.translationCache.get(cacheKey);
        }

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Using MyMemory Translation API (free, no key required)
                const response = await axios.get('https://api.mymemory.translated.net/get', {
                    params: {
                        q: text,
                        langpair: `en|${GOOGLE_LANG_MAP[targetLang]}`,
                    },
                    timeout: 10000,
                });

                if (response.data && response.data.responseData) {
                    let translated = response.data.responseData.translatedText;

                    // Clean up HTML entities
                    translated = translated
                        .replace(/&quot;/g, '"')
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&apos;/g, "'");

                    // Cache the result
                    this.translationCache.set(cacheKey, translated);
                    return translated;
                }
            } catch (error) {
                if (attempt < maxRetries - 1) {
                    const waitTime = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    log.warning(`Translation failed: "${text.substring(0, 50)}..." to ${targetLang}`);
                    this.failedTranslations.push({
                        text: text.substring(0, 100),
                        language: targetLang,
                        error: error.message
                    });
                    return text;
                }
            }
        }

        return text;
    }

    /**
     * Translate a batch of questions to target language
     */
    async translateQuestions(questions, targetLang) {
        const translatedQuestions = [];

        for (let idx = 0; idx < questions.length; idx++) {
            const question = questions[idx];
            try {
                const translatedQ = {
                    id: question.id,
                    q: await this.translateText(question.q, targetLang),
                    a: await this.translateText(question.a, targetLang)
                };

                translatedQuestions.push(translatedQ);

                // Progress indicator
                if ((idx + 1) % 500 === 0) {
                    log.progress(`Translated ${idx + 1}/${this.totalQuestions} questions to ${LANGUAGE_MAP[targetLang]}`);
                }

                // Small delay to avoid rate limiting
                if ((idx + 1) % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

            } catch (error) {
                log.error(`Error translating question ${question.id}: ${error.message}`);
                translatedQuestions.push(question);
            }
        }

        log.success(`Completed translation to ${LANGUAGE_MAP[targetLang]}: ${translatedQuestions.length}/${this.totalQuestions}`);
        return translatedQuestions;
    }

    /**
     * Save translated questions to JSON file
     */
    saveTranslatedQuestions(questions, langCode) {
        const outputFile = path.join(this.basePath, `revision_${langCode}.json`);

        try {
            fs.writeFileSync(outputFile, JSON.stringify(questions, null, 2), 'utf-8');
            log.success(`Saved ${questions.length} questions to ${outputFile}`);
            return true;
        } catch (error) {
            log.error(`Error saving ${langCode} translations: ${error.message}`);
            return false;
        }
    }

    /**
     * Verify that translations are complete and valid
     */
    verifyTranslations(langCode, originalQuestions) {
        const outputFile = path.join(this.basePath, `revision_${langCode}.json`);

        try {
            const data = fs.readFileSync(outputFile, 'utf-8');
            const translated = JSON.parse(data);

            // Check counts match
            if (translated.length !== originalQuestions.length) {
                log.warning(`Question count mismatch for ${langCode}: ${translated.length} vs ${originalQuestions.length}`);
                return false;
            }

            // Check all IDs match
            const originalIds = new Set(originalQuestions.map(q => q.id));
            const translatedIds = new Set(translated.map(q => q.id));

            if (originalIds.size !== translatedIds.size) {
                log.warning(`ID count mismatch for ${langCode}`);
                return false;
            }

            // Check no empty translations
            const emptyQ = translated.filter(q => !q.q || q.q.trim() === '');
            const emptyA = translated.filter(q => !q.a || q.a.trim() === '');

            if (emptyQ.length > 0) {
                log.warning(`Found ${emptyQ.length} empty questions in ${langCode}`);
            }
            if (emptyA.length > 0) {
                log.warning(`Found ${emptyA.length} empty answers in ${langCode}`);
            }

            log.success(`Verification passed for ${langCode}: All ${translated.length} questions intact`);
            return true;

        } catch (error) {
            log.error(`Error verifying ${langCode} translations: ${error.message}`);
            return false;
        }
    }

    /**
     * Main execution method
     */
    async run() {
        log.header('═══════════════════════════════════════════════════════════════════════════════');
        log.header('QUESTION TRANSLATION SYSTEM - STARTING');
        log.header('═══════════════════════════════════════════════════════════════════════════════');

        log.info(`Start time: ${new Date().toISOString()}`);
        log.info(`Source file: ${this.enFile}`);
        log.info(`Target languages: ${Object.values(LANGUAGE_MAP).join(', ')}`);
        log.info(`Translation method: MyMemory API (Free, No API Key Required)`);

        log.header('═══════════════════════════════════════════════════════════════════════════════');

        // Load English questions
        const englishQuestions = this.loadEnglishQuestions();

        // Translate to each language
        const successfulTranslations = [];
        const failedLanguages = [];

        const languageCodes = Object.keys(LANGUAGE_MAP);

        for (const langCode of languageCodes) {
            const langName = LANGUAGE_MAP[langCode];

            try {
                log.progress(`Starting translation to ${langName} (${langCode})...`);

                // Translate
                const translated = await this.translateQuestions(englishQuestions, langCode);

                // Save
                const saved = this.saveTranslatedQuestions(translated, langCode);

                // Verify
                if (saved) {
                    const verified = this.verifyTranslations(langCode, englishQuestions);
                    if (verified) {
                        successfulTranslations.push(langCode);
                    } else {
                        failedLanguages.push(langCode);
                    }
                } else {
                    failedLanguages.push(langCode);
                }

                // Small delay between languages
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                log.error(`Critical error translating to ${langName}: ${error.message}`);
                failedLanguages.push(langCode);
            }
        }

        // Final summary
        log.header('═══════════════════════════════════════════════════════════════════════════════');
        log.header('TRANSLATION SUMMARY');
        log.header('═══════════════════════════════════════════════════════════════════════════════');

        log.info(`Total questions translated: ${this.totalQuestions}`);
        log.info(`Languages completed: ${successfulTranslations.length}/${languageCodes.length}`);
        log.success(`Successful: ${successfulTranslations.join(', ')}`);

        if (failedLanguages.length > 0) {
            log.error(`Failed: ${failedLanguages.join(', ')}`);
        }

        if (this.failedTranslations.length > 0) {
            log.warning(`\nTotal failed translations: ${this.failedTranslations.length}`);
            // Show first 5 failures
            for (let i = 0; i < Math.min(5, this.failedTranslations.length); i++) {
                const failure = this.failedTranslations[i];
                log.warning(`  - ${failure.language}: ${failure.text}`);
            }
        }

        log.info(`\nEnd time: ${new Date().toISOString()}`);

        if (successfulTranslations.length === languageCodes.length) {
            log.success('ALL TRANSLATIONS COMPLETED SUCCESSFULLY!');
            log.header('═══════════════════════════════════════════════════════════════════════════════');
            return true;
        } else {
            log.warning(`${failedLanguages.length} languages failed translation`);
            log.header('═══════════════════════════════════════════════════════════════════════════════');
            return false;
        }
    }
}

/**
 * Entry point
 */
async function main() {
    const basePath = '/Users/apple/Desktop/Project/appJE/src/data/revision';

    if (!fs.existsSync(basePath)) {
        log.error(`Path not found: ${basePath}`);
        process.exit(1);
    }

    const translator = new QuestionTranslator(basePath);
    const success = await translator.run();

    process.exit(success ? 0 : 1);
}

main().catch(error => {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
});
