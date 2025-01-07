'use client';

import React from 'react';

interface InputFieldProps {
    label?: string;
    value: string;
    placeholder: string;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: 'text' | 'password';
}

export default function InputField({ label, value, placeholder, error, onChange, type = 'text' }: InputFieldProps) {
    return (
        <div className="mb-6 relative flex flex-col">
            <div className="flex items-center mb-2">
                <label className="w-40 text-gray-700 h-12 flex items-center">{label}</label>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`flex-grow h-12 px-4 border rounded-md focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-500'} text-gray-800`}
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-2 pl-[calc(10rem)]">{error}</p>}
        </div>
    );
}
