import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import Image from "next/image";
import { useNotification } from "web3uikit";
import { ethers } from "ethers";
import NftMarket from "../constants/abi.json";
import {
  Grid,
  Card,
  Text,
  Button,
  Row,
  Spacer,
  Container,
} from "@nextui-org/react";
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
}) {
  const { isWeb3Enabled, account } = useMoralis();
  const [imageURI, setImageURI] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const hideModal = () => setShowModal(false);
  const dispatch = useNotification();

  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: NftMarket,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tokenId,
    },
  });

  //   const { runContractFunction: buyItem } = useWeb3Contract({
  //     abi: nftMarketplaceAbi,
  //     contractAddress: marketplaceAddress,
  //     functionName: "buyItem",
  //     msgValue: price,
  //     params: {
  //       nftAddress: nftAddress,
  //       tokenId: tokenId,
  //     },
  //   });

  async function updateUI() {
    const tokenURI = await getTokenURI();
    // We are going to cheat a little here...
    if (tokenURI) {
      const tokenURIResponse = await (await fetch(tokenURI)).json();
      console.log(tokenURIResponse);
      const imageURIURL = tokenURIResponse.image;
      setImageURI(imageURIURL);
      setTokenName(tokenURIResponse.name);
      setTokenDescription(tokenURIResponse.description);
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);
  //   console.log(seller);
  //   console.log(account); seller is equal account
  const isOwnedByUser = seller === account || seller === undefined;
  //   console.log(isOwnedByUser); owner is true
  const formattedSellerAddress = isOwnedByUser
    ? "you"
    : truncateStr(seller || "", 15);

  const handleCardClick = () => {
    isOwnedByUser
      ? setShowModal(true)
      : buyItem({
          onError: (error) => console.log(error),
          onSuccess: () => handleBuyItemSuccess(),
        });
  };

  const handleBuyItemSuccess = () => {
    dispatch({
      type: "success",
      message: "Item bought!",
      title: "Item Bought",
      position: "topR",
    });
  };

  return (
    <Grid xs={3}>
      {imageURI ? (
        <Card style={{ boxShadow: "1px 1px 10px #ffffff" }} variant="bordered">
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontWeight: "600",
              fontSize: "20px",
              marginLeft: "10px",
            }}
          >
            {tokenName} Token-{tokenId}
          </Text>
          <Card.Body css={{ p: 0 }}>
            <Card.Image
              style={{ maxWidth: "150px", borderRadius: "6%" }}
              src={imageURI}
            />
            <Row wrap="wrap" justify="space-between" align="center">
              <Text wrap="wrap">{tokenDescription}</Text>
            </Row>
          </Card.Body>
          <Card.Footer css={{ justifyItems: "flex-start" }}>
            <Row wrap="wrap" justify="space-between" align="center">
              <button
                type="button"
                data-mdb-ripple="true"
                data-mdb-ripple-color="light"
                className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
              >
                Buy
              </button>
            </Row>
          </Card.Footer>
        </Card>
      ) : (
        <div>Loading...</div>
      )}
    </Grid>
  );
}
