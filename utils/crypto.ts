import crypto from 'crypto';

const algorithm = 'aes256';
const inputEncoding = 'utf8';
const outputEncoding = 'hex';
const ivlength = 16; // AES blocksize
const cipherKey = crypto.createHash('sha256').update(String(process.env.APP_SECRET)).digest('base64').substr(0, 32);

export const CryptoUtils = {

  encryptKey: (key: string): string => {
    const iv = crypto.randomBytes(ivlength);
    const cipher = crypto.createCipheriv(algorithm, cipherKey, iv);

    let ciphered = cipher.update(key, inputEncoding, outputEncoding);
    ciphered += cipher.final('hex');

    const cipherText = iv.toString('hex') + ':' + ciphered
    return cipherText
  },
  decryptKey: (encryptedKey: string): string => {
    const components = encryptedKey.split(':');
    const iv_from_ciphertext = Buffer.from(components.shift() || '', outputEncoding);
    const decipher = crypto.createDecipheriv(algorithm, cipherKey, iv_from_ciphertext);

    let deciphered = decipher.update(components.join(':'), outputEncoding, inputEncoding);
    deciphered += decipher.final(inputEncoding);
    return deciphered;
  }

}
