<script setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const languageValue = ref(null);

watch(languageValue, (newLocale) => {
    if (newLocale) {
        locale.value = newLocale;
        localStorage.setItem('language', newLocale);
    }
});

onMounted(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        languageValue.value = savedLang;
        locale.value = savedLang;
    }
});

const languageValues = ref([
    { name: 'English', code: 'en' },
    { name: 'Tiếng Việt', code: 'vi' },
    { name: '한국어', code: 'ko' }
]);
</script>

<template>
    <Select v-model="languageValue" :options="languageValues" optionLabel="name" optionValue="code" placeholder="Select Language" />
</template>

<style lang="scss" scoped></style>
