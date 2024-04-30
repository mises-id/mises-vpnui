import { shortenAddress } from '@/utils';
import { CenterPopup, CenterPopupProps, Toast } from 'antd-mobile';
import { FC, useMemo, useRef, useState } from 'react';
import { useAccount, useDisconnect, useNetwork } from 'wagmi';
import CustomAvatar from '../CustomAvatar'
import './index.less'

interface IProps extends CenterPopupProps {

}
const CurrentAccountInfo: FC<IProps> = (props) => {
  const { visible: isOpen } = props
  const { disconnect } = useDisconnect()

  const disconnectAccount = () => {
    try {
      disconnect()
      props.onClose?.()
      sessionStorage.removeItem('isFirstConnected')
    } catch (error) {

    }
  }

  const { address } = useAccount()

  const copy = (text: string) => {
    const input = document.createElement('input');
    input.setAttribute('readonly', 'readonly');
    input.setAttribute('value', text);
    document.body.appendChild(input);
    input.setSelectionRange(0, 9999);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    Toast.show('Copyed')
  }
  return (
    <CenterPopup visible={isOpen} closeOnMaskClick showCloseButton className='dialog-container down-dialog-style' onClose={() => {
      props.onClose?.()
    }}>
      <p className='connect-dialog-title'>Account</p>

      <div className='flex justify-between items-center px-12 pb-30'>
        <div className='flex items-center gap-2'  onClick={() => copy(address as string)}>
          {address && <CustomAvatar address={address} size={40} />}
          <span className='ml-10 text-lg history-account-address'>{shortenAddress(address)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </div>

        <div className='connect-dialog-close-icon' onClick={disconnectAccount}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
        </div>
      </div>
    </CenterPopup>
  )
}

export default CurrentAccountInfo;
