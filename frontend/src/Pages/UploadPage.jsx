import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import Slider from "react-slick"; // Importing react-slick for the carousel
import "slick-carousel/slick/slick.css"; // Slick CSS
import "slick-carousel/slick/slick-theme.css"; // Slick Theme CSS
import Navbar from "../components/Navbar";
import UploadImage from "../assets/icon1.png";
import CustomerVerified from "../assets/icon2.jpg";
import IndiaBanks from "../assets/icon4.png";
import WorldBanks from "../assets/icon3.png";
import AIPowered from "../assets/icon5.jpg"; // New image
import ProcessIntelligence from "../assets/icon6.png"; // New image

const UploadPage = () => {
  const [formData, setFormData] = useState({
    employeeId: "",
    pin: "",
    files: [],
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    setFormData({
      ...formData,
      files: [...formData.files, ...Array.from(files)],
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("employeeId", formData.employeeId);
      formDataToSend.append("pin", formData.pin);

      formData.files.forEach((file, index) => {
        formDataToSend.append(`file_${index}`, file);
      });

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
      } else {
        alert(result.error);
      }

      setFormData({
        employeeId: "",
        pin: "",
        files: [],
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  // Carousel settings for react-slick
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4, // Show 4 images at a time
    slidesToScroll: 1, // Scroll one image at a time
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
  };

  const carouselImages = [
    { src: CustomerVerified, text: "10M Customer Records Verified" },
    { src: IndiaBanks, text: "Partnered with 10+ Banks in India" },
    { src: WorldBanks, text: "Partnered with 25+ Banks Worldwide" },
    { src: AIPowered, text: "Pioneers in AI-powered technology" },
    { src: ProcessIntelligence, text: "Process Intelligence" },
  ];

  return (
    <>
      <Navbar />
      {/* Section with black background */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#000000", // Black background
          padding: 4,
        }}
      >
        {/* Form Section */}
        <Box
          sx={{ width: { xs: "100%", sm: "40%" } }}
          className="-translate-y-24 translate-x-10"
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "#FFFFFF",
              marginBottom: 3,
              fontFamily: "Oswald"
            }}
          >
            Upload Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employeeId"
                variant="outlined"
                value={formData.employeeId}
                onChange={handleChange}
                sx={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 1,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="PIN Number"
                name="pin"
                variant="outlined"
                type="password"
                value={formData.pin}
                onChange={handleChange}
                sx={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 1,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                sx={{
                  color: "#FFFFFF",
                  borderColor: "#FFFFFF",
                }}
              >
                Upload Files (PDFs)
                <input
                  type="file"
                  name="files"
                  hidden
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                />
              </Button>
              {formData.files.length > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, color: "#FFFFFF" }}
                >
                  Selected Files:
                  <ul>
                    {formData.files.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{
                  backgroundColor: "#FF5722",
                  padding: "10px 0",
                  fontWeight: "bold",
                  fontSize: "16px",
                  borderRadius: "30px",
                }}
              >
                Upload
              </Button>
            </Grid>
            {loading && (
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "center", mt: 2 }}
              >
                <CircularProgress sx={{ color: "#FFFFFF" }} />
                <Typography variant="body1" sx={{ ml: 2, color: "#FFFFFF" }}>
                  Uploading, please wait...
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Image Section */}
        <Box
          sx={{
            display: { xs: "none", sm: "block" },
            width: "50%",
          }}
        >
          <img
            className="translate-x-32 -translate-y-24"
            src={UploadImage}
            alt="Illustration"
            style={{
              height: "350px",
              width: "400px",
              borderRadius: "10px",
            }}
          />
        </Box>
      </Box>

      {/* Section with white background */}
      <Box
        className="-translate-y-64"
        sx={{
          minHeight: "100vh",
          backgroundColor: "#FFFFFF", // White background
          padding: 4,
        }}
      >
        <Slider
          {...carouselSettings}
          style={{ margin: "0 -15px" }} // Adjust margins for proper spacing
        >
          {carouselImages.map((item, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                margin: "0 15px", // Add spacing between images
                width: "70%", // Reduce the width of the images
                height: "200px", // Reduce the height of the images
                backgroundImage: `url(${item.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center", // Center the content vertically
                justifyContent: "center", // Center the content horizontally
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)", // Add a slight shadow for better visuals
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
                  padding: "10px 20px", // Add padding for the text strip
                  borderRadius: "5px",
                  textAlign: "center", // Center text alignment
                }}
              >
                {item.text}
              </Typography>
            </Box>
          ))}
        </Slider>
      </Box>
    </>
  );
};

export default UploadPage;
