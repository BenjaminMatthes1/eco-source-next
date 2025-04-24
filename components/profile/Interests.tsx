import React from 'react';

interface InterestsProps {
  interests?: string[];
}

const Interests: React.FC<InterestsProps> = ({ interests }) => {
  if (!interests || interests.length === 0) {
    return null; // No need to render anything if there are no interests
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">Interests</h2>
      <ul className="list-disc list-inside">
        {interests.map((interest, idx) => (
          <li key={idx}>{interest}</li>
        ))}
      </ul>
    </div>
  );
};

export default Interests;
