#!/usr/bin/env python3
"""
Translation System - Installation & Readiness Check
Verifies all translation scripts and dependencies are in place
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

# Colors
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

def print_header(text):
    print(f"\n{BOLD}{BLUE}{'=' * 70}{RESET}")
    print(f"{BOLD}{BLUE}{text:^70}{RESET}")
    print(f"{BOLD}{BLUE}{'=' * 70}{RESET}\n")

def check(condition, success_msg, fail_msg):
    if condition:
        print(f"{GREEN}✓{RESET} {success_msg}")
        return True
    else:
        print(f"{RED}✗{RESET} {fail_msg}")
        return False

def main():
    print_header("TRANSLATION SYSTEM - READINESS CHECK")
    
    base_path = Path('/Users/apple/Desktop/Project/appJE')
    revision_path = base_path / 'src' / 'data' / 'revision'
    
    all_good = True
    
    # 1. Check Project Directory
    print(f"{BOLD}1. Project Directory{RESET}")
    all_good &= check(
        base_path.exists(),
        f"Found: {base_path}",
        f"Not found: {base_path}"
    )
    all_good &= check(
        revision_path.exists(),
        f"Found: {revision_path}",
        f"Not found: {revision_path}"
    )
    
    # 2. Check English Questions File
    print(f"\n{BOLD}2. Source Data{RESET}")
    en_file = revision_path / 'revision_en.json'
    if en_file.exists():
        try:
            with open(en_file, 'r', encoding='utf-8') as f:
                questions = json.load(f)
            all_good &= check(
                len(questions) > 0,
                f"Loaded {len(questions)} English questions",
                "No questions found in revision_en.json"
            )
        except Exception as e:
            all_good &= check(False, "", f"Error reading revision_en.json: {e}")
    else:
        all_good &= check(False, "", f"Not found: {en_file}")
    
    # 3. Check Python Scripts
    print(f"\n{BOLD}3. Python Scripts{RESET}")
    python_scripts = [
        'translate_questions.py',
        'translate_questions_optimized.py',
    ]
    
    for script in python_scripts:
        script_path = base_path / script
        if script_path.exists():
            all_good &= check(
                os.access(script_path, os.X_OK) or script_path.suffix == '.py',
                f"Found: {script}",
                f"Not executable: {script}"
            )
        else:
            all_good &= check(False, "", f"Not found: {script}")
    
    # 4. Check JavaScript Scripts
    print(f"\n{BOLD}4. JavaScript Scripts{RESET}")
    js_script = base_path / 'translate_questions.js'
    if js_script.exists():
        all_good &= check(
            True,
            f"Found: translate_questions.js",
            f"Not found: translate_questions.js"
        )
    else:
        all_good &= check(False, "", f"Not found: translate_questions.js")
    
    # 5. Check Shell Script
    print(f"\n{BOLD}5. Batch Execution Script{RESET}")
    shell_script = base_path / 'run_translation.sh'
    if shell_script.exists():
        all_good &= check(
            os.access(shell_script, os.X_OK),
            f"Found and executable: run_translation.sh",
            f"Not executable: run_translation.sh"
        )
    else:
        all_good &= check(False, "", f"Not found: run_translation.sh")
    
    # 6. Check Documentation
    print(f"\n{BOLD}6. Documentation{RESET}")
    docs = [
        'QUICK_START.md',
        'README_TRANSLATION.md',
        'TRANSLATION_GUIDE.md',
    ]
    
    for doc in docs:
        doc_path = base_path / doc
        all_good &= check(
            doc_path.exists(),
            f"Found: {doc}",
            f"Not found: {doc}"
        )
    
    # 7. Check Python Version
    print(f"\n{BOLD}7. Python Installation{RESET}")
    try:
        result = subprocess.run(['python3', '--version'], 
                              capture_output=True, text=True, timeout=5)
        version = result.stdout.strip() + result.stderr.strip()
        all_good &= check(True, f"Python: {version}", "")
    except Exception as e:
        all_good &= check(False, "", f"Python3 not found: {e}")
    
    # 8. Check Internet Connection
    print(f"\n{BOLD}8. Network Connectivity{RESET}")
    try:
        subprocess.run(['ping', '-c', '1', 'google.com'], 
                      capture_output=True, timeout=5)
        all_good &= check(True, "Internet connection: OK", "")
    except Exception:
        print(f"{YELLOW}⚠{RESET} No internet detected (may affect translation)")
    
    # 9. Check Disk Space
    print(f"\n{BOLD}9. Storage Space{RESET}")
    try:
        import shutil
        stat = shutil.disk_usage(str(base_path))
        free_gb = stat.free / (1024 ** 3)
        all_good &= check(
            free_gb > 0.1,
            f"Free space: {free_gb:.2f} GB",
            f"Insufficient space: {free_gb:.2f} GB"
        )
    except Exception as e:
        print(f"{YELLOW}⚠{RESET} Could not check disk space: {e}")
    
    # 10. Summary
    print_header("READINESS SUMMARY")
    
    if all_good:
        print(f"{GREEN}{BOLD}✓ ALL SYSTEMS READY FOR TRANSLATION!{RESET}\n")
        print(f"You can now run one of these commands:\n")
        print(f"  {BOLD}Fastest (Recommended):{RESET}")
        print(f"    python3 /Users/apple/Desktop/Project/appJE/translate_questions_optimized.py\n")
        print(f"  {BOLD}Interactive (Easiest):{RESET}")
        print(f"    bash /Users/apple/Desktop/Project/appJE/run_translation.sh\n")
        print(f"  {BOLD}Standard Python:{RESET}")
        print(f"    python3 /Users/apple/Desktop/Project/appJE/translate_questions.py\n")
        print(f"  {BOLD}JavaScript Alternative:{RESET}")
        print(f"    npm install axios && node /Users/apple/Desktop/Project/appJE/translate_questions.js\n")
        return 0
    else:
        print(f"{RED}{BOLD}✗ SOME ISSUES FOUND - SEE ABOVE{RESET}\n")
        print(f"Please fix the issues above before running translation.\n")
        return 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as e:
        print(f"{RED}✗ Unexpected error: {e}{RESET}")
        sys.exit(1)
