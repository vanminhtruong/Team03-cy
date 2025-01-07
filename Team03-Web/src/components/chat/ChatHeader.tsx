import React from 'react';

interface ChatHeaderProps {
    shopName: string | null;
    toggleChat: () => void;
    profilePicture?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ shopName, toggleChat, profilePicture }) => {
    return (
        <div className="bg-gray-400 w-full h-[60px] text-black p-[6px] font-bold flex justify-between items-center border-b border-gray-300">
            <div className='flex justify-center item-center gap-3 '>

                <img src={profilePicture || '/layout/images/product/user (1).png'} alt="User Avatar" className="w-[50px] h-[50px] rounded-full object-cover" />
                <div className='mt-3 text-xl  '>{shopName}</div>
            </div>

            <button onClick={toggleChat} className="text-black text-xl hover:text-gray-300 transition-colors duration-300">
                ✖
            </button>
        </div>
    );
};

export default ChatHeader;
