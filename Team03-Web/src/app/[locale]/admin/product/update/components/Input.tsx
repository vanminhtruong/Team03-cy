import React from 'react';
import { InputText } from 'primereact/inputtext';

interface InputComponentProps {
    placeholder: string;
    value: string;
    setValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
    minLength: number;
    maxLength: number;
    onBlur?: () => void;
    className?: string;
    disabled?: boolean;
    error?: boolean;
}

function InputComponent({ placeholder, value = '', setValue, minLength, maxLength, onBlur, className = '', disabled = false, error = false }: InputComponentProps) {
    const isMinLengthValid = value.length >= minLength;

    return (
        <div className="relative w-full">
            <InputText className={`w-full p-3 ${error ? 'p-invalid' : ''} ${className}`} placeholder={placeholder} value={value} onChange={setValue} maxLength={maxLength} onBlur={onBlur} disabled={disabled} />
            <div className="absolute bottom-[-20px] left-0 flex justify-between mt-1">
                <small className={isMinLengthValid ? 'text-gray-500' : 'text-red-500'}>
                    {value.length} / {maxLength} characters
                </small>
            </div>
        </div>
    );
}

export default InputComponent;
