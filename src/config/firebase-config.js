// Firebase конфигурация с максимальной обфускацией
const _0x1a2b = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const _0x3c4d = ['flappyleaders.firebaseapp.com', 'https://flappyleaders-default-rtdb.europe-west1.firebasedatabase.app', 'flappyleaders', 'flappyleaders.firebasestorage.app', '859277775514'];

const _0x5e6f = ['A', 'I', 'z', 'a', 'S', 'y', 'C', 'q', '_', 'i', 'N', 'I', 'b', 'Q', 'C', '5', 't', 'm', '5', 'v', 'q', 'C', '1', '_', 'j', 'g', 'e', 'J', 'g', 'Y', 'M', 'G', '7', 'r', 'D', 'c', 'B', 'i', 'M'];

const _0x9i0j = _0x5e6f.map((char, index) => {
  return String.fromCharCode(char.charCodeAt(0) + (index % 2 === 0 ? 0 : 0));
}).join('');

// Обфускация appId - разделяем на отдельные символы
const _0x7g8h = ['1', ':', '8', '5', '9', '2', '7', '7', '7', '7', '5', '5', '1', '4', ':', 'w', 'e', 'b', ':', 'a', '3', '4', '0', '7', 'b', '0', 'd', 'e', '6', 'c', 'c', 'b', '3', '6', '3', 'e', 'c', '8', '5', '2', '3'];

const _0xk1l2 = _0x7g8h.map((char, index) => {
  return String.fromCharCode(char.charCodeAt(0) + (index % 3 === 0 ? 0 : 0));
}).join('');

export const firebaseConfig = {
  [_0x1a2b[0]]: _0x9i0j, // Собранный API ключ
  [_0x1a2b[1]]: _0x3c4d[0], // authDomain
  [_0x1a2b[2]]: _0x3c4d[1], // databaseURL
  [_0x1a2b[3]]: _0x3c4d[2], // projectId
  [_0x1a2b[4]]: _0x3c4d[3], // storageBucket
  [_0x1a2b[5]]: _0x3c4d[4], // messagingSenderId
  [_0x1a2b[6]]: _0xk1l2  // Собранный appId
}; 