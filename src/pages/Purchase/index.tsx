import './index.less';
import { ConfigProvider, AutoCenter } from 'antd-mobile';
import { BrowserRouter } from 'react-router-dom';
import enUS from 'antd-mobile/es/locales/en-US'
import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton, RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { Chain, configureChains, createConfig, WagmiConfig } from 'wagmi';
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
import { useEffect } from 'react';
import { chainList } from '@/App';
import Notification from "@/components/Notification";
import VpnProvider from '@/context/vpnContext';

function Purchase() {
  const { isShowLayout, isMaxRetryStatus, getProvider } = useShowLayout()
  useEffect(() => {
    const load = () => {
      console.log('getProvider loading')
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
    return <>
    <div className='flex justify-between'>
      <p className='p-20 text-16 m-0'><span className='font-bold text-[#5d61ff]'>Mises VPN</span></p>
      <ConnectButton.Custom>
        {(props) => {
          const ready = props.mounted;
          if (!ready) return
          return <ConnectWallet chains={chainList}  {...props} />
        }}
      </ConnectButton.Custom>
    </div>
    <AutoCenter className='text-18 mb-20 font-bold text-[#5d61ff]'>Purchase</AutoCenter>
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