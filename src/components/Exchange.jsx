import React, { useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { abis } from "../api";
import {
  ERC20,
  useContractFunction,
  useEthers,
  useTokenAllowance,
  useTokenBalance,
} from "@usedapp/core";
import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import {
  getAvailableTokens,
  getCounterpartTokens,
  findPoolByTokens,
  isOperationPending,
  getFailureMessage,
  getSuccessMessage,
} from "../utils";
import { ROUTER_ADDRESS } from "../config";
import { AmountIn, AmountOut, Balance } from "./";
import styles from "../styles";

const Exchange = ({ pools }) => {
  // SECTION ------ States --------------
  const { account } = useEthers();
  const [fromValue, setFromValue] = useState("0");
  // NOTE fromToken is the token for which we are swapping our tokens
  const [fromToken, setFromToken] = useState(pools[0].token0Address);
  const [toToken, setToToken] = useState("");
  const [resetState, setResetState] = useState(false);

  // SECTION ------ Pools and Token Info --------------
  // NOTE the value in input field should be in BigNumber
  const fromValueBigNumber = parseUnits(fromValue || "0");
  const availableTokens = getAvailableTokens(pools);
  const counterpartTokens = getCounterpartTokens(pools, fromToken);
  // NOTE the question mark before dot address is checking, if we are getting any results or not, And if we're not getting any results then show empty string.
  const pairAddress =
    findPoolByTokens(pools, fromToken, toToken)?.address ?? "";
  // NOTE get the tokenBalance of "fromToken" in account of user
  const fromTokenBalance = useTokenBalance(fromToken, account);
  const toTokenBalance = useTokenBalance(toToken, account);
  // NOTE to approve the swap of tokens
  const tokenAllowance =
    useTokenAllowance(fromToken, account, ROUTER_ADDRESS) || parseUnits("0");

  // SECTION ------ Contracts ABIs--------------
  const routerContract = new Contract(ROUTER_ADDRESS, abis.router02);
  // NOTE from which contract we're transacting
  const fromTokenContract = new Contract(fromToken, ERC20.abi);

  // SECTION ------ Using Contract fucntions --------------
  // changing the name of state to swapApproveState and vice versa
  const {
    state: swapApproveState,
    send: swapApproveSend,
  } = useContractFunction(fromTokenContract, "approve", {
    transactionName: "onApproveRequested",
    gasLimitBufferPercentage: 10,
  });

  const {
    state: swapExecuteState,
    send: swapExecuteSend,
  } = useContractFunction(routerContract, "swapExactTokensForTokens", {
    transactionName: "swapExactTokenForTokens",
    gasLimitBufferPercentage: 10,
  });

  // SECTION ------ checker variables --------------
  const successMessage = getSuccessMessage(swapApproveState, swapExecuteState);
  const failureMessage = getFailureMessage(swapApproveState, swapExecuteState);
  //  NOTE if fromValue is "gt" (greater than) tokenAllowance then we need an approval
  const approvedNeeded = fromValueBigNumber.gt(tokenAllowance);
  const formValueIsGreaterThan0 = fromValueBigNumber.gt(parseUnits("0"));
  //  NOTE lte = "lower than or equal to"
  const hasEnoughBalance = fromValueBigNumber.lte(
    fromTokenBalance ?? parseUnits("0")
  );
  const isApproving = isOperationPending(swapApproveState);
  const isSwapping = isOperationPending(swapExecuteState);
  const canApprove = !isApproving && approvedNeeded;
  const canSwap =
    !isSwapping &&
    hasEnoughBalance &&
    formValueIsGreaterThan0 &&
    !approvedNeeded;

  // SECTION ------ UI Handlers --------------
  const onApproveRequested = () => {
    swapApproveSend(ROUTER_ADDRESS, ethers.constants.MaxUint256);
  };

  // NOTE parameters are taken from "swapExactTokenForTokens" function of uniswap "// https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#swapexacttokensfortokens"
  const onSwapRequested = () => {
    swapExecuteSend(
      fromValueBigNumber,
      0,
      [fromToken, toToken],
      account,
      Math.floor(Date.now() / 1000) + 60 * 20 // deadline = 20 minutes
    ).then((_) => {
      setFromValue("0"); // this will reset the function once it's completed
    });
  };

  const onFromValueChange = (value) => {
    const trimmedValue = value.trim();

    try {
      if (trimmedValue) {
        parseUnits(value);

        setFromValue(value);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onFromTokenChange = (value) => {
    setFromToken(value);
  };

  const onToTokenChange = (value) => {
    setToToken(value);
  };

  // NOTE resetting everything
  useEffect(() => {
    if (failureMessage || successMessage) {
      setTimeout(() => {
        setResetState(true);
        setFromValue("0");
        setToToken("");
      }, 5000);
    }
  }, [failureMessage, successMessage]);

  // SECTION ------ HTML --------------
  return (
    <div className="flex flex-col w-full items-center">
      <div className="mb-8">
        <AmountIn
          value={fromValue}
          onChange={onFromValueChange}
          currencyValue={fromToken}
          onSelect={onFromTokenChange}
          currencies={availableTokens}
          isSwapping={isSwapping && hasEnoughBalance}
        />
        <Balance tokenBalance={fromTokenBalance} />
      </div>

      <div className="mb-8 w-[100%]">
        <AmountOut
          fromToken={fromToken}
          toToken={toToken}
          amountIn={fromValueBigNumber}
          pairContract={pairAddress}
          currencyValue={toToken}
          onSelect={onToTokenChange}
          currencies={counterpartTokens}
        />
        <Balance tokenBalance={toTokenBalance} />
      </div>

      {/* if the approval is needed and we are not currently swapping then show approval button otherwise show swap*/}
      {approvedNeeded && !isSwapping ? (
        <button
          disabled={!canApprove}
          onClick={onApproveRequested}
          className={`${
            canApprove
              ? "bg-site-pink text-white"
              : "bg-site-dim2 text-site-dim2"
          } ${styles.actionButton}`}
        >
          {isApproving ? "Approving..." : "Approve"}
        </button>
      ) : (
        <button
          disabled={!canSwap}
          onClick={onSwapRequested}
          className={`${
            canSwap ? "bg-site-pink text-white" : "bg-site-dim2 text-site-dim2"
          } ${styles.actionButton}`}
        >
          {isSwapping
            ? "Swapping..."
            : hasEnoughBalance
            ? "Swap"
            : "Insufficient balance"}
        </button>
      )}

      {/* If we get a failure message then show it or if we get success message then show it. */}
      {failureMessage && !resetState ? (
        <p className={styles.message}>{failureMessage}</p>
      ) : successMessage ? (
        <p className={styles.message}>{successMessage}</p>
      ) : (
        ""
      )}
    </div>
  );
};

export default Exchange;
