import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Button,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { joinChallenge } from "../firebaseConfig"; // Buttons to be added for this 

const calculateDaysLeft = (endDate) => {
  if (!endDate?.toDate) return "Unknown";
  const now = new Date();
  const end = endDate.toDate();
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `${diffDays} day(s) left` : "Ended";
};


//-------------------------------------------
// taking most of the code from prabhs example here to use in our system (Daysleft may change later depending if we decide on
// a 30 day limit for each challenge or not just depends on what we want to calculate i guess)
//-------------------------------------------

const ChallengeCard = ({ challenge }) => {
  const {
    title,
    description,
    type,
    bannerImage,
    createdAt,
    endDate,
    creatorId,
    creatorName,
  } = challenge;

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const isCreator = currentUser?.uid === creatorId;

  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${creatorId}`);
  };

  const handleEdit = () => {
    console.log("Edit challenge:", challenge.id);
    // this is just a place holder for now 
  };

  const handleDelete = () => {
    console.log("Delete challenge:", challenge.id);
    // another place holder for now
  };


  const handleJoinChallenge = async (teamColor) => {
  try {
    await joinChallenge(challenge.id, currentUser.uid, teamColor);
    //alert(`You have joined Team ${teamColor.toUpperCase()}!`);
  } catch (error) {
    console.error("Failed to join team:", error);
  }
};
  
  const userHasJoined = challenge.teams?.red?.includes(currentUser?.uid) ||
                      challenge.teams?.blue?.includes(currentUser?.uid)

  return (
    <Card sx={{ maxWidth: 345, height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        height="180"
        image={bannerImage || "https://via.placeholder.com/600x200?text=No+Image"}
        alt="Challenge Banner"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6">
          {title || "Untitled Challenge"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {description || "No description provided."}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
          <Chip
            icon={<FitnessCenterIcon />}
            label={type || "General"}
            size="small"
            color="secondary"
          />
          <Chip
            icon={<ScheduleIcon />}
            label={calculateDaysLeft(endDate)}
            size="small"
            color="primary"
          />
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 1,
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={handleProfileClick}
        >
          <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
          Created by: {creatorName || "Unknown"}
        </Typography>

        {isCreator && (
          <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
            <IconButton size="small" onClick={handleEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', padding: '16px' }}>
        <Button variant="contained"
          sx={{ background: '#e53935', '&:hover': { backgroundColor: '#b71c1c', }, }}
          disabled={userHasJoined}
          onClick={() => handleJoinChallenge('red')}>
          Join Red Team 
        </Button>
        <Button variant="contained"
          sx={{ background: '#1e88e5', '&:hover': { backgroundColor: '#0d47a1', }, }}
          disabled={userHasJoined}
          onClick={() => handleJoinChallenge('blue')}>
          Join Blue Team 
        </Button>
       </CardActions>
    </Card>
  );
};

export default ChallengeCard;
