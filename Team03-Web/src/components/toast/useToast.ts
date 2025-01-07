import { create } from 'zustand';

// @ts-ignore
const useToast = create((set) => ({
    textMess: '',
    title: '',
    urlImg: '',
    textBtn:'',
    openDialog: false,

    setNotification: ({ text, title, imgUrl,textBtn }: any) =>
        set(() => ({
            textMess: text,
            title: title,
            urlImg: imgUrl || '',
            textBtn: textBtn || '',
            openDialog: true,
        })),

    closeDialog: () => set(() => ({ openDialog: false })),
}));
export default useToast;
