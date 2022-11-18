import { useState, useEffect, useCallback } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { Card, Tag, useNotification } from "web3uikit";
import NftMarket from "../constants/abi.json";
import { useRouter } from "next/router";
import Image from "next/image";

import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";

const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) return fullStr;

  const separator = "...";
  const seperatorLength = separator.length;
  const charsToShow = strLen - seperatorLength;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  );
};

export default function NFTBox({
  price,
  nftAddress,
  tokenId,
  marketplaceAddress,
  seller,
  keys,
  resellable,
  updateaTable,
  listingPrice,
  updateListing,
}) {
  const [imageURI, setImageURI] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pending, setPending] = useState(false);

  const { isWeb3Enabled, account } = useMoralis();

  const router = useRouter();
  const hideModal = () => setShowModal(false);
  const dispatch = useNotification();

  const isOwnedByUser = seller === account || seller === undefined;
  //isOwnedByUser owner is true

  let btnText = "Buy";
  if (resellable) btnText = "Resell";
  if (isOwnedByUser && !resellable) btnText = "Update";
  const { runContractFunction } = useWeb3Contract();
  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: NftMarket,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tokenId,
    },
  });
  async function buyItem() {
    const options = {
      abi: NftMarket,
      contractAddress: nftAddress,
      functionName: "createMarketSale",
      msgValue: price,
      params: {
        tokenId: tokenId,
      },
    };
    await runContractFunction({
      params: options,
      onSuccess: handleBuyItemSuccess,
      onError: (error) => {
        console.log(error);
      },
    });
  }
  async function resell() {
    const options = {
      abi: NftMarket,
      contractAddress: nftAddress,
      functionName: "resellToken",
      msgValue: listingPrice, // make sure this price is the listingPrice fee not the price of nft
      params: {
        tokenId: tokenId,
        price: price,
      },
    };
    await runContractFunction({
      params: options,
      onSuccess: handleResellItemSuccess,
      onError: (error) => {
        console.log(error);
      },
    });
  }
  // async function updateUI() {
  //   const tokenURI = await getTokenURI();
  //   // We are going to cheat a little here...
  //   if (tokenURI) {
  //     const tokenURIResponse = await (await fetch(tokenURI)).json();
  //     const imageURIURL = tokenURIResponse.image;
  //     setImageURI(imageURIURL);
  //     setTokenName(tokenURIResponse.name);
  //     setTokenDescription(tokenURIResponse.description);
  //   }
  // }
  const updateUI = useCallback(async () => {
    const tokenURI = await getTokenURI();
    // We are going to cheat a little here...
    if (tokenURI) {
      const tokenURIResponse = await (await fetch(tokenURI)).json();
      const imageURIURL = tokenURIResponse.image;
      setImageURI(imageURIURL);
      setTokenName(tokenURIResponse.name);
      setTokenDescription(tokenURIResponse.description);
    }
  }, [getTokenURI]);

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled, updateUI]);

  const formattedSellerAddress = isOwnedByUser
    ? "you"
    : truncateStr(seller || "", 15);

  const handleCardClick = async () => {
    if (pending) return;
    setPending(true);
    if (resellable) {
      resell();
    }
    if (!isOwnedByUser) {
      buyItem();
    }
    if (isOwnedByUser && !resellable) {
      setShowModal(true);
    }
  };

  async function handleBuyItemSuccess(tx) {
    await tx.wait(1);
    updateaTable(tokenId);
    dispatch({
      type: "success",
      message: "Item bought!",
      title: "Item Bought",
      position: "topR",
    });
  }
  async function handleResellItemSuccess(tx) {
    await tx.wait(1);
    updateaTable(tokenId);
    dispatch({
      type: "success",
      message: "NFT listing",
      title: "NFT listed",
      position: "topR",
    });
  }
  return (
    <div className="m-3">
      <div>
        {imageURI ? (
          <div>
            <UpdateListingModal
              isVisible={showModal}
              tokenId={tokenId}
              marketplaceAddress={marketplaceAddress}
              nftAddress={nftAddress}
              onClose={hideModal}
              updateListing={updateListing}
            />
            <Card onClick={handleCardClick}>
              <div className="p-2 relative">
                {pending ? (
                  <div className="absolute top-0">
                    <Tag active text="Status Pending" theme="status" />
                  </div>
                ) : null}

                <div className="flex flex-col items-end gap-2">
                  <div>
                    #{tokenId} {isOwnedByUser}
                  </div>
                  <div className="italic text-sm">
                    Owned by {formattedSellerAddress}
                  </div>
                  <Image
                    loader={() => imageURI}
                    src={imageURI}
                    height="200"
                    width="200"
                    alt=""
                  />
                  <div className="font-bold">
                    {ethers.utils.formatUnits(price, "ether")} ETH
                  </div>
                </div>
              </div>
              <div className="p-1 text-center font-bold ">{tokenName}</div>
              <div className="p-1 text-center font-bold">
                {tokenDescription}
              </div>
              <div className="p-2 text-center">
                <button
                  type="button"
                  data-mdb-ripple="true"
                  data-mdb-ripple-color="light"
                  className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                >
                  {btnText}
                </button>
              </div>
            </Card>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
