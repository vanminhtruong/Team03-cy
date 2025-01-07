import React, { useState } from 'react';

const RatingFilter = ({ onFilter }: any) => {
    const [rating, setRating] = useState<number | undefined>(undefined);
    const [hasImage, setHasImage] = useState<boolean | undefined>(undefined);
    const [hasComment, setHasComment] = useState<boolean | undefined>(undefined);

    const handleFilterChange = () => {
        onFilter({ rating, hasImage, hasComment });
    };

    return (
        <div>
            {/* Rating filter example */}
            <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => {
                    setRating(Number(e.target.value));
                    handleFilterChange();
                }}
            />
            <label>Rating</label>

            {/* Checkbox filter for hasImage */}
            <label>
                <input
                    type="checkbox"
                    checked={hasImage || false}
                    onChange={(e) => {
                        setHasImage(e.target.checked);
                        handleFilterChange();
                    }}
                />
                Has Image
            </label>

            {/* Checkbox filter for hasComment */}
            <label>
                <input
                    type="checkbox"
                    checked={hasComment || false}
                    onChange={(e) => {
                        setHasComment(e.target.checked);
                        handleFilterChange();
                    }}
                />
                Has Comment
            </label>
        </div>
    );
};


export default RatingFilter;
