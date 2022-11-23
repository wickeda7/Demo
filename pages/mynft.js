import React from "react";
import Header from "../components/header";
import ClipLoader from "react-spinners/ClipLoader";
import { useContext, useEffect, useState, useCallback } from "react";
import { useQuery, gql } from "@apollo/client";
import { useWeb3Contract } from "react-moralis";
import NFTBox from "../components/NFTBox";
import NftMarket from "../constants/abi.json";
import { DemoContext } from "../context/context";
import Alerts from "../components/alerts";

const MyNft = () => {
  const [color, setColor] = useState("#ffffff");
  const [deleteToken, setDeleteToken] = useState([]);
  const [deleteToken1, setDeleteToken1] = useState([]);
  const [listingPrice, setListingPrice] = useState("");
  const [pendingText, setPendingText] = useState("");
  let itemBoughts = [];
  let { isWeb3Enabled, account } = useContext(DemoContext);
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

  const getListPrice = useCallback(async () => {
    let lPrice = await getPrice();
    lPrice = lPrice.toString();
    setListingPrice(lPrice);
  }, [getPrice]);

  useEffect(() => {
    if (isWeb3Enabled) {
      if (listingPrice == "") {
        getListPrice();
      }
    }
  }, [isWeb3Enabled, listingPrice, getListPrice]);

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
    setPendingText("");
  }
  function updateStatusText(text) {
    setPendingText(text);
  }
  return (
    <div className="min-h-screen">
      <Header />
      <div className=" text-white-800 py-6 px-6">
        <h1 className="py-4 px-4 font-bold text-2xl">My NFT Portal</h1>
        <Alerts pendingText={pendingText} />
        <ClipLoader
          color={color}
          loading={loading}
          cssOverride={override}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
      <div className=" text-white-800 flex flex-row px-6">
        <div className="basis-3/4">
          <div className="flex flex-wrap">
            {isWeb3Enabled ? (
              itemBoughts && itemBoughts.length > 0 ? (
                itemBoughts.map((nft) => {
                  const { price, nftAddress, tokenId, buyer, resell, id } = nft;
                  return (
                    <NFTBox
                      price={price}
                      nftAddress={nftAddress}
                      tokenId={tokenId}
                      marketplaceAddress={marketplaceAddress}
                      seller={buyer}
                      key={id}
                      resellable={1}
                      updateaTable={updateTable}
                      listingPrice={listingPrice}
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
        <div className="basis-1/4">2</div>
      </div>
    </div>
  );
};

export default MyNft;
