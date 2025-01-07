import { defineStore } from 'pinia';

export const usePromotion = defineStore('promotion', {
    state: () => ({
        callBackTablePromotion: false
    }),

    actions: {
        setCallBackTablePromotion(newState) {
            this.callBackTablePromotion = newState;
        }
    }
});
