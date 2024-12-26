# Appian Credit Union Document Processing

## Overview
This project automates the manual processing of unstructured PDF documents for Appian Credit Union. It utilizes state-of-the-art machine learning and natural language processing techniques to extract, categorize, and summarize data efficiently. The system handles tasks such as text extraction, document categorization, and named entity recognition (NER), significantly reducing the time and effort required by employees.

## Features
- **Text Extraction**: Utilizes OCR tools (Tesseract, Google Vision API) to extract text from unstructured PDFs.
- **Document Categorization**: Classifies documents (e.g., receipts, identity proofs, applications) and associates them with individuals.
- **Named Entity Recognition (NER)**: Extracts attributes like names, IDs, emails, and monetary values.
- **Hierarchical Organization**: Groups documents by individual and then by type.
- **Summarization**: Generates concise summaries for quick review.
- **Resource Efficiency**: Compressed to 5–6 GB, optimized for deployment on systems with limited GPU resources (4GB VRAM).
- **Custom Model Integration**: Includes LLaMA 3.1 8B model with FastLanguageModel for optimized performance.
- **Fine-tuning**: Uses LoRA adapters and a human feedback system for task-specific model improvements.

## Challenges Addressed
1. **High Volume of Data**: Processes thousands of documents daily with scalable and efficient workflows.
2. **Accurate Information Extraction**: Ensures high accuracy in extracting key details from diverse formats.
3. **Operational Efficiency**: Eliminates repetitive, time-intensive tasks, boosting employee productivity and morale.
4. **Dependency Management**: Optimized integration with Google Cloud Console for blob storage, ensuring seamless communication between the ML model and the backend.

## Installation

### Prerequisites
1. **Python 3.8+**
2. **Pip**
3. **GPU with at least 4GB VRAM** (Optional for better performance)
4. **Google Cloud Account** (For blob storage)

### Required Libraries
Install dependencies using the following command:
```bash
pip install -r requirements.txt
```

*requirements.txt*:
- text
- torch>=1.12.1
- torchvision
- transformers>=4.25.0
- fastapi
- uvicorn
- tesseract-ocr
- pytesseract
- opencv-python
- numpy
- pandas
- google-cloud-storage
- scipy
- LoRA-adapters


### Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/rohitk285/Appian.git
   ```   
2. **Google Cloud Console**:
   - Configure blob storage.
   - Set up authentication using a service account key.
3. **Tesseract OCR**:
   - Install Tesseract OCR ([installation guide](https://github.com/tesseract-ocr/tesseract)).
   - Ensure the binary is accessible in the system path.
4. **Environment Variables**:
   - Create a .env file to store sensitive configurations:
   STORAGE_BUCKET_NAME="your-bucket-name"
   MONGO_URI="your-mongo-db-uri"
   SERVICE_ACCOUNT_FILE="your-service-account-file-path"

   

## Usage
### Running the Application
- Start the FastAPI backend:
```bash
uvicorn main:app --reload
```

- Start the application frontend
```bash
cd frontend
npm install
npm run dev
```

- Start the application frontend
```bash
cd backend
python server.py
```

### API Endpoints
1. **Upload Document**:
   - Endpoint: /upload
   - Method: POST
   - Description: Uploads a PDF document for processing.
2. **Retrieve Processed Data**:
   - Endpoint: /results/{document_id}
   - Method: GET
   - Description: Retrieves the processed output, including extracted data and summaries.

### Training Custom Models
To fine-tune the LLaMA 3.1 model using LoRA adapters:
```bash
python train.py --data-path /path/to/data --model llama3.1 --output-dir /path/to/output
```


## Architecture
1. **OCR Module**: Extracts text from PDFs.
2. **ML/NLP Module**:
   - Classification: Distinguishes document types.
   - NER: Extracts entities (e.g., names, IDs).
   - Summarization: Generates concise summaries.
3. **Integration**:
   - Google Cloud Storage: Stores processed documents and results.
   - FastAPI: Provides a user-friendly API interface.

![Sample Image](images/architecture.jpeg)

## Easy OCR framework

![Sample Image](images/easyocr.jpeg)

## Frontend of Application
![Sample Image](images/uploadpage.png)

![Sample Image](images/retrieve1.png)

![Sample Image](images/retrieve2.png)

![Sample Image](images/retrieve3.png)

## Limitations
- Requires clean and legible PDFs for optimal OCR performance.
- Custom model training can be resource-intensive.

## Contributing
1. Fork the repository.
2. Create a feature branch (git checkout -b feature-name).
3. Commit changes (git commit -m "Add feature").
4. Push to the branch (git push origin feature-name).
5. Create a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For queries, contact the project maintainer:
- **Name**: Rohit Kannan
- **Email**: rohitmn482@gmail.com