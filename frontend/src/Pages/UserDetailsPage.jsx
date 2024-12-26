import React from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import { useLocation } from "react-router-dom";

const UserDetailsPage = () => {
  const location = useLocation();
  const { userDetails } = location.state; // Get the user details passed from the EntryPage

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: { xs: "90%", sm: "800px" },
          padding: 4,
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", marginBottom: 3 }}
        >
          User Details
        </Typography>

        <Box>
          <Typography variant="body1" gutterBottom>
            <strong>Name:</strong> {userDetails.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Date of Birth:</strong> {userDetails.dob}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Aadhar Number:</strong> {userDetails.aadharNumber}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>PAN Number:</strong> {userDetails.panNumber}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ marginBottom: 1 }}>
          Documents Uploaded:
        </Typography>

        {userDetails.documents && userDetails.documents.length > 0 ? (
          userDetails.documents.map((docLink, index) => (
            <Box key={index} sx={{ marginBottom: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  overflow: "hidden",
                  borderRadius: 2,
                  boxShadow: 1,
                  padding: 1,
                  backgroundColor: "#f1f1f1",
                }}
              >
                <iframe
                  src={docLink}
                  width="100%"
                  height="700px"
                  title={`Document ${index + 1}`}
                />
              </Paper>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No documents uploaded.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default UserDetailsPage;
