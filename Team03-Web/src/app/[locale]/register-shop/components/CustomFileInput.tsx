import { InputText } from 'primereact/inputtext';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import useSignupStore from '@/src/app/[locale]/admin/stores/signup/useSignupStore';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Image as PrimeImage } from 'primereact/image';

interface CustomFileInputProps {
    id: string;
    value: File | null;
    onChange: (file: File | null) => void;
    placeholder?: string;
    fieldName?: string;
    onUploadSuccess?: () => void;
}

const CustomFileInput: React.FC<CustomFileInputProps> = ({ id, value, onChange, placeholder, fieldName, onUploadSuccess }) => {
    const [fileName, setFileName] = useState('');
    const t = useTranslations('admin-signup');
    const [preview, setPreview] = useState<string | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);
    const icon = <i className="pi pi-trash"></i>;
    const [hasImageChanged, setHasImageChanged] = useState(false);

    const webcamRef = useRef<Webcam>(null);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const storedFile = fieldName ? useSignupStore((state: any) => state[fieldName]) : null;
    const [showDialog, setShowDialog] = useState(false);
    const handleOpenDialog = () => {
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
    };

    const handleCaptureImage = () => {
        handleOpenDialog();
        setIsCapturing(true);
    };

    useEffect(() => {
        if (value && value instanceof File) {
            const objectURL = URL.createObjectURL(value);
            setPreview(objectURL);
            setFileName(value.name);
            scanQRCodeFromFile(value);
        } else {
            setPreview(null);
            setFileName('');
        }

        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [value, fieldName]);

    useEffect(() => {
        if (storedFile) {
            setImageSrc(storedFile);
            if (onChange) {
                onChange(storedFile);
            }
        }
    }, [storedFile]);

    useEffect(() => {
        if (hasImageChanged && onUploadSuccess) {
            onUploadSuccess();
        }
    }, [imageSrc, hasImageChanged]);

    const scanQRCodeFromFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, canvas.width, canvas.height);
                    if (code) {
                        setQrCodeData(code.data);
                    } else {
                        setQrCodeData(null);
                    }
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: any) => {
        fileInputRef.current?.click();
        const fileInput = e.target;
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            if (onChange) onChange(file);

            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                const base64 = fileReader.result as string;
                useSignupStore.getState().setFile(fieldName, base64);
            };
            fileReader.readAsDataURL(file);

            setImageSrc(URL.createObjectURL(file));
            setFileName(file.name);
            setHasImageChanged(true);

            scanQRCodeFromFile(file);
        }

        fileInput.value = '';
    };

    const handleClearImage = () => {
        setFileName('');
        setImageSrc(null);
        setQrCodeData(null);
        useSignupStore.getState().setFile(fieldName, null);
        setHasImageChanged(true);
        setIsCapturing(false);
        document.body.style.overflow = 'auto';
    };

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImageSrc(imageSrc);
            useSignupStore.getState().setFile(fieldName, imageSrc);
            setIsCapturing(false);
            scanQRCode(imageSrc);
            setHasImageChanged(true);
        }
    }, [webcamRef]);

    const scanQRCode = (imageSrc: string) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0, image.width, image.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);
                if (code) {
                    setQrCodeData(code.data);
                } else {
                    setQrCodeData(null);
                }
            }
        };
    };

    return (
        <div className="relative group">
            {imageSrc ? (
                <PrimeImage src={imageSrc} indicatorIcon={icon} alt="Captured" onClick={handleClearImage} width="250" preview />
            ) : (
                <div className="flex justify-between py-2 gap-2 w-[10rem]">
                    <Button icon="pi pi-camera" type="button" onClick={handleCaptureImage} className="p-button-outlined border-dashed border-2 border-gray-300 rounded-lg p-button-secondary w-full" size="large" />
                    <div>
                        <InputText accept="image/*" type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                        <Button icon="pi pi-upload" type="button" onClick={handleFileChange} className="p-button-outlined border-dashed border-2 border-gray-300 rounded-lg p-button-secondary w-full" size="large" />
                    </div>
                </div>
            )}

            {isCapturing && (
                <Dialog header={t('takePhoto')} visible={showDialog} onHide={handleCloseDialog}>
                    <div className="flex flex-col gap-4 w-[20rem] min-h-[15rem]">
                        <div className="mt-4 flex flex-col justify-center items-center border-2 border-gray-400 rounded-lg w-full relative overflow-hidden">
                            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width="100%" height="100%" className="rounded-lg" />
                        </div>

                        <div className="flex justify-between">
                            <Button label={t('cancel')} type="button" className="p-button-text text-primary-text" onClick={handleClearImage} />
                            <Button label={t('takePhoto')} type="button" className="bg-primary-text hover:bg-secondary-text text-white" onClick={capture} />
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default CustomFileInput;
