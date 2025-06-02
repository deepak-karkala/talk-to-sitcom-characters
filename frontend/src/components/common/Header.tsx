// frontend/src/components/common/Header.tsx
import React from 'react';

const Header = () => {
  return (
    <header className="p-4 border border-black text-black"> {/* Removed bg-, added border, text-black */}
      <h1 className="text-2xl font-bold text-center">Chatterbox</h1>
    </header>
  );
};
export default Header;
