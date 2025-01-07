export default {
    shopManagement: '상점 관리',
    searchByName: '이름으로 검색...',
    status: '상태',
    statuses: {
        all: '모두',
        ready: '준비 완료',
        pending: '승인 대기',
        rejected: '거부됨',
        locked: '잠금'
    },
    actions: {
        updateStatus: '상점 상태 업데이트',
        successUpdate: '상점 상태 업데이트 성공',
        errorUpdate: '상점 상태 업데이트 실패',
        lockShop: '상점 잠금',
        successLockShop: '상점 잠금 성공',
        errorLockShop: '상점 잠금 실패',
        noData: '데이터 없음'
    },
    labels: {
        shopName: '상점 이름',
        owner: '소유자',
        email: '이메일',
        phone: '전화번호',
        address: '주소',
        idCard: '신분증',
        registeredDate: '등록 날짜',
        reason: '상점 잠금 이유'
    },
    placeholders: {
        searchName: '상점 이름으로 검색...',
        defaultImage: '기본 이미지',
        enterReason: '상점 잠금 이유를 입력하세요...'
    },
    dialogs: {
        lockShopDialog: {
            title: '상점 잠금',
            message: '진행하기 전에 상점 잠금 이유를 입력하세요.',
            submitButton: '이유 제출',
            cancelButton: '취소'
        }
    }
};
