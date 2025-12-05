// src/components/ui/Input.jsx
import React from 'react';

export const Input = ({ label, textarea, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    {textarea ? (
      <textarea
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
        rows="3"
        {...props}
      />
    ) : (
      <input
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
        {...props}
      />
    )}
  </div>
);