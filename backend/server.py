from flask import Flask, jsonify, request
import random
import requests
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_cors import CORS
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from io import BytesIO

# Importing necessary functions from LlamaFinal.py
from LlamaFinal import process_pdf_with_llama

app = Flask(__name__)
CORS(app)
load_dotenv()

# Google Drive API setup
SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = os.getenv('SERVICE_ACCOUNT_FILE')
MONGO_URI = os.getenv("MONGO_URI")

# Authenticate using the service account
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

drive_service = build('drive', 'v3', credentials=credentials)

@app.route('/', methods=['GET'])
def test():
    return jsonify({"message": "Flask server is running"}), 200

@app.route('/uploadDetails', methods=['POST'])
def upload_details():
    try:
        # Handle file uploads
        files = request.files
        if not files:
            return jsonify({"error": "No files uploaded."}), 400

        file_drive_links = {}
        document_outputs = []

        for file_key, file in files.items():
            # Use the file content in memory
            file_stream = BytesIO(file.read())

            # Process PDF and get structured data
            output_folder = "temp_output"  # Temporary folder for images
            json_output_path = None  # Placeholder for path

            document_data = process_pdf_with_llama(file_stream, output_folder, json_output_path)

            if not document_data:
                return jsonify({"error": "Failed to process the document."}), 500

            document_outputs.append(document_data)
            print(document_data)

            # Upload the original file to Google Drive
            file_metadata = {'name': file.filename}
            file_stream.seek(0)  # Reset stream pointer
            media = MediaIoBaseUpload(file_stream, mimetype=file.mimetype, resumable=True)

            file_response = drive_service.files().create(
                body=file_metadata, media_body=media, fields='id').execute()

            if file_response:
                drive_file_id = file_response.get('id')

                # Update file permissions to make it publicly viewable
                drive_service.permissions().create(
                    fileId=drive_file_id,
                    body={
                        "type": "anyone",
                        "role": "reader"
                    }
                ).execute()

                drive_file_link = f"https://drive.google.com/file/d/{drive_file_id}/view"
                file_drive_links[file_key] = drive_file_link

        # Select a random document from processed outputs
        selected_data = document_outputs[0][0]
        print(selected_data)

        # Save the structured data into MongoDB
        client = MongoClient(MONGO_URI)
        db = client['test']  # Replace with your database name
        
        document_type = selected_data.get("document_type", "")
        named_entities = selected_data.get("named_entities", {})

        if document_type == "Aadhaar Card" and "Name" in named_entities:
            db.aadhars.update_one(
                {"name": named_entities["Name"]},
                {"$set": {"fileLink": file_drive_links['file_0']}},
                upsert=True
            )
        elif document_type == "PAN Card" and "Name" in named_entities:
            db.pans.update_one(
                {"name": named_entities["Name"]},
                {"$set": {"fileLink": file_drive_links['file_0']}},
                upsert=True
            )
        elif document_type == "Credit Card" and "Name" in named_entities:
            db.creditcards.update_one(
                {"name": named_entities["Name"]},
                {"$set": {"fileLink": file_drive_links['file_0']}},
                upsert=True
            )
        elif document_type == "Cheque" and "Name" in named_entities:
            db.cheques.update_one(
                {"name": named_entities["Name"]},
                {"$set": {"fileLink": file_drive_links['file_0']}},
                upsert=True
            )

        # Send data to the Express server
        express_url = "http://localhost:3000/pushDetails"
        response = requests.post(express_url, json=selected_data)

        if response.status_code in [200, 201]:
            return jsonify({
                "message": "Data sent to /pushDetails and files uploaded to Google Drive successfully",
                "express_response": response.json(),
                "uploaded_files": file_drive_links
            }), response.status_code
        else:
            return jsonify({
                "message": "Failed to send data to /pushDetails",
                "express_response": response.text
            }), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
