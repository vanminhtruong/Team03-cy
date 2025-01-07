import React from 'react';
import FeedbackItem from '@/src/app/[locale]/(main)/products/_component/ProductFeedbacks';
import { Feedback } from '@/src/interface/product.interface';

interface FeedbackListProps {
    feedbacks: Feedback[];
    maxVisibleMedia: number;
    handleFeedbackImageClick: (mediaLink: string) => void;
}

const FeedbackList: React.FC<FeedbackListProps> = ({ feedbacks, maxVisibleMedia, handleFeedbackImageClick }) => {
    return (
        <div>
            {feedbacks.length === 0 ? (
                <p className="text-gray-700 font-[500] mt-4">No reviews yet.</p>
            ) : (
                feedbacks.map((feedback) => (
                    <FeedbackItem
                        key={feedback.id}
                        feedback={feedback}
                        maxVisibleMedia={maxVisibleMedia}
                        handleFeedbackImageClick={handleFeedbackImageClick}
                    />
                ))
            )}
        </div>
    );
};

export default FeedbackList;
