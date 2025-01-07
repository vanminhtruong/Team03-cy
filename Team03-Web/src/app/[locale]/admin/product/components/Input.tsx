import React from 'react';
import { InputText } from 'primereact/inputtext';

interface InputComponentProps {
    placeholder: string;
    value: string;
    setValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
    minLength: number;
    maxLength: number;
    defaultValue?: string;
}

function InputComponent({
    placeholder,
    value = '',
    setValue,
    minLength,
    maxLength,
    defaultValue = ''
}: InputComponentProps) {
    const currentValue = value ?? defaultValue;
    const isMinLengthValid = currentValue.length >= minLength;

    return (
        <div className="relative w-full">
            <InputText className="w-full p-3" placeholder={placeholder} value={currentValue} onChange={setValue} maxLength={maxLength} />
            <div className="absolute bottom-[-20px] left-0 flex justify-between mt-1">
                <small className={`${isMinLengthValid ? 'text-black' : 'text-gray-500'}`}>
                    {currentValue.length} / {maxLength} characters
                </small>
            </div>
        </div>
    );
}

export default InputComponent;
