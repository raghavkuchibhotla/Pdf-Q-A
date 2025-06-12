# Technical Specification - PDF Q&A Application

## 1. System Requirements

### 1.1 Functional Requirements
- **FR1**: Users can upload PDF documents (max 10MB)
- **FR2**: System extracts and stores text content from PDFs
- **FR3**: Users can view list of uploaded documents
- **FR4**: Users can ask natural language questions about documents
- **FR5**: System provides intelligent answers based on document content
- **FR6**: System handles specific question patterns (name, email, education, etc.)
- **FR7**: System provides general keyword-based search for other questions

### 1.2 Non-Functional Requirements
- **NFR1**: Response time < 2 seconds for Q&A operations
- **NFR2**: Support for concurrent users (up to 100)
- **NFR3**: 99.9% uptime availability
- **NFR4**: Secure file handling and storage
- **NFR5**: Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- **NFR6**: Mobile-responsive design

## 2. Technology Specifications

### 2.1 Frontend Technology Stack
```
React: 18.3.1
Tailwind CSS: 3.4.17
React Router: 6.x
Axios: 1.x
Node.js: 14+ (for development)
```

### 2.2 Backend Technology Stack
```
Python: 3.8+
FastAPI: 0.104.1
SQLAlchemy: 2.0.23
PyMuPDF: 1.23.8
Uvicorn: 0.24.0
SQLite: 3.x
```

## 3. API Specifications

### 3.1 Document Management APIs

#### Upload Document
```
POST /api/v1/documents/upload
Content-Type: multipart/form-data

Request:
- file: PDF file (required)

Response:
{
    "id": 1,
    "filename": "document.pdf"
}

Status Codes:
- 200: Success
- 400: Invalid file type/size
- 500: Server error
```

#### List Documents
```
GET /api/v1/documents/

Response:
[
    {
        "id": 1,
        "filename": "document.pdf",
        "upload_date": "2024-01-01T10:00:00Z",
        "title": "document"
    }
]

Status Codes:
- 200: Success
- 500: Server error
```

#### Get Document Details
```
GET /api/v1/documents/{document_id}

Response:
{
    "id": 1,
    "filename": "document.pdf",
    "upload_date": "2024-01-01T10:00:00Z",
    "title": "document"
}

Status Codes:
- 200: Success
- 404: Document not found
- 500: Server error
```

### 3.2 Q&A APIs

#### Ask Question
```
POST /api/v1/qa/{document_id}
Content-Type: application/json

Request:
{
    "question": "What is my name?"
}

Response:
{
    "answer": "Based on the document, the name appears to be: John Doe"
}

Status Codes:
- 200: Success
- 404: Document not found
- 500: Server error
```

## 4. Database Schema

### 4.1 Documents Table
```sql
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL UNIQUE,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255),
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_documents_filename ON documents(filename);
CREATE INDEX idx_documents_upload_date ON documents(upload_date);
```

## 5. File System Structure

### 5.1 Directory Organization
```
project_root/
├── uploads/
│   ├── {uuid}_document1.pdf
│   ├── {uuid}_document1/
│   │   └── content.txt
│   ├── {uuid}_document2.pdf
│   └── {uuid}_document2/
│       └── content.txt
├── backend/
│   ├── app/
│   └── pdf_qa.db
└── frontend/
    └── build/
```

### 5.2 File Naming Convention
- **PDF Files**: `{uuid4}_{original_filename}.pdf`
- **Text Directories**: `{uuid4}_{original_filename_without_extension}/`
- **Extracted Text**: `content.txt` (inside text directory)

## 6. Security Specifications

### 6.1 Input Validation
- **File Type**: Only PDF files allowed (.pdf extension)
- **File Size**: Maximum 10MB per file
- **Filename**: Sanitized to prevent path traversal
- **Question Length**: Maximum 1000 characters

### 6.2 CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 6.3 Error Handling
- No sensitive information in error messages
- Proper HTTP status codes
- Structured error responses

## 7. Performance Specifications

### 7.1 Response Time Requirements
- **Document Upload**: < 5 seconds (for 10MB PDF)
- **Document List**: < 1 second
- **Q&A Response**: < 2 seconds
- **Text Extraction**: < 3 seconds per MB

### 7.2 Throughput Requirements
- **Concurrent Users**: 100 simultaneous users
- **Upload Rate**: 10 documents per minute
- **Q&A Rate**: 100 questions per minute

## 8. Algorithm Specifications

### 8.1 Text Extraction Algorithm
```
Input: PDF file path
Process:
1. Open PDF using PyMuPDF
2. Iterate through all pages
3. Extract text from each page
4. Concatenate all text
5. Save to text file
Output: Directory path containing extracted text
```

### 8.2 Question Pattern Recognition
```
Input: User question (string)
Process:
1. Convert to lowercase
2. Check for specific patterns:
   - Name patterns: "what is my name", "my name"
   - Email patterns: "email", "contact"
   - Education patterns: "education", "degree"
   - Job patterns: "work", "job", "position"
3. Route to appropriate handler
4. If no pattern matches, use general search
Output: Appropriate handler function
```

### 8.3 General Search Algorithm
```
Input: Document content, question
Process:
1. Split content into sentences
2. Extract keywords from question
3. Score sentences based on keyword matches
4. Sort by relevance score
5. Select top 5 sentences
6. Concatenate and limit to 800 characters
Output: Relevant answer text
```

## 9. Deployment Specifications

### 9.1 Development Environment
```
Frontend: npm start (localhost:3000)
Backend: uvicorn app.main:app --reload (localhost:8000)
Database: SQLite file-based
```

### 9.2 Production Environment
```
Frontend: Nginx + Static files
Backend: Gunicorn + Uvicorn workers
Database: PostgreSQL (recommended for production)
Reverse Proxy: Nginx
SSL: Let's Encrypt certificates
```

## 10. Testing Specifications

### 10.1 Unit Testing
- **Backend**: pytest with 80%+ code coverage
- **Frontend**: Jest + React Testing Library
- **Database**: SQLAlchemy test fixtures

### 10.2 Integration Testing
- **API Endpoints**: Full request/response cycle testing
- **File Upload**: End-to-end upload and processing
- **Q&A Flow**: Complete question-answer workflow

### 10.3 Performance Testing
- **Load Testing**: 100 concurrent users
- **Stress Testing**: Maximum file size uploads
- **Memory Testing**: Large document processing

## 11. Monitoring and Logging

### 11.1 Application Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Log important events
logger.info(f"Document uploaded: {filename}")
logger.error(f"Failed to process PDF: {error}")
```

### 11.2 Metrics to Monitor
- **Response Times**: API endpoint performance
- **Error Rates**: Failed uploads and Q&A requests
- **Resource Usage**: CPU, memory, disk space
- **User Activity**: Upload frequency, question patterns
