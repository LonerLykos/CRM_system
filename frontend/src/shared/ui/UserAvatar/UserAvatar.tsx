import React from 'react';

interface Props {
  hash: string;
}

export const UserAvatar = ({ hash }: Props) => {
  const mainColor = `#${hash.substring(0, 6)}`;

  const grid = new Array(25).fill(false);

  for (let i = 0; i < 15; i++) {
    const isActive = hash.charCodeAt(i % hash.length) % 2 === 0;

    const row = Math.floor(i / 3);
    const col = i % 3;

    grid[row * 5 + col] = isActive;

    if (col < 2) {
      grid[row * 5 + (4 - col)] = isActive;
    }
  }

  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 5 5"
      style={{
        borderRadius: '4px',
        backgroundColor: '#F3F4F6',
        display: 'block'
      }}
    >
      {grid.map((active, index) => {
        if (!active) return null;
        return (
          <rect
            key={index}
            x={index % 5}
            y={Math.floor(index / 5)}
            width="1"
            height="1"
            fill={mainColor}
          />
        );
      })}
    </svg>
  );
};