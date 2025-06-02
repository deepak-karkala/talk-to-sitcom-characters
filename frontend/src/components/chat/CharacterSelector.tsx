// frontend/src/components/chat/CharacterSelector.tsx
"use client";
import React, { useState } from 'react';
import Image from 'next/image';
interface Character { id: string; name: string; avatarUrl: string; }
const characters: Character[] = [{ id: 'chandler', name: 'Chandler Bing', avatarUrl: '/characters/chandler/avatar.svg' }];

const CharacterSelector = () => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>('chandler');
  return (
    // Re-applied card styling
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-3 my-3">
      <h2 className="text-lg font-semibold mb-2 text-center text-slate-700 dark:text-slate-300">Select a Character</h2>
      <div className="flex justify-center space-x-3">
        {characters.map((char) => (
          <div
            key={char.id}
            className={`p-1 rounded-lg cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center
                        ${selectedCharacterId === char.id ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'}`}
            onClick={() => setSelectedCharacterId(char.id)} role="button" tabIndex={0} aria-pressed={selectedCharacterId === char.id} aria-label={`Select ${char.name}`}
          >
            <Image src={char.avatarUrl} alt={char.name} width={60} height={60} className="rounded-full" priority />
            <p className="text-center mt-1 text-xs text-slate-600 dark:text-slate-400">{char.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CharacterSelector;
