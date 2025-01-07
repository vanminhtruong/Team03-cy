import React from 'react';

interface ChatButtonProps {
    onClick: () => void;
    label: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick, label }) => {
    return (
        <button className="fixed bottom-4 right-4 bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded-full shadow-lg transition transform hover:scale-110 z-50 border border-gray-300" onClick={onClick}>
            <div className="flex gap-3 items-center">
                <img src="/layout/images/product/bubble-chat.png" alt="Chat Icon" className="w-6 h-6" />
                <span>{label}</span>
            </div>
        </button>
    );
};

export default ChatButton;
