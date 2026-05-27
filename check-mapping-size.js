const zlib = require('zlib')

// Full plaintext alphabet — everything a user can type
const plaintext = [
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0123456789',
  ' !@#$%^&*()-_=+[]{};\':\",./<>?\\|`~',
].join('')

// Build a large pool of unique Unicode symbols for ciphertext
const pool = []
const ranges = [
  [0x0391, 0x03C9], // Greek
  [0x2200, 0x22FF], // Math operators
  [0x2500, 0x257F], // Box drawing
  [0x2600, 0x26FF], // Misc symbols
  [0x2700, 0x27BF], // Dingbats
  [0x2800, 0x28FF], // Braille
]
for (const [start, end] of ranges) {
  for (let i = start; i <= end; i++) {
    pool.push(String.fromCodePoint(i))
  }
}

// Assign 5 unique homophones to each plaintext character
const mapping = {}
let idx = 0
for (const char of plaintext) {
  mapping[char] = []
  for (let i = 0; i < 5; i++) {
    mapping[char].push(pool[idx++])
  }
}

// Also add null symbols (20% noise pool — 20 symbols)
mapping['__nulls__'] = []
for (let i = 0; i < 20; i++) {
  mapping['__nulls__'].push(pool[idx++])
}

const json        = JSON.stringify(mapping)
const jsonBytes   = Buffer.byteLength(json, 'utf8')
const compressed  = zlib.gzipSync(json, { level: 9 })
const compBytes   = compressed.length
const base64      = compressed.toString('base64')
const b64Bytes    = base64.length

const QR_LIMIT    = 2953 // QR version 40, binary, low error correction (bytes)
const QR_LIMIT_H  = 1273 // QR version 40, binary, high error correction (bytes)

console.log('=== Noiseroom worst-case mapping size check ===\n')
console.log(`Plaintext chars:       ${plaintext.length}`)
console.log(`Homophones per char:   5`)
console.log(`Total ciphertext syms: ${plaintext.length * 5}`)
console.log(`Null symbols:          20`)
console.log('')
console.log(`JSON raw:              ${jsonBytes} bytes  (${(jsonBytes/1024).toFixed(2)} KB)`)
console.log(`Gzip compressed:       ${compBytes} bytes  (${(compBytes/1024).toFixed(2)} KB)`)
console.log(`Base64 encoded:        ${b64Bytes} bytes  (${(b64Bytes/1024).toFixed(2)} KB)`)
console.log(`Compression ratio:     ${((1 - compBytes/jsonBytes)*100).toFixed(1)}%`)
console.log('')
console.log(`QR limit (low EC):     ${QR_LIMIT} bytes`)
console.log(`QR limit (high EC):    ${QR_LIMIT_H} bytes`)
console.log('')
console.log(`Fits in QR (low EC):   ${compBytes <= QR_LIMIT  ? '✅ YES' : '❌ NO'} (${compBytes} / ${QR_LIMIT} bytes)`)
console.log(`Fits in QR (high EC):  ${compBytes <= QR_LIMIT_H ? '✅ YES' : '❌ NO'} (${compBytes} / ${QR_LIMIT_H} bytes)`)
