import { createConfig, http } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'

export const providerConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http("https://mainnet.infura.io/v3/aabba8d72cfc4bb5b74b3e7d90ee5477"),
    [sepolia.id]: http("https://sepolia.infura.io/v3/aabba8d72cfc4bb5b74b3e7d90ee5477"),
  },
})