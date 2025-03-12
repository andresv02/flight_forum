/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // Card colors
        card: {
          DEFAULT: "var(--card-background)",
          foreground: "var(--card-foreground)",
        },
        
        // Input colors
        input: {
          DEFAULT: "var(--input-background)",
          foreground: "var(--input-foreground)",
          border: "var(--input-border)",
          focus: "var(--input-focus)",
        },
        
        // Button colors
        primary: {
          DEFAULT: "var(--primary-button)",
          foreground: "var(--primary-button-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary-button)",
          foreground: "var(--secondary-button-foreground)",
        },
        
        // Accent colors
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        
        // Status colors
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
        
        // Border colors
        border: "var(--border)",
        divider: "var(--divider)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
