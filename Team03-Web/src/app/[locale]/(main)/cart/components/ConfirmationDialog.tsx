'use client';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useTranslations } from 'next-intl';

const ConfirmationDialog = ({ visible, setVisible, confirmationMessage, onConfirm }: any) => {
    const t = useTranslations('cart.confirmationDialog');
    const handleClose = () => {
        setVisible(false);
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        handleClose();
    };

    return (
        <Dialog visible={visible} onHide={handleClose} header={t('title')} modal style={{ width: '30rem' }}>
            <div className="flex flex-col gap-12 mt-2">
                <p>{confirmationMessage}</p>
                <div className="p-field p-col-12 p-md-4 flex flex-row gap-2 justify-end">
                    <Button label={t('no')} icon="pi pi-times" severity="secondary" text raised onClick={handleClose} />
                    <Button label={t('yes')} icon="pi pi-check" onClick={handleConfirm} />
                </div>
            </div>
        </Dialog>
    );
};

export default ConfirmationDialog;
