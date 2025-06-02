// frontend/src/components/common/Header.tsx
import React from 'react';

const Header = () => {
  return (
    // Changed to transparent, added bottom border
    <header className="bg-transparent text-slate-900 dark:text-slate-100 p-4 border-b border-slate-200 dark:border-slate-700">
      <h1 className="text-2xl font-bold text-center">Chatterbox</h1> {/* Centered title for now */}
    </header>
  );
};

export default Header;
