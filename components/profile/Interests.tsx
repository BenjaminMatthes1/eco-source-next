import React from 'react';

interface InterestsProps {
  interests?: string[];
}

const Interests: React.FC<InterestsProps> = ({ interests }) => {
  if (!interests?.length) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">Interests</h2>
      <p className="font-redditLight">None</p>
    </div>
  );
}

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">Interests</h2>
      <div className="flex flex-wrap gap-2 mt-2">
        {interests.map((i) => (
          <span key={i} className="badge badge-outline font-redditLight">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Interests;
