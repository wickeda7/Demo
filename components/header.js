import React from "react";
import Link from "next/link";
import Image from "next/image";
import Search from "../assets/svg/search";
import ConnectButton2 from "./ConnectButton";
import { useRouter } from "next/router";

const styles = {
  navLink: `text-white flex mx-[10px]`,
  badge: `rounded-full bg-blue-600 h-1 w-1 absolute bottom-5 right-0 top-1 ring-4`,
  navItem: `relative mr-1 cursor-pointer hover:opacity-60`,
  navActive: `relative mr-1 opacity-60`,
  nav: `flex justify-center items-center gap-[20px]`,
  header: `bg-[#17171A] text-white h-20 flex gap-[100px] w-full p-[30px]`,
  headerWrapper: `flex justify-center h-full max-w-screen-xl mx-auto px-4`,
  inputContainer: `flex items-center justify-center p-2 rounded bg-[#171924]`,
  input: `bg-transparent outline-none text-white w-70 ml-3`,
  cursorPointer: `mr-5 cursor-pointer`,
};

const Header = () => {
  //const {Moralis, accout} = useMoralis()
  // async function test(){
  //   const Coins = Moralis.Object.extend("Coins");
  //   const coins = new Coins();
  //   coins.set('name', 'BitHoss')
  //   await coins.save();
  // }
  // let acName = "";
  // const { account } = useContext(DemoContext);
  // if (account) {
  //   acName = account.slice(0, 6) == "0x9d29" ? "ACCOUNT2" : "ACCOUNT1";
  // }

  const router = useRouter();
  return (
    <div className={styles.header}>
      {/* <button onClick={test}>Save</button> */}
      {/* {acName} */}
      <Image
        alt=""
        src="https://s2.coinmarketcap.com/static/cloud/img/coinmarketcap_white_1.svg"
        width={220}
        height={220}
      />
      <div className={styles.headerWrapper}>
        <nav className={styles.nav}>
          <div className={styles.navItem}>
            <div
              className={
                router.pathname == "/" ? styles.navActive : styles.navLink
              }
            >
              <Link href="/">Cryptocurrencies</Link>
            </div>
            {router.pathname == "/" && <div className={styles.badge} />}
          </div>
          <div className={styles.navItem}>
            <div
              className={
                router.pathname == "/marketplace"
                  ? styles.navActive
                  : styles.navLink
              }
            >
              <Link href="/marketplace">MarketPlace</Link>
            </div>
            {router.pathname == "/marketplace" && (
              <div className={styles.badge} />
            )}
          </div>
          <div className={styles.navItem}>
            <div
              className={
                router.pathname == "/create" ? styles.navActive : styles.navLink
              }
            >
              <Link href="/create">Create Portal</Link>
            </div>
            {router.pathname == "/create" && <div className={styles.badge} />}
          </div>

          <div className={styles.navItem}>
            <div
              className={
                router.pathname == "/mynft" ? styles.navActive : styles.navLink
              }
            >
              <Link href="/mynft">My NTF Portal</Link>
            </div>
            {router.pathname == "/mynft" && <div className={styles.badge} />}
          </div>
        </nav>

        <div className="flex items-center">
          <ConnectButton2 />
          <div className={styles.inputContainer}>
            <Search />
            <input className={styles.input} placeholder="Search" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
