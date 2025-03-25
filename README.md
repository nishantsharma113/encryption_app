# Encryption & Decryption Web App

A React.js application that allows users to encrypt and decrypt text using various encryption algorithms.

## Features

- Multiple encryption algorithms: AES, DES, Triple DES, and RC4
- Easy to use interface
- Copy encrypted/decrypted text to clipboard
- Responsive design for mobile and desktop

## Technologies Used

- React.js with TypeScript
- CryptoJS for encryption/decryption algorithms
- CSS for styling

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Usage

1. Select the operation mode (Encrypt or Decrypt)
2. Choose an encryption algorithm
3. Enter your secret key
4. Enter the text to encrypt or the encrypted text to decrypt
5. Click the "Encrypt" or "Decrypt" button
6. The result will appear in the output box
7. Use the "Copy to Clipboard" button to copy the result

## Build for Production

To build the application for production, run:

```bash
npm run build
```

This will create a `build` directory with optimized production files.

## License

MIT
