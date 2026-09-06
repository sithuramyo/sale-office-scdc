import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title: 'South Dagon | Sales Office & SCDC', description: 'Explore the South Dagon sales office and supply chain distribution center in interactive 3D.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
