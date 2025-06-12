import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Document {
  id: number;
  filename: string;
  upload_date: string;
}

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/documents/');
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) return <div>Loading documents...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Documents</h1>
        <Link 
          to="/upload" 
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Upload New Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No documents uploaded yet</p>
          <Link 
            to="/upload" 
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Upload Your First Document
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div key={doc.id} className="border rounded p-4 shadow-sm">
              <h2 className="font-semibold mb-2">{doc.filename}</h2>
              <p className="text-sm text-gray-500 mb-4">
                Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
              </p>
              <Link
                to={`/qa/${doc.id}`}
                className="text-blue-500 hover:underline"
              >
                Ask Questions
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;