import fs from 'fs'
import { ethers } from 'ethers'
import { RPC } from './config'
import { addLiquidity } from './helpers/add-liquidity'
import { burnLiquidity } from './helpers/burn-liquidity'
import { getTokensInLiquidity } from './helpers/get-tokens'
import { getPool } from './helpers/get-tokens-pool'

require('dotenv').config()

const provider = new ethers.providers.JsonRpcProvider(RPC)
const privateKey = process.env.PRIVATE_KEY as string

const start = async (
  tokenA: string,
  amountA: number,
  tokenB: string,
  amountB: number
) => {
  const wallet = new ethers.Wallet(privateKey, provider)

  let pool = await getPool(tokenA, tokenB)
  // If we didn't find pool, changing tokens place
  if (!pool) {
    const _ = tokenA
    tokenA = tokenB
    tokenB = _
    const __ = amountA
    amountA = amountB
    amountB = __
    pool = await getPool(tokenA, tokenB)
  }
  await addLiquidity(tokenA, amountA, tokenB, amountB, wallet, pool)
  console.log(await getTokensInLiquidity(pool.p, await wallet.getAddress()))
  await burnLiquidity(pool.p, wallet)
}

// ETH   0x0000000000000000000000000000000000000000
// USDC  0x0faF6df7054946141266420b43783387A78d82A9
// USDT  0xfcEd12dEbc831D3a84931c63687C395837D42c2B
// CURVE 0x0C7811ba1CE9f63246bAcD97847f9D5a987e421B

start(
  '0xfcEd12dEbc831D3a84931c63687C395837D42c2B',
  0.001,
  '0x0faF6df7054946141266420b43783387A78d82A9',
  0.001
)
