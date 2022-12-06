import { Goerli } from "@usedapp/core";

export const ROUTER_ADDRESS = "0x756D6E08Be7C15f6045e87CeA0D9d03bfba87592";

export const DAPP_CONFIG = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Goerli.chainId]:
      "https://eth-goerli.g.alchemy.com/v2/PuHnBqS1NQeEd-GDk37LpGNN3YxnthQv",
  },
};
