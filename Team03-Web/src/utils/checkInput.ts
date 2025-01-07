import { z } from 'zod';

export const checkInput = (formData: any, setErrorMessages: any, schema: any) => {
    try {
        schema.parse(formData);
        setErrorMessages({});
        return true;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: any = {};
            error.errors.forEach((err) => {
                errors[err.path[0]] = err.message;
            });
            setErrorMessages(errors);
        }
        return false;
    }
};
