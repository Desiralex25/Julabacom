import React from 'react';

export default function TestApp() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Application Test
        </h1>
        <p className="text-gray-600">
          Si vous voyez ceci, React fonctionne correctement.
        </p>
      </div>
    </div>
  );
}
