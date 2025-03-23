import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import ChallengeCard from "../components/ChallengeCard";
import { Typography, Container, Grid } from "@mui/material";

const HomePage = () => {
  const [challenges, setChallenges] = useState([]);

  // get the challenges from firebase store
  // we want them to be stored on this page thus the fetch

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "challenges"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChallenges(data);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchChallenges();
  }, []);

  
  return (
    <Container sx={{ paddingTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Current Challenges
      </Typography>

      <Grid container spacing={3}>
        {challenges.length > 0 ? (
          challenges.map((challenge) => (
            <Grid item xs={12} sm={6} md={4} key={challenge.id}>
              <ChallengeCard challenge={challenge} />
            </Grid>
          ))
        ) : (
          <Typography variant="body1">No challenges yet!</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default HomePage;
