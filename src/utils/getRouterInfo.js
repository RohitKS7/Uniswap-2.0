import { abis } from "../api";

export const getRouterInfo = async (routerAddress, web3) => {
  const router = new web3.eth.Contract(abis.router02, routerAddress);

  //   The factory address returned by getRouterInfo() is the address of the factory contract we compiled and deployed using CRANQ
  return {
    factory: await router.methods.factory().call(),
  };
};
