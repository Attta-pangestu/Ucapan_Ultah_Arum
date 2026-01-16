import React from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-black">
      <Experience />
      <Overlay />
    </div>
  );
};

export default App;