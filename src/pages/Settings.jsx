import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Button,
    Box,
    Avatar,
    Divider,
    ThemeProvider,
    createTheme,
} from "@mui/material";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const Settings = () => {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        age: "",
        weight: "",
        profilePic: "",
    });

    const [workout, setWorkout] = useState({
        workoutPlan: "Strength",
        trackRecords: true,
    });

    const [nutrition, setNutrition] = useState({
        calorieGoal: 2000,
        diet: "None",
    });

    const [appearance, setAppearance] = useState({
        darkMode: false,
        language: "English",
    });

    const [subscription, setSubscription] = useState("Free");

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchSettings = async () => {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile({ ...profile, ...data.profile });
                    setWorkout(data.workout || {});
                    setNutrition(data.nutrition || {});
                    setAppearance(data.appearance || {});
                    setSubscription(data.subscription || "Free");
                }
            };
            fetchSettings();
        }
    }, [user, db]);

    // Update UI when dark mode is toggled
    useEffect(() => {
        document.body.style.backgroundColor = appearance.darkMode ? "#121212" : "#ffffff";
    }, [appearance.darkMode]);

    const darkTheme = createTheme({
        palette: {
            mode: appearance.darkMode ? "dark" : "light",
            background: {
                default: appearance.darkMode ? "#121212" : "#ffffff",
                paper: appearance.darkMode ? "#1e1e1e" : "#ffffff",
            },
            text: {
                primary: appearance.darkMode ? "#ffffff" : "#000000",
            },
        },
    });

    const handleSave = async () => {
        await setDoc(doc(db, "users", user.uid), {
            profile,
            workout,
            nutrition,
            appearance,
            subscription,
        }, { merge: true });

        await updateProfile(user, { displayName: profile.name });
        alert("Settings updated successfully!");
        setIsEditing(false);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", overflowY: "auto", pb: 5, color: darkTheme.palette.text.primary }}>
                <Container maxWidth="sm" sx={{ mt: 4 }}>
                    <Typography variant="h4" align="center">Settings</Typography>

                    {/* Profile Settings */}
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                        <Avatar src={profile.profilePic} sx={{ width: 80, height: 80 }} />
                    </Box>

                    <Typography variant="h6">Profile Settings</Typography>
                    <TextField fullWidth label="Full Name" value={profile.name} disabled={!isEditing} onChange={(e) => setProfile({ ...profile, name: e.target.value })} margin="normal" InputLabelProps={{ style: { color: darkTheme.palette.text.primary } }} />
                    <TextField fullWidth label="Email" value={profile.email} disabled margin="normal" InputLabelProps={{ style: { color: darkTheme.palette.text.primary } }} />
                    <TextField fullWidth label="Age" type="number" value={profile.age} disabled={!isEditing} onChange={(e) => setProfile({ ...profile, age: e.target.value })} margin="normal" InputLabelProps={{ style: { color: darkTheme.palette.text.primary } }} />
                    <TextField fullWidth label="Weight" type="number" value={profile.weight} disabled={!isEditing} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} margin="normal" InputLabelProps={{ style: { color: darkTheme.palette.text.primary } }} />

                    {!isEditing ? (
                        <Button variant="contained" fullWidth onClick={() => setIsEditing(true)} sx={{ mt: 2 }}>Edit Profile</Button>
                    ) : (
                        <Button variant="contained" fullWidth onClick={handleSave} sx={{ mt: 2 }}>Save Changes</Button>
                    )}

                    <Divider sx={{ my: 3 }} />

                    {/* Workout Preferences */}
                    <Typography variant="h6">Workout Preferences</Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Default Workout Plan</InputLabel>
                        <Select value={workout.workoutPlan} onChange={(e) => setWorkout({ ...workout, workoutPlan: e.target.value })}>
                            <MenuItem value="Strength">Strength</MenuItem>
                            <MenuItem value="Cardio">Cardio</MenuItem>
                            <MenuItem value="Hybrid">Hybrid</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControlLabel control={<Switch checked={workout.trackRecords} onChange={(e) => setWorkout({ ...workout, trackRecords: e.target.checked })} />} label="Enable Personal Records Tracking" />

                    <Divider sx={{ my: 3 }} />

                    {/* Nutrition Settings */}
                    <Typography variant="h6">Nutrition Settings</Typography>
                    <TextField fullWidth label="Calorie Goal" type="number" value={nutrition.calorieGoal} onChange={(e) => setNutrition({ ...nutrition, calorieGoal: e.target.value })} margin="normal" />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Diet Preference</InputLabel>
                        <Select value={nutrition.diet} onChange={(e) => setNutrition({ ...nutrition, diet: e.target.value })}>
                            <MenuItem value="None">None</MenuItem>
                            <MenuItem value="Vegetarian">Vegetarian</MenuItem>
                            <MenuItem value="Vegan">Vegan</MenuItem>
                            <MenuItem value="Keto">Keto</MenuItem>
                        </Select>
                    </FormControl>

                    <Divider sx={{ my: 3 }} />

                    {/* Subscription Plan */}
                    <Typography variant="h6">Subscription Plan</Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Subscription</InputLabel>
                        <Select value={subscription} onChange={(e) => setSubscription(e.target.value)}>
                            <MenuItem value="Free">Free</MenuItem>
                            <MenuItem value="Premium">Premium</MenuItem>
                            <MenuItem value="Pro">Pro</MenuItem>
                        </Select>
                    </FormControl>

                    <Divider sx={{ my: 3 }} />

                    {/* App Appearance */}
                    <Typography variant="h6">App Appearance</Typography>
                    <FormControlLabel control={<Switch checked={appearance.darkMode} onChange={(e) => setAppearance({ ...appearance, darkMode: e.target.checked })} />} label="Enable Dark Mode" />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Language</InputLabel>
                        <Select value={appearance.language} onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}>
                            <MenuItem value="English">English</MenuItem>
                            <MenuItem value="Spanish">Spanish</MenuItem>
                            <MenuItem value="French">French</MenuItem>
                        </Select>
                    </FormControl>

                    <Divider sx={{ my: 3 }} />

                    {/* Support & About */}
                    <Typography variant="h6">Support & About</Typography>
                    <Button variant="contained" fullWidth sx={{ mt: 2 }}>Help Center</Button>
                    <Button variant="contained" fullWidth sx={{ mt: 2 }}>FAQs</Button>
                    <Button variant="contained" fullWidth sx={{ mt: 2 }}>Report a Bug</Button>
                    <Button variant="contained" fullWidth sx={{ mt: 2 }}>Contact Support</Button>

                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Settings;