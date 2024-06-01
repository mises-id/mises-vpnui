import { Link } from "react-router-dom";
import { Card } from "antd-mobile";
import { FC } from "react"; 
import { VpnOrder } from "@/api";
import { shortenAddress } from "@/utils";

const VpnOrders:FC<{orders: VpnOrder[] | undefined}> = ({orders}) => {
    return (
        <div className='px-15'>
        { orders && <Card 
          title={
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
          }
          extra={
            <>
            <div className='plan-title' style={{marginLeft: 'auto', marginRight: 'auto'}}>
            Orders
            </div>
            <div>
            {orders.length > 5 && <Link to={`/vpn/orders`}>more</Link>}
            </div>
            </>
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
                    orders.map((object, i) => {
                      if(i < 5){ 
                      return (
                        <tr key={i}>
                        <td><Link to={`/vpn/order/${object.orderId}`}>{shortenAddress(object.orderId)}</Link></td>
                        <td>{object.status}</td>
                        <td>{object.amount} {object.token}</td>
                        <td>{object.createTime}</td>
                        </tr>
                      )}else{
                        return null
                      }
                    })
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
    )
}

export default VpnOrders