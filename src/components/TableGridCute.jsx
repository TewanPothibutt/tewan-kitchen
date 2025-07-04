import React from 'react';

const tables = Array.from({ length: 12 }, (_, i) => i + 1);

export default function TableGridCute() {
  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-pink-700 mb-8">
          🍽️ Choose Your Table
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {tables.map((tableNum) => (
            <button
              key={tableNum}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center hover:bg-pink-100 transition"
              onClick={() => alert(`เลือกโต๊ะ ${tableNum}`)}
            >
              <div className="text-2xl font-semibold text-pink-700">โต๊ะ {tableNum}</div>
              <div className="text-sm text-gray-500 mt-1">ว่างอยู่</div>
            </button>
          ))}
        </div>

        <div className="text-center text-xs text-gray-400 mt-10">
          Tewan's Kitchen POS 
        </div>
      </div>
    </div>
  );
}