/* eslint-disable import/no-named-as-default-member */
import FingerprintJS, { Agent, GetResult } from '@fingerprintjs/fingerprintjs';

export const generateBrowserFingerprint = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    FingerprintJS.load().then((fpAgent: Agent) => {
      fpAgent.get().then((result: GetResult) => {
        const components = result.components;

        if (typeof components === 'object' && components !== null) {
          const fingerprint = Object.values(components).join('');
          resolve(fingerprint);
        } else {
          reject(new Error('Invalid fingerprint components'));
        }
      }).catch(error => {
        reject(error);
      });
    }).catch(error => {
      console.error('FingerprintJS load error:', error);
      resolve(generatePostmanFingerprint());
    });
  });
};

const generatePostmanFingerprint = (): string => {
  return 'postman_fingerprint';
};
