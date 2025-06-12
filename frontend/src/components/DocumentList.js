import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/documents');
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading documents...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Documents</h2>
        <Link
          to="/upload"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Upload New Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-4">No documents found</p>
          <Link
            to="/upload"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Upload Your First Document
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white shadow rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2 truncate">{doc.filename}</h3>
              <p className="text-gray-500 mb-4">
                Uploaded on {new Date(doc.created_at).toLocaleDateString()}
              </p>
              <Link
                to={`/qa/${doc.id}`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded block text-center"
              >
                Ask Questions
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentList;