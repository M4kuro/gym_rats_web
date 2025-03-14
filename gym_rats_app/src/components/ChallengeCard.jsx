import React from "react";

const ChallengeCard = ({ challenge }) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      {/* banner banner banner */}
      <div className="relative">
        <img src={challenge.banner} alt="Challenge Banner" className="w-full h-40 object-cover rounded-md" />
        <p className="absolute top-2 left-2 bg-black text-white px-2 py-1 text-sm rounded-md">
          {challenge.description}
        </p>
      </div>

      {/* challenge info */}
      <div className="mt-3 flex justify-between items-center bg-gray-200 p-3 rounded-md">
        {/* leader section */}
        <div className="flex items-center">
          <img src={challenge.leader.img} alt="Leader" className="w-10 h-10 rounded-full mr-2" />
          <p className="text-sm font-semibold">{challenge.leader.name}</p>
          <p className="text-sm text-gray-600 ml-1">{challenge.leader.points} pts</p>
        </div>

        {/* your team section*/}
        <div className="flex items-center">
          <img src={challenge.team.img} alt="Your Team" className="w-10 h-10 rounded-full mr-2" />
          <p className="text-sm font-semibold">{challenge.team.name}</p>
          <p className="text-sm text-gray-600 ml-1">{challenge.team.points} pts</p>
        </div>

        {/* days left section*/}
        <p className="text-sm bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md font-semibold">
          {challenge.daysLeft} days left
        </p>
      </div>

      {/* completed tasks section */}
      <div className="mt-3 bg-gray-100 p-2 rounded-md">
        <p className="text-sm font-semibold">Completed Tasks:</p>
        <ul className="text-sm text-gray-600">
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
