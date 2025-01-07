import React from 'react';
import useChatStore from '@/src/app/[locale]/(main)/stores/useChatStore';

interface LastMessage {
    sentAt?: string;
    message?: string;
    mediaUrls?: string[];
}

interface User {
    userId: any;
    name: string;
    profilePicture?: string;
    lastMessage?: LastMessage;
}

interface MessagePreviewProps {
    lastMessage?: LastMessage;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({ lastMessage }) => {
    if (!lastMessage) return <span>Không có tin nhắn</span>;

    const messageTime = lastMessage.sentAt
        ? new Date(lastMessage.sentAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
          })
        : '';

    const truncateMessage = (message: string, maxLength = 50): string => {
        if (message.length <= maxLength) {
            return message;
        }
        return message.substring(0, maxLength) + '...';
    };

    if (lastMessage.message) {
        return (
            <div className="flex items-center">
                <span className="truncate">{truncateMessage(lastMessage.message)}</span>
                <span className="text-gray-400 text-xs ml-2 shrink-0">{messageTime}</span>
            </div>
        );
    }

    if (lastMessage.mediaUrls && lastMessage.mediaUrls.length > 0) {
        const mediaUrl = lastMessage.mediaUrls[0];
        const isImage = /\.(jpeg|jpg|gif|png)$/i.test(mediaUrl);
        const isVideo = /\.(ogg|webm|mp4)$/i.test(mediaUrl);

        return (
            <div className="flex items-center">
                <span>{isImage ? 'Đã gửi 1 ảnh' : isVideo ? 'Đã gửi 1 video' : 'Không có tin nhắn'}</span>
                <span className="text-gray-400 text-xs ml-2 shrink-0">{messageTime}</span>
            </div>
        );
    }

    return <span>Không có tin nhắn</span>;
};

interface UserCardProps {
    user: User;
    isSelected: boolean;
    onClick: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, isSelected, onClick }) => (
    <div className={`p-3 cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-gray-200' : ''}`} onClick={onClick}>
        <div className="flex gap-2 my-2">
            <img src={user.profilePicture || '/layout/images/product/user (1).png'} alt="User Avatar" className="w-[50px] h-[50px] rounded-full object-cover border border-gray-200" />
            <div>
                <div className="text-gray-600 text-sm">
                    <p className="font-bold text-black">{user.name}</p>
                    <MessagePreview lastMessage={user.lastMessage} />
                </div>
            </div>
        </div>
    </div>
);

const Sidebar: React.FC = () => {
    const { users, recipientId, setRecipientId, setimageShop, setShopName, resetChat } = useChatStore();

    const handleUserSelect = (user: User): void => {
        resetChat();
        setRecipientId(user?.userId);
        setShopName(user.name);
        setimageShop(user.profilePicture || '');
    };

    return (
        <div className="bg-white w-[300px] h-full border-r border-gray-600 flex flex-col">
            <div className="bg-gray-400 text-black h-[60px] w-full flex justify-center item-center font-bold">
                <span className="uppercase mt-3 text-md">Danh sách shop</span>
            </div>
            <div className="flex-1 h-full overflow-y-auto">
                {users.map((user) => (
                    <UserCard key={user.userId} user={user} isSelected={recipientId === user.userId} onClick={() => handleUserSelect(user)} />
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
