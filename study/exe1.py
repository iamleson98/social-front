"""
Author: Le Van Son
Created at: Nov 09, 2025
"""

import abc, os, subprocess, typing as tp, time, sys, pyautogui, dataclasses


@abc.ABC
class EditorFunctionInterface:
    def __init__(self, program_name: str):
        self.program_name = program_name

    @abc.abstractmethod
    def handle_replacement(self, phrase: str, replace: str, wait: tp.Optional[float] = None):
        pass


@abc.ABC
class TestClassInterface:
    @abc.abstractmethod
    def handle_open_file(self, editor_name: str, file_path: str, wait_seconds: tp.Optional[float] = None):
        """Abstract method of opening a document. Implementation details should be provided in your impletation class."""

    @abc.abstractmethod
    def handle_search_phrase(self, editor_impl: EditorFunctionInterface, phrase: str):
        """Abstract method of searching for given phrase. Your implementation class should handle the details based on your your editor of choice and some os procedures."""


class MacOsTestImpl(TestClassInterface):
    def handle_open_file(self, editor_name: str, file_path: str, wait_seconds: tp.Optional[float] = None):
        abs_file_path = os.path.abspath(file_path)
        assert os.path.exists(abs_file_path), "File does not exist"

        applescript = f'''
        tell application "{editor_name}"
            activate
            open POSIX file "{abs_file_path}"
        end tell
        '''

        try:
            subprocess.run(['osascript', '-e', applescript], check=True)
        except Exception as exp:
            print(exp)
            sys.exit(1)
        else:
            if wait_seconds:
                time.sleep(wait_seconds)

    def handle_search_phrase(self, editor_impl: EditorFunctionInterface, phrase: str):
        pass


class WindowsTestImpl(TestClassInterface):
    def handle_open_file(self, editor_name: str, file_path: str, wait_seconds: tp.Optional[float] = None):
        abs_file_path = os.path.abspath(file_path)
        assert os.path.exists(abs_file_path), "File does not exist"

        if not editor_name.endswith(".exe"):
            editor_name = f"{editor_name}.exe"

        try:
            subprocess.run([editor_name, abs_file_path], check=True)
        except Exception as exp:
            print(exp)
            sys.exit(1)
        else:
            if wait_seconds:
                time.sleep(wait_seconds)

    def handle_search_phrase(self, editor_impl: EditorFunctionInterface, phrase: str):
        pass


class MacOsTextEditEditor(EditorFunctionInterface):
    def handle_replacement(self, phrase: str, replace: str, wait: tp.Optional[float] = None):
        # open find phrase box
        pyautogui.hotkey('command', 'f')
        if wait: time.sleep(wait)

        # write phrase into find box
        pyautogui.write(phrase)
        if wait: time.sleep(wait)

        # now open to find and replace feature, it auto focus on the replace box, so the last step helps prepopulate the phrase find box
        pyautogui.hotkey('command', 'option', 'f')
        if wait: time.sleep(wait)

        # now write replace phrase into replace input box
        pyautogui.write(replace)
        if wait: time.sleep(wait)

        # replace all
        pyautogui.hotkey('command', 'option', 'r')
        if wait: time.sleep(wait)

        # close file
        pyautogui.hotkey('command', 'w')
        if wait: time.sleep(wait)
