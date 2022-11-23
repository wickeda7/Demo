import React, { useEffect } from "react";
import { useMoralis } from "react-moralis";
import { DemoContext } from "../context/context";

const ConnectButton2 = () => {
  const { Moralis } = useMoralis();

  const { isWeb3Enabled, account } = useContext(DemoContext);

  const connect = async (provider) => {
    // Enable web3 to get user address and chain
    await enableWeb3({ throwOnError: true, provider });
    const { account, chainId } = Moralis;

    if (typeof window !== "undefined") {
      window.localStorage.setItem("connected", "injected");
    }
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
  };
  return (
    <nav className="p-5 border-b-2">
      <ul className="">
        <li className="flex flex-row">
          {account ? (
            <div className="ml-auto py-2 px-4">
              Connected to {account.slice(0, 6)}...
              {account.slice(account.length - 4)}
            </div>
          ) : (
            <button
              onClick={() => connect("metamask")}
              disabled={isWeb3EnableLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            >
              Connect Wallet
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default ConnectButton2;
