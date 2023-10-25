import fs from 'fs'
import { ethers } from 'ethers'
import { RPC } from '../config'
import { Pool } from './add-liquidity'

interface TokensInLiquidityResponse {
  lpBalance: string
  tokenA: {
    tiket: string
    amount: string
    decimal: number
  }
  tokenB: {
    tiket: string
    amount: string
    decimal: number
  }
}
const poolAbi = [
  {
    constant: true,
    inputs: [],
    name: 'getReserves',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]
export const getTokensInLiquidity = async (
  poolAddress: string,
  userAddress: string
): Promise<TokensInLiquidityResponse> => {
  const contractAddress = poolAddress

  const provider = new ethers.providers.JsonRpcProvider(RPC)
  const contract = new ethers.Contract(contractAddress, poolAbi, provider)

  const [reserve0, reserve1] = await contract.getReserves()
  const totalSupply = await contract.totalSupply()
  const userLpBalance = await contract.balanceOf(userAddress)

  const balance0 = userLpBalance.mul(reserve0).div(totalSupply)
  const balance1 = userLpBalance.mul(reserve1).div(totalSupply)

  const pools = JSON.parse(
    await fs.promises.readFile('abi/pools.json', 'utf-8')
  ).pools

  const pool = pools.find((data: Pool) => data.p === contractAddress)
  return {
    lpBalance: ethers.utils.formatUnits(userLpBalance, 18),
    tokenA: {
      tiket: pool.t0[1],
      amount: ethers.utils.formatUnits(balance0, pool.t0[3]),
      decimal: pool.t0[3],
    },
    tokenB: {
      tiket: pool.t1[1],
      amount: ethers.utils.formatUnits(balance1, pool.t1[3]),
      decimal: pool.t1[3],
    },
  }
}
