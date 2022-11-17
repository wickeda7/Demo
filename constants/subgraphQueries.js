import { gql } from "@apollo/client";

const GET_ACTIVE_ITEMS = gql`
  {
    activeItems(
      first: 5
      where: { buyer: "0x0000000000000000000000000000000000000000" }
    ) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

const GET_ACTIVE_ITEMS = gql`
  query GetActiveItems($account: String!) {
    activeItems(
      where: {
        buyer: "0x0000000000000000000000000000000000000000"
        tokenId_not: $account
      }
    ) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

const GET_GREETING = gql`
  query GetGreeting($language: String!) {
    greeting(language: $language) {
      message
    }
  }
`;

s;
export default GET_ACTIVE_ITEMS;
