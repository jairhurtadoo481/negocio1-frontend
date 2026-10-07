import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Tejidos Macu",
  description: "Tejidos a crochet hechos a mano: amigurumis, ramos, flores, llaveros, bolsos y tops. Pedidos personalizados desde Ica.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${inter.variable} bg-gradient-to-b from-macu-navy-dark via-macu-navy to-macu-navy-dark text-macu-cream min-h-screen`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
