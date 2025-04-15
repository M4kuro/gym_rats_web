import React, { useEffect, useState } from "react";
import {
    getAuth,
    onAuthStateChanged,
    updateProfile
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
    Typography,
    Container,
    Avatar,
    Card,
    Box,
    Grid,
    Chip,
    LinearProgress,
    Stack,
    Divider,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [joinedChallenges, setJoinedChallenges] = useState([]);
    const [highlighted, setHighlighted] = useState({});
    const [selectedChallenge, setSelectedChallenge] = useState("");
    const [challengeMeta, setChallengeMeta] = useState(null);
    const [loginDates, setLoginDates] = useState([]);
    const [userScore, setUserScore] = useState(0);

    const [editOpen, setEditOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPhoto, setNewPhoto] = useState("");

    useEffect(() => {
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUser({ ...user, displayName: data.name, photoURL: data.photoURL });
                    setUserScore(data.score || 0);

                    const joined = data.challengesJoined || [];
                    const challengesWithTitles = await Promise.all(
                        joined.map(async (entry) => {
                            const challengeRef = doc(db, "challenges", entry.challengeId);
                            const challengeSnap = await getDoc(challengeRef);
                            const title = challengeSnap.exists() ? challengeSnap.data().title : "Untitled";
                            const start = challengeSnap.exists() ? challengeSnap.data().startDate?.toDate() : null;
                            const end = challengeSnap.exists() ? challengeSnap.data().endDate?.toDate() : null;
                            return { ...entry, title, start, end };
                        })
                    );
                    setJoinedChallenges(challengesWithTitles);
                }
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
        const today = dayjs();

        const loginRef = doc(db, "users", user.uid, "logins", challengeId);
        const loginSnap = await getDoc(loginRef);
        const dates = loginSnap.exists() ? loginSnap.data().dates : [];
        setLoginDates(dates);

        const missed = [];
        const highlights = {};
        for (let d = start; d.isBefore(end.add(1, "day")); d = d.add(1, "day")) {
            const dateKey = d.format("YYYY-MM-DD");
            const checkedIn = dates.includes(dateKey);
            const missedAndPast = !checkedIn && d.isBefore(today, "day");
            if (missedAndPast) missed.push(dateKey);
            highlights[dateKey] = {
                label: d.isSame(end, "day") ? "End" : checkedIn ? "Checked" : missedAndPast ? "Missed" : "",
                color: d.isSame(end, "day") ? "#4caf50" : checkedIn ? "#90caf9" : missedAndPast ? "#f44336" : "transparent"
            };
        }

        const joinedEntry = joinedChallenges.find((j) => j.challengeId === challengeId);
        const userTeam = joinedEntry?.team || "N/A";

        const totalDays = end.diff(start, "day") + 1;
        const completedDays = dates.filter(date => {
            const day = dayjs(date);
            return day.isAfter(start.subtract(1, 'day')) && day.isBefore(end.add(1, 'day'));
        }).length;

        const status = today.isAfter(end) ? "Ended" : "Active";
        const progressPercent = Math.min(100, Math.round((completedDays / totalDays) * 100));

        // ⬇️ scoring logic
        if (status === "Ended") {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                const scored = data.challengeStats?.[challengeId]?.scoreGiven;
                if (!scored) {
                    const dailyPoints = completedDays;
                    const penaltyPoints = missed.length * 2;
                    const bonus = completedDays === totalDays ? 10 : 0;
                    const earnedScore = dailyPoints + bonus - penaltyPoints;
                    const updatedScore = (data.score || 0) + earnedScore;

                    await updateDoc(userRef, {
                        score: updatedScore,
                        [`challengeStats.${challengeId}`]: {
                            checkedIn: dates,
                            missed: missed.length,
                            completed: completedDays === totalDays,
                            scoreGiven: true
                        }
                    });
                    setUserScore(updatedScore);
                }
            }
        }

        setHighlighted(highlights);
        setSelectedChallenge(data.title || "Selected Challenge");
        setChallengeMeta({
            challengeId,
            title: data.title || "Unknown",
            start: start.format("MMMM D, YYYY"),
            end: end.format("MMMM D, YYYY"),
            totalDays,
            completedDays,
            team: userTeam,
            status,
            progressPercent,
            missedDays: missed.length
        });
    };

    const handleCheckIn = async () => {
        if (!user || !challengeMeta) return;
        const today = dayjs().format("YYYY-MM-DD");
        const loginRef = doc(db, "users", user.uid, "logins", challengeMeta.challengeId);
        const loginSnap = await getDoc(loginRef);
        if (loginSnap.exists()) {
            const data = loginSnap.data();
            if (!data.dates.includes(today)) {
                await updateDoc(loginRef, { dates: arrayUnion(today) });
                setLoginDates([...data.dates, today]);
            }
        } else {
            await setDoc(loginRef, { dates: [today] });
            setLoginDates([today]);
        }
    };

    const handleProfileUpdate = async () => {
        if (!user) return;
        const auth = getAuth();
        const userRef = doc(db, "users", user.uid);

        await updateProfile(auth.currentUser, {
            displayName: newName,
            photoURL: newPhoto
        });

        await updateDoc(userRef, {
            name: newName,
            photoURL: newPhoto
        });

        setUser((prev) => ({
            ...prev,
            displayName: newName,
            photoURL: newPhoto
        }));
        setEditOpen(false);
    };

    // ⬇️ month grid
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
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);

    return (
        <Container maxWidth="md" sx={{ paddingY: 5 }}>
            <Card sx={{ p: 4, borderRadius: 4, boxShadow: 4 }}>
                <Stack direction="row" alignItems="center" spacing={3}>
                    <Avatar sx={{ width: 90, height: 90 }} src={user?.photoURL || "https://via.placeholder.com/90"} />
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h5" fontWeight="bold">{user?.displayName || "Anonymous"}</Typography>
                            <IconButton onClick={() => {
                                setNewName(user?.displayName || "");
                                setNewPhoto(user?.photoURL || "");
                                setEditOpen(true);
                            }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                        <Typography color="text.secondary">{user?.email}</Typography>
                        <Typography color="primary" fontWeight="bold">Score: {userScore} pts</Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>Joined Challenges</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                    {joinedChallenges.map((ch) => (
                        <Tooltip key={ch.challengeId} title={`From ${dayjs(ch.start).format("MMM D")} to ${dayjs(ch.end).format("MMM D")}`} arrow>
                            <Chip label={ch.title} onClick={() => handleChallengeClick(ch.challengeId)} clickable color="primary" variant="outlined" />
                        </Tooltip>
                    ))}
                </Box>

                {selectedChallenge && (
                    <>
                        <Typography variant="h6" sx={{ color: "#e91e63", mb: 1 }}>
                            {today.format("MMMM YYYY").toUpperCase()}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ mb: 2, color: "#3f51b5" }}>
                            Highlighting: {selectedChallenge}
                        </Typography>
                    </>
                )}

                <Box sx={{ backgroundColor: "#fafafa", borderRadius: 2, p: 2 }}>
                    <Grid container spacing={1}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <Grid item xs={1.71} key={day}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", color: "#e91e63", textAlign: "center" }}>
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
                                        <Box sx={{
                                            width: 36,
                                            height: 36,
                                            mx: "auto",
                                            borderRadius: "50%",
                                            textAlign: "center",
                                            lineHeight: "36px",
                                            fontWeight: isToday ? "bold" : "normal",
                                            backgroundColor: isMarked ? isMarked.color : "transparent",
                                            border: isToday ? "2px solid #f06292" : "1px solid transparent"
                                        }}>
                                            {day || ""}
                                        </Box>
                                    </Grid>
                                );
                            })
                        )}
                    </Grid>
                </Box>

                {challengeMeta && (
                    <Box mt={4} p={3} borderRadius={3} bgcolor="#f9f9f9" boxShadow={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h6">Challenge Info: {challengeMeta.title}</Typography>
                            <Chip label={challengeMeta.status} color={challengeMeta.status === "Active" ? "success" : "error"} size="small" />
                        </Stack>
                        <Typography variant="body2">📅 Start: {challengeMeta.start}</Typography>
                        <Typography variant="body2">🏁 End: {challengeMeta.end}</Typography>
                        <Typography variant="body2">📆 Total Days: {challengeMeta.totalDays}</Typography>
                        <Typography variant="body2">❌ Missed Days: {challengeMeta.missedDays}</Typography>
                        <Typography variant="body2">
                            🟦 Team: <strong style={{ color: challengeMeta.team === "red" ? "#e53935" : "#1e88e5" }}>{challengeMeta.team.toUpperCase()}</strong>
                        </Typography>

                        <Box mt={2}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Progress: {challengeMeta.completedDays} of {challengeMeta.totalDays} days ({challengeMeta.progressPercent}%)
                            </Typography>
                            <LinearProgress variant="determinate" value={challengeMeta.progressPercent} color="primary" sx={{ height: 10, borderRadius: 5 }} />
                        </Box>

                        {challengeMeta.status === "Active" && (
                            <Box mt={2} textAlign="right">
                                <Button variant="contained" size="small" onClick={handleCheckIn}>Check-In for Today</Button>
                            </Box>
                        )}
                    </Box>
                )}
            </Card>

            {/* EDIT PROFILE MODAL */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Display Name" value={newName} onChange={(e) => setNewName(e.target.value)} sx={{ my: 1 }} />
                    <TextField fullWidth label="Profile Picture URL" value={newPhoto} onChange={(e) => setNewPhoto(e.target.value)} sx={{ my: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleProfileUpdate} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default Profile;
