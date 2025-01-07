export const sendMessage = (message: string, selectedUser: any, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
    const senderId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).state.id : '';
    if (!selectedUser) return;

    const newMessage: Message = {
        messageId: Date.now(),
        chatId: `${senderId}_${selectedUser.userId}`,
        senderId: senderId,
        senderName : 'me',
        recipientId: selectedUser.userId,
        recipientUsername: selectedUser.username,
        message,
        mediaUrls: [],
        sentAt: new Date().toISOString()
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
};

