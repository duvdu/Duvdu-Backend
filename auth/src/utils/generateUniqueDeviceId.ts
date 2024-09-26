import { UAParser } from 'ua-parser-js';

export function generateUniqueDeviceId(userAgent: string): string {
  const parser = new UAParser(userAgent);
  const { browser, device, os } = parser.getResult();

  const deviceFingerprint = {
    browserName: browser.name || '',
    browserVersion: browser.version || '',
    deviceModel: device.model || '',
    deviceType: device.type || '',
    osName: os.name || '',
    osVersion: os.version || '',
  };

  function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  const deviceId = `${deviceFingerprint.browserName}-${deviceFingerprint.browserVersion}-${deviceFingerprint.deviceModel}-${deviceFingerprint.deviceType}-${deviceFingerprint.osName}-${deviceFingerprint.osVersion}-${hashString(
    JSON.stringify(deviceFingerprint),
  )}`;
  return deviceId;
}
