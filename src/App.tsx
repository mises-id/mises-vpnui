import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from './routes';
import Web3Provider from './components/Web3Provider';
import InitPageProvider from './components/pageProvider/InitPageProvider';
// import { mainnet, arbitrum, bsc, bscTestnet } from 'wagmi/chains';
import { bscTestnet } from 'wagmi/chains';

export const chainList = [
  // {
  //   ...mainnet,
  //   iconUrl: '/images/eth.svg',
  //   rpcUrls: {
  //     public: {
  //       http: ["https://rpc.ankr.com/eth"],
  //     },
  //     default: {
  //       http: ['https://rpc.ankr.com/eth'],
  //     },
  //   },
  // },
  // {
  //   ...bsc,
  //   iconUrl: '/images/bsc.svg',
  //   rpcUrls: {
  //     public: {
  //       http: ["https://bsc-dataseed.binance.org"],
  //     },
  //     default: {
  //       http: ['https://bsc-dataseed.binance.org/'],
  //     },
  //   },
  // },
  // {
  //   ...arbitrum,
  //   iconUrl: '/images/arb.svg'
  // },
  {
    ...bscTestnet,
    iconUrl: '/images/error.svg',
  }
]

function App() {
  return (
    <div className="App">
      <InitPageProvider>
        <Web3Provider>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </Web3Provider>
      </InitPageProvider>
    </div>
  );
}

export default App;
