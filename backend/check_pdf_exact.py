import pymupdf

doc_pdf = pymupdf.open("ingestion/1762513884655822300file.pdf")

print("PAGE 384 text:")
print(doc_pdf[383].get_text()[:1000])

print("\nPAGE 388 text:")
print(doc_pdf[387].get_text()[:1000])
