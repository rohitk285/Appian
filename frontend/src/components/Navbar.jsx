import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Handle dropdown menu open/close
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#FFFFFF", // White navbar
        color: "#000000", // Default text color to black
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for the navbar
        padding: 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Appian text */}
        <Typography
          variant="h3"
          component="div"
          sx={{
            cursor: "pointer",
            fontWeight: "bold",
            color: "#FF5722", // Orange color for Appian text
            fontFamily: "Bebas Neue",
          }}
          onClick={() => navigate("/")}
        >
          Appian
        </Typography>

        {/* Menu options */}
        <Box>
          {/* Retrieve Button with Dropdown */}
          <Button
            onClick={handleMenuOpen}
            sx={{
              color: "#FFFFFF", // White text for button
              backgroundColor: "#FF5722", // Orange bubble background
              fontWeight: "bold",
              textTransform: "none",
              marginRight: 2, // Spacing between buttons
              padding: "8px 20px", // Bubble-like padding
              borderRadius: "10px", // Rounded bubble style
              ":hover": {
                backgroundColor: "#E64A19", // Darker orange on hover
              },
            }}
          >
            Retrieve
          </Button>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate("/retrievedate"); }}>
              By Upload Date
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate("/"); }}>
              By Customer Name
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate("/retrievedoc"); }}>
              By Document Type
            </MenuItem>
          </Menu>

          {/* Other Buttons */}
          {["Upload", "About Us", "Logout"].map((text, index) => (
            <Button
              key={index}
              onClick={() => navigate(index === 0 ? "/uploadDocs" : "#")}
              sx={{
                color: "#FFFFFF", // White text for buttons
                backgroundColor: "#FF5722", // Orange bubble background
                fontWeight: "bold",
                textTransform: "none",
                marginRight: 2, // Spacing between buttons
                padding: "8px 20px", // Bubble-like padding
                borderRadius: "10px", // Rounded bubble style
                ":hover": {
                  backgroundColor: "#E64A19", // Darker orange on hover
                },
              }}
            >
              {text}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
