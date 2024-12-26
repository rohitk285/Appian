import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import Navbar from "../components/Navbar";

const EntryPage = () => {
  const users = [
    { name: "Rohan Bakshi", dob: "1987-11-09", uploadedOn: "29/09/2024" },
    { name: "Rohini Deshpande", dob: "2001-07-17", uploadedOn: "29/09/2024" },
    { name: "Rohit Kumar", dob: "1995-12-12", uploadedOn: "28/09/2024" },
    { name: "Yousaf M", dob: "1975-05-14", uploadedOn: "28/09/2024" },
    { name: "Rohaan Acharya", dob: "1992-06-24", uploadedOn: "02/12/2024" },
    { name: "Rohandeep Reddy", dob: "1997-07-06", uploadedOn: "12/09/2024" },
    { name: "Manoj Reddy", dob: "1998-09-09", uploadedOn: "12/10/2024" },
    { name: "Aditya Bakshi", dob: "1988-12-30", uploadedOn: "02/12/2024" },
    { name: "Amyra Pandey", dob: "1999-07-10", uploadedOn: "01/11/2024" },
    { name: "Alapati Raju", dob: "1985-11-11", uploadedOn: "02/11/2024" },
    { name: "Govindan Narasimha", dob: "1990-08-09", uploadedOn: "01/11/2024" },
    { name: "Lakshmi Narayanan", dob: "1985-09-08", uploadedOn: "02/11/2024" },
  ];

  const [formData, setFormData] = useState({ name: "", dob: "" });
  const [filteredResults, setFilteredResults] = useState(users);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(newFormData.name.toLowerCase()) &&
        (!newFormData.dob || user.dob === newFormData.dob)
    );
    setFilteredResults(filtered);
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          minHeight: "100vh",
          backgroundColor: "#FFFFFF", // White background
          padding: 4,
          marginTop: "64px", // Avoid navbar overlap
        }}
      >
        {/* Left Input Section */}
        <Box
          sx={{
            flex: 1,
            maxWidth: "300px",
            maxHeight: "280px",
            marginRight: 4,
            backgroundColor: "#FF5722", // Orange background
            padding: 4,
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: "bold",
              marginBottom: 2,
              color: "#FFFFFF", // White text
            }}
          >
            Search User
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                sx={{
                  backgroundColor: "#FFFFFF", // White input background
                  borderRadius: "4px",
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dob"
                variant="outlined"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dob}
                onChange={handleChange}
                sx={{
                  backgroundColor: "#FFFFFF", // White input background
                  borderRadius: "4px",
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Right Results Section */}
        <Box
          sx={{
            flex: 2,
            backgroundColor: "#111810", // Black background
            padding: 4,
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            maxHeight: "600px", // Fixed height
            overflow: "auto", // Scrollable content
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold", marginBottom: 2, color: "#FFFFFF" }}
          >
            Results
          </Typography>
          {filteredResults.length > 0 ? (
            filteredResults.map((user, index) => (
              <Card
                key={index}
                sx={{
                  marginBottom: 2,
                  borderRadius: "8px",
                  backgroundColor: "#FF5722", // Orange background
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  color: "#FFFFFF", // White text
                  ":hover": {
                    backgroundColor: "#FFFFFF", // White background on hover
                    color: "#000000", // Black text on hover
                    transition: "background-color 0.3s, color 0.3s", // Smooth transition
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", fontFamily: "MerriWeather" }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body1" sx={{fontFamily: "Kanit"}}>
                    Date of Birth: {user.dob}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: "#FFFFFF" }}>
              No results found.
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
};

export default EntryPage;
