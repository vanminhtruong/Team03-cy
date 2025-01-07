'use client';
import { useRouter } from '@/src/i18n/routing';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { getCart, updateCart, deleteCart } from '../service/serviceCart';
import useUserStore from '@/src/app/[locale]/(auth)/stores/useStore';
import { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import formatMoney from '@/src/utils/formatMoney';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { Checkbox } from 'primereact/checkbox';
import { useTranslations } from 'next-intl';
import useHandleCart from '@/src/layout/store/useHandleCart';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import Spinner from '@/src/components/spinner/spinner';

const WithCartItemPage = () => {
    const t = useTranslations('cart.withCartItem');
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const { id } = useUserStore();
    const [shops, setShops] = useState<any[]>([]);
    const [selectedShops, setSelectedShops] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [selectedProductsId, setSelectedProductsId] = useState<any[]>([]);
    const [selectCartDetailId, setSelectCartDetailId] = useState<number[]>([]);
    const [quantity, setQuantity] = useState<number>(1);
    const [visible, setVisible] = useState<boolean>(false);
    const [confirmationMessage, setConfirmationMessage] = useState<string>('');
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const [checked, setChecked] = useState<boolean>(false);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [cartId, setCartId] = useState<number>(0);
    const selectedAllQuantity = useRef<number>(0);
    const { triggerFetch, setTriggerFetch } = useHandleCart();
    const overlayRef = useRef<OverlayPanel>(null);
    const [overlayData, setOverlayData] = useState<any>(null);
    const [isLoading, setLoading] = useState<boolean>(false);

    const showOverlay = (data: any, event: React.MouseEvent) => {
        if (overlayRef.current) {
            overlayRef.current.toggle(event);
            setOverlayData(data);
        }
    };

    const showMess = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    const getProductsInCart = async (userId: number) => {
        try {
            const response = await getCart(userId);
            const aliasData = response?.cartItems || [];
            if (aliasData.length === 0) {
                window.location.reload();
            }
            setCartId(response?.cartId);

            const groupedShops = aliasData.reduce((shops: any[], item: any) => {
                const shopId = item.item.productFamily.shopId;
                const shopName = item.item.productFamily.shopName;

                const product = {
                    cartDetailId: item.cartDetailId,
                    itemId: item.item.itemId,
                    productId: item.item.productFamily.productId,
                    productImage: item.item.image,
                    productImageDto: item.item.productFamily.productImage,
                    productName: item.item.productFamily.productName,
                    size: item.item?.option1?.value?.name,
                    color: item.item?.option2?.value?.name,
                    price: item.item.price,
                    discountedPrice: item.item.discountedPrice,
                    quantity: item.itemQuantity,
                    total: item.totalPrice,
                    stock: item.item.quantity,
                    disabled: item.item.quantity <= 0
                };

                const existingShop = shops.find((shop) => shop.shopId === shopId);

                if (existingShop) {
                    existingShop.items.push(product);
                } else {
                    shops.push({
                        shopId,
                        shopName,
                        items: [product]
                    });
                }
                return shops;
            }, []);

            const shopsWithDisabled = groupedShops.map((shop: any) => {
                return {
                    ...shop,
                    isOutOfStockProducts: shop.items.every((item: any) => item.disabled),
                    items: [...shop.items].reverse()
                };
            });

            const revertedShops = [...shopsWithDisabled].reverse();
            setShops?.(revertedShops);
            selectedAllQuantity.current = groupedShops.flatMap((shop: { items: any }) => shop.items.filter((item: any) => !item.disabled) || []).length;
        } catch (error: any) {
            showMess('error', 'Error', error.message);
        }
    };

    useEffect(() => {
        if (id) getProductsInCart(id);
    }, [id, quantity]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (selectedProducts.some((item) => item.quantity > 0)) {
                const newTotalPrice = selectedProducts.reduce((total, item) => total + (item.quantity > 0 ? item.discountedPrice * item.quantity : 0), 0);
                setTotalPrice(newTotalPrice);
            } else {
                setTotalPrice(0);
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [selectedProducts]);

    const isProductNotInSelected = (productId: any) => !selectedProducts.some((product) => product.itemId === productId);

    const handleDeleteSelectedProducts = () => {
        setProductToDelete(selectedProducts);
        setSelectedProductsId(selectedProducts.map((product) => product.itemId));
        setConfirmationMessage(t('confirmDeleteSelectedProducts', { count: selectedProducts.length }));
        setVisible(true);
    };

    const handleDeleteProduct = (rowData: any) => {
        setProductToDelete(rowData);
        setSelectedProductsId([rowData.itemId]);
        setConfirmationMessage(t('confirmDeleteProducts', { productName: rowData.productName }));
        setVisible(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            const response = await deleteCart(id, selectedProductsId);

            if (response.status === 200) {
                setTriggerFetch(!triggerFetch);
                showMess('success', t('success'), t('successDeleteProducts'));
                await getProductsInCart(id);
                const checkIfProductsSelected = selectedProductsId.some((productId) => isProductNotInSelected(productId));
                if (!checkIfProductsSelected) {
                    setSelectedProducts(selectedProducts.filter((product) => !selectedProductsId.includes(product.itemId)));
                    setChecked(false);
                }
            } else {
                showMess('error', t('error'), t('errorDeleteProducts'));
            }
        } catch (error: any) {
            showMess('error', t('error'), error.message);
        } finally {
            setProductToDelete(null);
            setSelectedProductsId([]);
        }
    };

    const handleMinusQuantity = async (rowData: any) => {
        if (rowData.quantity > 1) {
            setLoading?.(true);
            try {
                const response = await updateCart(id, rowData.itemId, rowData.quantity - 1);
                if (response.status === 200) {
                    setQuantity?.(rowData.quantity - 1);
                    const updatedProducts = selectedProducts.map((product) => (product.itemId === rowData.itemId ? { ...product, quantity: rowData.quantity - 1 } : product));
                    setSelectedProducts(updatedProducts);
                } else {
                    showMess('error', t('error'), t('errorUpdateQuantity'));
                }
            } catch (error: any) {
                showMess('error', t('error'), error.message);
            } finally {
                setTimeout(() => setLoading?.(false), 100);
            }
        } else {
            showMess('warn', t('warn'), t('warnQuantity'));
        }
    };

    const handlePlusQuantity = async (rowData: any) => {
        if (rowData.quantity < rowData.stock) {
            setLoading?.(true);
            try {
                const response = await updateCart(id, rowData.itemId, rowData.quantity + 1);
                if (response.status === 200) {
                    setQuantity?.(rowData.quantity + 1);
                    const updatedProducts = selectedProducts.map((product) => (product.itemId === rowData.itemId ? { ...product, quantity: rowData.quantity + 1 } : product));
                    setSelectedProducts(updatedProducts);
                } else {
                    showMess('error', t('error'), t('errorUpdateQuantity'));
                }
            } catch (error: any) {
                showMess('error', t('error'), error.message);
            } finally {
                setTimeout(() => setLoading?.(false), 100);
            }
        } else {
            showMess('warn', t('warn'), t('warnStock'));
        }
    };

    const productBodyTemplate = (rowData: any) => {
        return (
            <div>
                <div className="flex flex-row justify-start items-center gap-3">
                    {rowData.productImage && rowData.productImage !== '' ? (
                        <img
                            src={rowData.productImage}
                            alt="Product Image"
                            style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                            }}
                        />
                    ) : (
                        <img
                            src={rowData.productImageDto}
                            alt="Product Image"
                            style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                            }}
                        />
                    )}
                    <div
                        className="break-words flex-1 order-1 line-clamp-1 sm:line-clamp-2 cursor-pointer"
                        onMouseEnter={(event) => showOverlay(rowData, event)}
                        onMouseLeave={() => overlayRef.current?.hide()}
                        onClick={() => router.push(`/products/${rowData.productId}`)}
                    >
                        {rowData.productName}
                    </div>
                    <OverlayPanel ref={overlayRef} dismissable>
                        <div>{overlayData ? overlayData.productName : ''}</div>
                    </OverlayPanel>
                    <div className="flex order-2 flex-col w-1/3">
                        <div>{t('productClassification')}:</div>
                        {rowData.size && rowData.color ? (
                            <div>
                                {rowData.size} - {rowData.color}
                            </div>
                        ) : (
                            <>
                                {rowData.size ? rowData.size : ''}
                                {rowData.color ? ' - ' + rowData.color : ''}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="flex justify-end pointer-events-auto">
                <Button type="button" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteProduct(rowData)} />
            </div>
        );
    };

    const priceBodyTemplate = (rowData: any) => {
        return (
            <div className="flex flex-col">
                <div>{formatMoney(rowData.discountedPrice)}</div>
                {rowData.price !== rowData.discountedPrice && rowData.price > rowData.discountedPrice ? <div className="line-through text-gray-300">{formatMoney(rowData.price)}</div> : null}
            </div>
        );
    };

    const quantityBodyTemplate = (rowData: any) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [tempQuantity, setTempQuantity] = useState(rowData.quantity);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            setTempQuantity(rowData.quantity);
        }, [rowData.quantity]);

        const handleInputChange = (e: any) => {
            const value = e.target.value;
            if (!isNaN(Number(value)) && Number(value) >= 0) {
                setTempQuantity(value);
            }
        };

        const handleBlur = async () => {
            let updatedQuantity = parseInt(tempQuantity, 10) || 1;
            if (updatedQuantity > rowData.stock) {
                updatedQuantity = rowData.stock;
            }
            rowData.quantity = updatedQuantity;
            const response = await updateCart(id, rowData.itemId, updatedQuantity);
            if (response.status === 200) {
                setQuantity?.(rowData.quantity);
                const updatedProducts = selectedProducts.map((product) => (product.itemId === rowData.itemId ? { ...product, quantity: rowData.quantity } : product));
                setSelectedProducts(updatedProducts);
                setTempQuantity(updatedQuantity);
            }
        };
        return (
            <div className="flex flex-col justify-start gap-2">
                <div className="flex flex-row border w-fit">
                    <Button type="button" icon="pi pi-minus" severity="secondary" text onClick={() => handleMinusQuantity(rowData)} disabled={rowData.disabled || rowData.quantity <= 1} />
                    <InputText value={tempQuantity} onChange={handleInputChange} onBlur={handleBlur} className="w-16 text-center" />
                    <Button type="button" icon="pi pi-plus" severity="secondary" text onClick={() => handlePlusQuantity(rowData)} disabled={rowData.disabled || rowData.quantity >= rowData.stock} />
                </div>
                {rowData.disabled ? <div className="text-red-500">{t('noProduct')}</div> : null}
            </div>
        );
    };

    const totalBodyTemplate = (rowData: any) => {
        return <div className="text-left">{formatMoney(rowData.total)}</div>;
    };

    const handleSelectedAll = (checked: boolean) => {
        setChecked(checked);
        if (checked) {
            const allProducts = shops.flatMap((shop) => shop.items?.filter((item: any) => !item.disabled) || []);
            if (allProducts.length === 0) return;
            setSelectedProducts(allProducts);
            setSelectCartDetailId(allProducts.map((product) => product.cartDetailId));
            setSelectedShops(shops);
        } else {
            setSelectedProducts([]);
            setSelectedShops([]);
            setSelectCartDetailId([]);
        }
    };

    const handleShopSelectedChange = (selectedShops: any[]) => {
        const allSelectedProducts = selectedShops.flatMap((shop) => shop.items?.filter((item: any) => !item.disabled) || []);
        setSelectedShops(selectedShops);
        const allShopsChecked = shops.flatMap((shop) => shop.items?.filter((item: any) => !item.disabled) || []);
        setChecked(allSelectedProducts.length === allShopsChecked.length);
        checkIfProductsSelected(allSelectedProducts);
    };
    const checkIfProductsSelected = (allSelectedProducts: any) => {
        const selectedShopItems = selectedShops.flatMap((shop) => shop.items.filter((item: any) => !item.disabled));
        if (allSelectedProducts.length === 0) {
            const filteredProducts = selectedProducts.filter((selectedProduct) => !selectedShopItems.some((item: any) => item.itemId === selectedProduct.itemId));
            setSelectedProducts(filteredProducts);
            setSelectedProductsId(filteredProducts.map((product) => product.itemId));
            setSelectCartDetailId(filteredProducts.map((product) => product.cartDetailId));
        } else {
            const allProductsExist = allSelectedProducts.every((product: any) => selectedProducts.some((selectedProduct) => selectedProduct.itemId === product.itemId));
            setSelectedProducts((prevSelectedProducts) => {
                if (allProductsExist) {
                    const products = selectedShopItems.filter((item: any) => !allSelectedProducts.some((selectedProduct: any) => selectedProduct.itemId === item.itemId));
                    const filteredProducts = selectedProducts.filter((selectedProduct) => !products.some((item: any) => item.itemId === selectedProduct.itemId));
                    return filteredProducts;
                }
                const newSelectedProducts = [...prevSelectedProducts, ...allSelectedProducts];
                const uniqueSelectedProducts = Array.from(new Set(newSelectedProducts.map((product) => product.itemId))).map((itemId) => newSelectedProducts.find((product) => product.itemId === itemId));
                setSelectedProductsId(uniqueSelectedProducts.map((product) => product.itemId));
                setSelectCartDetailId(uniqueSelectedProducts.map((product) => product.cartDetailId));
                return uniqueSelectedProducts;
            });
        }
    };

    const handleProductSelectedChange = (selectedProducts: any[]) => {
        setSelectedProducts(selectedProducts);
        const updatedProductsInShops = shops.map((shop) => ({
            ...shop,
            items: shop.items.filter((item: any) => !item.disabled)
        }));
        const updatedSelectedShops = updatedProductsInShops.filter((shop) => {
            const allProductsSelected = shop.items.every((item: any) => selectedProducts.some((selected) => selected.itemId === item.itemId));
            return allProductsSelected;
        });
        const allProductsActive = shops.flatMap((shop) => shop.items?.filter((item: any) => !item.disabled) || []);
        const allShopsChecked = selectedProducts.length === allProductsActive.length;
        setChecked(allShopsChecked);
        setSelectedShops(updatedSelectedShops);
        setSelectedProductsId(selectedProducts.map((product) => product.itemId));
        setSelectCartDetailId(selectedProducts.map((product) => product.cartDetailId));
    };

    const rowClassName = (rowData: any) => {
        return rowData.disabled || rowData.isOutOfStockProducts ? 'bg-gray-100 pointer-events-none' : '';
    };

    const renderRowExpansion = (data: any) => {
        return (
            <div>
                <DataTable
                    value={data.items}
                    selectionMode="checkbox"
                    selection={selectedProducts}
                    onSelectionChange={(e) => handleProductSelectedChange(e.value)}
                    dataKey="itemId"
                    rowClassName={rowClassName}
                    showHeaders={false}
                    tableStyle={{ minWidth: '50rem', fontSize: '1rem', fontWeight: 550 }}
                >
                    <Column style={{ width: '1rem' }} />
                    <Column selectionMode="multiple" headerStyle={{ width: '1rem' }} style={{ width: '1rem' }}></Column>
                    <Column field="productImage" body={productBodyTemplate} style={{ width: '32rem' }}></Column>
                    <Column field="price" body={priceBodyTemplate} style={{ width: '15rem' }}></Column>
                    <Column field="quantity" body={quantityBodyTemplate} style={{ width: '15rem' }}></Column>
                    <Column field="total" body={totalBodyTemplate}></Column>
                    <Column body={actionBodyTemplate}></Column>
                </DataTable>
            </div>
        );
    };

    const shopBodyTemplate = (rowData: any) => {
        return (
            <div className="cursor-pointer" onClick={() => router.push(`/shop/${rowData.shopId}`)}>
                {rowData.shopName}
            </div>
        );
    };

    const handleDiscardProducts = () => {
        const disabledProducts = shops.flatMap((shop) => shop.items.filter((item: any) => item.disabled));
        setSelectedProductsId(disabledProducts.map((product) => product.itemId));
        setConfirmationMessage(t('confirmDeleteInactiveProducts', { count: disabledProducts.length }));
        setProductToDelete(disabledProducts);
        setVisible(true);
    };

    const handleCheckout = () => {
        if (totalPrice > 100000000) {
            showMess('warn', t('warn'), t('warnTotalPrice'));
            return;
        }
        const queryParams = selectCartDetailId ? Object.values(selectCartDetailId).join(', ') : '';
        setLoading?.(true);
        router.push(`/checkout/${cartId}?cartItemId=${queryParams}`);
    };

    return (
        <div className="min-h-screen my-4">
            <ConfirmationDialog visible={visible} setVisible={setVisible} confirmationMessage={confirmationMessage} onConfirm={handleConfirmDelete} />
            <Toast ref={toast} />
            <Spinner isLoading={isLoading} />
            <div className="shadow-lg">
                <DataTable
                    value={shops}
                    selectionMode="checkbox"
                    selection={selectedShops}
                    onSelectionChange={(e) => handleShopSelectedChange(e.value)}
                    rowExpansionTemplate={renderRowExpansion}
                    expandedRows={shops}
                    rowClassName={rowClassName}
                    dataKey="shopId"
                    tableStyle={{ minWidth: '50rem', fontSize: '1.2rem', fontWeight: 550 }}
                >
                    <Column style={{ width: '3rem' }} />
                    <Column selectionMode="multiple" headerStyle={{ width: '1rem' }}></Column>
                    <Column field="shopName" header={t('product')} body={shopBodyTemplate} style={{ width: '32rem' }}></Column>
                    <Column header={t('price')} style={{ width: '15rem' }}></Column>
                    <Column header={t('quantity')} style={{ width: '15rem' }}></Column>
                    <Column header={t('subtotal')}></Column>
                    <Column header=""></Column>
                </DataTable>
            </div>
            <div className="flex flex-row border p-4 justify-between w-full pl-16 items-center text-xl font-medium  mt-4 shadow-lg">
                <div className="flex flex-row gap-5 items-center">
                    <Checkbox onChange={(e: any) => handleSelectedAll(e.checked)} checked={checked}></Checkbox>
                    <div>
                        {t('selectAll')} ({selectedAllQuantity.current})
                    </div>
                    <div onClick={handleDeleteSelectedProducts} className="cursor-pointer">
                        {t('delete')}
                    </div>
                    <div onClick={handleDiscardProducts} className="cursor-pointer">
                        {t('discardInactiveProdcuts')}
                    </div>
                </div>
                <div className="flex flex-row gap-5 items-center">
                    <div>{t('subtotalProducts', { count: selectedProducts.length })}</div>
                    <div className="text-red-500">{formatMoney(totalPrice)}</div>
                    <Button label="Checkout" className={`bg-primary-text ${selectCartDetailId.length === 0 ? 'cursor-not-allowed ' : ''}`} onClick={handleCheckout} disabled={selectCartDetailId.length === 0} />
                </div>
            </div>
        </div>
    );
};

export default WithCartItemPage;
