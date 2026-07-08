# Decentralized Escrow System with Arbitration ⚖️🛒

A decentralized Escrow Web3 application. This project demonstrates how smart contracts can act as a trusted third party in e-commerce transactions, secure funds, and provide a decentralized dispute resolution mechanism.

---

## 🚀 Project Overview

This dApp facilitates a secure trade agreement between three distinct roles: a **Buyer**, a **Seller**, and an **Arbiter**. The Buyer locks funds into the smart contract upon deployment. The funds are only released to the Seller once the Buyer confirms receipt of the goods, or according to an Arbiter's decision if a dispute arises.

### Key Features

- **Secure Fund Locking:** Ethereum funds are held safely by the EVM state machine.
- **State-Driven Workflow:** The UI adaptively updates according to the smart contract lifecycle (`Funded` ➡️ `Completed` / `InDispute`).
- **Metamask Integration:** Real-time wallet connection and dynamic user role detection based on the active account address.
- **Conditional UI Rendering:** Users only see the actions/buttons relevant to their cryptographic role.

---

## 🛠️ Tech Stack

- **Smart Contract:** Solidity, compiled and tested using Remix IDE.
- **Frontend:** React.js, modern functional components.
- **Blockchain Interaction:** Ethers.js (v6) for state synchronization and Metamask provider handling.
- **Network:** Ethereum Sepolia Testnet.

---

## 🔄 Contract State Machine (Lifecycle)

The smart contract coordinates the frontend state based on the following flow:

1. **Created (0):** Contract instantiated but pending initialization/funding.
2. **Funded (1):** Buyer successfully deployed the contract with ETH locked inside.
3. **Completed (2):** Funds successfully transferred to the Seller. Contract is safely finalized.
4. **InDispute (3):** Buyer or Seller raised a dispute. The contract locks down awaiting the Arbiter.

---

## 💻 Installation & Local Setup

Follow these steps to run the frontend application locally:

### 1. Clone the repository

```bash
git clone <repository-url>
cd escrow-dapp
```
