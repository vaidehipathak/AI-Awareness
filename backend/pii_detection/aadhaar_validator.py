"""
Aadhaar number validation using Verhoeff algorithm.
This helps prevent false positives by validating the checksum.
"""

# Verhoeff algorithm multiplication table
MULTIPLICATION_TABLE = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
]

# Verhoeff algorithm permutation table
PERMUTATION_TABLE = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
]

# Inverse table
INVERSE_TABLE = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]


def validate_aadhaar_checksum(aadhaar_number):
    """
    Validate Aadhaar number using Verhoeff algorithm.
    
    Args:
        aadhaar_number: String of 12 digits (spaces will be removed)
    
    Returns:
        True if valid Aadhaar checksum, False otherwise
    """
    # Remove spaces and validate format
    aadhaar = aadhaar_number.replace(" ", "").replace("-", "")
    
    if len(aadhaar) != 12 or not aadhaar.isdigit():
        return False
    
    # Apply Verhoeff algorithm
    checksum = 0
    for i, digit in enumerate(reversed(aadhaar)):
        col = PERMUTATION_TABLE[i % 8][int(digit)]
        checksum = MULTIPLICATION_TABLE[checksum][col]
    
    return checksum == 0


def is_valid_aadhaar(aadhaar_number):
    """
    Check if the given number is a valid Aadhaar number.
    
    Args:
        aadhaar_number: String that might be an Aadhaar number
    
    Returns:
        True if valid Aadhaar, False otherwise
    """
    return validate_aadhaar_checksum(aadhaar_number)
