import React from "react";
import { useEthers } from "@usedapp/core";
import styles from "./styles";
import { uniswapLogo } from "./assets";
import { Exchange, Loader, WalletButton } from "./components";
import { usePools } from "./hooks";

const App = () => {
  const { account } = useEthers();
  const [loading, pools] = usePools();

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <header className={styles.header}>
          <img
            src={uniswapLogo}
            alt="uniswap logo"
            className="w-16 h-16 object-contain"
          />
          <WalletButton />
        </header>
        <div className={styles.exchangeContainer}>
          <h1 className={styles.headTitle}>Uniswap 2.0</h1>
          <p className={styles.subTitle}>Exchange tokens in seconds</p>
          <span className="text-red-500 mt-4">
            Use Goerli Network to Intract with the Application, ignore if
            already connected
          </span>
          <div className={styles.exchangeBoxWrapper}>
            <div className={styles.exchangeBox}>
              <div className="pink_gradient" />
              <div className={styles.exchange}>
                {account ? (
                  loading ? (
                    <Loader title="Loading pools, please wait!" />
                  ) : (
                    <Exchange pools={pools} />
                  )
                ) : (
                  <Loader title="Please connect your wallet" />
                )}
              </div>
              <div className="blue_gradient" />
            </div>
          </div>
        </div>

        <footer className={styles.subTitle}>Made with 💜 by Rohit</footer>
      </div>
    </div>
  );
};

export default App;
