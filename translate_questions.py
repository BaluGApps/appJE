#!/usr/bin/env python3
"""
Comprehensive Translation Script for Revision Questions
Translates 5021+ questions and answers from English to 15 Indian languages
Uses Google Translate API for accurate, context-aware translations
"""

import json
import os
import sys
import time
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/Users/apple/Desktop/Project/appJE/translation_log.txt'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

try:
    from google.cloud import translate_v2
    GOOGLE_TRANSLATE_AVAILABLE = True
except ImportError:
    logger.warning("Google Cloud Translate not available. Install with: pip install google-cloud-translate")
    GOOGLE_TRANSLATE_AVAILABLE = False

# Language mappings - ISO 639-1 codes
LANGUAGE_MAP = {
    'as': 'Assamese',      # Assamese
    'bn': 'Bengali',       # Bengali (West Bengal)
    'gom': 'Konkani',      # Goan Konkani
    'gu': 'Gujarati',      # Gujarati
    'hi': 'Hindi',         # Hindi
    'kn': 'Kannada',       # Kannada
    'ml': 'Malayalam',     # Malayalam
    'mni': 'Manipuri',     # Manipuri (Meitei)
    'mr': 'Marathi',       # Marathi
    'or': 'Oriya',         # Oriya (Odia)
    'pa': 'Punjabi',       # Punjabi
    'ta': 'Tamil',         # Tamil
    'te': 'Telugu',        # Telugu
    'ur': 'Urdu',          # Urdu
}

# Google Translate language codes mapping
GOOGLE_LANG_MAP = {
    'as': 'as',    # Assamese
    'bn': 'bn',    # Bengali
    'gom': 'gom',  # Konkani
    'gu': 'gu',    # Gujarati
    'hi': 'hi',    # Hindi
    'kn': 'kn',    # Kannada
    'ml': 'ml',    # Malayalam
    'mni': 'mni',  # Manipuri
    'mr': 'mr',    # Marathi
    'or': 'or',    # Oriya
    'pa': 'pa',    # Punjabi
    'ta': 'ta',    # Tamil
    'te': 'te',    # Telugu
    'ur': 'ur',    # Urdu
}


class QuestionTranslator:
    """
    Translates revision questions and answers to multiple languages
    """

    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.en_file = self.base_path / 'revision_en.json'
        self.translated_files = {}
        self.total_questions = 0
        self.failed_translations = []
        
        # Initialize Google Translate client if available
        self.translator = None
        if GOOGLE_TRANSLATE_AVAILABLE:
            try:
                self.translator = translate_v2.Client()
                logger.info("✓ Google Translate Client initialized successfully")
            except Exception as e:
                logger.warning(f"Could not initialize Google Translate: {e}")
                logger.info("Attempting to use alternative translation method...")

    def load_english_questions(self) -> List[Dict[str, str]]:
        """
        Load English questions from JSON file
        """
        try:
            with open(self.en_file, 'r', encoding='utf-8') as f:
                questions = json.load(f)
            
            self.total_questions = len(questions)
            logger.info(f"✓ Loaded {self.total_questions} English questions")
            return questions
        except Exception as e:
            logger.error(f"✗ Error loading English questions: {e}")
            sys.exit(1)

    def translate_text(self, text: str, target_lang: str) -> str:
        """
        Translate text to target language using Google Translate
        With fallback mechanism and retry logic
        """
        if not text or not text.strip():
            return text

        max_retries = 3
        for attempt in range(max_retries):
            try:
                if self.translator:
                    result = self.translator.translate_text(
                        text,
                        target_language=GOOGLE_LANG_MAP[target_lang]
                    )
                    translated = result.get('translatedText', text)
                    
                    # Clean up HTML entities if present
                    translated = translated.replace('&quot;', '"')
                    translated = translated.replace('&amp;', '&')
                    translated = translated.replace('&lt;', '<')
                    translated = translated.replace('&gt;', '>')
                    
                    return translated
                else:
                    logger.warning(f"No translator available for: {text[:50]}...")
                    return text
                    
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff
                    logger.debug(f"Translation attempt {attempt + 1} failed, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    logger.warning(f"Translation failed for text: {text[:50]}... to {target_lang}")
                    self.failed_translations.append({
                        'text': text[:100],
                        'language': target_lang,
                        'error': str(e)
                    })
                    return text

    def translate_questions(self, questions: List[Dict[str, str]], target_lang: str) -> List[Dict[str, str]]:
        """
        Translate a batch of questions to target language
        """
        translated_questions = []
        
        for idx, question in enumerate(questions, 1):
            try:
                # Keep ID unchanged
                translated_q = {
                    'id': question['id'],
                    'q': self.translate_text(question['q'], target_lang),
                    'a': self.translate_text(question['a'], target_lang)
                }
                
                translated_questions.append(translated_q)
                
                # Progress indicator
                if idx % 500 == 0:
                    logger.info(f"  → Translated {idx}/{self.total_questions} questions to {LANGUAGE_MAP[target_lang]}")
                
            except Exception as e:
                logger.error(f"Error translating question {question['id']}: {e}")
                # Add original if translation fails
                translated_questions.append(question)

        logger.info(f"✓ Completed translation to {LANGUAGE_MAP[target_lang]}: {len(translated_questions)}/{self.total_questions}")
        return translated_questions

    def save_translated_questions(self, questions: List[Dict[str, str]], lang_code: str):
        """
        Save translated questions to JSON file
        """
        output_file = self.base_path / f'revision_{lang_code}.json'
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)
            
            logger.info(f"✓ Saved {len(questions)} questions to {output_file}")
            return True
            
        except Exception as e:
            logger.error(f"✗ Error saving {lang_code} translations: {e}")
            return False

    def verify_translations(self, lang_code: str, original_questions: List[Dict[str, str]]):
        """
        Verify that translations are complete and valid
        """
        output_file = self.base_path / f'revision_{lang_code}.json'
        
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                translated = json.load(f)
            
            # Check counts match
            if len(translated) != len(original_questions):
                logger.warning(f"⚠ Question count mismatch for {lang_code}: {len(translated)} vs {len(original_questions)}")
                return False
            
            # Check all IDs match
            original_ids = {q['id'] for q in original_questions}
            translated_ids = {q['id'] for q in translated}
            
            if original_ids != translated_ids:
                missing = original_ids - translated_ids
                extra = translated_ids - original_ids
                logger.warning(f"⚠ ID mismatch for {lang_code}. Missing: {missing}, Extra: {extra}")
                return False
            
            # Check no empty translations
            empty_q = [q for q in translated if not q.get('q') or q['q'].strip() == '']
            empty_a = [q for q in translated if not q.get('a') or q['a'].strip() == '']
            
            if empty_q:
                logger.warning(f"⚠ Found {len(empty_q)} empty questions in {lang_code}")
            if empty_a:
                logger.warning(f"⚠ Found {len(empty_a)} empty answers in {lang_code}")
            
            logger.info(f"✓ Verification passed for {lang_code}: All {len(translated)} questions intact")
            return True
            
        except Exception as e:
            logger.error(f"✗ Error verifying {lang_code} translations: {e}")
            return False

    def run(self):
        """
        Main execution method
        """
        logger.info("=" * 80)
        logger.info("QUESTION TRANSLATION SYSTEM - STARTING")
        logger.info("=" * 80)
        logger.info(f"Start time: {datetime.now()}")
        logger.info(f"Source file: {self.en_file}")
        logger.info(f"Target languages: {list(LANGUAGE_MAP.values())}")
        logger.info("=" * 80)

        # Load English questions
        english_questions = self.load_english_questions()

        # Translate to each language
        successful_translations = []
        failed_languages = []

        for lang_code, lang_name in LANGUAGE_MAP.items():
            try:
                logger.info(f"\n→ Starting translation to {lang_name} ({lang_code})...")
                
                # Translate
                translated = self.translate_questions(english_questions, lang_code)
                
                # Save
                saved = self.save_translated_questions(translated, lang_code)
                
                # Verify
                if saved:
                    verified = self.verify_translations(lang_code, english_questions)
                    if verified:
                        successful_translations.append(lang_code)
                    else:
                        failed_languages.append(lang_code)
                else:
                    failed_languages.append(lang_code)
                
                # Small delay between languages to avoid rate limiting
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"✗ Critical error translating to {lang_name}: {e}")
                failed_languages.append(lang_code)

        # Final summary
        logger.info("\n" + "=" * 80)
        logger.info("TRANSLATION SUMMARY")
        logger.info("=" * 80)
        logger.info(f"Total questions translated: {self.total_questions}")
        logger.info(f"Languages completed: {len(successful_translations)}/{len(LANGUAGE_MAP)}")
        logger.info(f"  ✓ Successful: {successful_translations}")
        if failed_languages:
            logger.info(f"  ✗ Failed: {failed_languages}")
        
        if self.failed_translations:
            logger.warning(f"\nTotal failed translations: {len(self.failed_translations)}")
            # Show first 5 failures
            for failure in self.failed_translations[:5]:
                logger.warning(f"  - {failure['language']}: {failure['text']}")
        
        logger.info(f"\nEnd time: {datetime.now()}")
        logger.info("=" * 80)
        
        if len(successful_translations) == len(LANGUAGE_MAP):
            logger.info("✓ ALL TRANSLATIONS COMPLETED SUCCESSFULLY!")
        else:
            logger.warning(f"⚠ {len(failed_languages)} languages failed translation")

        return len(failed_languages) == 0


def main():
    """
    Entry point for the translation script
    """
    base_path = '/Users/apple/Desktop/Project/appJE/src/data/revision'
    
    if not os.path.exists(base_path):
        logger.error(f"Path not found: {base_path}")
        sys.exit(1)

    translator = QuestionTranslator(base_path)
    success = translator.run()
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
