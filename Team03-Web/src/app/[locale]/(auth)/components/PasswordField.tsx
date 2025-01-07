import React, { useState } from 'react';
import { EyeIcon } from 'primereact/icons/eye';
import { EyeSlashIcon } from 'primereact/icons/eyeslash';

interface PasswordFieldProps {
    value: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ value, placeholder, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => setShowPassword((prev) => !prev);

    return (
        <div className="relative  w-full ">
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    placeholder={placeholder || 'Enter your password'}
                    onChange={onChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-gray-300 transition duration-200"
                />


                <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-500"
                    onClick={toggleShowPassword}
                >
                    {showPassword ? <EyeIcon className="w-7 h-7" /> : <EyeSlashIcon className="w-7 h-7" />}
                </button>
            </div>
        </div>
    );
};

export default PasswordField;
