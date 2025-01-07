import React from 'react';
import ButtonCustom from '@/src/components/ButtonCustom';

const ProductActions = ({ handleAddToCart }: { handleAddToCart: () => void }) => {
    return (
        <div className="flex gap-4">
            <ButtonCustom className='min-w-[200px] py-4 my-5 font-[500] bg-gray-800' onClick={handleAddToCart}>
                ADD TO CART
            </ButtonCustom>
        </div>
    );
};

export default ProductActions;
