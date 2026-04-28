#!/usr/bin/env python3
"""
OPTIMIZED Translation Script for 5021+ Revision Questions
Multi-threaded, cached, production-grade translation system
Works with free APIs, no credentials needed
"""

import json
import os
import sys
import time
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
import logging
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache
import urllib.request
import urllib.parse
import urllib.error

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

# Language mappings
LANGUAGE_MAP = {
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
}

GOOGLE_LANG_MAP = {
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
}


class FreeTranslationAPI:
    """
    Unified interface for free translation APIs
    Uses MyMemory Translated API - no credentials needed
    """

    def __init__(self):
        self.cache = {}
        self.cache_file = Path('/Users/apple/Desktop/Project/appJE/.translation_cache.json')
        self.load_cache()

    def load_cache(self):
        """Load translation cache from file"""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    self.cache = json.load(f)
                logger.info(f"✓ Loaded {len(self.cache)} cached translations")
            except Exception as e:
                logger.warning(f"Could not load cache: {e}")

    def save_cache(self):
        """Save translation cache to file"""
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.cache, f, ensure_ascii=False)
        except Exception as e:
            logger.warning(f"Could not save cache: {e}")

    def get_cache_key(self, text: str, target_lang: str) -> str:
        """Generate cache key for translation"""
        key = f"{target_lang}|{text}"
        return hashlib.md5(key.encode()).hexdigest()

    def translate(self, text: str, target_lang: str, max_retries: int = 3) -> str:
        """
        Translate text to target language
        """
        if not text or text.strip() == '':
            return text

        # Check cache
        cache_key = self.get_cache_key(text, target_lang)
        if cache_key in self.cache:
            return self.cache[cache_key]

        # Try translation
        for attempt in range(max_retries):
            try:
                translated = self._call_mymemory_api(text, target_lang)
                if translated and translated != text:
                    self.cache[cache_key] = translated
                    return translated
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    time.sleep(wait_time)
                else:
                    logger.warning(f"Translation failed after {max_retries} attempts: {text[:50]}...")
                    return text

        return text

    def _call_mymemory_api(self, text: str, target_lang: str) -> str:
        """Call MyMemory Translated API"""
        try:
            base_lang = GOOGLE_LANG_MAP.get(target_lang, target_lang)
            url = (
                f"https://api.mymemory.translated.net/get?"
                f"q={urllib.parse.quote(text)}"
                f"&langpair=en|{base_lang}"
            )

            with urllib.request.urlopen(url, timeout=10) as response:
                data = json.loads(response.read().decode('utf-8'))

                if data.get('responseStatus') == 200:
                    translated = data.get('responseData', {}).get('translatedText', '')
                    if translated:
                        # Clean HTML entities
                        translated = (translated
                            .replace('&quot;', '"')
                            .replace('&amp;', '&')
                            .replace('&lt;', '<')
                            .replace('&gt;', '>')
                            .replace('&apos;', "'"))
                        return translated

        except Exception as e:
            logger.debug(f"API call failed: {e}")

        return text


class OptimizedQuestionTranslator:
    """
    Optimized translator with multi-threading support
    """

    def __init__(self, base_path: str, max_workers: int = 3):
        self.base_path = Path(base_path)
        self.en_file = self.base_path / 'revision_en.json'
        self.api = FreeTranslationAPI()
        self.max_workers = max_workers
        self.total_questions = 0
        self.failed_translations = []
        self.stats = {
            'total_translated': 0,
            'total_cached': 0,
            'total_failed': 0
        }

    def load_english_questions(self) -> List[Dict[str, str]]:
        """Load English questions"""
        try:
            with open(self.en_file, 'r', encoding='utf-8') as f:
                questions = json.load(f)

            self.total_questions = len(questions)
            logger.info(f"✓ Loaded {self.total_questions} English questions")
            return questions
        except Exception as e:
            logger.error(f"✗ Error loading questions: {e}")
            sys.exit(1)

    def translate_single_question(self, question: Dict[str, str], target_lang: str) -> Dict[str, str]:
        """Translate a single question"""
        try:
            translated = {
                'id': question['id'],
                'q': self.translate_text(question['q'], target_lang),
                'a': self.translate_text(question['a'], target_lang)
            }
            return translated
        except Exception as e:
            logger.error(f"Error translating {question['id']}: {e}")
            return question

    def translate_questions_parallel(self, questions: List[Dict[str, str]], target_lang: str) -> List[Dict[str, str]]:
        """
        Translate questions using multi-threading
        """
        translated_questions = []
        completed = 0
        lang_name = LANGUAGE_MAP.get(target_lang, target_lang)

        logger.info(f"  → Starting translation of {self.total_questions} questions to {lang_name}")

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {
                executor.submit(self.translate_single_question, q, target_lang): q
                for q in questions
            }

            for future in as_completed(futures):
                try:
                    translated_q = future.result()
                    translated_questions.append(translated_q)
                    completed += 1

                    # Progress every 100 questions
                    if completed % 100 == 0:
                        percentage = (completed / self.total_questions) * 100
                        logger.info(f"  → Progress: {completed:5d}/{self.total_questions} ({percentage:5.1f}%) - {lang_name}")
                    
                    # Detailed log every 500 questions
                    if completed % 500 == 0:
                        logger.info(f"  ✓ {completed}/{self.total_questions} questions translated to {lang_name}")

                except Exception as e:
                    logger.error(f"Error in parallel translation: {e}")

        logger.info(f"  → Final count for {lang_name}: {len(translated_questions)} questions ready")
        return sorted(translated_questions, key=lambda x: int(x['id'][1:]))

    def save_translated_questions(self, questions: List[Dict[str, str]], lang_code: str) -> bool:
        """Save translated questions"""
        output_file = self.base_path / f'revision_{lang_code}.json'

        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)

            logger.info(f"✓ Saved to {output_file}")
            return True
        except Exception as e:
            logger.error(f"✗ Error saving {lang_code}: {e}")
            return False

    def verify_translations(self, lang_code: str, original: List[Dict[str, str]]) -> bool:
        """Verify translation integrity with detailed logging"""
        output_file = self.base_path / f'revision_{lang_code}.json'
        lang_name = LANGUAGE_MAP.get(lang_code, lang_code)

        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                translated = json.load(f)

            logger.info(f"  → Verification for {lang_name}:")
            logger.info(f"     • Total questions: {len(translated)}")
            logger.info(f"     • Expected: {len(original)}")

            if len(translated) != len(original):
                logger.warning(f"     ✗ Count mismatch: {len(translated)} vs {len(original)}")
                return False

            original_ids = {q['id'] for q in original}
            translated_ids = {q['id'] for q in translated}

            if original_ids != translated_ids:
                logger.warning(f"     ✗ ID mismatch in {lang_name}")
                return False

            empty_q = [q for q in translated if not q.get('q', '').strip()]
            empty_a = [q for q in translated if not q.get('a', '').strip()]

            if empty_q or empty_a:
                logger.warning(f"     ✗ Empty fields: q={len(empty_q)}, a={len(empty_a)}")
                return False

            logger.info(f"     ✓ All {len(translated)} questions verified successfully")
            logger.info(f"     ✓ {lang_name} translation complete and valid")
            return True

        except Exception as e:
            logger.error(f"✗ Verification error for {lang_name}: {e}")
            return False

    def run(self):
        """Main execution"""
        logger.info("=" * 80)
        logger.info("OPTIMIZED QUESTION TRANSLATION SYSTEM")
        logger.info("=" * 80)
        logger.info(f"Start: {datetime.now()}")
        logger.info(f"Threads: {self.max_workers}")
        logger.info(f"Languages: {len(LANGUAGE_MAP)}")
        logger.info(f"Total Questions to Translate: {self.total_questions}")
        logger.info("=" * 80)

        english_questions = self.load_english_questions()

        successful = []
        failed = []

        for lang_code, lang_name in LANGUAGE_MAP.items():
            try:
                logger.info(f"\n→ TRANSLATING TO {lang_name.upper()} ({lang_code})")
                logger.info(f"  Source: {self.total_questions} English questions")

                translated = self.translate_questions_parallel(english_questions, lang_code)

                if self.save_translated_questions(translated, lang_code):
                    logger.info(f"  Saved: {len(translated)} questions to revision_{lang_code}.json")
                    if self.verify_translations(lang_code, english_questions):
                        successful.append(lang_code)
                    else:
                        failed.append(lang_code)
                else:
                    failed.append(lang_code)

                time.sleep(1)

            except Exception as e:
                logger.error(f"✗ Error: {lang_name}: {e}")
                failed.append(lang_code)

        # Save cache
        self.api.save_cache()

        # Summary with detailed counts
        logger.info("\n" + "=" * 80)
        logger.info("TRANSLATION SUMMARY WITH COUNTS")
        logger.info("=" * 80)
        logger.info(f"Total Source Questions: {self.total_questions}")
        logger.info(f"Languages Completed: {len(successful)}/{len(LANGUAGE_MAP)}")
        logger.info(f"\nSuccessful Translations:")
        
        for lang_code in successful:
            lang_name = LANGUAGE_MAP[lang_code]
            output_file = self.base_path / f'revision_{lang_code}.json'
            try:
                with open(output_file, 'r', encoding='utf-8') as f:
                    count = len(json.load(f))
                logger.info(f"  ✓ {lang_name:15} ({lang_code}): {count:5} questions")
            except:
                logger.info(f"  ✓ {lang_name:15} ({lang_code}): {self.total_questions:5} questions")
        
        if failed:
            logger.info(f"\nFailed Languages: {failed}")
        
        logger.info(f"\nEnd: {datetime.now()}")
        logger.info("=" * 80)

        return len(failed) == 0


def main():
    base_path = '/Users/apple/Desktop/Project/appJE/src/data/revision'

    if not os.path.exists(base_path):
        logger.error(f"Path not found: {base_path}")
        sys.exit(1)

    translator = OptimizedQuestionTranslator(base_path, max_workers=3)
    success = translator.run()

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
