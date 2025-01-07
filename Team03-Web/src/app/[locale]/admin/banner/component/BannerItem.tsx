'use client';
import React, { useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Image } from 'primereact/image';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { deleteBanner } from '@/src/app/[locale]/admin/banner/service/CreateBannerPayload';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

interface BannerItemProps {
    banner: {
        id: string;
        image: string;
        createStart: string;
        createEnd: string;
        isActive: number;
    };
    t: (key: string) => string;
    onDelete: (id: string) => void;
}

const BannerItem: React.FC<BannerItemProps> = ({ banner, t, onDelete }) => {
    const currentDate = new Date();
    const startDate = new Date(banner.createStart);
    const endDate = new Date(banner.createEnd);
    const toast = useRef<Toast>(null);

    const [deleting, setDeleting] = useState(false);

    let status = '';
    if (endDate < currentDate) {
        status = t('expired');
    } else if (startDate > currentDate) {
        status = t('notStarted');
    } else {
        status = t('active');
    }

    const approvalStatus = banner.isActive === 1 ? t('approved') : t('pending');

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await deleteBanner(banner.id);
            onDelete(banner.id);
            toast.current?.show({ severity: 'success', summary: t('bannerDeleted'), life: 3000 });
        } catch (error) {
            console.error('Failed to delete banner:', error);
            toast.current?.show({ severity: 'error', summary: t('deleteFailed'), life: 3000 });
        } finally {
            setDeleting(false);
        }
    };

    const confirmDelete = () => {
        confirmDialog({
            message: t('areYouSureDelete'),
            header: t('deleteConfirmation'),
            icon: 'pi pi-exclamation-triangle',
            accept: handleDelete,
            reject: () => toast.current?.show({ severity: 'info', summary: t('deleteCancelled'), life: 3000 })
        });
    };

    return (
        <div className="col-12 sm:col-6 lg:col-4 p-3 flex flex-column align-items-center">
            <Card className="w-full relative">
                <div className="absolute top-2 left-2 z-10">
                    <Tag value={status} severity={status === t('expired') ? 'danger' : status === t('notStarted') ? 'warning' : 'success'} />
                </div>
                <div className="absolute top-2 right-2 z-10">
                    <Tag value={approvalStatus} severity={approvalStatus === t('approved') ? 'success' : 'warning'} />
                </div>

                <div className="flex justify-content-center mb-3">
                    <div className="w-[220px] h-[220px] flex justify-content-center align-items-center border-round overflow-hidden" style={{ backgroundColor: '#f5f5f5' }}>
                        <Image src={banner.image} alt="Image" width="100%" height="100%" preview className="object-cover" />
                    </div>
                </div>

                <div className="text-center">
                    <p>
                        <strong>{t('start')}:</strong> {startDate.toLocaleString()}
                    </p>
                    <p>
                        <strong>{t('end')}:</strong> {endDate.toLocaleString()}
                    </p>
                </div>

                <div className="flex justify-content-center mt-3">
                    <Button
                        label={t('delete')}
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={confirmDelete}
                        disabled={deleting}
                    />
                </div>
            </Card>
            <Toast ref={toast} />
            <ConfirmDialog />
        </div>
    );
};

export default BannerItem;
