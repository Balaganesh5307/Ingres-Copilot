import pymupdf

doc = pymupdf.open('ingestion/1762513884655822300file.pdf')
page = doc[387] # Page 388 which we looked at earlier
blocks = page.get_text("blocks")

for b in blocks[:50]:
    x0, y0, x1, y1, text, block_no, block_type = b
    text = text.replace('\n', ' ').strip()
    if text:
        print(f"[{x0:.1f}, {y0:.1f}, {x1:.1f}, {y1:.1f}] : {text}")
