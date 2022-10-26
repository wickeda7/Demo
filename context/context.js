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
    return (
        <DemoContext.Provider
            value={{
                // getTopTenCoins,
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
