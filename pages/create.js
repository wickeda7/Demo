import React from "react";
import Header from "../components/header";
import UploadNFT from "../components/uploadNft";
import { useContext, useEffect, useState, useCallback } from "react";
import { useLazyQuery, useQuery, gql } from "@apollo/client";
import { DemoContext } from "../context/context";
import NFTBox from "../components/NFTBox";
import Alerts from "../components/alerts";

const Sell = () => {
  const [newNft, setNewNft] = useState("");
  const [pendingText, setPendingText] = useState("");
  const [reset, setReset] = useState(false);
  const { isWeb3Enabled, account } = useContext(DemoContext);
  const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const GET_ACTIVE_ITEMS = gql`
    query GetActiveItems($account: ID!) {
      marketItemCreateds(where: { sold: false, seller: $account }) {
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
  const loadData = useCallback(async () => {
    const res = await refetch({ variables: { account } });
    // ? provide it with the query variable
  }, [account, refetch]);

  useEffect(() => {
    if (newNft) {
      const timer = setTimeout(() => {
        loadData();
        setPendingText("");
      }, 7000);
      return () => clearTimeout(timer);
    } else {
      loadData();
    }
    setReset(true);
  }, [newNft, loadData]);

  function updateTable(newNft) {
    setNewNft(newNft);
  }

  function updateStatusText(text) {
    setPendingText(text);
  }
  return (
    <div className="min-h-screen">
      <Header />
      <div className=" text-white-800 py-6 px-6">
        <h1 className="text-3xl font-bold">Create Portal</h1>
        <Alerts pendingText={pendingText} />
      </div>
      <div className=" text-white-800 flex flex-row px-6">
        <div className="basis-3/4">
          <div className="flex flex-wrap">
            {isWeb3Enabled ? (
              listedNfts && listedNfts.marketItemCreateds.length > 0 ? (
                listedNfts.marketItemCreateds.map((nft) => {
                  const { price, owner, tokenId, seller, sold, id } = nft;
                  return (
                    <NFTBox
                      price={price}
                      nftAddress={owner}
                      tokenId={tokenId}
                      marketplaceAddress={marketplaceAddress}
                      seller={seller}
                      key={id}
                      hashId={id}
                      sold={sold}
                      updateaTable={updateTable}
                      updateStatusText={updateStatusText}
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
          <UploadNFT
            updateaTable={updateTable}
            updateStatusText={updateStatusText}
            reset={reset}
          />
        </div>
      </div>
    </div>
  );
};

export default Sell;
