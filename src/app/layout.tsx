import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";
export const metadata: Metadata = {title:{default:"Football IQ Academy | Understand the Game",template:"%s | Football IQ Academy"},description:"Explore football rules, positions, formations and tactics through an interactive pitch and match scenarios."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><SiteHeader/><main className="shell">{children}</main><SiteFooter/></body></html>}
