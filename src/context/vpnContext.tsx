import { Timeout } from "ahooks/lib/useRequest/src/types";
import { Dispatch, FC, ReactNode, SetStateAction, createContext, useEffect, useState } from "react";
import { useWalletClient } from "wagmi";

interface transferTokenData {
  tokenAddress: string,
  symbol?: string
  decimals?: number
  balance?: string
};

export interface notificationData {
  type: 'reverted' | 'success',
  text: string,
  hash: string,
  noticeType?: 'token' | 'normal',
  description?: string | undefined,
  icon?: () => JSX.Element,
}

interface globalDialogMessageData {
  type: 'error' | 'pending' | 'success' | 'cannotEstimate',
  description: string,
  info?: transferTokenData & {
    blockExplorer: string | undefined,
    txHash: string,
    chainId: number | undefined
  }
}

export type VpnContextType = {
  status: number | string,
  setStatus: Dispatch<SetStateAction<number | string>>
  globalDialogMessage: globalDialogMessageData | undefined,
  setGlobalDialogMessage: Dispatch<SetStateAction<globalDialogMessageData | undefined>>,
  notification: notificationData[], 
  setNotification: Dispatch<SetStateAction<notificationData[]>>,
  pushNotificationData: (params: notificationData)=>void,
  removeNotificationData: (index: number) => void,
  chainId: number, 
  setChainId: Dispatch<SetStateAction<number>>,
};
interface Iprops {
  children?: ReactNode
}

export const VpnContext = createContext<VpnContextType | null>(null);

const VpnProvider: FC<Iprops> = ({ children }) => {

  const [status, setStatus] = useState<number | string>(1)

  const [globalDialogMessage, setGlobalDialogMessage] = useState<globalDialogMessageData>()

  const [chainId, setChainId] = useState<number>(1)
  
  const [notification, setNotification] = useState<notificationData[]>([])

  const [timeout, settimeout] = useState<Timeout | undefined>()

  const [tokens, settokens] = useState<token[] | undefined>(undefined)

  const createRemoveTask = () =>{
    const timeoutFn = setTimeout(removeNotificationData, 4000);
    settimeout(timeoutFn)
  }

  const pushNotificationData = (params: notificationData) => {
    // notification.push(params)
    setNotification([params])
    createRemoveTask()
  }

  const removeNotificationData = () => {
    // notification.splice(index, 1)
    setNotification([])
    if(timeout) {
      clearTimeout(timeout)
      settimeout(undefined)
    }
  }

  return <VpnContext.Provider value={{
    status,
    setStatus,
    globalDialogMessage, 
    setGlobalDialogMessage,
    notification, 
    setNotification,
    pushNotificationData,
    removeNotificationData,
    chainId, 
    setChainId
  }}>{children}</VpnContext.Provider>;
};

export default VpnProvider;
