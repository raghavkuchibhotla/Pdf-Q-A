from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Document
from app.services.document_processor import process_pdf
import os
from app.core.config import settings
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Save file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Process PDF and extract text
    try:
        process_pdf(file_path)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    
    # Save document info to database
    db_document = Document(
        filename=file.filename,
        file_path=file_path
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    return {"id": db_document.id, "filename": db_document.filename}


@router.get("/")
async def get_documents(db: Session = Depends(get_db)):
    """Get all documents"""
    documents = db.query(Document).all()
    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "upload_date": doc.upload_date.isoformat() if doc.upload_date else None,
            "title": doc.title
        }
        for doc in documents
    ]


@router.get("/{document_id}")
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """Get a specific document by ID"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "id": document.id,
        "filename": document.filename,
        "upload_date": document.upload_date.isoformat() if document.upload_date else None,
        "title": document.title
    }


