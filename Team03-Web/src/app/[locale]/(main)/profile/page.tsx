'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Toast } from 'primereact/toast';
import Spinner from '@/src/components/spinner/spinner';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import ButtonCustom from '@/src/components/ButtonCustom';
import InputCustom from '@/src/components/InputCustom';
import useUserStore from '@/src/app/[locale]/(auth)/stores/useStore';
import { getUserData, updateUserProfileWithFormData } from '@/src/app/[locale]/(main)/profile/service/profileService';

export default function ProfilePage() {
    const toast = useRef<Toast>(null);
    const t = useTranslations('profile');
    const updateUserStore = useUserStore((state) => state.setUserStore);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [phone, setPhone] = useState<string | undefined>(undefined);
    const [gender, setGender] = useState<number | null>(null);
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [nameState, setNameState] = useState<string>('');
    const storedUserData = localStorage.getItem('user');
    const userData = storedUserData ? JSON.parse(storedUserData).state : null;
    const userId = userData?.id;

    const profileSchema = z.object({
        name: z.string().min(1, t('nameNotEmpty')),
        phone: z
            .string()
            .optional()
            .refine((val) => !val || (/^(03|05|07|08|09)[0-9]{8}$/.test(val) && val.length === 10), {
                message: t('phoneFormat')
            })
    });

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicture(file);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const userData = await getUserData(userId);
                const { name, gender, phone, profilePicture } = userData;
                setNameState(name);
                setGender(gender);
                setPhone(phone);
                setProfilePicUrl(profilePicture);
            } catch (error: any) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || t('errorUpdatingProfile')
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [userId]);

    const handleSave = async () => {
        const formattedPhone = phone?.trim() || undefined;
        const validation = profileSchema.safeParse({ name: nameState, phone: formattedPhone });

        if (!validation.success) {
            const newErrors: Record<string, string> = {};
            validation.error.errors.forEach((err) => {
                newErrors[err.path[0]] = err.message;
            });
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfileWithFormData(nameState, formattedPhone, gender, profilePicture);

            updateUserStore(userData.id, nameState, userData.userName, userData.email, userData.roleName);

            toast.current?.show({
                severity: 'success',
                summary: t('success'),
                detail: t('successUpdate')
            });
            setErrors({});
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || t('errorUpdatingProfile')
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-36 bg-gray-100 flex items-center justify-center py-16">
            <Toast ref={toast} />
            <div className="bg-white w-full max-w-[1300px] p-20 rounded-lg shadow-lg">
                <Spinner isLoading={isLoading} />
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{t('title')}</h3>
                <p className="text-gray-600 mb-6">{t('subtitle')}</p>
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                        <InputCustom label={t('name')} value={nameState} placeholder={t('enterName')} error={errors.name} onChange={(e) => setNameState(e.target.value)} />
                        <InputCustom label={t('phone')} value={phone || ''} placeholder={t('enterPhone')} error={errors.phone} onChange={(e) => setPhone(e.target.value)} />
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 font-semibold">{t('gender')}</label>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="gender" value={0} checked={gender === 0} onChange={() => setGender(0)} />
                                    <span className="text-gray-700">{t('female')}</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="gender" value={1} checked={gender === 1} onChange={() => setGender(1)} />
                                    <span className="text-gray-700">{t('male')}</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="gender" value={-1} checked={gender === -1} onChange={() => setGender(-1)} />
                                    <span className="text-gray-700">{t('other')}</span>
                                </label>
                            </div>
                        </div>
                        <ButtonCustom onClick={handleSave}>{t('save')}</ButtonCustom>
                    </div>
                    <div className="col-span-1 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
                            {profilePicture ? (
                                <img src={URL.createObjectURL(profilePicture)} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover" />
                            ) : profilePicUrl ? (
                                <img src={profilePicUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                            ) : (
                                <img alt="" src="/layout/profile/user-default.jpg" />
                            )}
                        </div>
                        <div className="flex items-center justify-center">
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
                            <ButtonCustom onClick={() => fileInputRef.current?.click()}>{t('chooseFile')}</ButtonCustom>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
