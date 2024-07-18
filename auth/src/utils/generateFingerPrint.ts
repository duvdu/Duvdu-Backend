
/* eslint-disable import/no-named-as-default-member */
import FingerprintJS, { Agent, GetResult, Component } from '@fingerprintjs/fingerprintjs';


export const generateBrowserFingerprint = async (): Promise<string> => {
  try {
    const fpAgent: Agent = await FingerprintJS.load();
    const result: GetResult = await fpAgent.get();
    const components = result.components;

    if (typeof components === 'object' && components !== null) {
      // Serialize the components in a consistent manner
      const fingerprint = Object.values(components).map((component: Component<unknown>) => {
        if ('value' in component) {
          return component.value;
        }
        return 'error';
      }).join('-');
      return fingerprint;
    } else {
      throw new Error('Invalid fingerprint components');
    }
  } catch (error) {
    console.error('FingerprintJS error:', error);
    return generatePostmanFingerprint();
  }
};

const generatePostmanFingerprint = (): string => {
  return 'postman_fingerprint';
};