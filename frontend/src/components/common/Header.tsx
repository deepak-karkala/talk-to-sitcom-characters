// frontend/src/components/common/Header.tsx
import React from 'react';

const Header = () => {
  return (
    // text-slate-900 for light mode (on slate-100), text-slate-100 for dark mode (on slate-900)
    <header className="bg-transparent text-slate-900 dark:text-slate-100 p-4 border-b border-slate-300 dark:border-slate-700">
      <h1 className="text-2xl font-bold text-center">Talk to TV Show/Movie Characters</h1>
    </header>
  );
};
export default Header;
