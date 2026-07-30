import sys
import json
import struct
import time
import ctypes
from ctypes import wintypes

# --- Windows Shell API Configuration ---
FO_DELETE = 0x0003
FOF_ALLOWUNDO = 0x0040        # Move to Recycle Bin
FOF_NOCONFIRMATION = 0x0010   # Silent execution
FOF_SILENT = 0x0004           # Hide Windows UI

class SHFILEOPSTRUCTW(ctypes.Structure):
    _fields_ = [
        ("hwnd", wintypes.HWND),
        ("wFunc", wintypes.UINT),
        ("pFrom", wintypes.LPCWSTR),
        ("pTo", wintypes.LPCWSTR),
        ("fFlags", wintypes.WORD),
        ("fAnyOperationsAborted", wintypes.BOOL),
        ("hNameMappings", ctypes.c_void_p),
        ("lpszProgressTitle", wintypes.LPCWSTR),
    ]

def send_to_recycle_bin(path):
    # Windows API requires a double null-terminated string (\0\0)
    double_null_path = path + "\0\0"
    
    fileop = SHFILEOPSTRUCTW()
    fileop.hwnd = None
    fileop.wFunc = FO_DELETE
    fileop.pFrom = double_null_path
    fileop.pTo = None
    fileop.fFlags = FOF_ALLOWUNDO | FOF_NOCONFIRMATION | FOF_SILENT
    fileop.fAnyOperationsAborted = False
    fileop.hNameMappings = None
    fileop.lpszProgressTitle = None

    result = ctypes.windll.shell32.SHFileOperationW(ctypes.byref(fileop))
    return result == 0 and not fileop.fAnyOperationsAborted

def read_message():
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length or len(raw_length) < 4:
        sys.exit(0)
    message_length = struct.unpack('@I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

def send_message(message_dict):
    encoded_message = json.dumps(message_dict).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('@I', len(encoded_message)))
    sys.stdout.buffer.write(encoded_message)
    sys.stdout.buffer.flush()

def main():
    try:
        data = read_message()
        file_path = data.get("filePath")
        
        if not file_path:
            send_message({"status": "error", "message": "No file path"})
            return

        # Attempt 1: Immediate deletion
        if send_to_recycle_bin(file_path):
            send_message({"status": "success"})
            return

        # Attempt 2: Wait 300ms for file lock release
        time.sleep(0.3)
        if send_to_recycle_bin(file_path):
            send_message({"status": "success"})
        else:
            send_message({"status": "error", "message": "File locked"})

    except Exception as e:
        send_message({"status": "error", "message": str(e)})

if __name__ == "__main__":
    main()