const crypto = require("crypto");
require("dotenv").config();

// AES encryption with CBC mode and PKCS#7 padding
function encryptAES(plaintextName) {
  const keyHex = process.env.ENCRYPTION_KEY;
  const key = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(16);

  const blockSize = 16;
  const buffer = Buffer.from(plaintextName, "utf8");
  const padLen = blockSize - (buffer.length % blockSize);
  const padded = Buffer.concat([buffer, Buffer.alloc(padLen, padLen)]);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(padded), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    ciphertext: encrypted.toString("hex"),
  };
}

function decryptAES(encryptedObj) {
  const keyHex = process.env.ENCRYPTION_KEY;
  const key = Buffer.from(keyHex, "hex");
  const iv = Buffer.from(encryptedObj.iv, "hex");
  const encryptedText = Buffer.from(encryptedObj.ciphertext, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decryptedPadded = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

  // Remove PKCS#7 padding
  const padLen = decryptedPadded[decryptedPadded.length - 1];
  const decrypted = decryptedPadded.slice(0, decryptedPadded.length - padLen);

  return decrypted.toString("utf8");
}

function hashName(name) {
  return crypto.createHash("sha256").update(name).digest("hex");
}

module.exports = { encryptAES, decryptAES, hashName };
