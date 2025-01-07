import { create } from 'zustand';

interface HandleCartState {
    triggerFetch: boolean;
    setTriggerFetch: (value: boolean) => void;
}

const useHandleCart = create<HandleCartState>((set) => ({
    triggerFetch: false,
    setTriggerFetch: (value: boolean) => set({ triggerFetch: value }),
}));

export default useHandleCart;
