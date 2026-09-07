import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Our little room',description:'Somewhere we can always be together.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
