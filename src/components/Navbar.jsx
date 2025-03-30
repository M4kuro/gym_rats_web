import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from '@mui/material/Avatar';
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import CreateChallengeDialog from "./CreateChallengeDialog";
import { red } from '@mui/material/colors';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();
  const color = red[500];

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
      <AppBar position="fixed" sx={{ backgroundColor:'#e53935' }}>
        <Toolbar>
          <IconButton edge="start" color="black" onClick={toggleDrawer(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          {/* logo centrilized */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
             <Avatar src="/homeL.png" sx={{ width: 52, height: 52, background:'#e53935'}}>L</Avatar>
          </Box>

          {/* User on the right */}
          <IconButton>
            <Avatar src="" sx={{ width: 42, height: 42,}}>L</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Toolbar /> {/* i found this offset on the web, it keeps content from being hidden behind the appbar */}

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box sx={{ width: 220 }} role="presentation" onClick={toggleDrawer(false)}>
            <List>
              {navLinks.map((link, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    sx={{
                      justifyContent: 'center',
                      '&:hover': {
                        backgroundColor: '#e53935', 
                        
                      },
                    }}
                    onClick={() => {
                      if (link.action) {
                        link.action();
                      } else {
                        navigate(link.path);
                      }
                    }}
                  >
                    <ListItemText
                      primary={link.text}
                      sx={{ textAlign: 'center' }} // Center text within ListItemText
                    />
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
