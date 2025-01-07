export function useFormatted() {
    function formatCurrency(value) {
        return value.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 2
        });
    }

    // function formatDate(value) {
    //     return value.toLocaleDateString('en-US', {
    //         day: '2-digit',
    //         month: '2-digit',
    //         year: 'numeric'
    //     });
    // }

    function formatDate(value) {
        const date = new Date(value);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function formatStatusLabel(value, statuses) {
        const statusObj = statuses.find((s) => s.value == value);
        if (statusObj) {
            return { label: statusObj.label, severity: statusObj.severity };
        }
        return { label: 'N/A', severity: 'warn' };
    }

    return {
        formatCurrency,
        formatDate,
        formatStatusLabel
    };
}
