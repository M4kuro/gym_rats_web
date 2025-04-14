import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc, getDoc, updateDoc, collection, arrayUnion, increment } from "firebase/firestore"; 

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
    const teamsRef = collection(challengeRef, "teams");

    const redTeamRef = doc(teamsRef, "red");
    const blueTeamRef = doc(teamsRef, "blue");

    const [redDoc, blueDoc] = await Promise.all([
      getDoc(redTeamRef),
      getDoc(blueTeamRef),
    ]);

    const alreadyInRed = redDoc.exists() && redDoc.data()?.members?.includes(userId);
    const alreadyInBlue = blueDoc.exists() && blueDoc.data()?.members?.includes(userId);

    if (alreadyInRed || alreadyInBlue) {
      alert("You have already joined a team in this challenge!");
      return;
    }

    const teamRef = doc(teamsRef, teamColor);
    const teamDoc = await getDoc(teamRef);

    if (!teamDoc.exists()) {
      console.log(`[joinChallenge] Creating ${teamColor} team and adding user ${userId}`);
      await setDoc(teamRef, { members: [userId] });
    } else {
      console.log(`[joinChallenge] Adding user ${userId} to existing ${teamColor} team`);
      await updateDoc(teamRef, {
        members: arrayUnion(userId),
      });
    }

    alert(`You joined Team ${teamColor.toUpperCase()}!`);
  } catch (error) {
    console.error("🔥 Error joining challenge:", error);
  }
};

export const leaveChallengeTeam = async (challengeId, userId) => {
  try {
    const teamsRef = collection(doc(db, "challenges", challengeId), "teams");
    const redRef = doc(teamsRef, "red");
    const blueRef = doc(teamsRef, "blue");

    const [redSnap, blueSnap] = await Promise.all([
      getDoc(redRef),
      getDoc(blueRef),
    ]);

    const redMembers = redSnap.exists() ? redSnap.data().members || [] : [];
    const blueMembers = blueSnap.exists() ? blueSnap.data().members || [] : [];

    if (redMembers.includes(userId)) {
      await updateDoc(redRef, {
        members: redMembers.filter((id) => id !== userId),
      });
    }

    if (blueMembers.includes(userId)) {
      await updateDoc(blueRef, {
        members: blueMembers.filter((id) => id !== userId),
      });
    }

    console.log(`👋 User ${userId} removed from their team in challenge ${challengeId}`);
    return true;
  } catch (error) {
    console.error("Error leaving team:", error);
    return false;
  }
};

export const logChallengeProgress = async (challengeId, userId, teamColor) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // e.g., "2025-04-15"
    const participantRef = doc(db, "challenges", challengeId, "participants", userId);
    const participantSnap = await getDoc(participantRef);

    if (!participantSnap.exists()) {
      await setDoc(participantRef, {
        totalPoints: 0,
        logs: {}
      });
    }

    const participantData = (await getDoc(participantRef)).data() || {};
    const logs = participantData.logs || {};

    if (logs[today]) {
      alert("You’ve already checked in today!");
      return false;
    }

    await updateDoc(participantRef, {
      [`logs.${today}`]: {
        completed: true,
        points: 5,
      },
      totalPoints: increment(5),
    });

    const teamRef = doc(db, "challenges", challengeId, "teams", teamColor);
    await updateDoc(teamRef, {
      totalPoints: increment(5),
    });

    return true;
  } catch (error) {
    console.error("Error logging progress:", error);
    return false;
  }
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

export {auth,db}
export default app;