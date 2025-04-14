// src/hooks/useUserProfile.js
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const useUserProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (!user) return;

    const fetchProfile = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile(data.profile || null);
      }
    };

    fetchProfile();
  }, []);

  return profile;
};

export default useUserProfile;
