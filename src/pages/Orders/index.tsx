import './index.less';
import { DotLoading, Card, Toast } from 'antd-mobile';
import { hooks } from '@/components/Web3Provider/metamask';
import { useMemo } from 'react';
import { shortenAddress } from '@/utils';
import { fetchOrders } from '@/api';
import { useRequest } from 'ahooks';
import { Link, useNavigate } from "react-router-dom";

const { useAccounts } = hooks

const Orders = () => {
    const accounts = useAccounts()
    const navigate = useNavigate()

    const currentAccount = useMemo(() => {
        // return "0x3836f698D4e7d7249cCC3291d9ccd608Ee718988";
        if (accounts?.length) {
          return accounts[0]
        }
        const connectAddress = localStorage.getItem('ethAccount')
        return connectAddress || ''
    }, [accounts])

    const {data, error, loading: fetchOrdersLoading} = useRequest(fetchOrders, {
        pollingInterval: 15000
    })

    // data = [
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
    // ]
    // fetchOrdersLoading = true
    // error = new Error("network error")

    if(error) {
        console.log("fetchOrders:", error)
        Toast.show("data error")
    }

    return <>
    <div className='flex justify-between'>
        <p className='p-20 text-16 m-0' onClick={()=>navigate('/vpn/info')}><span className='font-bold text-[#5d61ff]'>Mises VPN</span></p>
        {currentAccount && <div className='flex items-center mr-15'>
        <div className='rounded-2xl p-10 bg-white dark:bg-[#131a2a]'>
            {shortenAddress(currentAccount)}
        </div>
        </div>}
    </div>
    <div className='px-15'>
        { data && <Card 
          title={
            <div>Orders</div>
          }
          style={{ borderRadius: '16px', marginTop: '30px', border: '1px solid var(--border-color)' }}
          headerStyle={{ justifyContent: 'center' }}
        >
          <div className='plan-content'>
          <table className=''>
                <thead>
                    <tr>
                        <th>Order Id</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                  {
                    data.map((object, i) => 
                        <tr>
                        <td><Link to={`/vpn/order/${object.orderId}`}>{object.orderId}</Link></td>
                        <td>{object.status}</td>
                        <td>{object.amount} {object.token}</td>
                        <td>{object.createTime}</td>
                        </tr>
                    )
                  }
                </tbody>
            </table>
          </div>
          <div className='plan-footer-order'>
            <p>If paid, please be patient ...</p>
          </div>
        </Card>
        }
    </div>
    {fetchOrdersLoading && <DotLoading className='vpninfo-loading' color='primary'/>}
    </>
}

export default Orders
