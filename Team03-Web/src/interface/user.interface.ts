interface Message {
    messageId: number;
    chatId: string;
    senderId: string;
    senderName: string | null;
    recipientId: number;
    recipientUsername: string | null;
    message: string;
    mediaUrls: string[];
    sentAt: string;
}

interface User {
    updatedUser: Message;
    userId: number | null;
    name: string;
    profilePicture: string;
    username: string;
    lastMessage: Message[];
    timestamp: string;
}
