import { create } from 'zustand';


interface User {
    userId: any;
    name: string;
    profilePicture?: string;
    lastMessage?: any;
}

interface StateChat {
    id: number;
    senderId: number;
    recipientId: number;
    message: string;
    mediaUrls: string[];
    sentAt: string;
}

interface ChatStore {
    openChat: boolean;
    recipientId: number | null;
    shopName: string | null;
    users: User[];
    stateChat: StateChat[];
    imageShop: string;
    setimageShop: (imageShop: string) => void;
    setStateChat: (stateChat: StateChat[]) => void;
    setShopName: (shopName: string) => void;
    setOpenChat: (isOpen: boolean) => void;
    setRecipientId: (userId: number | null) => void;
    setUser: (users: User[]) => void;
    resetChat: () => void;
}

const useChatStore = create<ChatStore>((set) => ({
    openChat: false,
    recipientId: null,
    shopName: null,
    imageShop: '',
    setimageShop: (imageShop: string) => set(() => ({ imageShop })),
    users: [],
    stateChat: [],
    setStateChat: (newMessages: StateChat[]) => set((state) => ({ stateChat: [...state.stateChat, ...newMessages] })),
    setShopName: (shopName: string) => set(() => ({ shopName })),
    setOpenChat: (isOpen: boolean) => set(() => ({ openChat: isOpen })),
    setRecipientId: (userId: number | null) => set(() => ({ recipientId: userId })),
    setUser: (users: User[]) => set(() => ({ users })),
    resetChat: () => set(() => ({ recipientId: null, stateChat: [] }))
}));

export default useChatStore;
