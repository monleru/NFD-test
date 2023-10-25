import fs from 'fs'
import path from 'path'
import { Wallet, ethers } from 'ethers'
import { RPC, ZERO_ADDRESS, contractAddress } from '../config'
import { tokenApprove } from './token-approve'

const provider = new ethers.providers.JsonRpcProvider(RPC)

export const burnLiquidity = async (pool: string, wallet: Wallet) => {
  const contractAbi = JSON.parse(
    await fs.promises.readFile('abi/abi.json', 'utf-8')
  )

  const lpTokens = await getTokenBalance(pool, await wallet.getAddress())
  await tokenApprove(pool, lpTokens, wallet)
  const args = [
    pool,
    lpTokens,
    ethers.utils.defaultAbiCoder.encode(
      ['address', 'address'],
      [await wallet.getAddress(), '0x0000000000000000000000000000000000000001']
    ),
    [0, 0],
    ZERO_ADDRESS,
    '0x',
  ]
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet)

  const gasLimit = 1778595
  const result = await contract.burnLiquidity(...args, { gasLimit })

  await result.wait()
  console.log('burnLiquidity Hash:', result.hash)
}

const getTokenBalance = async (pool: any, wallet: string) => {
  const tokenAbi = [
    {
      constant: true,
      inputs: [{ name: '_owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: 'balance', type: 'uint256' }],
      type: 'function',
    },
  ]

  const tokenContract = new ethers.Contract(pool, tokenAbi, provider)
  try {
    const balance = await tokenContract.balanceOf(wallet)
    return balance
  } catch (error) {
    throw new Error(`Error fetching token balance: ${error}`)
  }
}
