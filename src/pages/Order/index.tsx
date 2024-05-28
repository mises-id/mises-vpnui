import './index.less';
import { useParams, useNavigate } from 'react-router-dom';
import { hooks } from '@/components/Web3Provider/metamask';
import { useMemo, useEffect } from 'react';
import { shortenAddress } from '@/utils';
import { fetchOrderInfo } from '@/api';
import { useRequest } from 'ahooks';
import { Toast, DotLoading, Card } from 'antd-mobile';

const { useAccounts } = hooks

const Order = () => {
    const { orderId }  = useParams<string>()
    const accounts = useAccounts()
    const navigate = useNavigate()

    const currentAccount = useMemo(() => {
        if (accounts?.length) {
          return accounts[0]
        }
        const connectAddress = localStorage.getItem('ethAccount')
        return connectAddress || ''
    }, [accounts])

    const {data, error, cancel, loading: fetchOrderInfoLoading} = useRequest(() => {
        return fetchOrderInfo(orderId)
    }, {
        pollingInterval: 15000
    })

    if(error) {
        console.log("fetchOrders:", error)
        Toast.show("data error")
    }

    useEffect(() => {
        if (data?.status && data?.status !== 'Pending') {
          cancel()
        }
    }, [data, cancel]);

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
            <div>Order</div>
          }
          style={{ borderRadius: '16px', marginTop: '30px', border: '1px solid var(--border-color)' }}
          headerStyle={{ justifyContent: 'center' }}
        >
          <div className='order-content'>
            <div className='detail-block'>
                <div className="detail-title">Order ID</div>
                <div className="detail-content">{data.orderId}</div>
            </div>
            <div className='detail-block'>
                <div className="detail-title">Status</div>
                <div className="detail-content">{data.status}</div>
            </div>
            <div className='detail-block'>
                <div className="detail-title">Amount</div>
                <div className="detail-content">{data.amount} {data.token}</div>
            </div>
            <div className='detail-block'>
                <div className="detail-title">Chain</div>
                <div className="detail-content">{data.chain}</div>
            </div>
            <div className='detail-block'>
                <div className="detail-title">Transaction Hash</div>
                <div className="detail-content">{data.txnHash || "To be confirmed"}</div>
            </div>
            <div className='detail-block'>
                <div className="detail-title">Time</div>
                <div className="detail-content">{data.createTime}</div>
            </div>
          </div>
          { data.status === "Pending" &&
          <div className='order-footer'>
            <p>To be confirmed, please wait patiently.</p>
          </div>
          }
        </Card>
        }
    </div>
    {fetchOrderInfoLoading && <DotLoading className='vpninfo-loading' color='primary'/>}
    </>
    
}

export default Order
