import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EncryptDecrypt.css';











// Enum to match the Dart code's encryption types



enum EncryptionType {
  
  CBC = 'react_native', // React Native style encryption method
  AES_ECB = 'aes_ecb' // Dart AES-ECB encryption/decryption
}

// enum EncryptionType {
//   TYPE1 = 'type1',
//   TYPE2 = 'type2',
//   CAESAR = 'caesar',
//   VIGENERE = 'vigenere',
//   AES = 'aes',
//   CUSTOM_JSON = 'custom_json', // New type for the JSON format with IV
//   DIRECT_AES = 'direct_aes', // Direct AES decryption without format requirements
//   REACT_NATIVE = 'react_native', // React Native style encryption method
//   AES_ESE = 'aes_ese', // AES-ESE encryption method
//   DART_AES_ECB = 'dart_aes_ecb' // Dart AES-ECB encryption/decryption
// }

const EncryptDecrypt: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>(() => {
    const savedMode = localStorage.getItem('mode');
    return savedMode === 'encrypt' || savedMode === 'decrypt' ? savedMode : 'encrypt';
  });
  const [algorithm, setAlgorithm] = useState<string>(EncryptionType.CBC);
  const [shift, setShift] = useState<number>(3); // For Caesar cipher
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load saved keys and preferences from localStorage (similar to SharedPreferences in Dart)
  useEffect(() => {
    const savedKey = localStorage.getItem('encryption_key');
    const savedKeyType2 = localStorage.getItem('encryption_key_type2');
    const savedType = localStorage.getItem('encryption_type');
    const savedMode = localStorage.getItem('mode');
    console.log('mode', savedMode);
    if (savedKey) {
      setSecretKey(savedKey);
    }
    if (savedType && Object.values(EncryptionType).includes(savedType as EncryptionType)) {
      setAlgorithm(savedType);
    }
    if (savedMode === 'encrypt' || savedMode === 'decrypt') {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    if (mode) {
      console.log('mode1', mode);
      localStorage.setItem('mode', mode);
    }
  }, [mode]);

  // Save key to localStorage when it changes
  useEffect(() => {
    if (secretKey) {
      if (algorithm === EncryptionType.CBC) {
        localStorage.setItem('encryption_key', secretKey);
      } else {
        localStorage.setItem('encryption_key_type2', secretKey);
      }
    }
  }, [secretKey, algorithm]);

  // Save algorithm type when it changes
  useEffect(() => {
    if (algorithm) {
      localStorage.setItem('encryption_type', algorithm);
    }
  }, [algorithm]);


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    clearOutputs();
  };

  const handleSecretKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecretKey(e.target.value);
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value as 'encrypt' | 'decrypt');
    clearOutputs();
  };

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAlgorithm(e.target.value);
    clearOutputs();
  };

  const handleShiftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setShift(value);
    }
  };

  const clearOutputs = () => {
    setOutputText('');
    setIsError(false);
    setErrorMessage('');
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(outputText).then(
      () => {
        toast.success('Copied to clipboard!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      },
      (err) => {
        toast.error('Failed to copy to clipboard', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        console.error('Could not copy text: ', err);
      }
    );
  };

  // React Native style encryption - matching your React Native project
  const encryptReactNative = (data: any, key: string): string => {
    try {
      // Generate a random IV (16 bytes)
      const iv = CryptoJS.lib.WordArray.random(16);
      
      // Create key from the Base64-encoded key string
      const parsedKey = CryptoJS.enc.Base64.parse(key);
      
      // Encrypt the data using AES with CBC mode
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), parsedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      // Convert IV and encrypted value to Base64
      const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
      const valueBase64 = encrypted.toString();
      
      // Create an object with IV and encrypted value
      const encryptedObject = { iv: ivBase64, value: valueBase64 };
      
      // Convert to JSON string and encode to Base64
      const encryptedString = CryptoJS.enc.Base64.stringify(
        CryptoJS.enc.Utf8.parse(JSON.stringify(encryptedObject))
      );
      
      return encryptedString;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt data.');
    }
  };
  
  // React Native style decryption - matching your React Native project
  const decryptReactNative = (encryptedString: string, key: string): any => {
    try {
      if (!encryptedString) {
        throw new Error("Encrypted string is undefined or empty.");
      }
      
      // Decode Base64 string to a UTF-8 JSON string
      const decodedString = CryptoJS.enc.Utf8.stringify(
        CryptoJS.enc.Base64.parse(encryptedString)
      );
      
      if (!decodedString) {
        throw new Error("Decoded string is empty. Ensure encryption format is correct.");
      }
      
      // Parse the JSON object
      const encryptedObject = JSON.parse(decodedString);
      if (!encryptedObject.iv || !encryptedObject.value) {
        throw new Error("Invalid encrypted object format.");
      }
      
      // Extract IV and encrypted value
      const iv = CryptoJS.enc.Base64.parse(encryptedObject.iv);
      const encryptedValue = encryptedObject.value;
      
      // Parse the key from Base64
      const parsedKey = CryptoJS.enc.Base64.parse(key);
      
      // Decrypt using AES with CBC mode
      const decrypted = CryptoJS.AES.decrypt(encryptedValue, parsedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      // Convert decrypted data back to string
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedString) {
        throw new Error("Decryption failed. Incorrect key or corrupted data.");
      }
      
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error("Error decrypting data:", error);
      throw new Error(`Failed to decrypt: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Direct AES decryption without format requirements
  const decryptDirectAES = (encryptedData: string, key: string): string => {
    try {
      // Try multiple approaches to decrypt the data
      let decrypted;
      let success = false;
      
      // Approach 1: Direct decryption with the key
      try {
        decrypted = CryptoJS.AES.decrypt(encryptedData, key);
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        if (result && result.length > 0) {
          return result;
        }
      } catch (e) {
        console.log('Direct decryption failed, trying other methods');
      }
      
      // Approach 2: Try to parse as Base64 first
      try {
        const parsedData = CryptoJS.enc.Base64.parse(encryptedData);
        decrypted = CryptoJS.AES.decrypt(
          { ciphertext: parsedData } as CryptoJS.lib.CipherParams,
          CryptoJS.enc.Base64.parse(key),
          {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          }
        );
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        if (result && result.length > 0) {
          return result;
        }
      } catch (e) {
        console.log('Base64 decryption failed, trying other methods');
      }

      // Approach 3: Try with different key formats
      try {
        // Using raw key (without hashing)
        decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        if (result && result.length > 0) {
          return result;
        }
      } catch (e) {
        console.log('Raw key decryption failed');
      }

      // If we get here, none of the approaches worked
      throw new Error('Could not decrypt data with the provided key');
        
    } catch (error) {
      console.error('Direct AES decryption error:', error);
      throw new Error(`Failed to decrypt: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Implementation of Type1 encryption (mimicking the Dart service)
  const encryptType1 = (data: any, key: string): string => {
    try {
      // Convert data to JSON string
      const jsonString = JSON.stringify(data);
      
      // Create a simple key derivation
      const derivedKey = CryptoJS.SHA256(key).toString();
      
      // Encrypt using AES
      const encrypted = CryptoJS.AES.encrypt(jsonString, derivedKey).toString();
      
      // Return base64 encoded result
      return encrypted;
    } catch (error) {
      console.error('Type1 encryption error:', error);
      throw new Error('Failed to encrypt with Type1 algorithm');
    }
  };

  // Implementation of Type1 decryption
  const decryptType1 = (encryptedData: string, key: string): any => {
    try {
      // Create a simple key derivation
      const derivedKey = CryptoJS.SHA256(key).toString();
      
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(encryptedData, derivedKey).toString(CryptoJS.enc.Utf8);
      
      // Parse the JSON
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Type1 decryption error:', error);
      throw new Error('Failed to decrypt with Type1 algorithm');
    }
  };

  // Implementation of Type2 encryption (different approach from Type1)
  const encryptType2 = (data: any, key: string): string => {
    try {
      // Convert data to JSON string
      const jsonString = JSON.stringify(data);
      
      // Use a different key derivation method
      const salt = CryptoJS.lib.WordArray.random(128/8);
      const derivedKey = CryptoJS.PBKDF2(key, salt, { 
        keySize: 256/32, 
        iterations: 1000 
      }).toString();
      
      // Encrypt with a different mode
      const encrypted = CryptoJS.AES.encrypt(jsonString, derivedKey, {
        iv: CryptoJS.lib.WordArray.random(128/8),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString();
      
      // Return the salt + encrypted data
      return salt.toString() + ':' + encrypted;
    } catch (error) {
      console.error('Type2 encryption error:', error);
      throw new Error('Failed to encrypt with Type2 algorithm');
    }
  };

  // Implementation of Type2 decryption
  const decryptType2 = (encryptedData: string, key: string): any => {
    try {
      // Split the salt and encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }
      
      const salt = CryptoJS.enc.Hex.parse(parts[0]);
      const ciphertext = parts[1];
      
      // Derive the key using the same method as encryption
      const derivedKey = CryptoJS.PBKDF2(key, salt, { 
        keySize: 256/32, 
        iterations: 1000 
      }).toString();
      
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(ciphertext, derivedKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);
      
      // Parse the JSON
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Type2 decryption error:', error);
      throw new Error('Failed to decrypt with Type2 algorithm');
    }
  };

  // New Custom JSON format encryption (with IV and value in JSON)
  const encryptCustomJson = (text: string, key: string): string => {
    try {
      // Generate a random IV
      const iv = CryptoJS.lib.WordArray.random(128/8);
      
      // Encrypt the data
      const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Create the result object
      const result = {
        iv: CryptoJS.enc.Base64.stringify(iv),
        value: encrypted.toString()
      };
      
      // Return JSON encoded string
      return JSON.stringify(result);
    } catch (error) {
      console.error('Custom JSON encryption error:', error);
      throw new Error('Failed to encrypt with Custom JSON format');
    }
  };

  // New Custom JSON format decryption (with IV and value in JSON)
  const decryptCustomJson = (encryptedData: string, key: string): string => {
    try {
      // Parse the JSON
      let jsonData;
      try {
        jsonData = JSON.parse(encryptedData);
      } catch (e) {
        throw new Error('Invalid JSON format for encrypted data');
      }

      // Check if required fields exist
      if (!jsonData.iv || !jsonData.value) {
        throw new Error('Invalid encrypted data format: missing iv or value');
      }

      // Parse the IV
      const iv = CryptoJS.enc.Base64.parse(jsonData.iv);
      
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(jsonData.value, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Convert to UTF8 string
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Custom JSON decryption error:', error);
      throw new Error(`Failed to decrypt with Custom JSON format: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Caesar cipher encryption
  const encryptCaesar = (text: string, shift: number): string => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      
      // Uppercase letters
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      // Lowercase letters
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      
      // If it's not a letter, return as is
      return char;
    }).join('');
  };

  // Caesar cipher decryption
  const decryptCaesar = (text: string, shift: number): string => {
    // To decrypt, we shift in the opposite direction (or by 26-shift)
    return encryptCaesar(text, 26 - (shift % 26));
  };

  // Vigenere cipher encryption
  const encryptVigenere = (text: string, key: string): string => {
    if (!key) return text;
    
    return text.split('').map((char, i) => {
      const keyChar = key[i % key.length];
      const keyShift = keyChar.toLowerCase().charCodeAt(0) - 97;
      const code = char.charCodeAt(0);
      
      // Only encrypt letters
      if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
        const isUpperCase = code >= 65 && code <= 90;
        const base = isUpperCase ? 65 : 97;
        return String.fromCharCode(((code - base + keyShift) % 26) + base);
      }
      
      return char;
    }).join('');
  };

  // Vigenere cipher decryption
  const decryptVigenere = (text: string, key: string): string => {
    if (!key) return text;
    
    return text.split('').map((char, i) => {
      const keyChar = key[i % key.length];
      const keyShift = keyChar.toLowerCase().charCodeAt(0) - 97;
      const code = char.charCodeAt(0);
      
      // Only decrypt letters
      if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
        const isUpperCase = code >= 65 && code <= 90;
        const base = isUpperCase ? 65 : 97;
        // Add 26 to avoid negative numbers
        return String.fromCharCode(((code - base - keyShift + 26) % 26) + base);
      }
      
      return char;
    }).join('');
  };

  // Dart AES-ECB encryption (matching the Dart 'encrypt' package implementation)
  const encryptDartAesEcb = (data: any, key: string): string => {
    try {
      // Create key from UTF-8 string (matching '7878tyefngfh9173')
      const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
      
      // Generate IV (16 bytes)
      const iv = CryptoJS.lib.WordArray.random(16);
      
      // Encrypt using AES-ECB mode
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), keyUtf8, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv
      });
      
      return encrypted.toString();
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt data.');
    }
  };

  // Dart AES-ECB decryption
  const decryptDartAesEcb = (encryptedString: string, key: string): any => {
    try {
      // Create key from UTF-8 string
      const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
      
      // Generate IV (16 bytes)
      const iv = CryptoJS.lib.WordArray.random(16);
      
      // Decrypt using AES-ECB mode
      const decrypted = CryptoJS.AES.decrypt(encryptedString, keyUtf8, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv
      });
      
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error(`Failed to decrypt: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const performCryptoOperation = () => {
    clearOutputs();
    
    if (!inputText) {
      setIsError(true);
      setErrorMessage('Please enter text to process');
      return;
    }

    if (!secretKey) {
      setIsError(true);
      setErrorMessage('Secret key is required');
      return;
    }

    try {
      let result = '';
      
      if (mode === 'encrypt') {
        switch (algorithm) {
          
            
          case EncryptionType.CBC:
            try {
              const jsonData = JSON.parse(inputText.trim());
              result = encryptReactNative(jsonData, secretKey);
            } catch (e) {
              throw new Error('Invalid JSON format. Please enter valid JSON data.');
            }
            break;
            
          
            
          case EncryptionType.AES_ECB:
            try {
              const jsonData = JSON.parse(inputText.trim());
              result = encryptDartAesEcb(jsonData, secretKey);
            } catch (e) {
              throw new Error('Invalid JSON format. Please enter valid JSON data.');
            }
            break;
            
          default:
            result = CryptoJS.AES.encrypt(inputText, secretKey).toString();
        }
      } else {
        // Decryption
        switch (algorithm) {
          
          case EncryptionType.CBC:
            try {
              const decryptedData = decryptReactNative(inputText, secretKey);
              result = JSON.stringify(decryptedData, null, 2); // Pretty print
            } catch (e) {
              throw new Error(`Failed to decrypt: ${e instanceof Error ? e.message : String(e)}`);
            }
            break;
            
          
            
          case EncryptionType.AES_ECB:
            try {
              const decryptedData = decryptDartAesEcb(inputText, secretKey);
              result = JSON.stringify(decryptedData, null, 2); // Pretty print
            } catch (e) {
              throw new Error('Failed to decrypt. Check your key and input data.');
            }
            break;
            
          default:
            try {
              const bytes = CryptoJS.AES.decrypt(inputText, secretKey);
              result = bytes.toString(CryptoJS.enc.Utf8);
            } catch (e) {
              throw new Error('Failed to decrypt. Check your key and input data.');
            }
        }
      }

      setOutputText(result);
    } catch (error) {
      console.error('Operation failed:', error);
      setIsError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Operation failed. Please check your input and secret key.');
    }
  };

  return (
    <div className="crypto-container">
      <ToastContainer />
      <h2>Text {mode === 'encrypt' ? 'Encryption' : 'Decryption'} Tool</h2>
      
      <div className="form-group">
        <label>Operation Mode:</label>
        <select value={mode} onChange={handleModeChange} className="select-input">
          <option value="encrypt">Encrypt</option>
          <option value="decrypt">Decrypt</option>
        </select>
      </div>

      <div className="form-group">
        <label>Algorithm:</label>
        <select value={algorithm} onChange={handleAlgorithmChange} className="select-input">
          <option value={EncryptionType.CBC}>CBC</option>
          <option value={EncryptionType.AES_ECB}>AES ECB (UTF-8)</option>
          
        </select>
      </div>

      

      <div className="form-group">
          <label>Secret Key:</label>
          <input
            type="text"
            value={secretKey}
            onChange={handleSecretKeyChange}
            placeholder="Enter your secret key"
            className={algorithm === EncryptionType.CBC ? "text-input base64-key" : "text-input"}
          />
          {algorithm === EncryptionType.CBC && (
            <small className="helper-text">
              Enter your UTF-8 secret key
            </small>
          )}
          {algorithm === EncryptionType.AES_ECB && (
            <small className="helper-text">
              Enter your UTF-8 secret key
            </small>
          )}
        </div>

      <div className="form-group">
        <label>Input Text:</label>
        <textarea
          value={inputText}
          onChange={handleInputChange}
          placeholder={
            [EncryptionType.CBC, EncryptionType.AES_ECB].includes(algorithm as EncryptionType)
              ? mode === 'encrypt'
                ? 'Enter JSON data to encrypt'
                : 'Enter encrypted text to decrypt'
              : mode === 'encrypt'
              ? 'Enter text to encrypt'
              : 'Enter encrypted text to decrypt'
          }
          className="textarea-input"
        />
      </div>

      {isError && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      <div className="button-group">
        <button onClick={performCryptoOperation} className="primary-button">
          {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </button>
        <button onClick={clearOutputs} className="secondary-button">
          Clear
        </button>
      </div>

      <div className="form-group">
        <label>Output:</label>
        <textarea
          value={outputText}
          readOnly
          className="textarea-output"
          placeholder="Result will appear here"
        />
      </div>

      {outputText && (
        <button onClick={handleCopyToClipboard} className="copy-button">
          Copy to Clipboard
        </button>
      )}
    </div>
  );
};

export default EncryptDecrypt; 