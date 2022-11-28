import React from "react";
import Header from "../components/header";
import { useContext, useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { useQuery, gql } from "@apollo/client";
import NFTBox from "../components/NFTBox";
import { DemoContext } from "../context/context";
import Alerts from "../components/alerts";

const Nft = () => {
  const [color, setColor] = useState("#ffffff");
  const [deleteToken, setDeleteToken] = useState([]);
  const [deleteToken1, setDeleteToken1] = useState([]);
  const [pendingText, setPendingText] = useState("");

  let nfts = [];
  let { isWeb3Enabled, account } = useContext(DemoContext);
  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "white",
  };

  const GET_ACTIVE_ITEMS = gql`
    query GetActiveItems($account: ID!) {
      marketItemCreateds(where: { sold: false, seller_not: $account }) {
        id
        seller
        owner
        tokenId
        price
        sold
      }
    }
  `;

  const {
    loading,
    error,
    data: listedNfts,
  } = useQuery(GET_ACTIVE_ITEMS, {
    variables: { account },
  });

  if (listedNfts) {
    if (deleteToken.length == 0) {
      nfts = listedNfts.marketItemCreateds;
    } else {
      nfts = listedNfts.marketItemCreateds.filter(
        (nft) => !deleteToken1.includes(nft.tokenId)
      );
    }
  }
  const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  function updateTable(tokenId) {
    deleteToken1.push(tokenId);
    setDeleteToken1(deleteToken1);
    setDeleteToken([tokenId]);
    setPendingText("");
  }
  function updateStatusText(text) {
    setPendingText(text);
  }
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto">
        <h1 className="py-4 px-4 font-bold text-2xl">NFT Marketplace</h1>
        <Alerts pendingText={pendingText} />
        <ClipLoader
          color={color}
          loading={loading}
          cssOverride={override}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <div className="flex flex-wrap">
          {isWeb3Enabled ? (
            nfts && nfts.length > 0 ? (
              nfts.map((nft) => {
                const { price, owner, tokenId, seller, sold, id } = nft;
                return (
                  <NFTBox
                    price={price}
                    nftAddress={owner}
                    tokenId={tokenId}
                    marketplaceAddress={marketplaceAddress}
                    seller={seller}
                    key={id}
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
    </div>
  );
};

export default Nft;
