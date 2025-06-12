import os
import re

def get_answer(pdf_path, question):
    """Get answer to a question based on the PDF content using enhanced text search"""
    # Get the document directory
    doc_dir = os.path.splitext(pdf_path)[0]
    text_path = os.path.join(doc_dir, "content.txt")

    # Read the extracted text
    if not os.path.exists(text_path):
        return "Document content not found. Please re-upload the document."

    with open(text_path, "r", encoding="utf-8") as f:
        content = f.read()

    question_lower = question.lower().strip()
    content_lower = content.lower()

    # Handle specific question patterns
    if any(phrase in question_lower for phrase in ["what is my name", "what's my name", "my name", "who am i"]):
        return find_name_in_content(content)

    if any(phrase in question_lower for phrase in ["what is my email", "email address", "contact email"]):
        return find_email_in_content(content)

    if any(phrase in question_lower for phrase in ["what is my phone", "phone number", "contact number"]):
        return find_phone_in_content(content)

    if any(phrase in question_lower for phrase in ["where do i work", "current job", "current position", "work at"]):
        return find_current_job(content)

    if any(phrase in question_lower for phrase in ["education", "degree", "university", "college", "studied"]):
        return find_education(content)

    # General keyword search for other questions
    return general_search(content, question_lower)


def find_name_in_content(content):
    """Extract name from resume content"""
    lines = content.split('\n')

    # Look for name patterns in the first few lines (common in resumes)
    for i, line in enumerate(lines[:10]):
        line = line.strip()
        if line and len(line.split()) <= 4:  # Names are usually short
            # Check if it looks like a name (starts with capital letters)
            words = line.split()
            if len(words) >= 1 and all(word[0].isupper() for word in words if word.isalpha()):
                # Avoid common resume headers
                if not any(header in line.lower() for header in ['resume', 'cv', 'curriculum', 'profile', 'summary']):
                    return f"Based on the document, the name appears to be: {line}"

    # Look for "Name:" pattern
    name_match = re.search(r'name\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', content, re.IGNORECASE)
    if name_match:
        return f"The name is: {name_match.group(1)}"

    return "I couldn't find a clear name in the document."


def find_email_in_content(content):
    """Extract email from content"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, content)
    if emails:
        return f"The email address is: {emails[0]}"
    return "I couldn't find an email address in the document."


def find_phone_in_content(content):
    """Extract phone number from content"""
    phone_patterns = [
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # US format
        r'\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b',  # (123) 456-7890
        r'\b\+\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b'  # International
    ]

    for pattern in phone_patterns:
        phones = re.findall(pattern, content)
        if phones:
            return f"The phone number is: {phones[0]}"

    return "I couldn't find a phone number in the document."


def find_current_job(content):
    """Find current job/position"""
    lines = content.split('\n')

    # Look for experience section
    for i, line in enumerate(lines):
        if any(keyword in line.lower() for keyword in ['experience', 'employment', 'work history']):
            # Look at the next few lines for current position
            for j in range(i+1, min(i+10, len(lines))):
                if lines[j].strip() and not lines[j].startswith(' '):
                    return f"Current position appears to be: {lines[j].strip()}"

    return "I couldn't find clear information about the current job position."


def find_education(content):
    """Find education information"""
    lines = content.split('\n')
    education_info = []

    for i, line in enumerate(lines):
        if any(keyword in line.lower() for keyword in ['education', 'academic', 'degree']):
            # Collect next few relevant lines
            for j in range(i+1, min(i+12, len(lines))):
                if lines[j].strip():
                    education_info.append(lines[j].strip())
                if len(education_info) >= 6:  # Collect more education details
                    break
            break

    if education_info:
        return f"Education: {' '.join(education_info)}"  # Include all collected info

    return "I couldn't find clear education information in the document."


def general_search(content, question_lower):
    """General keyword-based search"""
    sentences = re.split(r'[.!?]\s+', content)
    keywords = re.findall(r'\b\w+\b', question_lower)
    relevant_sentences = []

    for sentence in sentences:
        sentence_lower = sentence.lower()
        score = sum(1 for keyword in keywords if keyword in sentence_lower)
        if score > 0:
            relevant_sentences.append((sentence.strip(), score))

    relevant_sentences.sort(key=lambda x: x[1], reverse=True)

    if not relevant_sentences:
        return "I couldn't find relevant information in the document to answer your question."

    # Take more relevant sentences and increase character limit
    answer_parts = [sentence for sentence, score in relevant_sentences[:5]]
    answer = " ".join(answer_parts)

    # Increase character limit to allow more complete answers
    if len(answer) > 800:
        answer = answer[:800] + "..."

    return answer