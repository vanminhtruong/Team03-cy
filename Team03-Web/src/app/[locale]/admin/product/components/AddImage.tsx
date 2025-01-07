'use client';
import React, { useState, useEffect } from 'react';
import { Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { useTranslations } from 'next-intl';

interface AddImageButtonProps {
    onImagesChange: (images: File[]) => void;
}

const AddImageButton: React.FC<AddImageButtonProps> = ({ onImagesChange }) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const maxImages = 6;
    const t = useTranslations('createProduct');

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        const limitedFileList = newFileList.slice(0, maxImages);

        if (JSON.stringify(limitedFileList) !== JSON.stringify(fileList)) {
            setFileList(limitedFileList);
        }
    };

    useEffect(() => {
        const files = fileList.map(file => file.originFileObj as File).filter(Boolean);
        onImagesChange(files);
    }, [fileList]);

    const onPreview = async (file: UploadFile) => {
        let src = file.url as string;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj as File);
                reader.onload = () => resolve(reader.result as string);
            });
        }
        const image = new Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow?.document.write(image.outerHTML);
    };

    const customUpload = async (options: any) => {
        const { file, onSuccess } = options;
        onSuccess('ok');
    };

    return (
        <ImgCrop >
            <Upload
                customRequest={customUpload}
                listType="picture-card"
                fileList={fileList}
                onChange={handleChange}
                onPreview={onPreview}
                multiple
                maxCount={maxImages}
            >
                {fileList.length < maxImages && (
                    <div className="flex flex-col items-center justify-center text-red-500">
                        <svg

                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="text-primary-text w-12 h-12"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-primary-text font-semibold">
                            {t('addImagePrompt', { count: fileList.length, maxImages })}
                        </p>
                    </div>
                )}
            </Upload>
        </ImgCrop>
    );
};

export default AddImageButton;
