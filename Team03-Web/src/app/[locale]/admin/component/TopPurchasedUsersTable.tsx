import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface User {
    username: string;
    name: string;
    profilePicture?: string;
}

interface TopPurchasedUsersTableProps {
    users: User[];
    t: (key: string) => string;
}

const defaultProfileImage = '/layout/images/product/user-icon-1024x1024-dtzturco.png';

const TopPurchasedUsersTable = ({ users,t }: TopPurchasedUsersTableProps) => (
    <div className="mt-8">
        <h3 className="text-center font-semibold text-2xl mb-6 text-gray-800">{t('topPurchaseUsers')}</h3>
        <DataTable value={users}>
            <Column field="username" header={t('username')} />
            <Column field="name" header={t('fullName')} />
            <Column header={t('profilePicture')} body={(rowData) => <img src={rowData.profilePicture || defaultProfileImage} alt={rowData.username} width={50} className="rounded-full" />} />
        </DataTable>
    </div>
);

export default TopPurchasedUsersTable;
