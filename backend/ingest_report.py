import os
import asyncio
import pandas as pd
import fitz
from app.modules.documents.service import DocumentService
from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.rag import rag_core

async def generate_report():
    await connect_to_mongo()
    service = DocumentService()
    
    # User mentioned backend/data/documents, but files are actually in backend/ingestion
    # We will check both.
    directories = ["data/documents", "ingestion"]
    target_dir = None
    for d in directories:
        if os.path.exists(d) and os.path.isdir(d):
            target_dir = d
            break
            
    if not target_dir:
        print("No ingestion directory found.")
        await close_mongo_connection()
        return

    files = [f for f in os.listdir(target_dir) if os.path.isfile(os.path.join(target_dir, f))]
    
    total_files = len(files)
    pdf_files = 0
    csv_files = 0
    success_count = 0
    failed_count = 0
    skipped_count = 0
    
    total_pages = 0
    total_rows = 0
    total_chunks = 0
    total_embeddings = 0 # assuming 1-to-1 with chunks
    total_chroma = 0     # assuming 1-to-1 with chunks
    
    report_lines = []
    
    for filename in files:
        file_path = os.path.join(target_dir, filename)
        file_type = "PDF" if filename.lower().endswith('.pdf') else "CSV" if filename.lower().endswith('.csv') else "UNKNOWN"
        
        if file_type == "PDF": pdf_files += 1
        elif file_type == "CSV": csv_files += 1
        else: continue
        
        # Read raw metadata
        title = filename
        year = "Unknown"
        state = "Unknown"
        district = "Unknown"
        page_count = 0
        row_count = 0
        
        # Pre-read counts
        try:
            if file_type == "PDF":
                doc = fitz.open(file_path)
                page_count = len(doc)
                total_pages += page_count
            elif file_type == "CSV":
                df = pd.read_csv(file_path)
                row_count = len(df)
                total_rows += row_count
                
                # Attempt to extract metadata like the ingestion script does
                if "State" in df.columns: state = str(df.iloc[0].get("State", "Unknown"))
                if "District" in df.columns: district = str(df.iloc[0].get("District", "Unknown"))
                if "Year" in df.columns: year = str(df.iloc[0].get("Year", "Unknown"))
        except Exception as e:
            pass

        # Check duplicate
        from app.modules.documents.service import get_file_hash
        file_hash = get_file_hash(file_path)
        existing = await service.repository.get_document_by_hash(file_hash)
        
        is_dup = "Yes" if existing else "No"
        status = "SKIPPED" if existing else "SUCCESS"
        err = "None"
        chunks_created = 0
        
        if existing:
            skipped_count += 1
            chunks_created = 0
            if file_type == "PDF":
                # Extracted from existing metadata if available
                title = existing.get("metadata", {}).get("title", title)
            elif file_type == "CSV":
                title = existing.get("metadata", {}).get("title", title)
        else:
            # We will run the ingestion to get it done!
            try:
                if file_type == "PDF":
                    res = await service.ingest_pdf(file_path, filename)
                else:
                    res = await service.ingest_csv(file_path, filename)
                    
                # parse chunks from result string "Success: Ingested filename (N chunks)"
                import re
                m = re.search(r"\((\d+) chunks\)", res)
                if m:
                    chunks_created = int(m.group(1))
                    
                status = "SUCCESS"
                success_count += 1
                total_chunks += chunks_created
                total_embeddings += chunks_created
                total_chroma += chunks_created
                
            except Exception as e:
                status = "FAILED"
                failed_count += 1
                err = str(e)
                
        extracted_metric = page_count if file_type == "PDF" else row_count
        if status == "SKIPPED":
            extracted_metric = 0 # No newly extracted pages/records if skipped
        
        report = (
            f"1. Filename: {filename}\n"
            f"2. File type: {file_type}\n"
            f"3. Detected document title: {title}\n"
            f"4. Detected year: {year}\n"
            f"5. State, if detected: {state}\n"
            f"6. District, if detected: {district}\n"
            f"7. {'PDF page count' if file_type == 'PDF' else 'CSV row count'}: {page_count if file_type == 'PDF' else row_count}\n"
            f"8. Successfully extracted {'pages' if file_type == 'PDF' else 'records'}: {extracted_metric}\n"
            f"9. Chunks created: {chunks_created}\n"
            f"10. Embeddings created: {chunks_created}\n"
            f"11. ChromaDB records created: {chunks_created}\n"
            f"12. MongoDB document record created: {'Yes' if status == 'SUCCESS' else 'No'}\n"
            f"13. Duplicate detected: {is_dup}\n"
            f"14. Final status: {status}\n"
            f"15. Exact error if failed: {err}\n"
            "--------------------------------------------------\n"
        )
        report_lines.append(report)

    # After loop, get total Chroma count
    try:
        chroma_count = rag_core.collection.count()
    except Exception:
        chroma_count = 0
        
    summary = (
        f"Total files found: {total_files}\n"
        f"PDF files: {pdf_files}\n"
        f"CSV files: {csv_files}\n\n"
        f"Successfully ingested: {success_count}\n"
        f"Failed: {failed_count}\n"
        f"Skipped as duplicates: {skipped_count}\n\n"
        f"Total PDF pages processed: {total_pages}\n"
        f"Total CSV rows processed: {total_rows}\n"
        f"Total chunks: {total_chunks}\n"
        f"Total embeddings: {total_embeddings}\n"
        f"Total ChromaDB records: {total_chroma}\n\n"
        f"ChromaDB collection: ingres_groundwater\n"
        f"Current Total ChromaDB Records in collection: {chroma_count}\n"
    )
    
    with open("ingest_report.txt", "w", encoding="utf-8") as f:
        f.write("".join(report_lines))
        f.write(summary)
        
    print("Report generated in ingest_report.txt")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(generate_report())
