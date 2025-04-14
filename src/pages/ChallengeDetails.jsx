// Full code with auto-refresh after check-in and team join buttons
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db, joinChallenge, leaveChallengeTeam, logChallengeProgress } from "../firebaseConfig";
import { getAuth } from "firebase/auth";

import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Stack,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";

import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ScheduleIcon from "@mui/icons-material/Schedule";

const calculateDaysLeft = (endDate) => {
  if (!endDate?.toDate) return "Unknown";
  const now = new Date();
  const end = endDate.toDate();
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `${diffDays} day(s) left` : "Ended";
};

const ChallengeDetails = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redMembers, setRedMembers] = useState([]);
  const [blueMembers, setBlueMembers] = useState([]);
  const [userTeam, setUserTeam] = useState(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const fetchTeams = async () => {
    if (!challenge || !currentUser) return;

    try {
      const teamsRef = collection(doc(db, "challenges", challenge.id), "teams");
      const teamDocs = await getDocs(teamsRef);

      const red = [];
      const blue = [];

      for (const docSnap of teamDocs.docs) {
        const team = docSnap.id;
        const members = docSnap.data().members || [];

        for (const uid of members) {
          const userRef = doc(db, "users", uid);
          const userDoc = await getDoc(userRef);
          let name = uid;
          let profilePic = "";

          if (userDoc.exists()) {
            const data = userDoc.data();
            name = data.profile?.name || data.name || data.email || uid;
            profilePic = data.profile?.profilePic || "";
          }

          const member = { name, uid, profilePic };

          if (team === "red") red.push(member);
          if (team === "blue") blue.push(member);

          if (uid === currentUser.uid) {
            setUserTeam(team);
          }
        }
      }

      setRedMembers(red);
      setBlueMembers(blue);

      const redTeamRef = doc(db, "challenges", challenge.id, "teams", "red");
      const blueTeamRef = doc(db, "challenges", challenge.id, "teams", "blue");

      const [redScoreSnap, blueScoreSnap] = await Promise.all([
        getDoc(redTeamRef),
        getDoc(blueTeamRef),
      ]);

      if (redScoreSnap.exists()) {
        setRedScore(redScoreSnap.data().totalPoints || 0);
      }
      if (blueScoreSnap.exists()) {
        setBlueScore(blueScoreSnap.data().totalPoints || 0);
      }
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  };

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const challengeRef = doc(db, "challenges", id);
        const docSnap = await getDoc(challengeRef);

        if (docSnap.exists()) {
          setChallenge({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error loading challenge:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  useEffect(() => {
    fetchTeams();
  }, [challenge, currentUser]);

  useEffect(() => {
    const checkTodayLog = async () => {
      if (!challenge || !currentUser) return;

      const today = new Date().toISOString().split("T")[0];
      const participantRef = doc(db, "challenges", challenge.id, "participants", currentUser.uid);
      const participantSnap = await getDoc(participantRef);

      if (participantSnap.exists()) {
        const logs = participantSnap.data().logs || {};
        if (logs[today]) {
          setHasCheckedInToday(true);
        }
      }
    };

    checkTodayLog();
  }, [challenge, currentUser]);

  const renderTeamMembers = (members, teamColor) => (
    members.map((member, i) => {
      const isCurrentUser = member.uid === currentUser.uid;
      return (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          key={i}
          sx={{ mb: 0.5 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={
                member.profilePic && member.profilePic !== ""
                  ? member.profilePic
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=ccc&color=444&size=40`
              }
              alt={member.name}
              sx={{ width: 32, height: 32 }}
            />
            <Typography
              variant="body2"
              fontWeight={isCurrentUser ? "bold" : "normal"}
            >
              {isCurrentUser ? `✅ ${member.name} (You)` : member.name}
            </Typography>
          </Stack>
          {isCurrentUser && (
            <Button
              size="small"
              variant="outlined"
              color="success"
              disabled={hasCheckedInToday}
              onClick={async () => {
                const success = await logChallengeProgress(
                  challenge.id,
                  currentUser.uid,
                  teamColor
                );
                if (success) {
                  setHasCheckedInToday(true);
                  await fetchTeams();
                  alert("✅ Your check-in was logged!");
                }
              }}
            >
              {hasCheckedInToday ? "✓ Done" : "Daily Done"}
            </Button>
          )}
        </Stack>
      );
    })
  );

  return (
    <Container sx={{ py: 5 }}>
      <Box
        sx={{
          maxWidth: "1000px",
          margin: "0 auto",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
          bgcolor: "#fff",
        }}
      >
        <img
          src={challenge?.bannerImage || "https://via.placeholder.com/800x300?text=No+Image"}
          alt="Banner"
          style={{ width: "100%", maxHeight: 350, objectFit: "cover" }}
        />

        <Box sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>{challenge?.title}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{challenge?.description}</Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip icon={<FitnessCenterIcon />} label={challenge?.type || "General"} color="secondary" />
            <Chip icon={<ScheduleIcon />} label={calculateDaysLeft(challenge?.endDate)} color="primary" />
          </Stack>

          
<Box sx={{ mt: 2 }}>
  {userTeam && (
    <Button
      variant="outlined"
      color="warning"
      onClick={async () => {
        const confirmed = window.confirm("Are you sure you want to leave your current team?");
        if (!confirmed) return;
        const success = await leaveChallengeTeam(challenge.id, currentUser.uid);
        if (success) {
          setUserTeam(null);
          await fetchTeams();
          alert("✅ You have left your team.");
        }
      }}
    >
      Leave Team
    </Button>
  )}
</Box>
        </Box>

        <Box sx={{ px: 4, pb: 4 }}>
          {userTeam ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: "#ffebee" }}>
                  <Typography variant="h6" gutterBottom>
                    Red Team Members ({redMembers.length}) – 🏆 {redScore} pts
                  </Typography>
                  {renderTeamMembers(redMembers, "red")}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: "#e3f2fd" }}>
                  <Typography variant="h6" gutterBottom>
                    Blue Team Members ({blueMembers.length}) – 🏆 {blueScore} pts
                  </Typography>
                  {renderTeamMembers(blueMembers, "blue")}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                You're not on a team yet!
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="contained" color="error" onClick={() => joinChallenge(id, currentUser.uid, "red").then(() => { setUserTeam("red"); fetchTeams(); })}>
                  Join Red Team
                </Button>
                <Button variant="contained" color="primary" onClick={() => joinChallenge(id, currentUser.uid, "blue").then(() => { setUserTeam("blue"); fetchTeams(); })}>
                  Join Blue Team
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ChallengeDetails;
