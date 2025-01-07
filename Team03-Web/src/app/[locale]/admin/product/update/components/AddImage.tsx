'use client';
import React, { useState, useEffect } from 'react';
import { Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { deleteImageProduct } from '@/src/app/[locale]/admin/product/sevice/deleteImageProduct';
import { useTranslations } from 'next-intl';

interface AddImageButtonProps {
    initialImages?: { id: number; imageLink: string }[];
    onImagesChange: (images: File[]) => void;
}

const AddImageButton: React.FC<AddImageButtonProps> = ({ initialImages = [], onImagesChange }) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const maxImages = 6;
    const t = useTranslations('updateProduct');

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        const limitedFileList = newFileList.slice(0, maxImages);
        if (JSON.stringify(limitedFileList) !== JSON.stringify(fileList)) {
            setFileList(limitedFileList);
        }
    };

    useEffect(() => {
        const files = fileList.map((file) => file.originFileObj as File).filter(Boolean);
        onImagesChange(files);
    }, [fileList]);

    useEffect(() => {
        const initialFileList = initialImages.map((image) => ({
            uid: String(image.id),
            name: image.imageLink.split('/').pop() || 'Image',
            status: 'done' as const,
            url: image.imageLink
        }));
        setFileList(initialFileList);
    }, [initialImages]);

    const handleDeleteImage = async (id: number) => {
        try {
            await deleteImageProduct(id);
        } catch (e) {
            console.error(t('deleteImageError'), e);
        }
    };

    const onRemove = async (file: UploadFile) => {
        const id = parseInt(file.uid, 10);
        if (!isNaN(id)) {
            await handleDeleteImage(id);
        }
        setFileList((prevFileList) => prevFileList.filter((item) => item.uid !== file.uid));
    };

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
        <ImgCrop>
            <Upload
                customRequest={customUpload}
                listType="picture-card"
                fileList={fileList}
                onChange={handleChange}
                onPreview={onPreview}
                onRemove={onRemove}
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <p className="mt-2 text-sm text-primary-text font-semibold">
                            {t('maxImages', { current: fileList.length, max: maxImages })}
                        </p>
                    </div>
                )}
            </Upload>
        </ImgCrop>
    );
};

export default AddImageButton;
