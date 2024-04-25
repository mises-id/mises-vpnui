import { BigNumberish, ethers } from "ethers";

export const MBChainId = 42161;

export const MBChainInfo = {
  chainId: MBChainId,
  chainName: 'Arbitrum One',
  rpcUrls: ['https://arbitrum.llamarpc.com', 'https://rpc.ankr.com/arbitrum'],
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  blockExplorerUrls: ['https://arbitrum.io/'],
}

export enum ErrorCode {
  addChain=4902,
  notFoundMises=9999,
  pleaseWait=-32002,
  hasBeen=4001
}

export const MBCoinInfo = {
  "address": '0x9AcfD327448C44E01FeA5D526b61DEf3a9D86217',
  "symbol": 'MB',
  "name": 'MB',
  "decimals": 18,
  "image": 'https://cdn.mises.site/s3://mises-storage/resources/token-icons/mb.png'
}

export const BonusesInfo = {
  "address": '',
  "symbol": 'pts',
  "decimals": 1,
  "image": 'logo.png'
}
export const MisInfo = {
  "address": '',
  "symbol": 'MIS',
  "decimals": 18,
  "image": 'logo.png'
}

export const misesBurnAddress = "mises1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqunwlz3"

export function formatAmount(value: string, unitName?: BigNumberish): string {
  const formatAmount = ethers.formatUnits(value || 0, Number(unitName))
  return formatAmount
}

const erc20ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "function"
  }
]

export const getErc20Balance = async (address: string) => {
  const tokenAddress = MBCoinInfo.address;
  if (address && tokenAddress) {
    try {
      const provider = new ethers.JsonRpcProvider(MBChainInfo.rpcUrls[0]);

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
type tokenName = 'token' | 'mises-token'
export function getToken(tokenName: tokenName = "token") {
  return localStorage.getItem(tokenName)
}

export function setToken(tokenName: tokenName="token", tokenValue: string) {
  return localStorage.setItem(tokenName, tokenValue)
}

export function removeToken(tokenName: tokenName="token") {
  return localStorage.removeItem(tokenName)
}

export const TRUNCATED_ADDRESS_START_CHARS = 5;
export const TRUNCATED_NAME_CHAR_LIMIT = 11;
export const TRUNCATED_ADDRESS_END_CHARS = 4;

export function shortenAddress(
  address = '',
  prefix = TRUNCATED_ADDRESS_START_CHARS,
) {
  if (address.length < TRUNCATED_NAME_CHAR_LIMIT) {
    return address;
  }

  return `${address.slice(0, prefix)}...${address.slice(
    -TRUNCATED_ADDRESS_END_CHARS,
  )}`;
}


export function Uint8ArrayToHexString(uint8Array: Uint8Array) {
  const arrayBuffer = uint8Array.buffer;
  const byteArray = new Uint8Array(arrayBuffer);
  let hexString = '';
  
  for (let i = 0; i < byteArray.length; i++) {
    const hex = byteArray[i].toString(16).padStart(2, '0');
    hexString += hex;
  }
  
  return hexString;
}

export function getSwapLink() {
  const isProd = process.env.REACT_APP_NODE_ENV==='production'
  return isProd ? 'https://swap.mises.site' : 'https://swap.test.mises.site'
}

export function isAndroid(): boolean {
  return (
    typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
  );
}

export function isSmallIOS(): boolean {
  return (
    typeof navigator !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent)
  );
}

export function isLargeIOS(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    (/iPad/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  );
}

export function isIOS(): boolean {
  return isSmallIOS() || isLargeIOS();
}

export function isMobile(): boolean {
  return isAndroid() || isIOS();
}

export function isRequest(provider: any) {
  return !window.befi && !window.nabox && provider.name !== "ezdefi" && !isIOS() && !window.phantom
}
