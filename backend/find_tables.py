import pymupdf

doc = pymupdf.open('ingestion/1762513884655822300file.pdf')
# Let's print pages 388, 389, 390
for page_num in range(387, 390):
    text = doc[page_num].get_text()
    print(f"--- PAGE {page_num+1} ---")
    print(text[:1000])
