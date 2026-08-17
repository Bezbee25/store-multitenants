import crypto from 'crypto';

let keyPair: { publicKey: string; privateKey: string; jwk: any } | null = null;

export function getOrCreateKeys() {
  if (keyPair) return keyPair;

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  const jwk = crypto.createPublicKey(publicKey).export({ format: 'jwk' });
  jwk.kid = 'store-multitenant-key';
  jwk.use = 'sig';
  jwk.alg = 'RS256';

  keyPair = { publicKey, privateKey, jwk };
  return keyPair;
}
