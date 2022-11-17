import React from "react";
import Header from "../components/header";
import ClipLoader from "react-spinners/ClipLoader";
import { useContext, useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { useWeb3Contract } from "react-moralis";
import NFTBox from "../components/NFTBox";
import NftMarket from "../constants/abi.json";
import { DemoContext } from "../context/context";

const MyNft = () => {
  let { isWeb3Enabled, account } = useContext(DemoContext);
  const [color, setColor] = useState("#ffffff");
  const [deleteToken, setDeleteToken] = useState([]);
  const [deleteToken1, setDeleteToken1] = useState([]);
  const [listingPrice, setListingPrice] = useState("");
  let itemBoughts = [];
  const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "white",
  };
  const { runContractFunction: getPrice } = useWeb3Contract({
    abi: NftMarket,
    contractAddress: marketplaceAddress,
    functionName: "getListingPrice",
  });

  async function getListPrice() {
    let lPrice = await getPrice();
    lPrice = lPrice.toString();
    setListingPrice(lPrice);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      if (listingPrice == "") {
        getListPrice();
      }
    }
  }, [isWeb3Enabled]);

  const GET_BUY_ITEMS = gql`
    query GetBuyItems($account: ID!) {
      itemBoughts(where: { resell_not: true, buyer: $account }) {
        id
        buyer
        nftAddress
        tokenId
        price
        resell
      }
    }
  `;
  const {
    loading,
    error,
    data: listedNfts,
  } = useQuery(GET_BUY_ITEMS, {
    variables: { account },
  });
  if (listedNfts) {
    if (deleteToken.length == 0) {
      itemBoughts = listedNfts.itemBoughts;
    } else {
      itemBoughts = listedNfts.itemBoughts.filter(
        (nft) => !deleteToken1.includes(nft.tokenId)
      );
    }
  }
  if (error) {
    console.log(error);
  }

  function updateTable(tokenId) {
    deleteToken1.push(tokenId);
    setDeleteToken1(deleteToken1);
    setDeleteToken([tokenId]);
  }
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto">
        <h1 className="py-4 px-4 font-bold text-2xl">My NFT Portal</h1>
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
            itemBoughts && itemBoughts.length > 0 ? (
              itemBoughts.map((nft) => {
                const { price, nftAddress, tokenId, buyer, resell } = nft;
                return (
                  <NFTBox
                    price={price}
                    nftAddress={nftAddress}
                    tokenId={tokenId}
                    marketplaceAddress={marketplaceAddress}
                    seller={buyer}
                    key={`${buyer}${tokenId}`}
                    resellable={1}
                    updateaTable={updateTable}
                    listingPrice={listingPrice}
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

export default MyNft;
