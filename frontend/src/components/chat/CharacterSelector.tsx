// frontend/src/components/chat/CharacterSelector.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface Character {
  id: string;
  name: string;
  avatarUrl: string;
}

const characters: Character[] = [
  { id: 'chandler', name: 'Chandler Bing', avatarUrl: '/characters/chandler/avatar.svg' },
];

const CharacterSelector = () => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>('chandler');

  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-2 my-3 rounded-md shadow"> {/* Reduced padding and margin */}
      <h2 className="text-lg font-semibold mb-2 text-center text-gray-800 dark:text-gray-200">Select a Character</h2> {/* Reduced margin, text size */}
      <div className="flex justify-center space-x-3"> {/* Reduced space */}
        {characters.map((char) => (
          <div
            key={char.id}
            className={`p-1 rounded-lg cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center  // Added flex utilities
                        ${selectedCharacterId === char.id ? 'ring-2 ring-blue-500 shadow-md' : 'opacity-70 hover:opacity-100'}`} // Reduced padding, shadow
            onClick={() => setSelectedCharacterId(char.id)}
            role="button"
            tabIndex={0}
            aria-pressed={selectedCharacterId === char.id}
            aria-label={`Select ${char.name}`}
          >
            <Image
              src={char.avatarUrl}
              alt={char.name}
              width={60} // Reduced size
              height={60} // Reduced size
              className="rounded-full"
              priority
            />
            <p className="text-center mt-1 text-xs text-gray-700 dark:text-gray-300">{char.name}</p> {/* Reduced margin and text size */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelector;
