ENTITY_MAP = {
    "EMAIL_ADDRESS": "EMAIL",
    "PHONE_NUMBER": "PHONE",
    "CREDIT_CARD": "CREDIT_DEBIT_CARD",
    "IBAN_CODE": "BANK_ACCOUNT",
    "DATE_TIME": "DOB",
    "PERSON": "NAME",
    "LOCATION": "ADDRESS"
}

def map_entity(entity):
    return ENTITY_MAP.get(entity, entity)
