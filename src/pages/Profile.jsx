import React, { useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  query
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Typography,
  Container,
  Avatar,
  Card,
  CardContent,
  Box,
  Grid,
  Paper
} from "@mui/material";
import dayjs from "dayjs";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [highlighted, setHighlighted] = useState({}); // { yyyy-mm-dd: { label, type } }
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const joined = userDoc.data()?.challengesJoined || [];
        setJoinedChallenges(joined);
      }
    });

    return () => unsub();
  }, []);

  const handleChallengeClick = async (challengeId) => {
    const challengeRef = doc(db, "challenges", challengeId);
    const challengeSnap = await getDoc(challengeRef);
    const data = challengeSnap.data();
    if (!data?.startDate || !data?.endDate) return;

    const start = dayjs(data.startDate.toDate());
    const end = dayjs(data.endDate.toDate());

    const highlights = {};
    for (let d = start; d.isBefore(end.add(1, "day")); d = d.add(1, "day")) {
      const dateKey = d.format("YYYY-MM-DD");
      highlights[dateKey] = {
        label: d.isSame(end, "day") ? "End" : "Progress",
        color: d.isSame(end, "day") ? "#4caf50" : "#90caf9",
        type: d.isSame(end, "day") ? "end" : "range"
      };
    }
    setHighlighted(highlights);
    setSelectedChallenge(data.title);
  };

  const today = dayjs();
  const startOfMonth = today.startOf("month");
  const daysInMonth = today.daysInMonth();

  const weeks = [];
  let currentWeek = new Array(startOfMonth.day()).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <Container sx={{ paddingTop: 8, textAlign: "center" }}>
      <Card
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
          padding: 3,
          width: "100%",
          maxWidth: 500,
          mx: "auto",
          backgroundColor: "#f5f5f5"
        }}
      >
        <Avatar
          sx={{ width: 90, height: 90, mr: 3 }}
          src={user?.photoURL || "https://via.placeholder.com/90"}
        />
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            {user?.displayName || "Anonymous"}
          </Typography>
          <Typography color="text.secondary">{user?.email}</Typography>
        </CardContent>
      </Card>

      {joinedChallenges.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Joined Challenges
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {joinedChallenges.map((ch) => (
              <Grid item key={ch.challengeId}>
                <Paper
                  onClick={() => handleChallengeClick(ch.challengeId)}
                  sx={{
                    px: 2,
                    py: 1,
                    cursor: "pointer",
                    border: "1px solid #ccc",
                    "&:hover": { background: "#ffecec" }
                  }}
                >
                  {ch.challengeId}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Typography variant="h6" sx={{ mb: 1, color: "#e91e63" }}>
        {today.format("MMMM YYYY").toUpperCase()}
      </Typography>

      <Box sx={{ display: "inline-block", p: 2, borderRadius: 3, backgroundColor: "#fafafa" }}>
        <Grid container spacing={1}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Grid item xs={1.71} key={day}>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "#e91e63", textAlign: "center" }}
              >
                {day}
              </Typography>
            </Grid>
          ))}

          {weeks.map((week, i) =>
            week.map((day, j) => {
              const dateKey = today.date(day || 1).month(today.month()).format("YYYY-MM-DD");
              const isToday = day === today.date();
              const isMarked = highlighted[dateKey];

              return (
                <Grid item xs={1.71} key={`${i}-${j}`}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      mx: "auto",
                      borderRadius: "50%",
                      textAlign: "center",
                      lineHeight: "36px",
                      fontWeight: isToday ? "bold" : "normal",
                      backgroundColor: isMarked ? isMarked.color : "transparent",
                      cursor: "pointer",
                      border: isToday ? "2px solid #f06292" : "1px solid transparent"
                    }}
                    onClick={() => {
                      const clicked = today.date(day).format("YYYY-MM-DD");
                      alert(`Clicked date: ${clicked}`);
                    }}
                  >
                    {day || ""}
                  </Box>
                </Grid>
              );
            })
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile;
