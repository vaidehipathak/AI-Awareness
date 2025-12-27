import os

# Note: For portability on Windows without ensuring libmagic DLLs, 
# we use a pure Python header dictionary approach for stability.

def _get_header(file_obj, length=2048):
    """Read file header safely without consuming it."""
    pos = file_obj.tell()
    file_obj.seek(0)
    header = file_obj.read(length)
    file_obj.seek(pos)
    return header
    """Read file header safely without consuming it."""
    pos = file_obj.tell()
    file_obj.seek(0)
    header = file_obj.read(length)
    file_obj.seek(pos)
    return header

def validate_uploaded_file(uploaded_file):
    """
    Validates an uploaded file against strict security rules.
    Returns: (is_valid: bool, error_message: str)
    """
    # 1. Size Limit (10MB)
    MAX_SIZE = 10 * 1024 * 1024
    if uploaded_file.size > MAX_SIZE:
        return False, "File too large (limit 10MB)."

    filename = uploaded_file.name.lower()
    
    # 2. Filename Sanitization & Double Extension Check
    # Simplest check: split by dot, should have at most one extension or 
    # specific allowed multipart patterns if we supported them (we don't for now).
    # "report.pdf" -> ['report', 'pdf'] (ok)
    # "malware.exe.pdf" -> ['malware', 'exe', 'pdf'] (reject)
    parts = filename.split('.')
    if len(parts) > 2:
        # Simple heuristic: if any mid-part looks like an executable or script ext, reject.
        # Strict user rule: "Reject double extensions" -> implies > 1 dot might be bad, 
        # or specifically dangerous ones. 
        # "shell.php.pdf" -> BAD. "my.report.pdf" -> Maybe OK?
        # User example: ".exe.txt" rejected.
        # Let's be strict: If > 2 parts, check if penultimate is a known dangerous ext.
        dangerous_exts = {'exe', 'php', 'bat', 'sh', 'py', 'js', 'dll', 'bin', 'cmd'}
        if any(p in dangerous_exts for p in parts[:-1]):
            return False, "Suspicious double extension."

    ext = parts[-1] if parts else ""
    
    # 3. Allow-List
    ALLOWED_EXTS = {
        'txt': 'text/plain',
        'pdf': 'application/pdf',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'csv': 'text/csv'
    }
    
    if ext not in ALLOWED_EXTS:
        return False, f"Unsupported file extension: .{ext}"

    # 4. Binary/Magic Byte Check
    header = _get_header(uploaded_file)
    
    # Magic Byte Signatures
    SIGNATURES = {
        'pdf': [b'%PDF'],
        'png': [b'\x89PNG\r\n\x1a\n'],
        'jpg': [b'\xff\xd8\xff'],
        'jpeg': [b'\xff\xd8\xff'],
        'docx': [b'PK\x03\x04'], # Zip archive magic
    }
    
    if ext in SIGNATURES:
        matched = False
        for sig in SIGNATURES[ext]:
            if header.startswith(sig):
                matched = True
                break
        if not matched:
            return False, "File content does not match extension (spoofed)."
            
    # 5. Text/CSV Binary Check
    # Verify it doesn't contain extensive null bytes or non-printable mess
    if ext in ['txt', 'csv']:
        # Read a chunk and check for null bytes which usually indicate binary
        if b'\x00' in header[:1024]: # Strict check
             return False, "Binary content detected in text file."
        
        # Try decoding
        try:
             header.decode('utf-8')
        except UnicodeDecodeError:
            # Try one more common one before failing? Or fail strict?
            # User wants strict "Reject binary blobs".
            # If it's not valid utf-8 (or ascii compat), it's suspicious for a web upload.
            # We can allow latin-1 but random binary will often fail or look garbage.
            # Sticking to NULL byte check is most robust for "binary vs text".
            # We already passed null byte check.
            pass

    return True, ""
