import React from "react";
import Header from "../components/header";
import UploadNFT from "../components/uploadNft";
import { useContext, useEffect, useState } from "react";
import { useLazyQuery, useQuery, gql } from "@apollo/client";
import { DemoContext } from "../context/context";
import NFTBox from "../components/NFTBox";

const sell = () => {
  const [newNft, setNewNft] = useState("");
  const [pendingText, setPendingText] = useState("");
  let { isWeb3Enabled, account } = useContext(DemoContext);
  const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  useEffect(() => {
    if (account) {
      console.log(account);
      if (newNft) {
        const timer = setTimeout(() => {
          console.log("new nft");
          loadData(account);
          setPendingText("");
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        loadData(account);
      }
    }
  }, [newNft, account]);

  const GET_ACTIVE_ITEMS = gql`
    query GetActiveItems($account: ID!) {
      marketItems(where: { sold: false, seller: $account }) {
        id
        seller
        owner
        tokenId
        price
        sold
      }
    }
  `;
  const [refetch, { loading, error, data: listedNfts }] = useLazyQuery(
    GET_ACTIVE_ITEMS,
    {
      fetchPolicy: "network-only",
      variables: { account },
    }
  );

  if (listedNfts) {
    console.log(listedNfts);
  }
  async function loadData(account) {
    const res = await refetch({ variables: { account } });
    console.log(res);
  }
  function updateTable(newNft) {
    setNewNft(newNft);
  }

  function updateListing(text) {
    setPendingText(text);
  }
  return (
    <div className="min-h-screen">
      <Header />
      <div className=" text-white-800 py-6 px-6">
        <h1 className="text-3xl font-bold">Create Portal</h1>
        {pendingText != "" && (
          <div
            className="bg-green-100 rounded-lg py-5 px-6 mb-4 text-base text-green-700 mb-3"
            role="alert"
          >
            <span role="status">
              <svg
                className="inline mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </span>
            {pendingText}
          </div>
        )}
      </div>
      <div className=" text-white-800 flex flex-row px-6">
        <div className="basis-3/4">
          <div className="flex flex-wrap">
            {isWeb3Enabled ? (
              listedNfts && listedNfts.marketItems.length > 0 ? (
                listedNfts.marketItems.map((nft) => {
                  const { price, owner, tokenId, seller, sold } = nft;
                  return (
                    <NFTBox
                      price={price}
                      nftAddress={owner}
                      tokenId={tokenId}
                      marketplaceAddress={marketplaceAddress}
                      seller={seller}
                      key={`${owner}${tokenId}`}
                      sold={sold}
                      updateaTable={updateTable}
                      updateListing={updateListing}
                    />
                  );
                })
              ) : (
                <div>No Nft available</div>
              )
            ) : (
              <div>Web3 Currently Not Enabled</div>
            )}
          </div>
        </div>
        <div className="basis-1/4">
          <UploadNFT updateaTable={updateTable} updateListing={updateListing} />
        </div>
      </div>
    </div>
  );
};

export default sell;
