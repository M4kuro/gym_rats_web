import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";


//
//  stealing a bit from prahbs code but it totally works for what we're doing
//  changed it up a bit to meet our needs


const CreateChallengeDialog = ({ open, onClose, onChallengeCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [banner, setBanner] = useState("");
  const [endDate, setEndDate] = useState("");


  const handleSubmit = async () => {
    try {

      const auth = getAuth();
      const user = auth.currentUser;
      const newChallenge = {
        title,
        description,
        type,
        bannerImage: banner,
        createdAt: Timestamp.now(),
        endDate: Timestamp.fromDate(new Date(endDate)),
        creatorId: user?.uid,
        creatorName: user?.displayName || user?.email.split("@")[0] || "Unknown",
      };

      await addDoc(collection(db, "challenges"), newChallenge);
      if (onChallengeCreated) onChallengeCreated(newChallenge);

      // clear everything and close
      setTitle("");
      setDescription("");
      setType("");
      setBanner("");
      setEndDate("");
      onClose();
    } catch (error) {
      console.error("Error creating challenge:", error);
    }
  };


  // for now we don't really have catagories so we can add the drop down later
  // but this is good for now for a presentation on monday.
  // i'll just have to refactor the code to meet the catagory requirements 

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Challenge</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Category / Type"
            fullWidth
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <TextField
            label="Banner Image URL"
            fullWidth
            value={banner}
            onChange={(e) => setBanner(e.target.value)}
          />
          <TextField
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Create</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateChallengeDialog;
