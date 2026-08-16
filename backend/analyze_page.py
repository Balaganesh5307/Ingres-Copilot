import pymupdf

doc = pymupdf.open('ingestion/1762513884655822300file.pdf')
page = doc[365] # Page 366
words = page.get_text("words")
words.sort(key=lambda w: (round(w[1]/10), w[0]))
for w in words[-50:]:
    print(w[4], end=" ")
print()
