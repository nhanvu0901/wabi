import './globals.css'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import RevealInit from '../components/RevealInit'

export const metadata = { title: 'Wabi Therapy' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400;1,6..72,500&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <div id="wabi" style={{ position: 'relative' }}>
          <RevealInit />
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}
