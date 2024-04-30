import './index.less';
import { ConfigProvider, AutoCenter, Input, Button, Toast, DotLoading } from 'antd-mobile';
import { usePageValue } from '@/components/pageProvider';
import enUS from 'antd-mobile/es/locales/en-US'
import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton, RainbowKitProvider, connectorsForWallets, useConnectModal } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig, useAccount, useNetwork } from 'wagmi';
import { erc20ABI, readContract, prepareWriteContract, writeContract } from '@wagmi/core';
import { publicProvider } from 'wagmi/providers/public';
import { bitkeepWallet } from '@/wallets/bitkeepWallet';
import { metaMaskWallet } from '@/wallets/metamask';
import { okxWallet } from '@/wallets/okxWallet';
import { phantomWallet } from '@/wallets/phantomWallet';
import { trustWallet } from '@/wallets/trustWallet';
import { injectedWallet } from '@/wallets/injectedWallet';
import { useShowLayout } from '@/hooks/useShowLayout';
import RetryMaxStatus from '@/components/RetryMaxStatus';
import ConnectWallet from "@/components/ConnectWallet";
import { useEffect, useState } from 'react';
import { chainList } from '@/App';
import Notification from "@/components/Notification";
import VpnProvider from '@/context/vpnContext';
import { getBalance } from '@/api/ether';
import { formatAmount, getToken } from "@/utils";
import BigNumber from 'bignumber.js';
import { useRequest } from 'ahooks';
import { createOrder, signin } from '@/api';

const contractABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      }
    ],
    "name": "getTokenBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "uniqueKey",
        "type": "string"
      }
    ],
    "name": "receiveTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      }
    ],
    "name": "withdrawToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const PurchaseConfigOnChain: {[key:number]:{tokenAddress:address, contractAddress:address}} = {
  // bsc testnet
  97: {
    // usdt
    tokenAddress: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    // receiver contract
    contractAddress: '0xc41Bfd2df09190C7416f21369aF61bE270128Dcb',
  },
}

function Purchase() {
  const { isShowLayout, isMaxRetryStatus, getProvider } = useShowLayout()
  useEffect(() => {
    const load = () => {
      getProvider()
    }
    if (document.readyState === "complete") {
      load();
    } else {
      window.addEventListener('load', load);
      return () => window.removeEventListener('load', load);
    }

    // eslint-disable-next-line
  }, [])
  if (isMaxRetryStatus) {
    return <RetryMaxStatus />
  }

  if (!isShowLayout) {
    return <div></div>
  }

  const { chains, publicClient, webSocketPublicClient } = configureChains(
    chainList,
    [
      publicProvider()
    ]
  );

  const projectId = '86a06f8526c8d8b550b13c46a013cb91'
  const connectors = connectorsForWallets([
    {
      groupName: 'Recommended',
      wallets: [
        injectedWallet({ chains }),
        metaMaskWallet({ projectId, chains }),
        okxWallet({ projectId, chains }),
        phantomWallet({ projectId, chains }),
        bitkeepWallet({ projectId, chains }),
        trustWallet({ projectId, chains }),
      ],
    }
  ]);

  const wagmiClient = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
  });

  const PurchaseView = () => {

    const { address } = useAccount()
    const [buttonText, setButtonText] = useState("Connect Wallet")
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [buttonLoading, setButtonLoading] = useState(false)
    const [purchaseStatus, setPurchaseStatus] = useState(0)
    const { openConnectModal } = useConnectModal()
    const { chain } = useNetwork()
    const chainId = chain?.id  || 1
    const { configData } = usePageValue()
    const { runAsync: runCreateOrder } = useRequest(createOrder, {
      retryCount: 3,
      manual: true,
      throttleWait: 1000
    })

    if(configData === undefined){
      return null
    }

    const onButtonClick = async () => {
      if(!address){
        openConnectModal?.()
        return
      }

      if(!(chainId in PurchaseConfigOnChain)){
        Toast.show({
          content: "This chain is not supported",
          maskClickable: false,
          duration: 2000
        })
        return
      }

      if(purchaseStatus === 0){
        setButtonText("Allowance Approval")
        setPurchaseStatus(1)
        setButtonDisabled(false)
        return
      }

      if(purchaseStatus === 999){
        Toast.show({
          content: "The order is being confirmed, please return to the VPN home page and wait patiently.",
          maskClickable: false,
          duration: 3000
        })
        return
      }

      setButtonDisabled(true);

      // allowance
      if(purchaseStatus === 1){
        await (async () => {
          try {
            // check chain
            const currentChain = chainList.find(val=>val.id === chainId)
            if(currentChain === undefined){
              Toast.show({
                content: "chain error",
                maskClickable: false,
                duration: 2000
              })
              return
            }

            setButtonLoading(true)

            // check balance
            const balance = await getBalance(PurchaseConfigOnChain[chainId].tokenAddress, address, currentChain)
            if(BigNumber(formatAmount(balance?.value.toString(), 18)).lt(configData.priceInUsdt)){
              Toast.show({
                content: "Insufficient Balance",
                maskClickable: false,
                duration: 3000
              })
              setButtonLoading(false)
              return
            }
            
            // check allowance
            const data = await readContract({
              address: PurchaseConfigOnChain[chainId].tokenAddress,
              abi: erc20ABI,
              functionName: 'allowance',
              args: [address, PurchaseConfigOnChain[chainId].contractAddress],
              chainId: chainId,
            });
            if(BigNumber(formatAmount(data.toString(), 18)).lt(configData.priceInUsdt)){
              // approve allowance
              const { request } = await prepareWriteContract({
                address: PurchaseConfigOnChain[chainId].tokenAddress,
                abi: erc20ABI,
                functionName: 'approve',
                args: [
                  PurchaseConfigOnChain[chainId].contractAddress,
                  BigInt(configData.priceInUsdt * 10 ** 18)
                ],
                chainId: chainId,
              });
              const { hash } = await writeContract(request);
              console.log(`Approve Transaction hash: ${hash}`);
            }

            // update button status
            setButtonLoading(false)
            setButtonText("Pay")
            setPurchaseStatus(2)
          } catch (error) {
            setButtonLoading(false)
            // console.log("allowance error:", error)
            Toast.show({
              content: "allowance error",
              maskClickable: false,
              duration: 2000
            })
          }
        })();

        setButtonDisabled(false);
        return
      }

      // pay
      if(purchaseStatus === 2){
        await (async () => {
          try{
            // check chain
            const currentChain = chainList.find(val=>val.id === chainId)
            if(currentChain === undefined){
              Toast.show({
                content: "chain error",
                maskClickable: false,
                duration: 2000
              })
              return
            }

            setButtonLoading(true)

            // pay
            let orderId = ""
            const orderInfo = await runCreateOrder()
            if(orderInfo.orderId !== ""){
              orderId = orderInfo.orderId
            }else{
              throw new Error("empty order id")
            }
            const { request } = await prepareWriteContract({
              address: PurchaseConfigOnChain[chainId].contractAddress,
              abi: contractABI,
              functionName: 'receiveTokens',
              args: [
                PurchaseConfigOnChain[chainId].tokenAddress,
                BigInt(configData.priceInUsdt * 10 ** 18),
                orderId
              ],
              chainId: chainId,
            });
            const { hash } = await writeContract(request);
            console.log(`Pay Transaction hash: ${hash}`);

            // update button status
            setButtonLoading(false)
            setButtonText("Done")
            setPurchaseStatus(999)

          }catch(error){
            setButtonLoading(false)
            console.log("pay error:", error)
            Toast.show({
              content: "pay error",
              maskClickable: false,
              duration: 2000
            })
          }
        })();

        setButtonDisabled(false);
        return
      }

    }

    return <>
    <div className='flex justify-between'>
      <p className='p-20 text-16 m-0'><span className='font-bold text-[#5d61ff]'>Mises VPN</span></p>
      <ConnectButton.Custom>
        {(props) => {
          const ready = props.mounted;
          if (!ready) return
          return <div className='mr-10 mt-5'><ConnectWallet chains={chainList}  {...props} /></div>
        }}
      </ConnectButton.Custom>
    </div>
    <AutoCenter className='text-18 mb-20 font-bold text-[#5d61ff]'>Purchase</AutoCenter>
    <div className='px-15'>
      <div className='purchase-content'>
        <div className='purchase-token-area'>
          <Input
          className='token-input flex-1'
          readOnly={true}
          value="3.00"
          />
          <div style={{display:'flex', alignItems:'center'}}>USDT</div>
        </div>
        <div className='purchase-info-area'>
          <p>Duration&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+30 day</p>
        </div>
        <Button
          disabled={buttonDisabled}
          className='purchase-button-area'
          color='primary'
          onClick={onButtonClick}
        >
          {buttonLoading && <DotLoading color='currentColor' />}
          {!buttonLoading && buttonText}
        </Button>
      </div>
    </div>
    <Notification/>
    </>
  }

  return (
    <div className="App">
      <WagmiConfig config={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <ConfigProvider locale={enUS}>
          <VpnProvider>
          <PurchaseView />
          </VpnProvider>
          </ConfigProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </div >
  );
}

export default Purchase