import React from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { Rating } from 'primereact/rating';
import { Feedback } from '@/src/interface/product.interface';

interface FeedbackItemProps {
    feedback: Feedback;
    maxVisibleMedia: number;
    handleFeedbackImageClick: (mediaLink: string) => void;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({ feedback, maxVisibleMedia, handleFeedbackImageClick }) => {
    return (
        <div key={feedback.id} className="mt-6">
            <div className="flex items-center gap-4">
                <div>
                    <div className="flex gap-1 mt-1">
                        <div className="flex gap-2">
                            <div className="w-12 h-12 rounded-full bg-gray-200">
                                <img
                                    src={feedback.user.profilePicture || '/layout/profile/user-default.jpg'}
                                    alt={feedback.user.name}
                                    className="w-full h-full rounded-full"
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{feedback.user.name}</p>
                                <div className="flex my-2">
                                    <PrimeReactProvider value={{ unstyled: false }}>
                                        <Rating className="flex" value={feedback.rate} cancel={false} />
                                    </PrimeReactProvider>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-md text-gray-500">{new Date(feedback.createdAt).toLocaleString()}</p>
                    <p className="text-md text-gray-700 mt-2">{feedback.content}</p>
                    <div className="mt-4">
                        {feedback.feedbackImages && feedback.feedbackImages.length > 0 && (
                            <div className="grid grid-cols-6 gap-2">
                                {feedback.feedbackImages.slice(0, maxVisibleMedia).map((media, index) => {
                                    const isVideo = /\.(mp4|webm|ogg)$/i.test(media.imageLink);
                                    return isVideo ? (
                                        <video
                                            key={index}
                                            onClick={() => handleFeedbackImageClick(media.imageLink)}
                                            className="cursor-pointer w-20 h-20 object-cover rounded-md"
                                            controls
                                        >
                                            <source src={media.imageLink} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <img
                                            key={index}
                                            onClick={() => handleFeedbackImageClick(media.imageLink)}
                                            src={media.imageLink}
                                            alt=""
                                            className="cursor-pointer w-20 h-20 object-cover rounded-md"
                                        />
                                    );
                                })}
                                {feedback.feedbackImages.length > maxVisibleMedia && (
                                    <div className="relative w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                                        <img
                                            src={feedback.feedbackImages[maxVisibleMedia - 1].imageLink}
                                            alt=""
                                            className="w-full h-full object-cover rounded-md opacity-50"
                                        />
                                        <span className="absolute text-white font-semibold text-lg">
                                            +{feedback.feedbackImages.length - maxVisibleMedia}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackItem;
