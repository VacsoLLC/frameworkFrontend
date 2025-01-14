import React from 'react';

export function PasswordStrengthBar({strength}) {
  const getColor = (score) => {
    const colors = [
      'bg-red-500', // Very weak
      'bg-orange-500', // Weak
      'bg-yellow-500', // Fair
      'bg-lime-500', // Strong
      'bg-green-500', // Very strong
    ];
    return colors[Math.min(Math.max(score, 0), 4)];
  };

  const width = `${(strength + 1) * 20}%`;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-5">
      <div
        className={`h-full rounded-full transition-all duration-300 ${getColor(strength)}`}
        style={{width}}
      ></div>
    </div>
  );
}
