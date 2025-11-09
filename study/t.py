# import os
# import subprocess
# import time
# import pyautogui
# # from pathlib import Path

# # Sample text file with multiple occurrences of "word1"
# SAMPLE_TEXT = """This is a test document with word1 appearing multiple times.
# Here is another word1.
# And one more word1 at the end."""

# def create_sample_file(filename: str = "test_replace.txt"):
#     """Create a sample text file with 'word1' occurrences."""
#     with open(filename, 'w') as f:
#         f.write(SAMPLE_TEXT)
#     return filename

# def launch_textedit_with_file(file_path: str):
#     """Launch TextEdit on macOS and open the specified file."""
#     # Use AppleScript via osascript to launch TextEdit with file
#     applescript = f'''
#     tell application "TextEdit"
#         activate
#         open POSIX file "{os.path.abspath(file_path)}"
#     end tell
#     '''
#     subprocess.run(['osascript', '-e', applescript], check=True)
#     time.sleep(2)  # Wait for app to launch and file to load

def perform_find_replace(search_term: str = "word1", replace_term: str = "word2"):
    """Perform Find and Replace All using keyboard shortcuts."""
    # Cmd + H to open Find dialog (Replace tab by default on TextEdit)
    pyautogui.hotkey('command', 'h')
    time.sleep(1)  # Sync: Wait for dialog to appear

    # Focus and enter search term (Find field)
    pyautogui.write(search_term)
    time.sleep(0.5)

    # Tab to Replace field (or use mouse if coords known; here assume Tab navigation)
    pyautogui.press('tab')
    time.sleep(0.5)
    pyautogui.write(replace_term)
    time.sleep(0.5)

    # Cmd + Option + R for Replace All (or click button; shortcut preferred for reliability)
    pyautogui.hotkey('command', 'option', 'r')
    time.sleep(1)  # Wait for replacement to complete

    # Cmd + W to close Find dialog
    pyautogui.hotkey('command', 'w')
    time.sleep(0.5)

# def save_and_verify(file_path: str, expected_replacements: int = 3):
#     """Save the document and verify replacements by checking file content."""
#     # Cmd + S to save
#     pyautogui.hotkey('command', 's')
#     time.sleep(1)  # Wait for save dialog if needed; assume no prompt

#     # Read file and count "word2" occurrences (should match expected)
#     with open(file_path, 'r') as f:
#         content = f.read()
    
#     word2_count = content.count(replace_term)
#     if word2_count == expected_replacements:
#         print(f"Verification passed: {word2_count} occurrences of '{replace_term}' found.")
#         return True
#     else:
#         print(f"Verification failed: Expected {expected_replacements}, found {word2_count}.")
#         return False

# def main():
#     # Step 1: Create sample file
#     file_path = create_sample_file()
#     print(f"Created sample file: {file_path}")

#     try:
#         # Step 2: Launch TextEdit with file
#         launch_textedit_with_file(file_path)
#         print("Launched TextEdit and opened file.")

#         # Step 3: Perform Find and Replace
#         perform_find_replace()
#         print("Performed Find and Replace All.")

#         # Step 4: Save and verify
#         success = save_and_verify(file_path)
#         print("Test completed." if success else "Test failed.")

#     finally:
#         # Cleanup: Close TextEdit
#         subprocess.run(['osascript', '-e', 'tell application "TextEdit" to quit'], check=False)
#         # Remove temp file
#         os.remove(file_path)

# if __name__ == "__main__":
#     main()

import os



assert os.path.exists('./t.pyt'), "lol"