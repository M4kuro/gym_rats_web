import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc, getDoc } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyBxXRDpESpQABwj3xVtVqgbvlvIo8bHlkk",
  authDomain: "gymrats-web.firebaseapp.com",
  projectId: "gymrats-web",
  storageBucket: "gymrats-web.appspot.com",
  messagingSenderId: "444955744535",
  appId: "1:444955744535:web:a3edeaf12ed5508f1b3f52"
};

// User collection
export const saveUserToFirestore = async (user) => {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || user.email.split("@")[0],
      email: user.email,
      createdAt: new Date(),
      challengesJoined: [],
    });
  }
};

// Challenges and user relation logic = Team assignment and storage management
export const joinChallenge = async (challengeId, userId, teamColor) => {
  try {
    const challengeRef = doc(db, "challenges", challengeId);
    const challengeDoc = await getDoc(challengeRef);

    if (!challengeDoc.exists()) {
      throw new Error("Challenge not found");
    }

    const teamsRef = collection(challengeRef, "teams");
    const teamRef = doc(teamsRef, teamColor);

    if (!teamDoc.exists()) {
      // If team document doesn't exist, create it with an empty members array
      await setDoc(teamRef, { members: [] });
    }

   // Check if the user is already in any team
    const redTeamRef = doc(teamsRef, "red");
    const blueTeamRef = doc(teamsRef, "blue");

    const [redTeamDoc, blueTeamDoc] = await Promise.all([
      getDoc(redTeamRef),
      getDoc(blueTeamRef),
    ]);

    if (
      (redTeamDoc.exists() && redTeamDoc.data().members?.includes(userId)) ||
      (blueTeamDoc.exists() && blueTeamDoc.data().members?.includes(userId))
    ) {
      alert("You have already joined a team in this challenge!");
      return;
    }
        
    await updateDoc(teamRef, {
       challengesJoined: arrayUnion({ challengeId, team: teamColor }),
    });
  } catch (error) {
    console.error("Error joining challenge:", error);
  }
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

export {auth,db}
export default app;