const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const Document = require("./models/documentModel");
const Aadhar = require("./models/aadharModel");
const Pan = require("./models/panModel");
const CreditCard = require("./models/creditCardModel");
const Cheque = require("./models/chequeModel");
const verhoeff = require('verhoeff');
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Allow only the frontend's domain
    methods: ["GET", "POST"], // Allow specific methods
  })
);

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI; // Replace with your MongoDB URI
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// /pushDetails endpoint
app.post("/pushDetails", async (req, res) => {
  try {
    const documentData = req.body;
    const { document_type, named_entities } = documentData;

    if (!named_entities.Name) {
      return res.status(400).json({ error: "Named entity 'name' is required" });
    }

    // Find document by name
    let existingDocument = await Document.findOne({
      name: named_entities.Name,
    });
    // console.log(existingDocument);
    if (existingDocument) {
      // Update the existing document
      if (!existingDocument.document_type.includes(document_type)) {
        // Append document type to the array if not already present
        existingDocument.document_type.push(document_type);
      }

      // Merge or update named_entities fields
      for (const [key, value] of Object.entries(named_entities)) {
        existingDocument.named_entities[key] = value; // Overwrite or add field
      }

      // console.log(existingDocument.named_entities);
      // Save the updated document
      await Document.updateOne(
        { name: existingDocument.name },
        {
          $set: {
            named_entities: existingDocument.named_entities,
            document_type: existingDocument.document_type,
          },
        }
      );
      return res.status(200).json({ message: "Document updated successfully" });
    } else {
      const newDocument = {name: named_entities.Name, document_type: [document_type],named_entities: named_entities};
      // console.log(newDocument);
      await Document.create(newDocument);
      return res.status(201).json({ message: "Document created successfully" });
    }
  } catch (error) {
    console.error("Error processing document data:", error);
    res.status(500).json({ error: "Failed to process document data" });
  }
});

app.post('/validateAadhaar', (req, res) => {
  const { aadhaar_number } = req.body;

  // Remove spaces before validating
  const cleanAadhaarNumber = aadhaar_number.replace(/\s+/g, '');
  console.log(cleanAadhaarNumber);
  console.log(verhoeff.validate(cleanAadhaarNumber));

  if (cleanAadhaarNumber && cleanAadhaarNumber.length === 12 && verhoeff.validate(cleanAadhaarNumber)) {
    return res.status(200).json({ message: "Aadhaar Number is valid." });
  } else {
    return res.status(400).json({ error: "Invalid Aadhaar Number." });
  }
});

app.get("/getUserDetails", async (req, res) => {
  try {
    const { name } = req.query; // Get the 'name' query parameter

    if (!name) return res.status(400).json({ error: "Name is required" });

    // Find document by name
    const userDocument = await Document.find({
      name: { $regex: name, $options: "i" },
    });

    // Return user details
    return res.status(200).json({
      message: "User details fetched successfully",
      data: userDocument,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

app.get("/getLinks", async (req, res) => {
  const { name } = req.query;

  try {
    if (!name) return res.status(400).json({ error: "Name is required" });

    let docs = await Document.findOne({ name: name }, { document_type: 1 });
    docs = docs.document_type;

    if (!docs || docs.length === 0) {
      return res.status(500).send("No documents found");
    }

    let response = [];

    // Use for...of loop to handle async/await properly
    for (const doc of docs) {
      switch (doc) {
        case "Aadhaar Card":
          let aadhaarLink = await Aadhar.findOne(
            { name: name },
            { fileLink: 1 }
          );
          if (aadhaarLink) {
            response.push({ document: "Aadhar", link: aadhaarLink.fileLink });
          }
          break;
        case "PAN Card":
          let panLink = await Pan.findOne({ name: name }, { fileLink: 1 });
          if (panLink) {
            response.push({ document: "PAN Card", link: panLink.fileLink });
          }
          break;
        case "Cheque":
          let chequeLink = await Cheque.findOne(
            { name: name },
            { fileLink: 1 }
          );
          if (chequeLink) {
            response.push({ document: "Cheque", link: chequeLink.fileLink });
          }
          break;
        case "Credit Card":
          let creditCardLink = await CreditCard.findOne(
            { name: name },
            { fileLink: 1 }
          );
          if (creditCardLink) {
            response.push({
              document: "Credit Card",
              link: creditCardLink.fileLink,
            });
          }
          break;
        default:
          break;
      }
    }

    // If no documents are found
    if (response.length === 0) {
      return res.status(404).json({ message: "No document links found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Express server running on http://localhost:${PORT}`)
);
