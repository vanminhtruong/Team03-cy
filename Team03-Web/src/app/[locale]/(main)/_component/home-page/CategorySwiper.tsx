import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useTranslations } from 'next-intl';
import { Category } from '@/src/interface/category.interface';
import { useRouter } from '@/src/i18n/routing';

type CategorySwiperProps = {
    categories: Category[];
};

const CategorySwiper = ({ categories }: CategorySwiperProps) => {
    const t = useTranslations('HomePage');
    const router = useRouter();
    return (
        <div className="w-full mt-8 px-2 max-w-[1280px]">
            <div id="category" className="text-center my-6">
                <h2 className="text-[32px] font-bold text-gray-800">{t('categories')}</h2>
            </div>
            <Swiper
                modules={[Navigation, Autoplay]}
                autoplay={{ delay: 2000, disableOnInteraction: false }}
                spaceBetween={24}
                slidesPerView={8}
                loop
                breakpoints={{
                    0: { slidesPerView: 2, spaceBetween: 0 },
                    320: { slidesPerView: 4, spaceBetween: 8 },
                    480: { slidesPerView: 4, spaceBetween: 12 },
                    640: { slidesPerView: 4, spaceBetween: 16 },
                    768: { slidesPerView: 4, spaceBetween: 20 },
                    1024: { slidesPerView: 6, spaceBetween: 24 },
                    1280: { slidesPerView: 8, spaceBetween: 24 }
                }}
            >
                {categories.map((category, index) => (
                    <SwiperSlide key={index}>
                        <div
                            onClick={() => {
                                router.push(`/products?categoryParent=${category.categoryId}`);
                            }}
                            className="group bg-white cursor-pointer rounded-full overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col items-center p-4"
                        >
                            <div className="h-[100px] w-[100px] overflow-hidden rounded-full">
                                <img src={category.image || '/layout/images/home-page/cate.webp'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt={category.categoryName} />
                            </div>
                            <div className="mt-4 text-center">
                                <h6 className="font-medium text-gray-800 text-[14px] line-clamp-1">{category.categoryName}</h6>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default CategorySwiper;
