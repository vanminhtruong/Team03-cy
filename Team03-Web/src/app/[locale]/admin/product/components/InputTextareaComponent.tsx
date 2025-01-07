import React from 'react';
import { Editor } from 'primereact/editor';

interface InputTextareaComponentProps {
    placeholder: string;
    value: string;
    setValue: (e: any) => void;
    minLength: number;
    maxLength: number;
    rows: number;
}

function InputTextareaComponent({ placeholder, value, setValue, minLength, maxLength, rows }: InputTextareaComponentProps) {
    const isMinLengthValid = value.length >= minLength;

    return (
        <div className="w-full">
            <Editor placeholder={placeholder} value={value} onTextChange={(e) => setValue(e.htmlValue)} style={{ height: `${rows * 50}px` }} maxLength={maxLength} className="w-full p-2" />
            <div className="flex justify-between mt-1">
                <small className={`${isMinLengthValid ? 'text-black' : 'text-gray-500'}`}>
                    {value.length} / {maxLength} characters
                </small>
            </div>
        </div>
    );
}

export default InputTextareaComponent;
