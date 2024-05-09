import request from '@/utils/request'
import { getToken } from '@/utils'

// todo:?
export interface configData {
  priceInUsdt: number
}

export enum VpnStatus {
  Unavailable = 0,
  Available
}

export interface VpnOrder {
  orderId: string,
  status: string,
  amount: string,
  chain: string,
  token: string
  txnHash: string,
  createTime: string
}

interface VpnInfo {
  status: number,
  subscription?: {
    expireTime: string,
  },
  orders?: VpnOrder[]
}

/**
 * get config data
 */
export async function fetchConfigData(): Promise<configData> {
  try {
    const { data } = await request({
      url: '/v1/vpn/config',
    })
    return data
  } catch (error) {
    // todo:test default
    return {priceInUsdt: 3.00}
  }
}

/**
 * get user account JWT token
 */
export async function signin(auth: string): Promise<{
  token: string,
  is_created: boolean
}> {
  const { data } = await request({
    url: '/v1/signin',
    method: 'POST',
    data: {
      user_authz: { auth }
    }
  })
  return data
}

/**
 * fetch vpn info for user account
 */
export async function fetchVpnInfo(): Promise<VpnInfo> {
  const token = getToken('token');
  if (!token) return Promise.reject("token error")
  const { data } = await request({
    url: '/v1/vpn/info',
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken('token')}`
    }
  })
  return data
}

/**
 * fetch order list for user account
 */
export async function fetchOrders(): Promise<VpnOrder[]> {
  const token = getToken('token');
  if (!token) return Promise.reject("token error")
  const { data } = await request({
    url: '/v1/vpn/orders',
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken('token')}`
    }
  })
  return data
}

/**
 * fetch order info for user account
 */
export async function fetchOrderInfo(orderId: string | undefined): Promise<VpnOrder> {
  if(!orderId){
    return Promise.reject("params error")
  }
  const token = getToken('token');
  if (!token) return Promise.reject("token error")
  const { data } = await request({
    url: `/v1/vpn/order/${orderId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken('token')}`
    }
  })
  return data
}

/**
 * create order
 */
export async function createOrder(chainId: number, planId: number = 1): Promise<{orderId:string}> {
  const token = getToken('token');
  if (!token) return Promise.reject("token error")
  const { data } = await request({
    url: `/v1/vpn/order/create`,
    method: "POST",
    data: {
      chainId,
      planId
    },
    headers: {
      Authorization: `Bearer ${getToken('token')}`
    }
  })
  return data
}

/**
 * update order hash
 */
export async function updateOrder(orderId: string, txnHash: string): Promise<boolean> {
  const token = getToken('token');
  if (!token) return Promise.reject("token error")
  if(txnHash === "") {
    return Promise.reject("hash error")
  }
  const { data } = await request({
    url: `/v1/vpn/order/update`,
    method: "PATCH",
    data: {
      orderId,
      txnHash
    },
    headers: {
      Authorization: `Bearer ${getToken('token')}`
    }
  })
  if(data?.status === true){
    return true
  }
  return false
}
