import { VpnContext, notificationData } from '@/context/vpnContext'
// import { useInterval } from 'ahooks'
import { FC, useContext, useMemo } from 'react'
import './index.less'
import { CloseOutline } from 'antd-mobile-icons'
// import { substringAmount } from '@/utils'
interface IProps {
}
const Notification:FC<IProps> = ()=> {
  const vpnContext = useContext(VpnContext)
  
  const list = useMemo(() => {
    return vpnContext?.notification || []
  }, [vpnContext?.notification])

  return (
    <>
    {list?.map((val: notificationData, index: number) => {
      return <div className='absolute right-3 notification flex justify-between shadow-lg' style={{top: index * 100}} key={index}>
        <div className='flex gap-4 items-center'>
          {val.noticeType === 'normal' && <>
          <div style={{width: 50}}>{val?.icon?.()}</div>
          <div>
            <p className='notification-title'>{val.text}</p>
            <p className='notification-desc'>
              {val.description}
            </p>
          </div>
          </>
          }
        </div>
        <CloseOutline className="cursor-pointer icon-color text-24" onClick={()=>{
          vpnContext?.removeNotificationData(index)
        }}/>
      </div>
    })}
    </>
  )
}

export default Notification