import request from '@/utils/request'
import { getToken } from '@/utils'

// todo:tmp
export interface accountData {
  "bonus": {
    "bonus_to_mb_rate": number,
    'min_redeem_bonus_amount': number,
  },
  "ad_mining": {
    "limit_per_day": number
  },
  "mb_airdrop": {
    "min_redeem_mis_amount": number
    "mis_redeem_mb_fee": number
    "mis_redeem_receiver_misesid": string
    "mis_redeem_status": number
  }
}

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
  amount: number,
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
 * fetch bonus count for user account
 */
export async function fetchBonusCount(): Promise<{ "bonus": number }> {
  const token = getToken('token');
  if (!token) return Promise.reject()
  const { data } = await request({
    url: '/v1/mining/bonus',
    headers: {
      Authorization: `Bearer ${getToken('token')}`
    }
  })
  return data
}

/**
 * redeem bonus count
 */
export async function redeemBonusCount(bonus: number): Promise<boolean> {
  const token = getToken('token');
  if (!token) return Promise.reject()
  const { data } = await request({
    url: '/v1/mining/redeem_bonus',
    method: 'post',
    data: {
      bonus
    },
    headers: {
      Authorization: `Bearer ${getToken('token')}`
    }
  })
  return data
}

export interface checkMBairdropData {
  "misesid": string,
  "total_airdrop_limit": number,
  "current_airdrop_limit": number,
  "current_airdrop": number
}

/**
 * check mises account
 */
export async function checkMisesAccount(misesid: string): Promise<checkMBairdropData> {
  const token = getToken('mises-token');
  if (!token) return Promise.reject()
  const { data } = await request({
    url: `/v1/mb_airdrop/user/${misesid}`,
    headers: {
      Authorization: `Bearer ${getToken('mises-token')}`
    }
  })
  // data.current_airdrop_limit = data.total_airdrop_limit
  return data
}

export interface paramsData {
  receive_address: string,
  tx_hash?: string,
}
/**
 * claim $MB
 */
export async function claimAirdrop(params: paramsData): Promise<void> {
  const token = getToken('mises-token');
  if (!token) return Promise.reject()
  const { data } = await request({
    url: `/v1/mb_airdrop/claim`,
    params,
    headers: {
      Authorization: `Bearer ${getToken('mises-token')}`
    }
  })
  return data
}

/**
 * fetch data for me
 */
export async function reportAds(requestData: {
  ad_type: 'admob'
}): Promise<void> {
  const token = getToken('token');
  if (!token) return Promise.reject()
  const { data } = await request({
    url: `/v1/ad_mining/log`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken('token')}`
    },
    data: requestData
  })
  return data
}

