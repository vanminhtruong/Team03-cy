import React from 'react';

type QuantitySelectorProps = {
    quantity: number;
    setQuantity: React.Dispatch<React.SetStateAction<number>>;
    selectedVariant: { quantity: number } | null;
    addedQuantity: number;
};

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
                                                               quantity,
                                                               setQuantity,
                                                               selectedVariant,
                                                               addedQuantity,
                                                           }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = parseInt(e.target.value, 10);
        if (!isNaN(inputValue)) {
            // Ensure the input value is within the valid range
            setQuantity(Math.min(Math.max(1, inputValue), (selectedVariant?.quantity || 0) - addedQuantity));
        }
    };

    return (
        <div className="flex items-center gap-4 py-4">
            <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 bg-gray-200 text-gray-800 font-bold flex items-center justify-center rounded-md hover:bg-gray-300"
                disabled={quantity === 1}
            >
                -
            </button>

            <input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                className="w-16 h-10 text-center font-semibold border border-gray-300 rounded-md"
                min={1}
                max={(selectedVariant?.quantity || 0) - addedQuantity}
            />

            <button
                onClick={() => setQuantity((prev) => Math.min(prev + 1, (selectedVariant?.quantity || 0) - addedQuantity))}
                className="w-10 h-10 bg-gray-200 text-gray-800 font-bold flex items-center justify-center rounded-md hover:bg-gray-300"
                disabled={quantity >= (selectedVariant?.quantity || 0) - addedQuantity}
            >
                +
            </button>
        </div>
    );
};

export default QuantitySelector;
