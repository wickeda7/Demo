import '../styles/globals.css'
import { MoralisProvider } from 'react-moralis'
import { DemoProvider } from '../context/context'

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider
      serverUrl={process.env.NEXT_PUBLIC_SERVER_URL ?? ''}
      appId={process.env.NEXT_PUBLIC_APPLICATION_ID ?? ''}
    >
      <DemoProvider>
        <Component {...pageProps} />
      </DemoProvider>
      
    </MoralisProvider>
    
  )
}

export default MyApp
