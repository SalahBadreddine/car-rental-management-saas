import React from 'react';
// Note: We are removing the import of './App.css' and the default logo,
// since we will be using Tailwind CSS for styling.

const App: React.FC = () => {
  return (
    // We use Tailwind classes here for a clean, centered layout
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center p-8 bg-white shadow-xl rounded-xl max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">
          Car Management System
        </h1>
        <p className="text-gray-600 text-lg">
          Frontend Structure Initialized (TypeScript & Tailwind Ready)
        </p>
        <p className="mt-6 text-sm text-gray-400">
          Start building by editing <code>src/App.tsx</code>
        </p>
      </div>
    </div>
  );
};

export default App;