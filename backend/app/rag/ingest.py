import os
import asyncio
import logging
from app.modules.documents.service import DocumentService
from app.core.database import connect_to_mongo, close_mongo_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_batch_ingestion():
    ingestion_dir = "ingestion"
    if not os.path.exists(ingestion_dir):
        logger.error(f"Directory {ingestion_dir} does not exist.")
        return

    await connect_to_mongo()
    service = DocumentService()

    for filename in os.listdir(ingestion_dir):
        file_path = os.path.join(ingestion_dir, filename)
        if not os.path.isfile(file_path):
            continue

        logger.info(f"Processing {filename}...")
        
        if filename.lower().endswith('.pdf'):
            result = await service.ingest_pdf(file_path, filename)
            logger.info(result)
        elif filename.lower().endswith('.csv'):
            result = await service.ingest_csv(file_path, filename)
            logger.info(result)
        else:
            logger.info(f"Skipping {filename}: unsupported format.")

    await close_mongo_connection()
    logger.info("Batch ingestion completed.")

if __name__ == "__main__":
    asyncio.run(run_batch_ingestion())
