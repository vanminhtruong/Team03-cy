import React from 'react';

interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = '', type = 'button' }) => {
    const defaultClass = `
        px-6 py-2 bg-black text-white border border-gray-300 rounded-lg
        transition-all duration-300 ease-in-out
        hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-500
    `;

    const combinedClassName = `${defaultClass} ${className}`;

    return (
        <button
            type={type}
            onClick={onClick}
            className={combinedClassName}
        >
            {children}
        </button>
    );
};

export default Button;
