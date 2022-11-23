import { Modal, Input, useNotification } from "web3uikit";
import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
//import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftMarketplaceAbi from "../constants/abi.json";
import { ethers } from "ethers";

export default function UpdateListingModal({
  nftAddress,
  hashId,
  tokenId,
  isVisible,
  marketplaceAddress,
  onClose,
  updateStatusText,
  updateaTable,
}) {
  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);

  const dispatch = useNotification();
  const { runContractFunction } = useWeb3Contract();
  async function handleUpdateListingSuccess(tx) {
    dispatch({
      type: "success",
      message: "listing submitted",
      title: "Listing submitted",
      position: "topR",
    });
    onClose && onClose();
    setPriceToUpdateListingWith("0");
    updateStatusText("New Listing Update Pending");
    await tx.wait(1);
    updateaTable(priceToUpdateListingWith);
    dispatch({
      type: "success",
      message: "listing updated",
      title: "Listing updated",
      position: "topR",
    });
  }

  async function updatePrice() {
    const options = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "updateListing",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
      },
    };
    await runContractFunction({
      params: options,
      onSuccess: handleUpdateListingSuccess,
      onError: (error) => {
        console.log(error);
      },
    });
  }

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => {
        updatePrice();
      }}
    >
      <Input
        label="Update listing price in L1 Currency (ETH)"
        name="New listing price"
        type="number"
        onChange={(event) => {
          setPriceToUpdateListingWith(event.target.value);
        }}
      />
    </Modal>
  );
}
