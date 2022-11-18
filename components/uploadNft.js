import React from "react";
import { useWeb3Contract } from "react-moralis";
import { useState } from "react";
import { Card, Image, Container, Textarea } from "@nextui-org/react";
import axios from "axios";
import { ethers } from "ethers";
import { Input, useNotification } from "web3uikit";
import NftMarket from "../constants/abi.json";

const UploadNFT = ({ updateaTable, updateListing }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [loadingState, setLoadingState] = useState(false);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });

  const { runContractFunction } = useWeb3Contract();
  const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const fileTypes = ["JPG", "PNG", "GIF"];
  const dispatch = useNotification();

  const { runContractFunction: getPrice } = useWeb3Contract({
    abi: NftMarket,
    contractAddress: marketplaceAddress,
    functionName: "getListingPrice",
  });

  // upload image
  async function onChange(e) {
    const file = e.target.files[0];
    setUploading("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
          "Content-Type": "multipart/form-data",
        },
      });
      const ImageURL = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      if (ImageURL) {
        setUploading("uploaded");
      }
      setFileUrl(ImageURL);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  // First upload metadata to IPFS and then return URL to use in later transaction
  async function uploadToIPFS() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;

    try {
      var jsondata = JSON.stringify({
        pinataMetadata: {
          name: `${name}.json`,
        },
        pinataContent: {
          name,
          description,
          image: fileUrl,
        },
      });

      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: jsondata,
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
          "Content-Type": "application/json",
        },
      });
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      return tokenURI;
    } catch (error) {
      console.log("Error uploading file :", error);
    }
  }
  async function createMarket() {
    setLoadingState(true);
    if (loadingState) return;

    const url = await uploadToIPFS();
    const { name, description, price } = formInput;
    const eprice = ethers.utils.parseUnits(price, "ether").toString();
    let listingPrice = await getPrice();
    listingPrice = listingPrice.toString();
    const options = {
      abi: NftMarket,
      contractAddress: marketplaceAddress,
      functionName: "createToken",
      msgValue: listingPrice,
      params: {
        /// url price string memory tokenURI, uint256 price
        tokenURI: url,
        price: eprice,
      },
    };

    await runContractFunction({
      params: options,
      onSuccess: handleCreatSuccess,
      onError: (error) => {
        console.log(error);
      },
    });

    setLoadingState(false);
    setUploading(null);
    setFileUrl(null);
    updateFormInput({
      price: "",
      name: "",
      description: "",
    });
    setTimeout(() => {
      document.getElementById("name").value = "";
      document.getElementById("desc").value = "";
      document.getElementById("price").value = "";
      document.getElementById("asset").value = null;
    }, 500);
  }
  async function handleCreatSuccess(tx) {
    dispatch({
      type: "success",
      message: "NFT submitted",
      title: "NFT submitted",
      position: "topR",
    });
    updateListing("New NFT Pending");
    await tx.wait(1);
    updateaTable(fileUrl);
    dispatch({
      type: "success",
      message: "NFT listed",
      title: "NFT listed",
      position: "topR",
    });
  }
  return (
    <div>
      <h1 color="white">Create and Sell your NFT in the Marketplace</h1>

      <Card
        style={{
          maxWidth: "300px",
          background: "#ffffff05",
          boxShadow: "0px 0px 5px #ffffff60",
        }}
      >
        <Card css={{ marginTop: "$1" }} style={{ border: "none" }}>
          <Card.Body style={{ backgroundColor: "#000000" }}>
            <Input
              placeholder="Enter your NFT Name"
              id="name"
              onChange={(e) =>
                updateFormInput({ ...formInput, name: e.target.value })
              }
            />
          </Card.Body>
        </Card>
        <Card style={{ border: "none" }}>
          <Card.Body style={{ backgroundColor: "#000000" }}>
            <Textarea
              id="desc"
              bordered
              placeholder="NFT Description"
              onChange={(e) =>
                updateFormInput({
                  ...formInput,
                  description: e.target.value,
                })
              }
            />
          </Card.Body>
        </Card>
        <Card style={{ border: "none" }}>
          <Card.Body style={{ backgroundColor: "#000000" }}>
            <Input
              id="price"
              css={{ marginTop: "$2" }}
              placeholder="Price (in ETH)"
              onChange={(e) =>
                updateFormInput({ ...formInput, price: e.target.value })
              }
            />
          </Card.Body>
        </Card>
        <Card style={{ border: "none" }}>
          <Card.Body style={{ backgroundColor: "#000000" }}>
            <input type="file" name="Asset" onChange={onChange} id="asset" />
            {fileUrl && (
              <Image
                showSkeleton
                width={320}
                height={320}
                maxDelay={10000}
                src={fileUrl}
                alt=""
              />
            )}

            {uploading == "uploading" && (
              <div className="w-320 h-320 flex justify-center items-center space-x-2 text-blue-600 ">
                Loading...
              </div>
            )}
          </Card.Body>
        </Card>
        <Container css={{ marginBottom: "$2" }}>
          {uploading == "uploaded" && (
            <button
              onClick={createMarket}
              type="button"
              data-mdb-ripple="true"
              data-mdb-ripple-color="light"
              className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
            >
              {!loadingState ? "List your NFT!" : "Wait uploading......"}
            </button>
          )}
        </Container>
      </Card>
    </div>
  );
};

export default UploadNFT;
