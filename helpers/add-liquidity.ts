import fs from 'fs'
import path from 'path'
import { BigNumber, Wallet, ethers } from 'ethers'
import { contractAddress, ZERO_ADDRESS } from '../config'
import { tokenApprove } from './token-approve'

export interface Pool {
  p: string
  f0: string
  f1: string
  t0: any[]
  t1: any[]
}
export const addLiquidity = async (
  tokenA: string,
  amountA: number,
  tokenB: string,
  amountB: number,
  wallet: Wallet,
  pool: Pool
) => {
  const contractAbi = JSON.parse(
    await fs.promises.readFile('abi/abi.json', 'utf-8')
  )

  const args = [
    pool.p,
    [
      [
        tokenA,
        ethers.utils.parseUnits(String(amountA), pool.t0[3]),
        pool.f0 === '0xc8',
      ],
      [
        tokenB,
        ethers.utils.parseUnits(String(amountB), pool.t1[3]),
        pool.f1 === '0xc8',
      ],
    ],
    ethers.utils.defaultAbiCoder.encode(
      ['address'],
      [await wallet.getAddress()]
    ),
    0,
    ZERO_ADDRESS,
    '0x',
  ]

  await tokenApprove(
    tokenA,
    ethers.utils.parseUnits(String(amountA), pool.t0[3]),
    wallet
  )

  await tokenApprove(
    tokenB,
    ethers.utils.parseUnits(String(amountB), pool.t1[3]),
    wallet
  )

  const contract = new ethers.Contract(contractAddress, contractAbi, wallet)
  let value: BigNumber | undefined
  if (tokenA === ZERO_ADDRESS) {
    value = ethers.utils.parseEther(String(amountA))
  } else if (tokenB === ZERO_ADDRESS) {
    value = ethers.utils.parseEther(String(amountB))
  }
  const gasLimit = 2778595
  const result = await contract.addLiquidity(...args, {
    gasLimit,
    value,
  })

  await result.wait()

  console.log('addLiquidity Hash:', result.hash)
  await new Promise((resolve, reject) => {
    setTimeout(() => resolve(null), 2000)
  })
}
