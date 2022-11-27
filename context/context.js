import { createContext, useState, useEffect } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";

import {
  bahoAbi,
  bittoAbi,
  flunaAbi,
  scoinAbi,
  bitHoAddress,
  bitToAddress,
  fLunaAddress,
  scoinAddress,
} from "../lib/constants";

export const DemoContext = createContext();

export const DemoProvider = ({ children }) => {
  const {
    isWeb3Enabled,
    isAuthenticated,
    user,
    Moralis,
    authenticate,
    deactivateWeb3,
    chainId,
    account,
  } = useMoralis();

  // Modal for swaping tokens
  const [openBuyCryptoModal, setOpenBuyCryptoModal] = useState(false);
  // Tokens swap handling
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("Scoin");
  const [amount, setAmount] = useState("");
  const [chainid, setchainid] = useState("");

  Moralis.onAccountChanged((account) => {
    if (account == null) {
      deactivateWeb3();
    }
  });

  // useEffect(() => {
  //   Moralis.onAccountChanged((account) => {
  //     if (account == null) {
  //       deactivateWeb3();
  //     }
  //   });
  // }, []);

  useEffect(() => {
    if (
      isWeb3Enabled &&
      typeof window !== "undefined" &&
      window.localStorage.getItem("provider")
    ) {
    }
  }, [isWeb3Enabled]);

  const {
    data: coins,
    error,
    isLoading: loadingCoins,
  } = useMoralisQuery("Coins");

  const getContractAddress = () => {
    if (fromToken === "BitTo") return bitToAddress;
    if (fromToken === "BitHo") return bitHoAddress;
    if (fromToken === "FLuna") return fLunaAddress;
    if (fromToken === "Scoin") return scoinAddress;
  };

  const getToAddress = () => {
    if (toToken === "BitTo") return bitToAddress;
    if (toToken === "BitHo") return bitHoAddress;
    if (toToken === "FLuna") return fLunaAddress;
    if (toToken === "Scoin") return scoinAddress;
  };

  const getToAbi = () => {
    if (toToken === "BitTo") return bittoAbi;
    if (toToken === "BitHo") return bahoAbi;
    if (toToken === "FLuna") return flunaAbi;
    if (toToken === "Scoin") return scoinAbi;
  };

  const openModal = () => {
    setOpenBuyCryptoModal(true);
  };

  //Mint function for the token with send ether to the contract
  const mint = async () => {
    try {
      if (fromToken === "ETH") {
        if (!isWeb3Enabled) return;
        await Moralis.enableWeb3();
        const contractAddress = getToAddress();
        const abi = getToAbi();

        let options = {
          contractAddress: contractAddress,
          functionName: "mint",
          abi: abi,
          params: {
            to: account,
            amount: Moralis.Units.Token(amount),
          },
        };
        sendEth();
        const transaction = await Moralis.executeFunction(options);
        const receipt = await transaction.wait(4);
      } else {
        swapTokens();
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  //Send eth function
  const sendEth = async () => {
    if (!isWeb3Enabled) return;
    const contractAddress = getToAddress();

    let options = {
      type: "native",
      amount: Moralis.Units.ETH("0.01"),
      receiver: contractAddress,
    };
    const transaction = await Moralis.transfer(options);
    const receipt = await transaction.wait();
    if (receipt) {
      setOpenBuyCryptoModal(false);
    }
  };
  const swapTokens = async () => {
    try {
      if (!isWeb3Enabled) return;
      await Moralis.enableWeb3();

      if (fromToken === toToken) return alert("You cannot swap the same token");

      const fromOptions = {
        type: "erc20",
        amount: Moralis.Units.Token(amount, "18"),
        receiver: getContractAddress(),
        contractAddress: getContractAddress(),
      };
      const toMintOptions = {
        contractAddress: getToAddress(),
        functionName: "mint",
        abi: getToAbi(),
        params: {
          to: account,
          amount: Moralis.Units.Token(amount, "18"),
        },
      };
      let fromTransaction = await Moralis.transfer(fromOptions);
      let toMintTransaction = await Moralis.executeFunction(toMintOptions);
      let fromReceipt = await fromTransaction.wait();
      let toReceipt = await toMintTransaction.wait();
      if (toReceipt) {
        setOpenBuyCryptoModal(false);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  async function requestMessage(account, chainId) {
    // Get message to sign from the auth api
    const { message } = await Moralis.Cloud.run("requestMessage", {
      address: account,
      chain: parseInt(chainId, 16),
      networkType: "evm",
    });
    // Authenticate and login via parse
    await authenticate({
      signingMessage: message,
      throwOnError: true,
    });
  }

  const getTopTenCoins = async () => {
    try {
      const res = await fetch("/api/getTopTen");
      const data = await res.json();
      return data.data.data;
    } catch (e) {
      console.log(e.message);
    }
  };
  const getTrending = async () => {
    try {
      const res = await fetch("/api/getTrending");
      const data = await res.json();
      return data.data.data;
    } catch (e) {
      console.log(e.message);
    }
  };
  return (
    <DemoContext.Provider
      value={{
        getTopTenCoins,
        openBuyCryptoModal,
        setOpenBuyCryptoModal,
        coins,
        loadingCoins,
        fromToken,
        toToken,
        setFromToken,
        setToToken,
        amount,
        setAmount,
        mint,
        openModal,
        isWeb3Enabled,
        account,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};
