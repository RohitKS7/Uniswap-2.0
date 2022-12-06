import React, { useEffect, useState } from "react";
import { shortenAddress, useEthers, useLookupAddress } from "@usedapp/core";
import styles from "../styles";

const WalletButton = () => {
  const [rendered, setRendered] = useState("");

  const { ens } = useLookupAddress();
  const { account, activateBrowserWallet, deactivate } = useEthers();

  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered(shortenAddress(account));
    } else {
      setRendered("");
    }
  }, [account, ens, setRendered]);

  return (
    <button
      onClick={() => {
        if (!account) {
          activateBrowserWallet();
        } else {
          deactivate();
        }
      }}
      className={styles.walletButton}
    >
      {/* if rendered is empty string then show Connect Wallet */}
      {rendered === "" && "Connect Wallet"}
      {/* if rendered is not empty stirng then show the rendered data */}
      {rendered !== "" && rendered}
    </button>
  );
};

export default WalletButton;
