import detectEthereumProvider from "@metamask/detect-provider";
import { useBoolean, useRequest } from "ahooks";
import { useAnalytics } from "./useAnalytics";
import { logEvent } from "firebase/analytics";
import { isRequest } from "@/utils";

export function useShowLayout() {
  const [isShowLayout, { setTrue }] = useBoolean(false)

  const [isMaxRetryStatus] = useBoolean(false)

  const getProvider = async () => {
    const provider: any = await detectEthereumProvider({
      mustBeMetaMask: false,
      silent: false,
      timeout: 1000
    })
    if (!provider) {
      setTrue()
      return 
    }

    console.log('has provider', provider)
    
    try {
      runReload()
      console.log('start connnect >>>>>>',)
      if(isRequest(provider)) {
        await provider?.request({ method: 'eth_chainId', params: [] })
      }
      console.log('test connnect success>>>>>>')

      setTrue()
      reloadPageCancel()
    } catch (error: any) {
      if (error.message === 'Request method eth_chainId is not supported') {
        setTrue()
        reloadPageCancel()
      }
    }
  }
  // useEffect(() => {
  //   // setTimeout(() => {
  //     // console.log('loading....')
  //     // getProvider()
  //   // }, 1000);
  //   // getProvider()
  //   const load = () =>{
  //     console.log('loading')
  //     getProvider()
  //   }
  //   window.onload = load
  //   window.addEventListener('load', () =>{
  //     console.log(window)
  //   })
  //   // eslint-disable-next-line
  // }, [])
  const analytics = useAnalytics()
  const reloadPage = async () => {
    const isPageReLoad = sessionStorage.getItem('isPageReLoad')

    if(isPageReLoad) {
      setTrue()
      sessionStorage.removeItem('isPageReLoad')
    }else {
      logEvent(analytics, 'vpn_purchase_page_reload')
      sessionStorage.setItem('isPageReLoad', '1')
      window.location.reload()
    }

    // if (currentCount === max) {
    //   setMaxTrue()
    //   window.location.reload()
    //   reloadPageCancel()
    //   return
    // } else {
    //   getProvider()
    // }
    // window.location.reload()

    console.log('reloadPage-getEthereum', window.ethereum)
    console.log('reloadPage')
  }

  const { cancel: reloadPageCancel, run: runReload } = useRequest(reloadPage, {
    manual: true,
    pollingWhenHidden: false,
    debounceWait: 300,
  });

  return {
    isShowLayout,
    isMaxRetryStatus,
    getProvider
  }
}
