import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"; 



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
    console.log("Joining Challenge:", challengeId, "User:", userId, "Team:", teamColor); // ---> debug

    // Challenge collection management
    // Get info
    const challengeRef = doc(db, "challenges", challengeId);
    //Subcollection
    const teamsRef = collection(db, "challenges", challengeId, "teams");
    const teamRef = doc(teamsRef, teamColor);


    // UserCollection management
    // Get info
    const userRef = doc(db, "users", userId);
    //Subcollection
    const userChallengeRef = collection(userRef, "challenges");
    const userChallengeDoc = doc(userChallengeRef, challengeId);
    
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();


    if (!userDoc.exists()) {
      console.error("User document not found!");
      return;
    }


    
    // Check if the selected team document exists
    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) {
      console.log("Creating team document for", teamColor); // Debug
      await setDoc(teamRef, { members: [] });
    }
    
    // Check if the user is already in any team
    const redTeamRef = doc(teamsRef, "red");
    const blueTeamRef = doc(teamsRef, "blue");
    
    const [redTeamDoc, blueTeamDoc] = await Promise.all([
      getDoc(redTeamRef),
      getDoc(blueTeamRef),
    ]);
    
    // Check if the user is already in a challenge
    const isInRedTeam = redTeamDoc.exists() && redTeamDoc.data().members.includes(userId);
    const isInBlueTeam = blueTeamDoc.exists() && blueTeamDoc.data().members.includes(userId);

    if (isInRedTeam || isInBlueTeam) {
      const currentTeam = isInRedTeam ? "RED" : "BLUE";
      alert(`You are already in Team ${currentTeam}!`);
      return;
    }
    
    // Add user to the selected team
    await updateDoc(teamRef, {
      members: arrayUnion(userId),
    });

    // Update user collection with challenge and team info
    await setDoc(userChallengeDoc, {
      challengeId,
      team: teamColor,
    });

    alert(`You have successfully joined Team ${teamColor.toUpperCase()}!`);

    //console.log(`User ${userId} successfully joined ${teamColor} team in challenge ${challengeId}`);
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