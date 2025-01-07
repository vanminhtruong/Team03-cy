export default {
    shopManagement: 'Quản lý cửa hàng',
    searchByName: 'Tìm kiếm theo tên...',
    status: 'Trạng thái',
    statuses: {
        all: 'Tất cả',
        ready: 'Sẵn sàng',
        pending: 'Chờ phê duyệt',
        rejected: 'Từ chối',
        locked: 'Khóa'
    },
    actions: {
        updateStatus: 'Cập nhật trạng thái cửa hàng',
        successUpdate: 'Cập nhật trạng thái cửa hàng thành công',
        errorUpdate: 'Cập nhật trạng thái cửa hàng thất bại',
        lockShop: 'Khóa cửa hàng',
        successLockShop: 'Khóa cửa hàng thành công',
        errorLockShop: 'Khóa cửa hàng thất bại',
        noData: 'Không có dữ liệu'
    },
    labels: {
        shopName: 'Tên cửa hàng',
        owner: 'Chủ sở hữu',
        email: 'Email',
        phone: 'Số điện thoại',
        address: 'Địa chỉ',
        idCard: 'CMND/CCCD',
        registeredDate: 'Ngày đăng ký',
        reason: 'Lý do khóa cửa hàng'
    },
    placeholders: {
        searchName: 'Tìm kiếm theo tên cửa hàng...',
        defaultImage: 'Ảnh mặc định',
        enterReason: 'Nhập lý do khóa cửa hàng...'
    },
    dialogs: {
        lockShopDialog: {
            title: 'Khóa cửa hàng',
            message: 'Vui lòng nhập lý do khóa cửa hàng trước khi tiếp tục.',
            submitButton: 'Gửi lý do',
            cancelButton: 'Hủy'
        }
    }
};
