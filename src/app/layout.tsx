import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "Avancemos por la Libertad Religiosa",
    description: "Visualización de avance de metas",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body className={cn(
                "min-h-screen bg-background font-sans antialiased",
                inter.variable
            )}>
                {children}
            </body>
        </html>
    );
}
