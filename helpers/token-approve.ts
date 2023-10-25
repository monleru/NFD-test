import { BigNumber, Wallet, ethers } from 'ethers'
import { ZERO_ADDRESS, contractAddress } from '../config'

export const tokenApprove = async (
  tokenAddress: string,
  amount: BigNumber,
  wallet: Wallet
) => {
  if (tokenAddress === ZERO_ADDRESS) return
  const tokenAbi = [
    {
      constant: false,
      inputs: [
        { name: '_spender', type: 'address' },
        { name: '_value', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ name: '', type: 'bool' }],
      type: 'function',
    },
  ]
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, wallet)

  try {
    const transaction = await tokenContract.approve(contractAddress, amount)
    await transaction.wait()
    console.log('Token approval successful', transaction.hash)
  } catch (error) {
    console.error('Error:', error)
  }
}
