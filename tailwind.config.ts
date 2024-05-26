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
        "l2t-dark-purple": "#613097",
        "l2t-purple": "#7816C5",
        "l2t-light-purple": "#BA63FF",
        "l2t-light-purple-2": "#cd7bff",
        "l2t-fade-purple": "#c892f2",
        "l2t-fade-purple-2": "#E3C0FF",
        "l2t-light-black": "#898989",
        "l2t-red": "#E52A01",
        "l2t-gray": "#525252",
        "l2t-green": "#0FBC00",
        "l2t-subtext": "#898989",
        "l2t-subtext-2": "#464646",
        "l2t-light-gray": "#bcbcbc",
        "l2t-fade-gray": "#cccccc",
        "l2t-dark-gray": "#cccccc",
        "l2t-orange": "#f15523",
        "l2t-purple-title": "#623097"

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
      }
    },
  },
  plugins: [headlessui],
});
