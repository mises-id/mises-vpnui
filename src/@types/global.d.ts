type address = `0x${string}`
interface token {
  "symbol": string,
  "name": string,
  "address": address,
  "decimals": number,
  'chain_id': number,
  "logo_uri": string,
  'balance'?: string,
  'price'?: string,
  'cacheTime'?: number,
  'isImport'?: boolean
}
