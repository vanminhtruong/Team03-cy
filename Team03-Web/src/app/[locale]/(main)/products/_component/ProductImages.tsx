import React from 'react';

const ProductImages = ({ selectedImage, productImages, handleThumbnailClick }: any) => {
    return (
        <div className="w-full lg:sticky top-0 text-center">
            <div className="lg:h-[560px] flex justify-center items-center">
                <img src={selectedImage} alt="Product" className="lg:w-11/12 w-full h-full max-h-[560px] rounded-md object-cover object-top" />
            </div>
            <div className="flex flex-wrap gap-4 justify-center mx-auto mt-4">
                {productImages.map((image: any, index: number) => (
                    <img alt="" key={index} src={image.imageLink} className="w-20 h-20 cursor-pointer rounded-md object-cover" onClick={() => handleThumbnailClick(image.imageLink)} />
                ))}
            </div>
        </div>
    );
};

export default ProductImages;
