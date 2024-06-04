import React, { PropsWithChildren } from 'react';
import { PageValueProvider } from '.';
import { useRequest } from 'ahooks';
import { fetchConfigData } from '@/api';
import { Toast } from 'antd-mobile';

const InitPageProvider = ({ children }: PropsWithChildren<{}>) => {
  const { data: configData, error: configDataError } = useRequest(fetchConfigData, {
    retryCount: 3
  })

  if(configDataError){
    Toast.show({
      content: "config error",
      maskClickable: false,
      duration: 2000
    })
  }

  return (
    <PageValueProvider value={{
      configData
    }}>{children}</PageValueProvider>
  )
}

export default InitPageProvider