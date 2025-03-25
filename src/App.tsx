import React from 'react';
import './App.css';
import EncryptDecrypt from './components/EncryptDecrypt';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Encryption & Decryption App</h1>
        <p>Secure your messages with powerful encryption algorithms</p>
      </header>
      <main>
        <EncryptDecrypt />
      </main>
      <footer>
        <p>Created with React and CryptoJS</p>
      </footer>
    </div>
  );
}

export default App;
