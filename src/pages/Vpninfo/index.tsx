import { VpnStatus, signin, fetchVpnInfo } from '@/api';
import { usePageValue } from '@/components/pageProvider';
import VpnIndex from '@/components/VpnIndex';
import VpnPay from '@/components/VpnPay';
import VpnOrders from '@/components/VpnOrders';
import { getSwapLink, getToken, removeToken, setToken, shortenAddress } from '@/utils';
import { useBoolean, useDocumentVisibility, useRequest } from 'ahooks';
import { Button, CenterPopup, Image, Toast, DotLoading, AutoCenter, Card } from 'antd-mobile'
import React, { useEffect, useMemo, useState } from 'react'
import { useAnalytics } from "@/hooks/useAnalytics";

import { hooks, metaMask } from '@/components/Web3Provider/metamask'
import { useWeb3React } from '@web3-react/core';
import './index.less';
import { logEvent } from 'firebase/analytics';
import DownloadPop from '@/components/DownloadPop';
import { SendOutline } from 'antd-mobile-icons';
import { useNavigate } from "react-router-dom";

const { useAccounts, useIsActivating } = hooks

function Vpninfo() {
  const accounts = useAccounts()
  const navigate = useNavigate()
  const isActivating = useIsActivating()
  const { connector } = useWeb3React();


  // const provider = useProvider()
  const [adsLoading, { setTrue: setAdsLoadingTrue, setFalse: setAdsLoadingFalse }] = useBoolean(false)
  const [showCenterPop, setshowCenterPop] = useState(false)
  const [continuePop, setcontinuePop] = useState(false)
  const [downloadPop, setDownloadPop] = useState(false)
  const [authAccount, setauthAccount] = useState('')
  const [loading, setloading] = useState(true)

  // todo:test
  const currentAccount = useMemo(() => {
    return "0x3836f698D4e7d7249cCC3291d9ccd608Ee718988";

    // if (accounts?.length) {
    //   return accounts[0]
    // }
    // const connectAddress = localStorage.getItem('ethAccount')
    // return connectAddress || authAccount || ''
  }, [accounts, authAccount])


  // const [signLoading, { setTrue: setsignLoadingTrue, setFalse: setsignLoadingFalse }] = useBoolean(true)

  const signMsg = async () => {
    try {
      const timestamp = new Date().getTime();
      console.log(accounts, 'accounts')
      if (accounts && accounts.length) {
        const address = accounts[0]
        const nonce = `${timestamp}`;
        const sigMsg = `address=${address}&nonce=${timestamp}`
        // setsignLoadingTrue()
        // const personalSignMsg = await provider?.send('personal_sign', [address, sigMsg])
        const data = await window.misesEthereum?.signMessageForAuth(address, nonce)
        if (data?.sig) {
          const auth = `${sigMsg}&sig=${data?.sig}`
          // setsignLoadingFalse()
          return auth
        }
        // setsignLoadingFalse()
        return Promise.reject({
          code: 9998,
          message: 'Not found personal sign message'
        })
      }
      // setsignLoadingFalse()
      return Promise.reject({
        code: 9998,
        message: 'Invalid address'
      })
    } catch (error) {
      // setsignLoadingFalse()
      return Promise.reject(error)
    }
  }

  const loginMisesAccount = async (params: {
    auth: string,
    misesId: string
  }) => {
    try {
      localStorage.setItem('ethAccount', params.misesId)
      setauthAccount(params.misesId)
      const res = await signin(params.auth)
      setToken('token', res.token)
      setloading(false)
    } catch (error) {
      setloading(false)
    }
  }

  const loginMises = () => {
    const oldConnectAddress = localStorage.getItem('ethAccount')
    if (accounts && accounts.length && oldConnectAddress !== accounts[0]) {
      // removeToken('token')
      // localStorage.removeItem('ethAccount')
      signMsg().then(auth => {
        loginMisesAccount({
          auth,
          misesId: accounts[0]
        })
      }).catch(error => {
        console.log(error, 'error')
        if(error && error.message) {
          Toast.show(error.message)
        }
      })
    }
  }

  // attempt to connect eagerly on mount
  useEffect(() => {
    metaMask.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to metamask')
    })
    const token = getToken()
    if(token) {
      setloading(false)
    }
  }, [])

  

  const documentVisibility = useDocumentVisibility();

  useEffect(() => {
    console.log(`Current document visibility state: ${documentVisibility}`);
    if (documentVisibility === 'visible') {
      loginMises()
    }
    if(!accounts) {
      if(!window.misesEthereum?.getCachedAuth) {
        setloading(false)
        return
      }
      setloading(true)
      window.misesEthereum?.getCachedAuth?.().then(res => {
        console.log('getCachedAuth')
        const token = getToken()
        const oldConnectAddress = localStorage.getItem('ethAccount')
        !token && loginMisesAccount(res)
        res.misesId !== oldConnectAddress && token && loginMisesAccount(res)
      }).catch(err => {
        console.log(err, 'getCachedAuth: error')
        setauthAccount('')
        removeToken('token')
        localStorage.removeItem('ethAccount')
        setloading(false)
      })
    }
    console.log(accounts, 'accounts')
    // eslint-disable-next-line
  }, [documentVisibility, accounts]);

  const connectWallet = async () => {
    try {
      await connector.activate()
      loginMises()
    } catch (error: any) {
      if(error && error.message === 'Please download the latest version of Mises Browser.') {
        setDownloadPop(true)
        return
      }
      if(error && error.code !== 1) {
        Toast.show(error.message)
      }
    }
  }

  const analytics = useAnalytics()

  // todo: 读取全局vpn配置信息
  // const { accountData } = usePageValue()

  const buttonText = useMemo(() => {
    if (isActivating) {
      return 'Connect Wallet...'
    }

    return 'Connect Mises ID'
    //
  }, [isActivating])

  const pendingPopClose = () => {
    setshowCenterPop(false);
    setAdsLoadingFalse()
    window.misesEthereum?.cancelAds?.()
  }

  // const RenderView = () => {
  //   if (currentAccount) {

  //   // console.log("currentAccount: ", currentAccount)
  //   // console.log("token: ", getToken())

  //     return <VpnView/>
  //   }
  //   return null
  // }
  
  // todo:test let
  let {data: vpnData, error: fetchVpnInfoError, loading: fetchVpnInfoLoading} = useRequest(() => {
    if(!currentAccount){
      return Promise.reject('please login')
    }
    return fetchVpnInfo()
  }, {
    pollingInterval: 15000
  })

  useEffect(() => {
    if (fetchVpnInfoError) {
        console.log("fetchVpnInfo:", fetchVpnInfoError);
        Toast.show("network error");
    }
  }, [fetchVpnInfoError]);

  // todo:test
  // vpnData = {
  //   status: 0,
  //   subscription: {
  //     expireTime: "2024/04/30",
  //   },
  //   orders: [
  //     {
  //       orderId: "cvcvcvcvcvcvcv",
  //       status: "pending",
  //       amount: 3,
  //       chain: "tron",
  //       token: "usdt",
  //       txnHash: "",
  //       createTime: "2024/04/30"
  //     },
  //     {
  //       orderId: "cvcvcvcvcvcvcv",
  //       status: "pending",
  //       amount: 3,
  //       chain: "tron",
  //       token: "usdt",
  //       txnHash: "",
  //       createTime: "2024/04/30"
  //     },
  //     {
  //       orderId: "cvcvcvcvcvcvcv",
  //       status: "pending",
  //       amount: 3,
  //       chain: "tron",
  //       token: "usdt",
  //       txnHash: "",
  //       createTime: "2024/04/30"
  //     }
  //   ]
  // }

  const RenderView = (props:{currentAccount:string, vpnData:any, fetchVpnInfoError: Error | undefined, fetchVpnInfoLoading:boolean}) => {
      if(VpnStatus.Available === props.vpnData?.status){
        return <>
        <div className='flex justify-between'>
          <p className='p-20 text-16 m-0'><span className='font-bold text-[#5d61ff]'>Mises VPN</span></p>
          {props.currentAccount && <div className='flex items-center mr-15'>
            <div className='rounded-2xl p-10 bg-white dark:bg-[#131a2a]'>
              {shortenAddress(props.currentAccount)}
            </div>
          </div>}
        </div>
        <div className='px-15'>
        {props.vpnData?.subscription && <Card 
          title={
            <div className='plan-title'>
            Current Subscription
            </div>
          }
          style={{ borderRadius: '16px', border: '1px solid var(--border-color)' }}
          headerStyle={{ justifyContent: 'center' }}
        >
          <div className='plan-content'>
            <div className='detail-block'>
                <div className="detail-title">Expiration time</div>
                <div className="detail-content">{props.vpnData?.subscription.expireTime}</div>
            </div>
            <div className='detail-block'>
                <div className="detail-title">Device limit</div>
                <div className="detail-content">No limit</div>
            </div>
          </div>
          <div className='plan-footer-purchase'>
            <Button
              className='vpn-button'
              color='primary'
              onClick={() => {
                Toast.show('Start VPN')
              }}
            >
              Start VPN
            </Button>
          </div>
        </Card>
        }
        </div>
        <VpnOrders orders={props.vpnData?.orders}/>
        {props.fetchVpnInfoLoading && <DotLoading className='vpninfo-loading' color='primary'/>}
        </>
      }else{
        // return <VpnPay />
        return <>
        <div className='flex justify-between'>
          <p className='p-20 text-16 m-0'><span className='font-bold text-[#5d61ff]'>Mises VPN</span></p>
          {props.currentAccount && <div className='flex items-center mr-15'>
            <div className='rounded-2xl p-10 bg-white dark:bg-[#131a2a]'>
              {shortenAddress(props.currentAccount)}
            </div>
          </div>}
        </div>
        <AutoCenter className='text-18 mb-20 font-bold text-[#5d61ff]'>Plans</AutoCenter>
        <div className='px-15'>
        <Card 
          title={
            <div className='plan-title'>
            3 USDT for 1 Month
            </div>
          } 
          style={{ borderRadius: '16px', border: '1px solid var(--border-color)' }}
          headerStyle={{ justifyContent: 'center' }}
        >
          <div className='plan-content'>
            <p className='text-14 leading-7 tracking-wider'>
              1. item 1: cccccccccccccccccccccccccccccccc
            </p>
            <p className='text-14 leading-7 tracking-wider'>
              2. item 2: cccccccccccccccccccccccccccccccccccc,
              cccccccccccccccccccccccccccc
            </p>
            <p className='text-14 leading-7 tracking-wider'>
              3. item 3: ccccccccccccccccccccccccccccccccccccccc
              cccccccc
            </p>
          </div>
          <div className='plan-footer-purchase'>
            <Button
              className='purchase-button'
              color='primary'
              onClick={() => {
                navigate('/vpn/purchase')
              }}
            >
              Purchase
            </Button>
          </div>
        </Card>
        </div>
        <VpnOrders orders={props.vpnData?.orders}/>
        {props.fetchVpnInfoLoading && <DotLoading className='vpninfo-loading' color='primary'/>}
      </>
      }
  };

  return (
    <div className={`h-screen  flex flex-col`}>
      {currentAccount && <RenderView currentAccount={currentAccount} vpnData={vpnData} fetchVpnInfoError={fetchVpnInfoError} fetchVpnInfoLoading={fetchVpnInfoLoading}/>}
      {!currentAccount && !loading ? <>
        <p className='p-20 text-16 m-0 font-bold text-[#5d61ff] fixed inset-x-0 top-0'>Mises VPN</p>
        <div style={{ minHeight: 160 }}>
          <img src="./images/me-bg.png" alt="bg" width="100%" className="block" />
        </div>
        <div className='bg-white px-15 pb-30'>
          <p className='text-25 text-[#333333]'>About Mises ID</p>
          <p className='text-14 leading-6 text-[#333333] py-20 mb-20'>Mises ID is a decentralized personal account.You need your own Mises ID to use Mises VPN.</p>
          <Button block shape='rounded' onClick={connectWallet} style={{ "--background-color": "#5d61ff", "--border-color": "#5d61ff", 'padding': '12px 0' }}>
            <span className='text-white block text-18'>{buttonText}</span>
          </Button>
        </div>
      </> : null}
      <DownloadPop setDownloadPop={setDownloadPop} downloadPop={downloadPop} />
    </div>
  )
}

export default Vpninfo