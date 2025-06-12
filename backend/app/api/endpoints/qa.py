from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Document
from app.services.qa_engine import get_answer
from pydantic import BaseModel

router = APIRouter()

class QuestionRequest(BaseModel):
    document_id: int
    question: str

@router.post("/ask")
def ask_question(
    request: QuestionRequest,
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(Document.id == request.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        answer = get_answer(document.file_path, request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")


class QuestionOnlyRequest(BaseModel):
    question: str


@router.post("/{document_id}")
def ask_question_by_id(
    document_id: int,
    request: QuestionOnlyRequest,
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        answer = get_answer(document.file_path, request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")