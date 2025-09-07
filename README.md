# MyCoin - Cryptocurrency Wallet & Blockchain Platform

A full-stack cryptocurrency application built with Next.js, featuring wallet management, blockchain operations, transaction processing, and mining capabilities.

## 🚀 Features

### Wallet Management
- **Create New Wallets**: Generate secure wallets with RSA key pairs
- **Import Wallets**: Access existing wallets using private keys or passphrases
- **Multiple Access Methods**: Support for private key, passphrase, and wallet file import
- **Secure Storage**: Local database storage with encrypted wallet data

### Blockchain Operations
- **Transaction Processing**: Send and receive MyCoin between wallets
- **Block Mining**: Proof-of-Work mining with adjustable difficulty
- **Real-time Balance**: Automatic balance calculation from transaction history
- **Transaction Fees**: Gas-based fee system for network operations

### Dashboard & Analytics
- **Network Statistics**: Real-time blockchain metrics and network health
- **Portfolio Tracking**: Monitor wallet balance and transaction history
- **Mining Dashboard**: Interactive mining interface with reward tracking
- **Top Wallets**: Leaderboard of highest balance addresses

### Advanced Features
- **Proof of Work**: SHA-256 based mining algorithm
- **Transaction Pool**: Pending transaction management system
- **Block Explorer**: View detailed block and transaction information
- **Responsive UI**: Modern design with Tailwind CSS and shadcn/ui components

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Node.js Crypto** - Cryptographic operations
- **JSON Database** - Local file-based data storage
- **UUID** - Unique identifier generation

### Key Libraries
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **date-fns** - Date manipulation
- **class-variance-authority** - Component styling variants

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── wallet/        # Wallet operations
│   │   ├── transactions/  # Transaction management
│   │   ├── mining/        # Block mining
│   │   └── stats/         # Network statistics
│   ├── dashboard/         # Mining & network dashboard
│   ├── wallet/           # Wallet management UI
│   ├── send/             # Send transactions
│   └── create-wallet/    # Wallet creation
├── components/           # Reusable UI components
├── lib/                 # Core utilities
│   ├── crypto-utils.ts  # Cryptographic functions
│   ├── database.ts      # Database operations
│   ├── transaction-processor.ts # Transaction handling
│   └── portfolio-analyzer.ts   # Portfolio calculations
├── database/           # JSON data storage
└── public/            # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ngductuan/21KTPM-New-Techs-My-Coin.git
   cd 21KTPM-New-Techs-My-Coin
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
pnpm build
pnpm start
```

## 📖 Usage Guide

### Creating a Wallet
1. Visit the home page and click "Create Wallet"
2. Optionally set a passphrase for additional security
3. Save your private key and address securely
4. Your wallet is ready to receive MyCoin!

### Accessing an Existing Wallet
1. Choose from three access methods:
   - **Private Key**: Enter your wallet's private key
   - **Passphrase**: Use your 12-word recovery phrase
   - **Wallet File**: Upload your JSON wallet file

### Sending Transactions
1. Access your wallet and navigate to "Send"
2. Enter recipient address and amount
3. Confirm transaction details and fees
4. Transaction will be processed and confirmed automatically

### Mining Blocks
1. Go to the Dashboard page
2. Connect your wallet for mining rewards
3. Click "Mine Block" to process pending transactions
4. Earn MyCoin rewards for successful mining!

## 🔐 Security Features

- **RSA 2048-bit Encryption**: Secure key pair generation
- **SHA-256 Hashing**: Cryptographic transaction signing
- **Proof of Work**: Secure consensus mechanism
- **Input Validation**: Server-side validation with Zod schemas
- **Private Key Protection**: Keys never stored on server

## 🏗️ Architecture

### Blockchain Structure
```typescript
interface Block {
  index: number;
  timestamp: string;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
  miner: string;
  reward: number;
}
```

### Transaction Format
```typescript
interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  fee: number;
  gasUsed: number;
  gasPrice: number;
}
```

### Wallet Structure
```typescript
interface Wallet {
  address: string;
  privateKey: string;
  publicKey: string;
  balance: number;
  created: string;
  passphrase?: string;
}
```

## 🛣️ API Endpoints

### Wallet Operations
- `POST /api/wallet` - Create new wallet
- `PUT /api/wallet` - Import existing wallet
- `GET /api/wallet/[address]` - Get wallet details
- `POST /api/wallet/access` - Access wallet with credentials

### Transaction Management
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/[id]` - Get specific transaction

### Mining & Blockchain
- `POST /api/mining` - Mine new block
- `GET /api/blocks` - Get all blocks
- `GET /api/stats` - Get network statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Nguyen Duc Tuan** - [@ngductuan](https://github.com/ngductuan)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**⚠️ Disclaimer**: This is an educational project for learning blockchain concepts. Do not use for actual financial transactions or store real cryptocurrencies.
