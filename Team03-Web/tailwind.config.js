/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-text': '#333333',
                'secondary-text': '#666666',
                'accent-text': '#007bff',
                'btn-hover-dart': '#4D4D4D',
            },

            fontSize: {
                'xs': '0.75rem',     // Extra small - For fine print, captions, footnotes
                'sm': '0.875rem',    // Small - For secondary information, hints, form labels
                'base': '1rem',      // Base - Default body text, standard paragraph text
                'lg': '1.125rem',    // Large - Slightly emphasized body text, subheadings
                'xl': '1.25rem',     // Extra large - Section headings, important highlights
                '2xl': '1.5rem',     // 2x large - Main headings, prominent titles
            },

            screens: {
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
            },

            borderRadius: {
                'input': '0.375rem',
            },

            backgroundColor: {
                'btn-primary': '#007bff',
                'btn-secondary': '#6c757d',
                'btn-success': '#28a745',
                'btn-danger': '#dc3545',
                'btn-dart': '#333333',
                'btn-hover-dart': '#4D4D4D',
            },

            flexGrow: {
                '2': '2', 
            },
        },
    },
    plugins: [],
}
