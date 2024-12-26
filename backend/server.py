from pymongo import MongoClient
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection string
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.get_database("user_uploads")  # Replace with your database name
uploads_collection = db.uploads  # Collection to store uploads data

# Google Drive API setup
SERVICE_ACCOUNT_FILE = os.getenv("SERVICE_ACCOUNT_FILE")
SCOPES = ['https://www.googleapis.com/auth/drive.file']
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
drive_service = build('drive', 'v3', credentials=credentials)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf'}

# Function to check if the file has an allowed extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to upload a file to Google Drive
def upload_to_google_drive(file_path, file_name):
    try:
        file_metadata = {'name': file_name}
        media = MediaFileUpload(file_path, mimetype='application/pdf')

        # Upload file to Google Drive
        file = drive_service.files().create(body=file_metadata, media_body=media, fields='id').execute()

        # Set file permissions to make it publicly accessible
        file_id = file.get('id')
        drive_service.permissions().create(
            fileId=file_id,
            body={'type': 'anyone', 'role': 'reader'}  # Public access
        ).execute()

        # Generate and return previewable link
        return f"https://drive.google.com/file/d/{file_id}/preview"
    except Exception as e:
        print(f"Error uploading to Google Drive: {e}")
        raise

@app.route("/upload", methods=["POST"])
def upload_data():
    try:
        data = request.form
        name = data.get('name')
        dob = data.get('dob')

        if not name or not dob:
            return jsonify({"error": "Name and Date of Birth are required"}), 400

        # List to store links of uploaded files
        document_links = []

        # Process uploaded files
        for file_key in request.files:
            file = request.files.get(file_key)
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join("temp", filename)
                file.save(file_path)
                file_link = upload_to_google_drive(file_path, filename)
                document_links.append(file_link)
                os.remove(file_path)  # Clean up temporary file

        if not document_links:
            return jsonify({"error": "No valid files uploaded."}), 400

        # Check if the user already exists
        existing_user = uploads_collection.find_one({"name": name, "dob": dob})

        if existing_user:
            # If user exists, append new file links to the documents array
            uploads_collection.update_one(
                {"_id": existing_user["_id"]},
                {"$push": {"documents": {"$each": document_links}}}
            )
            message = "Files uploaded successfully and added to existing user."
        else:
            # If user does not exist, create a new entry with the uploaded files
            user_data = {
                "name": name,
                "dob": dob,
                "documents": document_links  # Add all uploaded file URLs to documents
            }

            uploads_collection.insert_one(user_data)
            message = "New user created and files uploaded successfully."

        return jsonify({"message": message}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": f"Failed to upload data: {str(e)}"}), 500

@app.route("/getUserDetails", methods=["POST"])
def get_user_details():
    try:
        data = request.get_json()
        name = data.get("name")
        dob = data.get("dob")

        if not name or not dob:
            return jsonify({"error": "Name and Date of Birth are required"}), 400

        user_data = uploads_collection.find_one({"name": name, "dob": dob})

        if not user_data:
            return jsonify({"error": "No user found with the provided details"}), 404

        # Retrieve the documents (links) associated with the user
        documents = user_data.get("documents", [])

        # Return the full user data along with their associated document links
        return jsonify({
            "userData": {
                "name": user_data["name"],
                "dob": user_data["dob"],
                "aadharNumber": user_data["aadharNumber"],
                "panNumber": user_data["panNumber"],
                "documents": documents  # Include the array of document links
            }
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to retrieve user details: {str(e)}"}), 500

if __name__ == "__main__":
    # Create temp directory if not exists
    if not os.path.exists("temp"):
        os.makedirs("temp")
    app.run(debug=True)
