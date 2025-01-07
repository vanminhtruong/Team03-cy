import React, { useState } from 'react';

interface FeedbackFilterProps {
    onFilter: (filters: { hasImage?: number; hasComment?: number; rating?: number }) => void;
}

const FeedbackFilter: React.FC<FeedbackFilterProps> = ({ onFilter }) => {
    const [rating, setRating] = useState<number | null>(null);
    const [hasImage, setHasImage] = useState<boolean>(false);
    const [hasComment, setHasComment] = useState<boolean>(false);

    const applyFilter = () => {
        onFilter({
            rating: rating || undefined,
            hasImage: hasImage ? 1 : undefined,
            hasComment: hasComment ? 1 : undefined
        });
    };

    return (
        <div className="p-4 bg-gray-100 rounded-md shadow-md">
            <h4 className="font-bold text-gray-800 mb-4">Filter Feedbacks</h4>
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block font-medium text-gray-700 mb-2">Star Rating</label>
                    <select className="p-2 border rounded-md w-full" value={rating || ''} onChange={(e) => setRating(Number(e.target.value) || null)}>
                        <option value="">All Ratings</option>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <option key={star} value={star}>
                                {star} Star{star > 1 && 's'}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="inline-flex items-center">
                        <input type="checkbox" className="mr-2" checked={hasImage} onChange={(e) => setHasImage(e.target.checked)} />
                        Has Image
                    </label>
                </div>
                <div>
                    <label className="inline-flex items-center">
                        <input type="checkbox" className="mr-2" checked={hasComment} onChange={(e) => setHasComment(e.target.checked)} />
                        Has Comment
                    </label>
                </div>

                <button onClick={applyFilter} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md">
                    Apply Filter
                </button>
            </div>
        </div>
    );
};

export default FeedbackFilter;
