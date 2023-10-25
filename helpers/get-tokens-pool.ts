import fs from 'fs'
import path from 'path'
import { WETH, ZERO_ADDRESS } from '../config'

export const getPool = async (addressA: string, addressB: string) => {
  const addressA_ = addressA !== ZERO_ADDRESS ? addressA : WETH
  const addressB_ = addressB !== ZERO_ADDRESS ? addressB : WETH
  const pools = JSON.parse(
    await fs.promises.readFile('abi/pools.json', 'utf-8')
  )
  for (const pool of pools.pools) {
    if (pool?.t0[0] === addressA_ && pool?.t1[0] === addressB_) {
      if (pool.t !== 1) continue
      return pool
    }
  }
}
