def mask_value(t, v):
    if t == "AADHAAR":
        return "XXXX-XXXX-" + v[-4:]
    if t == "PAN":
        return v[:2] + "XXX" + v[-2:]
    if t == "BANK_ACCOUNT":
        return "XXXXXX" + v[-4:]
    if t == "CREDIT_DEBIT_CARD":
        return "XXXX-XXXX-XXXX-" + v[-4:]
    if t == "CVV":
        return "***"
    if t == "PHONE":
        return "XXXXXX" + v[-4:]
    if t == "EMAIL":
        name, dom = v.split("@")
        return name[0] + "***@" + dom
    if t == "OTP":
        return "****"
    if t == "DOB":
        return "**-**-" + v[-4:]
    if t == "IFSC":
        return v[:4] + "0XXXXXX"
    if t == "UPI_ID":
        u, p = v.split("@")
        return u[0] + "***@" + p
    if t == "IP_ADDRESS":
        return "XXX.XXX.XXX." + v.split(".")[-1]
    return "****"
    if t in {"MASKED_PHONE","MASKED_EMAIL","MASKED_PAN"}:
        return v
    if t == "UTILITY_ACCOUNT":
        return "XXXX" + v[-4:]
    return "****"