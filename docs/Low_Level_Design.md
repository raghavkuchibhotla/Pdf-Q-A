# Low Level Design (LLD) - PDF Q&A Application

## 1. Database Schema Design

### 1.1 Document Table
```sql
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255),
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 SQLAlchemy Model
```python
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    title = Column(String)
    file_size = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
```

## 2. API Endpoint Specifications

### 2.1 Document Upload Endpoint
```python
@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Input Validation
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Only PDF files allowed")
    
    # File Processing
    file_id = str(uuid.uuid4())
    file_path = f"uploads/{file_id}_{file.filename}"
    
    # Save File
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract Text
    doc_dir = process_pdf(file_path)
    
    # Database Storage
    db_document = Document(
        filename=file.filename,
        file_path=file_path,
        title=file.filename.replace('.pdf', ''),
        file_size=os.path.getsize(file_path)
    )
    db.add(db_document)
    db.commit()
    
    return {"id": db_document.id, "filename": db_document.filename}
```

### 2.2 Q&A Endpoint
```python
@router.post("/{document_id}")
def ask_question_by_id(
    document_id: int,
    request: QuestionOnlyRequest,
    db: Session = Depends(get_db)
):
    # Document Retrieval
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(404, "Document not found")
    
    # Question Processing
    answer = get_answer(document.file_path, request.question)
    
    return {"answer": answer}
```

## 3. Text Processing Engine

### 3.1 PDF Text Extraction
```python
def process_pdf(file_path):
    """Extract text from PDF using PyMuPDF"""
    doc = fitz.open(file_path)
    text = ""
    
    # Extract text from each page
    for page in doc:
        text += page.get_text()
    doc.close()
    
    # Create document directory
    doc_dir = os.path.splitext(file_path)[0]
    os.makedirs(doc_dir, exist_ok=True)
    
    # Save extracted text
    text_path = os.path.join(doc_dir, "content.txt")
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(text)
    
    return doc_dir
```

### 3.2 Intelligent Q&A Engine
```python
def get_answer(pdf_path, question):
    """Main Q&A processing function"""
    doc_dir = os.path.splitext(pdf_path)[0]
    text_path = os.path.join(doc_dir, "content.txt")
    
    with open(text_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    question_lower = question.lower().strip()
    
    # Pattern-based question routing
    if any(phrase in question_lower for phrase in ["what is my name", "my name"]):
        return find_name_in_content(content)
    elif any(phrase in question_lower for phrase in ["email", "contact"]):
        return find_email_in_content(content)
    elif any(phrase in question_lower for phrase in ["education", "degree"]):
        return find_education(content)
    else:
        return general_search(content, question_lower)
```

## 4. Intelligent Text Analysis Algorithms

### 4.1 Name Detection Algorithm
```python
def find_name_in_content(content):
    """Extract name using multiple strategies"""
    lines = content.split('\n')
    
    # Strategy 1: Check first 10 lines for name patterns
    for i, line in enumerate(lines[:10]):
        line = line.strip()
        if line and len(line.split()) <= 4:
            words = line.split()
            if len(words) >= 1 and all(word[0].isupper() for word in words if word.isalpha()):
                if not any(header in line.lower() for header in ['resume', 'cv']):
                    return f"Based on the document, the name appears to be: {line}"
    
    # Strategy 2: Regex pattern matching
    name_match = re.search(r'name\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', content, re.IGNORECASE)
    if name_match:
        return f"The name is: {name_match.group(1)}"
    
    return "I couldn't find a clear name in the document."
```

### 4.2 General Search Algorithm
```python
def general_search(content, question_lower):
    """Keyword-based search with relevance scoring"""
    sentences = re.split(r'[.!?]\s+', content)
    keywords = re.findall(r'\b\w+\b', question_lower)
    relevant_sentences = []
    
    # Score sentences based on keyword matches
    for sentence in sentences:
        sentence_lower = sentence.lower()
        score = sum(1 for keyword in keywords if keyword in sentence_lower)
        if score > 0:
            relevant_sentences.append((sentence.strip(), score))
    
    # Sort by relevance score
    relevant_sentences.sort(key=lambda x: x[1], reverse=True)
    
    if not relevant_sentences:
        return "I couldn't find relevant information in the document."
    
    # Return top 5 most relevant sentences
    answer_parts = [sentence for sentence, score in relevant_sentences[:5]]
    answer = " ".join(answer_parts)
    
    # Limit response length
    if len(answer) > 800:
        answer = answer[:800] + "..."
    
    return answer
```

## 5. Frontend Component Architecture

### 5.1 Document Upload Component
```javascript
const DocumentUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpload = async () => {
        if (!file) return;
        
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/v1/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Upload successful!');
            // Redirect to document list
        } catch (error) {
            setMessage('Upload failed: ' + error.response.data.detail);
        } finally {
            setUploading(false);
        }
    };

    return (
        // JSX component structure
    );
};
```

### 5.2 Q&A Component
```javascript
const QAPage = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const { documentId } = useParams();

    const handleAskQuestion = async () => {
        if (!question.trim()) return;
        
        setLoading(true);
        try {
            const response = await axios.post(`/api/v1/qa/${documentId}`, {
                question: question
            });
            setAnswer(response.data.answer);
        } catch (error) {
            setAnswer('Failed to get answer: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        // JSX component structure
    );
};
```

## 6. Error Handling Strategy

### 6.1 Backend Error Handling
```python
class DocumentNotFoundError(Exception):
    pass

class InvalidFileTypeError(Exception):
    pass

@app.exception_handler(DocumentNotFoundError)
async def document_not_found_handler(request: Request, exc: DocumentNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"detail": "Document not found"}
    )

@app.exception_handler(InvalidFileTypeError)
async def invalid_file_type_handler(request: Request, exc: InvalidFileTypeError):
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid file type. Only PDF files are allowed."}
    )
```

### 6.2 Frontend Error Handling
```javascript
const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error status
        return error.response.data.detail || 'Server error occurred';
    } else if (error.request) {
        // Request made but no response
        return 'Network error. Please check your connection.';
    } else {
        // Something else happened
        return 'An unexpected error occurred';
    }
};
```

## 7. File System Organization

### 7.1 Directory Structure
```
uploads/
├── {uuid}_document1.pdf
├── {uuid}_document1/
│   └── content.txt
├── {uuid}_document2.pdf
└── {uuid}_document2/
    └── content.txt
```

### 7.2 File Naming Convention
- **PDF Files**: `{uuid}_{original_filename}.pdf`
- **Text Files**: `{document_directory}/content.txt`
- **UUID**: Prevents filename conflicts and ensures uniqueness

## 8. Performance Optimizations

### 8.1 Database Optimizations
```python
# Index on frequently queried columns
class Document(Base):
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)  # For search operations
    upload_date = Column(DateTime, index=True)  # For sorting
```

### 8.2 Text Processing Optimizations
```python
# Efficient text chunking for large documents
def chunk_text(text, chunk_size=1000):
    """Split large text into manageable chunks"""
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks
```

## 9. Configuration Management

### 9.1 Environment Configuration
```python
class Settings:
    DATABASE_URL: str = "sqlite:///./pdf_qa.db"
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list = [".pdf"]
    CORS_ORIGINS: list = ["http://localhost:3000"]

settings = Settings()
```

## 10. Testing Strategy

### 10.1 Unit Test Examples
```python
def test_pdf_text_extraction():
    # Test PDF processing
    test_pdf_path = "test_files/sample.pdf"
    result = process_pdf(test_pdf_path)
    assert os.path.exists(result)
    assert os.path.exists(os.path.join(result, "content.txt"))

def test_name_detection():
    # Test name finding algorithm
    content = "John Doe\nSoftware Engineer\nEmail: john@example.com"
    result = find_name_in_content(content)
    assert "John Doe" in result
```
