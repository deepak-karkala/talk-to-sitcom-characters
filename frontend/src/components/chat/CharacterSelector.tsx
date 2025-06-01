// frontend/src/components/chat/CharacterSelector.tsx
"use client"; // Required for components with interactivity (useState, onClick)

import React, { useState } from 'react';
import Image from 'next/image';

// Define a type for a character
interface Character {
  id: string;
  name: string;
  avatarUrl: string;
}

// Initial character data (only Chandler for now)
const characters: Character[] = [
  { id: 'chandler', name: 'Chandler Bing', avatarUrl: '/characters/chandler/avatar.svg' },
  // Future characters can be added here
];

const CharacterSelector = () => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>('chandler'); // Default to Chandler

  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-4 my-4 rounded-md shadow">
      <h2 className="text-xl font-semibold mb-3 text-center text-gray-800 dark:text-gray-200">Select a Character</h2>
      <div className="flex justify-center space-x-4">
        {characters.map((char) => (
          <div
            key={char.id}
            className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105
                        ${selectedCharacterId === char.id ? 'ring-2 ring-blue-500 shadow-lg' : 'opacity-70 hover:opacity-100'}`}
            onClick={() => setSelectedCharacterId(char.id)}
            role="button"
            tabIndex={0}
            aria-pressed={selectedCharacterId === char.id}
            aria-label={`Select ${char.name}`}
          >
            <Image
              src={char.avatarUrl}
              alt={char.name}
              width={80}
              height={80}
              className="rounded-full"
              priority // Good for LCP if this is above the fold
            />
            <p className="text-center mt-2 text-sm text-gray-700 dark:text-gray-300">{char.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelector;
