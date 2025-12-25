import base64
import os
import json
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

def _get_cipher():
    """
    Derive a deterministic Fernet key from the Django SECRET_KEY.
    This ensures we can decrypt secrets even if the app restarts, 
    as long as SECRET_KEY remains constant.
    """
    # Use SECRET_KEY to derive a 32-byte key for Fernet
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'static_salt_for_mfa_secrets', # Stable salt for deterministic key
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(settings.SECRET_KEY.encode()))
    return Fernet(key)

def encrypt_secret(plain_text_secret: str) -> str:
    """
    Encrypt the TOTP secret before storing in DB.
    """
    cipher_suite = _get_cipher()
    encrypted_bytes = cipher_suite.encrypt(plain_text_secret.encode())
    return encrypted_bytes.decode('utf-8')

def decrypt_secret(encrypted_secret: str) -> str:
    """
    Decrypt the TOTP secret for use in verification.
    """
    cipher_suite = _get_cipher()
    decrypted_bytes = cipher_suite.decrypt(encrypted_secret.encode('utf-8'))
    return decrypted_bytes.decode('utf-8')

def hash_backup_codes(codes: list) -> list:
    """
    Hash a list of backup codes using Django's secure password hasher.
    Returns a list of hashed strings.
    """
    return [make_password(code) for code in codes]

def verify_backup_code(plain_code: str, hashed_codes_list: list) -> bool:
    """
    Check if a provided backup code matches any of the hashed codes.
    This is O(N) where N is number of codes (usually small, e.g. 10).
    """
    for hashed_code in hashed_codes_list:
        if check_password(plain_code, hashed_code):
            return True
    return False

def find_and_remove_backup_code(plain_code: str, hashed_codes_list: list) -> list:
    """
    Check if code is valid, and if so, return the new list WITHOUT that code.
    Returns None if code is invalid.
    """
    for index, hashed_code in enumerate(hashed_codes_list):
        if check_password(plain_code, hashed_code):
            # Code found! Remove it.
            new_list = hashed_codes_list[:index] + hashed_codes_list[index+1:]
            return new_list
    return None
