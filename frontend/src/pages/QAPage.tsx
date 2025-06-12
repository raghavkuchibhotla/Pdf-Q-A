import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Document {
  id: number;
  filename: string;
}

interface QAExchange {
  question: string;
  answer: string;
}

const QAPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<QAExchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/documents/`);
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        const documents = await response.json();
        const doc = documents.find((d: Document) => d.id === parseInt(documentId || '0'));
        if (doc) {
          setDocument(doc);
        } else {
          throw new Error('Document not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/qa/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: parseInt(documentId || '0'),
          question: question.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get answer');
      }

      const data = await response.json();
      
      setQaHistory([...qaHistory, { question: question.trim(), answer: data.answer }]);
      setQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link to="/" className="text-blue-500 hover:underline">Back to Documents</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center py-4 border-b">
        <div className="flex items-center">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 mr-2" />
          {document && <h1 className="text-lg font-medium">{document.filename}</h1>}
        </div>
        <div>
          <Link to="/" className="text-sm px-3 py-1 border rounded-md hover:bg-gray-50">
            Documents
          </Link>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {qaHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>Ask a question about this document</p>
          </div>
        ) : (
          qaHistory.map((exchange, index) => (
            <div key={index} className="space-y-4">
              {/* User Question */}
              <div className="flex justify-end">
                <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center mb-1">
                    <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">
                      U
                    </div>
                    <span className="text-xs text-gray-600">You</span>
                  </div>
                  <p className="text-sm">{exchange.question}</p>
                </div>
              </div>
              
              {/* AI Answer */}
              <div className="flex justify-start">
                <div className="bg-green-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center mb-1">
                    <div className="h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs mr-2">
                      AI
                    </div>
                    <span className="text-xs text-gray-600">Assistant</span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{exchange.answer}</p>
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs mr-2">
                  AI
                </div>
                <span className="text-xs text-gray-600">Thinking...</span>
              </div>
              <div className="mt-2 flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the document..."
            className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QAPage;
