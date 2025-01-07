import { useState, useEffect } from 'react';

type ImageCarouselProps = {
    images: string[];
};

const ImageCarousel = ({ images }: ImageCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [currentIndex]);

    const nextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    return (
        <div className="relative">
            <img src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} className="w-full object-cover" />
            <div className="absolute top-1/2 left-5 transform -translate-y-1/2">
                <button onClick={prevImage} className="text-black p-2 rounded-full">
                    <span className="pi pi-angle-left text-3xl font-bold"></span>
                </button>
            </div>
            <div className="absolute top-1/2 right-5 transform -translate-y-1/2">
                <button onClick={nextImage} className="text-black p-2 rounded-full">
                    <span className="pi pi-angle-right text-3xl font-bold"></span>
                </button>
            </div>
        </div>
    );
};

export default ImageCarousel;
