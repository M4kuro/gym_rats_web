import React, { useState } from "react";
import ChallengeCard from "../components/ChallengeCard";

const Home = () => {
  console.log("✅ Home Component is rendering!"); // debug debug debug debug!!!
  
  const currentUser = {
    name: "Sammuel", // 🔹🔹 need to change this dynamically when authentication is added at a later point for 
                     // now th is is good enough to show Prabh 🔹🔹

    team: "Team Bravo", // 🔹🔹 this makes sure that tasks are added only to the correct team 🔹🔹
  };

  const [challenges, setChallenges] = useState([
    {
      id: 1,
      description: "Complete 10,000 steps",
      banner: "https://cdn.pixabay.com/photo/2017/04/11/15/55/animals-2222007_1280.jpg",
      leader: { name: "Team Alpha", points: 120, img: "https://cdn.pixabay.com/photo/2023/02/07/07/48/meerkat-7773431_640.jpg" },
      team: { name: "Team Alpha", points: 100, img: "https://cdn.pixabay.com/photo/2023/01/08/08/22/bee-7704702_1280.jpg" },
      daysLeft: 5,
      tasks: [],
    },
    {
      id: 2,
      description: "Drink 8 Glasses of Water",
      banner: "https://cdn.pixabay.com/photo/2016/09/22/10/44/banner-1686943_1280.jpg",
      leader: { name: "Team Bravo", points: 150, img: "https://cdn.pixabay.com/photo/2025/03/06/08/37/ai-generated-9450151_640.jpg" },
      team: { name: "Team Bravo", points: 130, img: "https://cdn.pixabay.com/photo/2025/03/06/06/58/ai-generated-9449946_1280.jpg" },
      daysLeft: 3,
      tasks: [],
    },
  ]);

  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim() === "") return;

    // 🔹🔹 Find the challenge that belongs to the user's team 🔹🔹

    const updatedChallenges = challenges.map((challenge) => {
      if (challenge.team.name === currentUser.team) {
        return {
          ...challenge,
          tasks: [
            ...challenge.tasks,
            {
              user: currentUser.name,
              task: newTask,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
        };
      }
      return challenge;
    });

    setChallenges(updatedChallenges);
    setNewTask(""); // this resets the input field
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Home</h1>

      {/* adding tasks */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="What task did you complete?"
          className="border p-2 rounded-md w-80"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          onClick={addTask}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Submit Task
        </button>
      </div>

        {/* display challenge cards */}
      <div className="grid gap-4">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
};

export default Home;
