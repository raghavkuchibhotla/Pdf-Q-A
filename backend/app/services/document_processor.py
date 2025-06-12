import fitz  # PyMuPDF
import os

def process_pdf(file_path):
    """Extract text from PDF and save it for later processing"""
    # Extract text from PDF
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()  # Close the document to free resources

    # Create document directory if it doesn't exist
    doc_dir = os.path.splitext(file_path)[0]
    os.makedirs(doc_dir, exist_ok=True)

    # Save text to file
    text_path = os.path.join(doc_dir, "content.txt")
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(text)

    # For now, just return the directory - we'll create the index on-demand during Q&A
    return doc_dir