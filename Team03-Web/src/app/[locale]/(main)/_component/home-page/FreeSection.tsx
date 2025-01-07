import React from 'react';

interface FreeSectionProps {
    freeImages: string[];
}

const FreeSection: React.FC<FreeSectionProps> = ({ freeImages }) => {
    return (
        <div className="flex justify-center mt-8">
            <div className="grid grid-cols-5 gap-4 max-w-[1280px]">
                {freeImages.map((image, index) => (
                    <div
                        key={index}
                        className="bg-white cursor-pointer shadow-md rounded-[4px] overflow-hidden transition duration-300 ease-in-out hover:scale-105 flex items-center justify-center relative"
                    >
                        <div className="max-w-[238px] max-h-[238px] w-full h-full">
                            <img src={image} alt={`Image ${index + 1}`} className="object-cover" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FreeSection;
