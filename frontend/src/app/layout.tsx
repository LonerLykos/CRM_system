import {Metadata} from "next";
import './globals.sass'
import {Menu} from "@/widgets/Menu";

// Applies the persisted theme before first paint so there's no flash of the
// wrong theme. If nothing is stored, CSS falls back to prefers-color-scheme.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;


export const metadata: Metadata = {
    title: "CRM",
    description: "starting work",
};


export default function RootLayout({children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={'body'}>
                 <script dangerouslySetInnerHTML={{__html: themeInit}}/>
                 <Menu/>
                 <hr/>
                 {children}
            </body>
        </html>
    );
}
