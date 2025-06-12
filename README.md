# PDF Q&A Application

A full-stack web application that allows users to upload PDF documents and ask questions about their content using intelligent text analysis.

## 🚀 Features

- **Fast PDF Upload**: Quick document processing and storage
- **Intelligent Q&A**: Ask natural language questions about uploaded documents
- **Smart Text Analysis**: Handles specific question types (name, email, education, projects, etc.)
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Real-time Processing**: Fast document analysis without external API dependencies

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern JavaScript framework
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PyMuPDF** - PDF text extraction
- **Uvicorn** - ASGI server
- **SQLite** - Lightweight database

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pdf-qa-app.git
cd pdf-qa-app
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📖 Usage

1. **Upload PDF**: Navigate to the upload page and select a PDF document
2. **View Documents**: See all uploaded documents on the main page
3. **Ask Questions**: Click on any document to ask questions about its content
4. **Get Answers**: The system will analyze the document and provide relevant answers

## 🧠 Supported Question Types

The application intelligently handles various question patterns:

- **Personal Information**: "What is my name?", "What's my email?"
- **Education**: "Where did I study?", "What's my degree?"
- **Experience**: "Where do I work?", "What's my current job?"
- **Projects**: "What are my projects?", "Tell me about my work"
- **Skills**: "What programming languages do I know?"
- **General**: Any keyword-based questions about document content

## 📁 Project Structure

```
pdf-qa-app/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   └── services/
│   ├── uploads/
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```
DATABASE_URL=sqlite:///./pdf_qa.db
UPLOAD_DIR=uploads
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- React team for the powerful frontend library
- Tailwind CSS for the utility-first CSS framework
- PyMuPDF for PDF text extraction capabilities
