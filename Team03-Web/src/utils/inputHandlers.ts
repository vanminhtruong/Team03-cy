import { checkInput } from './checkInput';

export const isNumberic = (value: string) => {
    return /^[0-9]+$/.test(value);
};

export const handleBlurValidation = (field: string, formData: any, setErrorMessages: any, schema: any) => {
    const isValid = checkInput(formData, setErrorMessages, schema);

    if (isValid) {
        setErrorMessages((prev: any) => ({
            ...prev,
            [field]: ''
        }));
    }
};
