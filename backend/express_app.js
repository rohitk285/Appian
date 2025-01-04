const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors');
const Document = require("./models/documentModel");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Allow only the frontend's domain
    methods: ['GET', 'POST'], // Allow specific methods
  }));

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

    if (!named_entities.name) {
      return res.status(400).json({ error: "Named entity 'name' is required" });
    }

    // Find document by name
    let existingDocument = await Document.findOne({
      name: named_entities.name,
    });
    console.log(existingDocument);
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

      console.log(existingDocument.named_entities);
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
      // Create a new document if not found
      const newDocument = new Document({
        name: named_entities.name, // Extract and set the name
        document_type: [document_type], // Start with an array for document_type
        named_entities,
      });

      await newDocument.save();
      return res.status(201).json({ message: "Document created successfully" });
    }
  } catch (error) {
    console.error("Error processing document data:", error);
    res.status(500).json({ error: "Failed to process document data" });
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

    if (userDocument.length === 0)
      return res.status(404).json({ error: "User not found" });

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

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Express server running on http://localhost:${PORT}`)
);
