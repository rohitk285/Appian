from flask import Flask, jsonify, request
import random
import requests
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_cors import CORS
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import io
from googleapiclient.http import MediaIoBaseUpload

app = Flask(__name__)
CORS(app)
load_dotenv()

# Sample data array
data_array = [
  {
    "document_type": "aadhaar",
    "named_entities": {
      "Name": "Rahul Rajendra prasad Mishra",
      "dob": "25/05/1985",
      "gender": "Male",
      "aadhaar_number": "2932 1448 0395",
      "vid": "9155 9158 0007 4305",
      "issue_date": "25/05/2019"
    }
  },
  {
    "document_type": "cheque",
    "named_entities": {
      "Name": "Jane Doe",
      "address": "123 Great Linclon Road Miami MA 11223",
      "cheque_number": "A1234",
      "date": "26/06/2024",
      "payee": "Cairo Mohammed",
      "amount": "$2200",
      "bank": "Miami City Saving Union",
      "branch": "Miami Centre Branch Highland and Avenue 123 Miami USA"
    }
  },
  {
    "document_type": "PAN Card",
    "named_entities": {
      "Name": "Amardeep Singh",
      "father_name": "Surjit Singh",
      "dob": "09/11/1995",
      "pan_number": "LIWPS9203C"
    }
  },
  {
    "document_type": "credit card",
    "named_entities": {
      "Name": "CF Frost",
      "card_number": "3159 876543 21001",
      "expiry_date": "10/28",
      "issuer": "American Express"
    }
  },
  {
    "document_type": "aadhaar",
    "named_entities": {
      "Name": "Aarav Kapoor",
      "dob": "14/02/1990",
      "gender": "Male",
      "aadhaar_number": "7894 5623 1478",
      "vid": "1234 5678 9012 3456",
      "issue_date": "14/02/2020"
    }
  },
  {
    "document_type": "cheque",
    "named_entities": {
      "Name": "Neha Sharma",
      "address": "45 Elite Avenue Pune MH 411045",
      "cheque_number": "B5678",
      "date": "30/09/2023",
      "payee": "Amardeep Singh",
      "amount": "$1500",
      "bank": "Pune City Cooperative Bank",
      "branch": "Pune Elite Branch"
    }
  },
  {
    "document_type": "PAN Card",
    "named_entities": {
      "Name": "Jane Doe",
      "father_name": "Michael Doe",
      "dob": "12/08/1982",
      "pan_number": "HGXPS3452K"
    }
  },
  {
    "document_type": "credit card",
    "named_entities": {
      "Name": "Neha Sharma",
      "card_number": "5678 4321 2109 8765",
      "expiry_date": "07/25",
      "issuer": "MasterCard"
    }
  },
  {
    "document_type": "cheque",
    "named_entities": {
      "Name": "Michael Doe",
      "address": "1234 Main St, New York, NY, 10001",
      "cheque_number": "C9012",
      "date": "01/12/2023",
      "payee": "Aarav Kapoor",
      "amount": "$5000",
      "bank": "NY State Bank",
      "branch": "NYC Branch"
    }
  },
  {
    "document_type": "aadhaar",
    "named_entities": {
      "Name": "CF Frost",
      "dob": "1980",
      "gender": "Male",
      "aadhaar_number": "6543 3210 9087",
      "vid": "2109 8765 4321 1098",
      "issue_date": "1985"
    }
  }
]

# Google Drive API setup
SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = os.getenv('SERVICE_ACCOUNT_FILE')
MONGO_URI = os.getenv("MONGO_URI")
# print("SERVICE_ACCOUNT_FILE:", os.getenv('SERVICE_ACCOUNT_FILE'))

# Authenticate using the service account
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

drive_service = build('drive', 'v3', credentials=credentials)

# Function to upload file to Google Drive
def upload_to_drive(file_path, file_name):
    try:
        file_metadata = {'name': file_name}
        media = MediaFileUpload(file_path, mimetype='application/pdf')
        file = drive_service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        return file.get('id')
    except Exception as e:
        print(f"Error uploading file to Google Drive: {e}")
        return None

@app.route('/', methods=['GET'])
def test():
    return jsonify({"message": "Flask server is running"}), 200

from googleapiclient.errors import HttpError

@app.route('/uploadDetails', methods=['POST'])
def upload_details():
    try:
        # Handle file uploads
        files = request.files
        uploaded_files = []
        file_drive_links = {}

        # Map dynamic keys to expected document types
        document_type_mapping = {
            "aadhaar": "aadhaar",
            "pan": "pan",
            "credit_card": "credit_card",
            "cheque": "cheque"
        }

        for file_key, file in files.items():
            # Use the file content in memory
            file_metadata = {'name': file.filename}
            file_stream = io.BytesIO(file.read())
            media = MediaIoBaseUpload(file_stream, mimetype=file.mimetype, resumable=True)

            # Upload to Google Drive
            file_response = drive_service.files().create(
                body=file_metadata, media_body=media, fields='id').execute()

            if file_response:
                drive_file_id = file_response.get('id')

                # Update file permissions to make it publicly viewable
                try:
                    drive_service.permissions().create(
                        fileId=drive_file_id,
                        body={
                            "type": "anyone",  # Allow anyone with the link
                            "role": "reader"  # Grant view-only access
                        }
                    ).execute()
                except HttpError as e:
                    print(f"Error setting file permissions: {e}")

                drive_file_link = f"https://drive.google.com/file/d/{drive_file_id}/view"

                # Map uploaded file to its document type
                document_type = document_type_mapping.get(file_key, file_key)
                file_drive_links[document_type] = drive_file_link

                uploaded_files.append({
                    "file_name": file.filename,
                    "drive_file_id": drive_file_id,
                    "drive_file_link": drive_file_link
                })

        print("File Drive Links:", file_drive_links)

        # Select a random document from data_array
        # selected_data = random.choice(data_array)
        selected_data = data_array[2]
        document_type = selected_data["document_type"]
        named_entities = selected_data["named_entities"]

        client = MongoClient(MONGO_URI)  # Replace with your MongoDB URI
        db = client['test']  # Replace with your database name

        # Check if document exists and either insert or update
        if document_type == "aadhaar" and "Name" in named_entities:
            db.aadhars.update_one(
                {"name": named_entities["Name"]},  # Search for existing name
                {"$set": {"fileLink": file_drive_links.get("file_0", "")}},  # Update fileLink
                upsert=True  # If not found, insert new document
            )
        elif document_type == "PAN Card" and "Name" in named_entities:
            db.pans.update_one(
                {"name": named_entities["Name"]},
                {"$set": {"fileLink": file_drive_links.get("file_0", "")}},
                upsert=True
            )
        elif document_type == "credit card" and "Name" in named_entities:
            db.creditcards.update_one(
                {"name": named_entities["Name"]},
                {"$set": {"fileLink": file_drive_links.get("file_0", "")}},
                upsert=True
            )
        elif document_type == "cheque" and "Name" in named_entities:
            db.cheques.update_one(
                {"name": named_entities["Name"]},
                {"$set": {"fileLink": file_drive_links.get("file_0", "")}},
                upsert=True
            )

        # Proceed with sending data to the Express server
        express_url = "http://localhost:3000/pushDetails"
        response = requests.post(express_url, json=selected_data)

        if response.status_code in [200, 201]:
            return jsonify({
                "message": "Data sent to /pushDetails and files uploaded to Google Drive successfully",
                "express_response": response.json(),
                "uploaded_files": uploaded_files
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