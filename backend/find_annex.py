import pymupdf
import re

doc = pymupdf.open('ingestion/1762513884655822300file.pdf')
for i in range(250, 420):
    text = doc[i].get_text()
    if "ANNEXURE" in text.upper() and "IV" in text.upper():
        print(f"Annexure IV found on page {i+1}")
        
