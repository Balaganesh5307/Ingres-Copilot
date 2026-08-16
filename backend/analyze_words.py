import pymupdf

doc = pymupdf.open('ingestion/1762513884655822300file.pdf')
page = doc[387]
words = page.get_text("words")

# Find the words for "Coimbatore" row (y around 244-307)
row_words = [w for w in words if 240 < w[1] < 310]
row_words.sort(key=lambda w: (round(w[1]/10), w[0]))

for w in row_words:
    print(f"x0={w[0]:.1f} : {w[4]}")
