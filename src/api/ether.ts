import { formatAmount, nativeTokenAddress } from '@/utils'
import { erc20ABI, Chain, getWalletClient } from '@wagmi/core'
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

export const getBalance = async (tokenAddress: address, address: address, chain: Chain) => {
    if (tokenAddress.toLowerCase() === nativeTokenAddress.toLowerCase() && address) {
      const walletClient = await getWalletClient({ chainId: chain.id })
      const getWalletBalance = await walletClient?.request({method: 'eth_getBalance', params: [address, 'latest'] as any})
      if(getWalletBalance) {
        return {
          value: new BigNumber(parseInt(getWalletBalance))
        }
      }
    }
  
    if (address && tokenAddress) {
      try {
        const provider = new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0]);
  
        const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);
        
        const balance = await tokenContract.balanceOf(address);
        const decimals = await tokenContract.decimals()
        return {
          value: balance,
          formatted: formatAmount(balance.toString(), decimals)
        }
      } catch (error) {
        return Promise.reject(error);
      }

    }
}