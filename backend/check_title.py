import os
import pymupdf

pdf_path = "ingestion/1762513884655822300file.pdf"
if not os.path.exists(pdf_path):
    pdf_path = "data/documents/1762513884655822300file.pdf"

doc = pymupdf.open(pdf_path)

with open('pdf_title.txt', 'w', encoding='utf-8') as f:
    f.write("--- PAGE 1 ---\n")
    f.write(doc[0].get_text()[:500])
    f.write("\n--- PAGE 2 ---\n")
    f.write(doc[1].get_text()[:500])
    f.write("\n--- PAGE 3 ---\n")
    f.write(doc[2].get_text()[:500])
