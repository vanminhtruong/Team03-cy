import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Rating } from 'primereact/rating';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import Spinner from '@/src/components/spinner/spinner';
import { submitFeedback, updateOrderTracking } from '../services/purchase';

interface RatingModalProps {
    visible: boolean;
    onHide: () => void;
    productId: string | number;
    orderId: string;
    userId: string;
    orderDetailId: number;
    onRatingSuccess: () => void;
}

export default function RatingModal({ visible, onHide, productId, orderId, userId, orderDetailId, onRatingSuccess }: RatingModalProps) {
    const t = useTranslations();
    const toast = useRef<Toast>(null);
    const [rating, setRating] = useState<number>(0);
    const [content, setContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (selectedFiles.length + files.length > 5) {
            toast.current?.show({
                severity: 'warn',
                summary: t('purchase.rating.maxImagesError'),
                life: 3000
            });
            return;
        }
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!rating) {
            toast.current?.show({
                severity: 'warn',
                summary: t('purchase.rating.pleaseRate'),
                life: 3000
            });
            return;
        }

        try {
            setIsLoading(true);
            const feedbackResult = await submitFeedback(
                userId,
                productId,
                rating,
                content,
                selectedFiles
            );

            if (feedbackResult.success) {
                // Update order tracking
                const trackingResult = await updateOrderTracking(orderDetailId);
                
                if (trackingResult.success) {
                    toast.current?.show({
                        severity: 'success',
                        summary: t('purchase.rating.success'),
                        life: 3000
                    });
                    onRatingSuccess();
                    onHide();
                } else {
                    throw new Error(trackingResult.message || 'Failed to update order tracking');
                }
            } else {
                throw new Error(feedbackResult.message || 'Failed to submit review');
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: t('purchase.rating.error'),
                life: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <Spinner isLoading={isLoading} />
            <Toast ref={toast}/>
            <Dialog 
                visible={visible} 
                onHide={onHide}
                header={t('purchase.rating.title')}
                className="w-full max-w-lg bg-white"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">{t('purchase.rating.rateThis')}</span>
                        <Rating 
                            value={rating} 
                            onChange={(e) => setRating(e.value || 0)} 
                            cancel={false}
                            className="[&_.p-rating-item.p-rating-item-active>.p-rating-icon]:text-gray-900"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <InputTextarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            placeholder={t('purchase.rating.placeholder')}
                            className="w-full border border-gray-300 rounded-md focus:ring-gray-400 focus:border-gray-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-gray-600">{t('purchase.rating.maxImages')}</span>
                        <div className="flex flex-wrap gap-2">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-20 h-20 object-cover rounded border border-gray-300"
                                    />
                                    <Button
                                        icon="pi pi-times"
                                        onClick={() => handleRemoveFile(index)}
                                        className="absolute -top-1 -right-1 !p-1 !w-5 !h-5 !min-w-0 rounded-full bg-gray-800 text-white hover:bg-gray-900 flex items-center justify-center !border-0"
                                    />
                                </div>
                            ))}
                            {selectedFiles.length < 5 && (
                                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                                    <i className="pi pi-plus text-gray-400" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        multiple
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            label={t('purchase.rating.cancel')}
                            onClick={onHide}
                            className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded-md focus:outline-none !border-none !shadow-none"
                        />
                        <Button
                            label={t('purchase.rating.submit')}
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded-md focus:outline-none !border-none !shadow-none"
                        />
                    </div>
                </div>
            </Dialog>
        </>
    );
} 