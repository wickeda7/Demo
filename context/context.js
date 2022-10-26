import { createContext, useState, useEffect } from 'react'
import { useMoralis } from 'react-moralis'

export const DemoContext = createContext()

export const DemoProvider = ({ children }) => {
    const { isWeb3Enabled, isAuthenticated, user, Moralis,authenticate, deactivateWeb3 } = useMoralis()
    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            if (account == null) {
                deactivateWeb3()
            }
        })
    }, [])
       
      useEffect(() => {
        if (
            isWeb3Enabled &&
            typeof window !== "undefined" &&
            window.localStorage.getItem("provider")
        ) {
            const { account, chainId } = Moralis;
            requestMessage(account, chainId)
        }
       //
    }, [isWeb3Enabled])
    async function requestMessage(account, chainId) {
        // Get message to sign from the auth api
        const { message } = await Moralis.Cloud.run('requestMessage', {
            address: account,
            chain: parseInt(chainId, 16),
            networkType: 'evm', 
        });
        // Authenticate and login via parse
      await authenticate({
        signingMessage: message,
        throwOnError: true,
      });
    }

    const getTopTenCoins = async () => {
        try {
          const res = await fetch('/api/getTopTen')
          const data = await res.json()
          return data.data.data
        } catch (e) {
          console.log(e.message)
        }
      }
      const getTrending = async () => {
        try {
          const res = await fetch('/api/getTrending')
          const data = await res.json()
          return data.data.data
        } catch (e) {
          console.log(e.message)
        }
      }
    return (
        <DemoContext.Provider
            value={{
                getTopTenCoins,
                // openBuyCryptoModal,
                // setOpenBuyCryptoModal,
                // coins,
                // loadingCoins,
                // fromToken,
                // toToken,
                // setFromToken,
                // setToToken,
                // amount,
                // setAmount,
                // mint,
                // openModal,
            }}
            >
            {children}
        </DemoContext.Provider>
    );
};
