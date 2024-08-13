/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const headlessui = require("@headlessui/tailwindcss");
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Note the addition of the `app` directory.
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    borderRadius: {
      "s-3": "3rem",
      ...defaultTheme.borderRadius,
    },
    screens: {
      xs: { max: "320px" },
      "7xs": { min: "321px", max: "390px" },
      "6xs": { min: "391px", max: "418px" },
      "5xs": { min: "419px", max: "445px" },
      "4xs": { min: "446px", max: "498px" },
      "3xs": { min: "499px", max: "567px" },
      "2xs": { min: "567px", max: "684px" },
      "2xl": "1440px",
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        "comp-red-hover": "#FFE8EB",
        "comp-gray-bg": "#F8F9FA",
        "comp-red": "#DD2C37",
        "comp-grey": "#909AAA",
        "comp-red-lighter": "#fef1f3",
        "comp-natural-gray": "#D3D7DD",
        "comp-natural-base": "#7A8699",
        "comp-line-gray": "#E4E7EB",
        "comp-gray-line": "#484949",
        "comp-gray-text": "#A6AEBB",
        "text-gray-hover": "#bcc2c9",
        "comp-sub-header": "#878787",
        "comp-blue-link": "#00a1ff",
        "comp-gray-layout": "#d9d9d9",
        "comp-gray-upload": "#fafafa",
        "comp-blue-primary": "#1677ff",
        "comp-red-reward": "#E34F58",
        "comp-disable-input": "#f5f5f5",
        "comp-red-price": "#A62129"
      },
      flex: {
        "1-auto": "1 0 auto",
      },
      backgroundImage: {
        "shakehand-img": "url('https://link-2-team-public.s3.ap-southeast-1.amazonaws.com/shakehand.png')",
      },
      dropShadow: {
        "4xl": ["5px 5px 5px rgba(0, 0, 0, 0.25)", "0 5px 5px rgba(0, 0, 0, 0.15)"],
      },
      fontSize: {
        "1-2xl": "1.2rem",
        "1-4xl": "1.4rem",
        "1-7xl": "1.7rem",
        "2-2xl": "2.2rem",
      },
      spacing: {
        '1px': '1px',
      },
      flexGrow: {
        '02': "0.2"
      },
      width: {
        'wc-17': '17rem'
      }
    },
  },
  plugins: [headlessui],
});
