import React from "react";

const ChallengeCard = ({ challenge }) => {
  return (
    <div className="bg-white p-6 shadow-md rounded-lg max-w-full w-full mx-auto"> {/* making sure width is appropriate */}
      {/* banner section */}
      <div className="relative">
        <img src={challenge.banner} alt="Challenge Banner" className="w-full h-48 object-cover rounded-md" /> 
        <p className="absolute top-2 left-2 bg-black text-white px-3 py-1 text-sm rounded-md">
          {challenge.description}
        </p>
      </div>

      {/* challenge info section */}
      <div className="mt-4 flex justify-between items-center bg-gray-200 p-4 rounded-md">
        <div className="flex items-center">
          <img src={challenge.leader.img} alt="Leader" className="w-14 h-14 rounded-full mr-3" />
          <p className="text-base font-semibold">{challenge.leader.name}</p>
          <p className="text-base text-gray-600 ml-1">{challenge.leader.points} pts</p>
        </div>

        <div className="flex items-center">
          <img src={challenge.team.img} alt="Your Team" className="w-14 h-14 rounded-full mr-3" />
          <p className="text-base font-semibold">{challenge.team.name}</p>
          <p className="text-base text-gray-600 ml-1">{challenge.team.points} pts</p>
        </div>

        <p className="text-base bg-yellow-200 text-yellow-800 px-4 py-2 rounded-md font-semibold">
          {challenge.daysLeft} days left
        </p>
      </div>

      {/* completed tasks section  */}
      <div className="mt-4 bg-gray-100 p-4 rounded-md">
        <p className="text-base font-semibold">Completed Tasks:</p>
        <ul className="text-base text-gray-600">
          {challenge.tasks.length > 0 ? (
            challenge.tasks.map((task, index) => (
              <li key={index} className="mt-1">
                <strong>{task.user}</strong> - {task.task} at {task.time}
              </li>
            ))
          ) : (
            <li>No tasks completed yet</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export { ChallengeCard as default };
