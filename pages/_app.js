import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";
import { DemoProvider } from "../context/context";
import { createTheme, NextUIProvider } from "@nextui-org/react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { NotificationProvider } from "web3uikit";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
});

function MyApp({ Component, pageProps }) {
  const theme = createTheme({
    type: "dark",
    theme: {
      colors: {
        primaryLight: "$blue200",
        primaryLightHover: "$blue300",
        primaryLightActive: "$blue400",
        primaryLightContrast: "$blue600",
        primary: "$purple500",
        primaryBorder: "$blue500",
        primaryBorderHover: "$blue600",
        primarySolidHover: "$blue700",
        primarySolidContrast: "$white",
        primaryShadow: "$white500",
        transparent: "#00000000",

        gradient:
          "linear-gradient(112deg, $blue100 -25%, $pink500 -10%, $purple300 90%)",
        link: "#5E1DAD",

        myColor: "#00000030",
      },
      space: {},
      fonts: {},
    },
  });
  return (
    <MoralisProvider
      serverUrl={process.env.NEXT_PUBLIC_SERVER_URL ?? ""}
      appId={process.env.NEXT_PUBLIC_APPLICATION_ID ?? ""}
    >
      <ApolloProvider client={client}>
        <DemoProvider>
          <NextUIProvider theme={theme}>
            <NotificationProvider>
              <Component {...pageProps} />
            </NotificationProvider>
          </NextUIProvider>
        </DemoProvider>
      </ApolloProvider>
    </MoralisProvider>
  );
}

export default MyApp;
