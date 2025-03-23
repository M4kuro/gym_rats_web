import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import CreateChallengeDialog from "./CreateChallengeDialog";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();

  // useeffect for auth changes
  // using mostly the code that was provided via the class on last monday and saturday.
  // totally works for what we want
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, [auth]);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const navLinks = isLoggedIn
    ? [
        { text: "Home", path: "/home" },
        { text: "Create Challenge", action: () => setDialogOpen(true) },
        { text: "Profile", path: "/profile" },
        { text: "Logout", action: handleLogout },
      ]
    : [
        { text: "Login", path: "/" },
        { text: "Signup", path: "/signup" },
      ];

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gym Challenge App 💪
          </Typography>
        </Toolbar>
      </AppBar>

      <Toolbar /> {/* i found this offset on the web, it keeps content from being hidden behind the appbar */}

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {navLinks.map((link, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (link.action) {
                      link.action();
                    } else {
                      navigate(link.path);
                    }
                  }}
                >
                  <ListItemText primary={link.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

       {/*challenge Dialog should go here i think? */}
      <CreateChallengeDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      onChallengeCreated={(newChallenge) => {
        console.log("Challenge created:", newChallenge);
        // at some point later we will want this to refresh the homepage
      }}
    />
  </>
);
};

export default Navbar;
