'use server'

export const UserAvatar = async ({ hash }: { hash: string}) => {
  const color = `#${hash.substring(0, 6)}`;
  const grid = [];

  for (let i = 0; i < 15; i++) {
    if (hash.charCodeAt(i) % 2 === 0) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        grid.push({ x: col, y: row });
        if (col < 2) grid.push({ x: 4 - col, y: row });
    }
  }

  return (
    <svg width="40" height="40" viewBox="0 0 5 5" style={{ borderRadius: '4px', backgroundColor: '#eee' }}>
      {grid.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width="1" height="1" fill={color} />
      ))}
    </svg>
  );
};