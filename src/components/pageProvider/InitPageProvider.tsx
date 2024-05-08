import React, { PropsWithChildren } from 'react';
import { PageValueProvider } from '.';
// import { useRequest } from 'ahooks'
// import { fetchConfigData } from '@/api'

const InitPageProvider = ({ children }: PropsWithChildren<{}>) => {
  // const { data: configData } = useRequest(fetchConfigData, {
  //   retryCount: 3
  // })

  const configData = {priceInUsdt: 3.00}

  return (
    <PageValueProvider value={{
      configData
    }}>{children}</PageValueProvider>
  )
}

export default InitPageProvider