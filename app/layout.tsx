import './globals.css';import type {Metadata} from 'next';
export const metadata:Metadata={title:'Completed Works & Services',description:'Professional project photo gallery and services'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
