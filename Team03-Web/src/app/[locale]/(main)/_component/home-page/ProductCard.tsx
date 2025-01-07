import { ProductResponse } from '@/src/interface/product.interface';
import { useTranslations } from 'next-intl';
import formatMoney from '@/src/utils/formatMoney';

type ProductCardProps = {
    product: ProductResponse;
    onClick?: (id: number) => void;
};

const ProductCard = ({ product, onClick }: ProductCardProps) => {
    const firstImageLink = product?.image || '/layout/images/home-page/anhdoc.jpg';
    const t = useTranslations('HomePage');

    return (
        <div className="relative cursor-pointer rounded-lg overflow-hidden group" onClick={() => onClick?.(product.productId)}>
            <img src={firstImageLink} alt="" className="w-full h-[240px] object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                <span className="font-bold text-base sm:text-lg md:text-xl lg:text-xl line-clamp-2 text-white">{product.productName}</span>
                <span className="mt-2 text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-red-400">{formatMoney(product.newPrice)}</span>
                {product.oldPrice !== product.newPrice && <span className="text-xs sm:text-sm md:text-base lg:text-lg line-through">{formatMoney(product.oldPrice)}</span>}
            </div>
        </div>
    );
};

export default ProductCard;
