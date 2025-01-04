from flask import Flask, jsonify, request
import random
import requests

app = Flask(__name__)

# Sample data array
data_array = [
  {
    "document_type": "aadhaar",
    "named_entities": {
      "name": "Rahul Rajendra prasad Mishra",
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
      "name": "Jane Doe",
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
    "document_type": "pan",
    "named_entities": {
      "name": "Amardeep Singh",
      "father_name": "Surjit Singh",
      "dob": "09/11/1995",
      "pan_number": "LIWPS9203C"
    }
  },
  {
    "document_type": "credit card",
    "named_entities": {
      "name": "CF Frost",
      "card_number": "3159 876543 21001",
      "expiry_date": "10/28",
      "issuer": "American Express"
    }
  },
  {
    "document_type": "aadhaar",
    "named_entities": {
      "name": "Aarav Kapoor",
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
      "name": "Neha Sharma",
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
    "document_type": "pan",
    "named_entities": {
      "name": "Jane Doe",
      "father_name": "Michael Doe",
      "dob": "12/08/1982",
      "pan_number": "HGXPS3452K"
    }
  },
  {
    "document_type": "credit card",
    "named_entities": {
      "name": "Neha Sharma",
      "card_number": "5678 4321 2109 8765",
      "expiry_date": "07/25",
      "issuer": "MasterCard"
    }
  },
  {
    "document_type": "cheque",
    "named_entities": {
      "name": "Michael Doe",
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
      "name": "CF Frost",
      "dob": "1980",
      "gender": "Male",
      "aadhaar_number": "6543 3210 9087",
      "vid": "2109 8765 4321 1098",
      "issue_date": "1985"
    }
  }
]

@app.route('/', methods=['GET'])
def test():
    return jsonify({"message": "Flask server is running"}), 200

@app.route('/uploadDetails', methods=['POST'])
def upload_details():
    try:
        # Select a random object from the array
        # selected_data = random.choice(data_array)
        selected_data = data_array[3]

        # Send the selected data to the Express.js /pushDetails endpoint
        express_url = "http://localhost:3000/pushDetails"
        response = requests.post(express_url, json=selected_data)

        # Check if the Express.js server responded successfully
        if response.status_code == 200:
            return jsonify({
                "message": "Data sent to /pushDetails successfully",
                "express_response": response.json()
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
