from renderer import render_to_pdf

# Mock Intent Profile with "Researched" Branding
mock_intent_boi = {
    "document_domain": "financial",
    "branding_profile": {
        "primary_color_hex": "#FFA500", # Orange (Bank of India)
        "secondary_color_hex": "#000080", # Navy Blue
        "logo_concept": "star"
    }
}

mock_content_boi = """
**STATEMENT OF ACCOUNTS**
Bank of India - Star House
C-5, G Block, Bandra Kurla Complex, Bandra (East), Mumbai 400051

Dear Customer, 
Here is your statement for the period.

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 01/01/2023 | Opening Balance | | | $50,000 |
| 05/01/2023 | ATM Withdrawal | $500 | | $49,500 |
| 10/01/2023 | Deposit | | $2,000 | $51,500 |

[Logo: Star icon]
[Footer: Official Record]
"""

print("Running Renderer Debug for Bank of India Profile...")
render_to_pdf(mock_content_boi, "debug_boi_clone", mock_intent_boi)
