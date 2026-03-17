import {Metadata} from "next";
import './globals.css'
import {Menu} from "@/widgets/Menu";


export const metadata: Metadata = {
    title: "CRM",
    description: "starting work",
};


export default function RootLayout({children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
            <body className={'body'}>
                 <Menu/>
                 <hr/>
                 {children}
            </body>
        </html>
    );
}
