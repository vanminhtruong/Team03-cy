export default {
    shopManagement: 'Shop Management',
    searchByName: 'Search by name...',
    status: 'Status',
    statuses: {
        all: 'All',
        ready: 'Ready',
        pending: 'Pending Approval',
        rejected: 'Rejected',
        locked: 'Locked'
    },
    actions: {
        updateStatus: 'Update Shop Status',
        successUpdate: 'Successfully updated shop status',
        errorUpdate: 'Failed to update shop status',
        lockShop: 'Lock Shop',
        successLockShop: 'Shop locked successfully',
        errorLockShop: 'Failed to lock shop',
        noData: 'No data available'
    },
    labels: {
        shopName: 'Shop Name',
        owner: 'Owner',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        idCard: 'ID Card',
        registeredDate: 'Registered Date',
        reason: 'Reason for locking the shop'
    },
    placeholders: {
        searchName: 'Search by shop name...',
        defaultImage: 'Default image',
        enterReason: 'Enter reason for locking the shop...'
    },
    dialogs: {
        lockShopDialog: {
            title: 'Lock Shop',
            message: 'Please enter the reason for locking the shop before proceeding.',
            submitButton: 'Submit Reason',
            cancelButton: 'Cancel'
        }
    }
};
