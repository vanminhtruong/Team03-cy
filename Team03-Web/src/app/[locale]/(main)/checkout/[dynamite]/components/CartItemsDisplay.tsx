import React from 'react';

interface CartItemsDisplayProps {
  groupedCartItems: any;
  t: (key: string) => string;
}

const CartItemsDisplay: React.FC<CartItemsDisplayProps> = ({ groupedCartItems, t }) => {
  return (
    <>
      {groupedCartItems && Object.keys(groupedCartItems).map((shopId) => (
        <div key={shopId} className="bg-white rounded mb-3">
          <div className="p-4 border-b flex items-center">
            <span className="text-[#333333] text-base font-bold">{groupedCartItems[shopId][0].item.productFamily.shopName}</span>
          </div>
          {groupedCartItems[shopId].map((cartItem: any, index: number) => (
            <div key={index} className="p-4 flex items-center">
              <img
                src={cartItem.item.image !== "" ? cartItem.item.image : cartItem.item.productFamily.productImage}
                alt={cartItem.item.image}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="ml-4 flex-1">
                <div className="text-[#333333] text-xl font-bold">{cartItem.item.productFamily.productName}</div>
                <div className="text-[#666666] text-lg mt-1 font-medium">
                  {cartItem.item.option1 && cartItem.item.option1.name !== 'default' && `${cartItem.item.option1.name}: ${cartItem.item.option1.value.name}`}
                  {cartItem.item.option2 && cartItem.item.option2.name !== 'default' && `, ${cartItem.item.option2.name}: ${cartItem.item.option2.value.name}`}
                </div>
                <div className="text-[#666666] text-lg mt-1 font-medium">x{cartItem.itemQuantity}</div>
              </div>
              <div className="text-right">
                {cartItem.item.price !== cartItem.item.discountedPrice && (
                  <div className="text-[#999999] text-base line-through">
                    {new Intl.NumberFormat().format(cartItem.item.price)}₫
                  </div>
                )}
                <div className="text-primary-text text-lg font-bold">
                  {new Intl.NumberFormat().format(cartItem.item.discountedPrice)}₫
                </div>
              </div>
            </div>
          ))}
          <div className="p-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-black text-lg font-bold">{t('subtotal')}</span>
              <span className="text-[#777777] text-lg font-medium">
                {new Intl.NumberFormat().format(
                  groupedCartItems[shopId].reduce((acc:any, cartItem:any) => acc + (cartItem.item.discountedPrice * cartItem.itemQuantity), 0)
                )}₫
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default CartItemsDisplay;
