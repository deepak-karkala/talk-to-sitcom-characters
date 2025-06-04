// frontend/src/components/chat/CharacterSelector.tsx
"use client";
import React, { useState } from 'react';
import Image from 'next/image';

interface Character { 
  id: string; 
  name: string; 
  avatarUrl: string; 
  isDisabled?: boolean; // Added to explicitly mark characters as disabled
}

const characters: Character[] = [
  { id: 'chandler', name: 'Chandler Bing', avatarUrl: '/characters/chandler/avatar.png' },
  { id: 'tyrion', name: 'Tyrion Lannister', avatarUrl: '/characters/tyrion/avatar.png', isDisabled: true },
  { id: 'heisenberg', name: 'Walter Heisenberg', avatarUrl: '/characters/heisenberg/avatar.png', isDisabled: true },
  { id: 'peter', name: 'Peter Griffin', avatarUrl: '/characters/peter/avatar.png', isDisabled: true },
  // Add more characters here in the future, e.g.:
  // { id: 'ross', name: 'Ross Geller', avatarUrl: '/characters/ross/avatar.png', isDisabled: true },
  // { id: 'rachel', name: 'Rachel Green', avatarUrl: '/characters/rachel/avatar.png', isDisabled: true },
];

const CharacterSelector: React.FC = () => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>('chandler');

  const handleCharacterSelect = (char: Character) => {
    if (!char.isDisabled) {
      setSelectedCharacterId(char.id);
    }
    // Optionally, provide feedback if a disabled character is clicked, e.g., a toast notification
    // console.log(`${char.name} is not available yet.`);
  };

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2 text-center text-slate-700 dark:text-neutral-200">Select a Character</h2>
      {/* Reduced mt-8 to mt-2 */}
      <div className="overflow-x-auto pb-2 mt-2">
        {/* Outer container for horizontal scrolling */}
        <div className="flex flex-nowrap justify-center space-x-2 px-1"> {/* justify-center, flex-nowrap, added px-1 for slight edge padding */}
          {characters.map((char) => {
            const isSelected = selectedCharacterId === char.id;
            const isActuallyDisabled = char.id !== 'chandler';

            return (
              // Each character item wrapper - ensure it doesn't shrink
              <div
                key={char.id}
                className={`
                  flex-shrink-0 p-1 rounded-lg transition-all duration-200 ease-in-out transform text-center 
                  ${isActuallyDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                  }
                  ${isSelected && !isActuallyDisabled 
                    ? 'ring-2 ring-blue-500' 
                    : isActuallyDisabled ? '' : 'opacity-70 hover:opacity-100'
                  }
                `}
                onClick={() => handleCharacterSelect(char)}
                role="button"
                tabIndex={isActuallyDisabled ? -1 : 0}
                aria-pressed={isSelected && !isActuallyDisabled}
                aria-label={`Select ${char.name}${isActuallyDisabled ? ' (Coming Soon)' : ''}`}
              >
                <Image
                  src={char.avatarUrl}
                  alt={char.name}
                  width={60}
                  height={60}
                  className={`rounded-full mx-auto`}
                  loading="eager"
                />
                <p className="mt-1 text-xs text-slate-600 dark:text-neutral-300 w-24 break-words">{char.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default CharacterSelector;
