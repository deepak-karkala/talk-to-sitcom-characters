// frontend/src/components/common/Header.tsx
import React from 'react';

const Header = () => {
  return (
    <header className="bg-transparent text-slate-900 dark:text-slate-100 p-4 border-b border-slate-300 dark:border-slate-700"> {/* Adjusted border color slightly */}
      <h1 className="text-2xl font-bold text-center">Chatterbox</h1>
    </header>
  );
};
export default Header;
