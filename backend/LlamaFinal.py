import fitz  # PyMuPDF
import json
import base64
import os
from together import Together
import tempfile

# Initialize Together client using the API key from the environment variable
api_key = os.getenv("TOGETHER_API_KEY")
if not api_key:
    exit("Error: TOGETHER_API_KEY environment variable is not set.")
client = Together(api_key=api_key)

getDescriptionPrompt = """You are tasked with extracting and classifying the document type from the provided image and outputting only the named entities in strict JSON format. Follow these rules strictly:
1. Always include the document_type field with an exact and consistent value for the same type of document (e.g., "PAN Card" for all PAN cards).
2. Extract all named entities relevant to the document type, and include them under the named_entities field in a key-value format.
3. Do not add any commentary, explanation, or additional text outside of the JSON.
4. Ensure the JSON response follows this exact structure:

[
  {
    "document_type": "<document_type>",
    "named_entities": {
      "<entity_1>": "<value_1>",
      "<entity_2>": "<value_2>",
      ...
    }
  }
]

Here are examples for different document types to guide your output:

### PAN Card
[
  {
    "document_type": "PAN Card",
    "named_entities": {
      "Name": "Ram Agya Prasad",
      "Date of Birth": "24/01/1991",
      "Permanent Account Number": "CXRPK9829B"
    }
  }
]

### Aadhaar Card
[
  {
    "document_type": "Aadhaar Card",
    "named_entities": {
      "Name": "Sita Ram Gupta",
      "Aadhaar Number": "1234 5678 9123",
      "Date of Birth": "15/06/1985",
      "Gender": "Male",
      "Address": "House No. 123, Sector 9, Gurgaon, Haryana - 122001"
    }
  }
]

### Credit Card
[
  {
    "document_type": "Credit Card",
    "named_entities": {
      "Name": "John A. Smith",
      "Card Number": "4111 1111 1111 1111",
      "Expiry Date": "12/26",
      "Bank Name": "XYZ Bank"
    }
  }
]

### Cheque
[
  {
    "document_type": "Cheque",
    "named_entities": {
      "Name": "Rajesh Kumar",
      "Account Number": "9876543210",
      "Bank Name": "ABC Bank",
      "IFSC Code": "ABCD0123456",
      "Cheque Number": "123456",
      "Amount": "₹10,000"
    }
  }
]

For every receipt or document, generate the response in the same format and structure, maintaining consistency for the document_type field. Always ensure the JSON format is valid."""

def pdf_to_images(file_stream, output_folder, max_images=10):
    """
    Convert each page of a PDF into separate image files.

    Args:
    - file_stream (BytesIO): File-like object containing the PDF.
    - output_folder (str): Path to the folder where images will be saved.
    - max_images (int): Maximum number of images to extract.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Save the file stream to a temporary file
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_pdf:
        temp_pdf.write(file_stream.read())
        temp_pdf_path = temp_pdf.name

    pdf_document = fitz.open(temp_pdf_path)
    for page_num in range(min(len(pdf_document), max_images)):
        page = pdf_document[page_num]
        pix = page.get_pixmap(dpi=300)
        image_path = os.path.join(output_folder, f"receipt_page_{page_num + 1}.png")
        pix.save(image_path)
        print(f"Saved: {image_path}")

    pdf_document.close()
    os.remove(temp_pdf_path)  # Clean up the temporary file
    print(f"PDF pages converted to images in '{output_folder}'.")

# Function to encode the image to Base64
def encode_image(image_path):
    """Encode the image to Base64."""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")
    except FileNotFoundError:
        print(f"Error: Could not find image file at {image_path}")
        return None
    except Exception as e:
        print(f"An error occurred while reading the image: {str(e)}")
        return None

# Get the first 10 PNG images from the folder
def get_image_files(folder_path, limit=10):
    try:
        images = [
            os.path.join(folder_path, file)
            for file in os.listdir(folder_path)
            if file.endswith(".png") or file.endswith(".jpg")
        ]
        return images[:limit]
    except Exception as e:
        print(f"Error reading the folder: {str(e)}")
        return []

# Function to save JSON output to a file
def save_json_output(data, output_path):
    """Save the JSON data to a file."""
    try:
        with open(output_path, "w") as json_file:
            json.dump(data, json_file, indent=4)
        print(f"JSON output saved to {output_path}")
    except Exception as e:
        print(f"Error saving JSON output: {str(e)}")

# Function to normalize JSON response
def normalize_json_response(parsed_response):
    """Normalize the JSON response to handle missing fields."""
    normalized = []
    required_fields = ["document_type", "named_entities"]

    for entry in parsed_response:
        normalized_entry = {key: entry.get(key, "") for key in required_fields}
        if "named_entities" in normalized_entry and isinstance(normalized_entry["named_entities"], dict):
            # Ensure named_entities is a dictionary
            normalized_entry["named_entities"] = {
                key: value for key, value in normalized_entry["named_entities"].items()
            }
        else:
            normalized_entry["named_entities"] = {}

        normalized.append(normalized_entry)

    return normalized

# Function to convert output to strict JSON format
def convert_to_strict_json(response_content):
    """Ensure the output is in proper JSON format."""
    try:
        # Attempt to parse as JSON directly
        if response_content.startswith("[") and response_content.endswith("]"):
            return json.loads(response_content)
        else:
            print("Warning: Response does not strictly follow JSON format. Attempting to convert.")
            response_content = response_content.strip()
            start_idx = response_content.find("[")
            end_idx = response_content.rfind("]") + 1
            if start_idx != -1 and end_idx != -1:
                json_part = response_content[start_idx:end_idx]
                return json.loads(json_part)
            else:
                print("Error: Could not locate JSON in the response.")
                return []
    except json.JSONDecodeError:
        print("Error: Failed to parse the response as JSON.")
        return []

# Main function to process PDF and extract data
def process_pdf_with_llama(file_stream, output_folder, json_output_path=None):
    """
    Process a PDF file-like object and extract structured data.

    Args:
    - file_stream (BytesIO): File-like object containing the PDF.
    - output_folder (str): Path to the folder where images will be saved.
    - json_output_path (str): Path for saving the JSON output.
    """
    pdf_to_images(file_stream, output_folder)
    imageFiles = get_image_files(output_folder)

    if not imageFiles:
        print("No images found in the folder. Exiting.")
        return []

    all_responses = []

    valid_document_types = ["Aadhaar Card", "PAN Card", "Cheque", "Credit Card"]

    for idx, imagePath in enumerate(imageFiles):
        print(f"\nProcessing Image {idx + 1}/{len(imageFiles)}: {imagePath}")

        base64_image = encode_image(imagePath)
        if not base64_image:
            print(f"Failed to encode image {imagePath}. Skipping.")
            continue

        valid_response = False
        while not valid_response:
            stream = client.chat.completions.create(
                model="meta-llama/Llama-Vision-Free",
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": getDescriptionPrompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}"
                            },
                        },
                    ],
                }],
                stream=True,
            )

            print("Model Response:", end=" ", flush=True)
            response_content = ""
            for chunk in stream:
                if not hasattr(chunk, 'choices') or not chunk.choices:
                    continue

                choice = chunk.choices[0]
                if not hasattr(choice, 'delta'):
                    continue

                delta = choice.delta
                if not hasattr(delta, 'content'):
                    continue

                content = delta.content
                if content is not None:
                    print(content, end="", flush=True)
                    response_content += content

            print()  # Print a newline after the response

            # Convert and normalize the JSON response
            parsed_response = convert_to_strict_json(response_content)
            normalized_response = normalize_json_response(parsed_response)

            # Check if the response contains valid document types
            for entry in normalized_response:
                document_type = entry.get("document_type", "")
                if document_type in valid_document_types:
                    valid_response = True
                    all_responses.extend(normalized_response)
                    break  # Exit while loop if a valid response is found

    if json_output_path:
        save_json_output(all_responses, json_output_path)

    return all_responses


# Example usage
# pdf_path = "/home/george/MachineLearning/ML/1AadharPDF.pdf"  # Replace with your PDF file path
# output_folder = "aadharimage"  # Replace with your desired output folder
# json_output_path = "output_responses_aadhar.json"  # Path for saving the JSON output
# process_pdf_with_llama(pdf_path, output_folder, json_output_path)