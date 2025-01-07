import React, { useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';

interface MessageInputProps {
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    mediaFiles: FileList | null;
    setMediaFiles: React.Dispatch<React.SetStateAction<FileList | null>>;
    handleSendMessage: () => void;
    handleRemoveFile: (index: number) => void;
    loading: boolean;
    isConnected: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ message, setMessage, mediaFiles, setMediaFiles, handleSendMessage, handleRemoveFile, loading, isConnected }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const toast = useRef<Toast>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = e.target.files;

        if (newFiles && newFiles.length > 0) {
            const existingFiles = mediaFiles ? Array.from(mediaFiles) : [];
            const newFilesArray = Array.from(newFiles);

            const hasImage = newFilesArray.some((file) => file.type.startsWith('image/'));
            const hasVideo = newFilesArray.some((file) => file.type.startsWith('video/'));

            if (hasImage && hasVideo) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'You cannot select both images and videos at the same time.',
                    detail: 'Warning',
                    life: 3000
                });
                return;
            }

            const totalFiles = existingFiles.concat(newFilesArray);

            if (totalFiles.length > 6) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'You can only upload up to 6 files at a time',
                    detail: 'Warning',
                    life: 3000
                });
                return;
            }
            setMediaFiles(totalFiles as any);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onRemoveFile = (index: number) => {
        handleRemoveFile(index);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white text-black">
            <div className="flex gap-3 justify-start items-center w-full pl-20 pr-20 pb-20 pt-2 border-t border-gray-300 bg-white">
                <div className="flex gap-2 overflow-x-auto">
                    {mediaFiles &&
                        Array.from(mediaFiles).map((file, index) => {
                            const fileUrl = URL.createObjectURL(file);

                            const isVideo = file.type.startsWith('video/');
                            const defaultImage = '/layout/images/product/video-default.jpg';

                            return (
                                <div key={index} className="relative">
                                    {loading ? (
                                        <div className="flex justify-center items-center py-4">
                                            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="1" fill="var(--surface-ground)" animationDuration=".5s" />
                                        </div>
                                    ) : (
                                        <>
                                            {isVideo ? (
                                                <img
                                                    src={defaultImage}
                                                    alt={`video-preview-${index}`}
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        objectFit: 'cover',
                                                        marginRight: '5px'
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={fileUrl}
                                                    alt={`preview-${index}`}
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        objectFit: 'cover',
                                                        marginRight: '5px'
                                                    }}
                                                />
                                            )}
                                        </>
                                    )}
                                    <button onClick={() => onRemoveFile(index)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex justify-center items-center">
                                        X
                                    </button>
                                </div>
                            );
                        })}
                </div>
            </div>
            <div className="flex gap-3 justify-center items-center absolute bottom-0 left-0 w-full p-3 border-t border-gray-300 bg-white">
                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                    <i className="pi pi-images" style={{ color: 'green', fontSize: '1rem' }}></i>
                </label>

                <input type="file" multiple accept="image/*,video/*" onChange={onFileChange} id="file-upload" className="hidden" ref={fileInputRef} />

                <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    className="w-full p-2 border rounded focus:outline-none bg-gray-200 text-black border-gray-400"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSendMessage();
                        }
                    }}
                />

                <button
                    onClick={handleSendMessage}
                    disabled={!isConnected || loading || (!message && (!mediaFiles || mediaFiles.length === 0))}
                    className="flex items-center justify-center bg-red-500 text-white rounded px-4 py-3 hover:bg-red-700 transition-colors duration-300"
                >
                    {loading ? <div className="animate-spin border-t-2 border-white rounded-full w-5 h-5"></div> : <i className="pi pi-send"></i>}
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
