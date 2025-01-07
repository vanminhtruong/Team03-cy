import React from 'react';

interface TextFieldProps {
    type: string,
    value: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextField: React.FC<TextFieldProps> = ({type, value, placeholder, onChange }) => {
    return (
        <div className=" w-full">
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-gray-300 transition duration-200"
            />
        </div>
    );
};

export default TextField;
