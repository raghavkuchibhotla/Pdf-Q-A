import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DocumentUpload from './pages/DocumentUpload';
import DocumentList from './pages/DocumentList';
import QAPage from './pages/QAPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<DocumentList />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/qa/:documentId" element={<QAPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;