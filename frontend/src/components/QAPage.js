import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function QAPage() {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState('');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/documents/${documentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        const data = await response.json();
        setDocument(data);
      } catch (err) {
        setDocumentError(err.message);
      } finally {
        setDocumentLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch(`http://localhost:8000/api/v1/qa/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (documentLoading) {
    return <div className="text-center py-10">Loading document...</div>;
  }

  if (documentError) {
    return <div className="text-red-500 text-center py-10">{documentError}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-blue-500 hover:underline">
          &larr; Back to Documents
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">{document?.filename}</h2>
        <p className="text-gray-500">
          Ask questions about this document to get AI-powered answers.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Ask a Question</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question here..."
              className="w-full p-3 border border-gray-300 rounded resize-none h-32"
              disabled={loading}
            ></textarea>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className={`px-4 py-2 rounded ${
              loading || !question.trim()
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? 'Getting Answer...' : 'Get Answer'}
          </button>
        </form>

        {answer && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold mb-2">Answer:</h4>
            <p className="whitespace-pre-line">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QAPage;