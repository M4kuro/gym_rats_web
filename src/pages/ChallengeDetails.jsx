import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db, joinChallenge } from "../firebaseConfig";
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

  const auth = getAuth();
  const currentUser = auth.currentUser;

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
    if (!challenge || !currentUser) return;

    const fetchTeams = async () => {
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
      } catch (error) {
        console.error("Error loading teams:", error);
      }
    };

    fetchTeams();
  }, [challenge, currentUser]);

  const handleJoin = async (teamColor) => {
    await joinChallenge(id, currentUser.uid, teamColor);
    setUserTeam(teamColor);
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!challenge) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6">Challenge not found.</Typography>
      </Container>
    );
  }

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
          src={challenge.bannerImage || "https://via.placeholder.com/800x300?text=No+Image"}
          alt="Banner"
          style={{ width: "100%", maxHeight: 350, objectFit: "cover" }}
        />

        <Box sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>{challenge.title}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{challenge.description}</Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip
              icon={<FitnessCenterIcon />}
              label={challenge.type || "General"}
              color="secondary"
            />
            <Chip
              icon={<ScheduleIcon />}
              label={calculateDaysLeft(challenge.endDate)}
              color="primary"
            />
          </Stack>

          <Typography variant="subtitle2" color="text.secondary">
            Created by: {challenge.creatorName || "Unknown"}
          </Typography>
        </Box>

        <Box sx={{ px: 4, pb: 4 }}>
          {userTeam ? (
            <>
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  color={userTeam === "red" ? "error" : "primary"}
                  disabled
                >
                  Joined {userTeam.charAt(0).toUpperCase() + userTeam.slice(1)} Team
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: "#ffebee" }}>
                    <Typography variant="h6" gutterBottom>
                      Red Team Members ({redMembers.length})
                    </Typography>
                    {redMembers.length > 0 ? (
                      redMembers.map((member, i) => (
                        <Stack direction="row" spacing={1} alignItems="center" key={i} sx={{ mb: 0.5 }}>
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
                            fontWeight={member.uid === currentUser.uid ? "bold" : "normal"}
                            >
                            {member.uid === currentUser.uid
                                ? `✅ ${member.name} (You)`
                                : member.name}
                            </Typography>
                        </Stack>
                      ))
                    ) : (
                      <Typography variant="body2">No members yet.</Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: "#e3f2fd" }}>
                    <Typography variant="h6" gutterBottom>
                      Blue Team Members ({blueMembers.length})
                    </Typography>
                    {blueMembers.length > 0 ? (
                      blueMembers.map((member, i) => (
                        <Stack direction="row" spacing={1} alignItems="center" key={i} sx={{ mb: 0.5 }}>
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
                            fontWeight={member.uid === currentUser.uid ? "bold" : "normal"}
                            >
                            {member.uid === currentUser.uid
                                ? `✅ ${member.name} (You)`
                                : member.name}
                            </Typography>
                        </Stack>
                      ))
                    ) : (
                      <Typography variant="body2">No members yet.</Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" color="error" onClick={() => handleJoin("red")}>
                Join Red Team
              </Button>
              <Button variant="contained" color="primary" onClick={() => handleJoin("blue")}>
                Join Blue Team
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ChallengeDetails;
