/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
  	extend: {
		screens: {
			"ld": "884px"
		},
  		fontFamily: {
  			roboto: ["Roboto", "sans-serif"],
  			montserrat: ["Monstserrat", "sans-serif"],
  			ubuntu: ["Ubuntu Mono", "sans-serif"],
  			lora: ["Lora", "serif"],
  			spaceMono: ["Space Mono", "sans-serif"],
  			muli: ["Mulish", "sans-serif"],
  			oswald: ["Oswald", "sans-serif"],
  			noto: ["Noto Sans", "sans-serif"],
  			poppins: ["Poppins", "sans-serif"],
			arimo: ["Arimo", "sans-serif"]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {}
  	}
  },
  plugins: [tailwindcssAnimate],
}
