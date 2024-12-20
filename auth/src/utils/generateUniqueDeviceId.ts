import UAParser from 'ua-parser-js';
import { v5 as uuidv5 } from 'uuid';

export enum Platform {
  unknown = 'unknown',
  ios = 'ios',
  android = 'android',
  web = 'web',
}

const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

const getPlatform = (osName: string | undefined): Platform => {
  if (!osName) return Platform.unknown;

  const normalizedOS = osName.toLowerCase();

  if (
    normalizedOS.includes('ios') ||
    normalizedOS.includes('iphone') ||
    normalizedOS.includes('ipad')
  ) {
    return Platform.ios;
  }
  if (normalizedOS.includes('android')) {
    return Platform.android;
  }
  if (
    normalizedOS.includes('windows') ||
    normalizedOS.includes('mac') ||
    normalizedOS.includes('linux')
  ) {
    return Platform.web;
  }

  return Platform.unknown;
};

export const generateUniqueDeviceId = (headers: any): { deviceId: string; deviceInfo: any } => {
  // Check if request is from mobile app by looking for custom headers
  const isMobileApp = headers['x-app-version'] || headers['x-platform'];
  console.log(isMobileApp);
  console.log(headers['user-agent']);

  let deviceInfo;

  if (isMobileApp) {
    // Handle mobile app request
    deviceInfo = {
      deviceId: uuidv5(headers['x-device-id'] || JSON.stringify(headers), NAMESPACE),
      deviceName: headers['x-device-manufacturer'] || 'Unknown',
      deviceModel: headers['x-device-model'] || 'Unknown',
      platform: headers['x-platform'] ? getPlatform(headers['x-platform']) : Platform.unknown,
      browserName: 'Mobile App',
      browserVersion: headers['x-app-version'] || 'Unknown',
      osVersion: headers['x-os-version'] || 'Unknown',
      ipAddress: headers['x-forwarded-for'] || headers['x-real-ip'] || 'Unknown',
      lastUsedAt: new Date(),
    };
  } else {
    // Browser request handling
    const ua = new UAParser(headers['user-agent']);
    const device = ua.getDevice();
    const cpu = ua.getCPU();
    const os = ua.getOS();
    const browser = ua.getBrowser();

    const deviceData = {
      // Hardware identifiers (highest priority)
      deviceModel: device.model || '',
      deviceVendor: device.vendor || '',
      cpuArchitecture: cpu.architecture || '',
      hardwareConcurrency: headers['x-cpu-cores'] || '',
      deviceMemory: headers['x-device-memory'] || '',
      webglRenderer: headers['x-webgl-renderer'] || '',
      screenResolution: headers['x-screen-resolution'] || '',

      // OS level (secondary priority)
      osName: os.name || '',
      osVersion: os.version || '',

      // Browser level (lowest priority)
      browserName: browser.name || '',
      browserVersion: browser.version || '',
      userAgent: headers['user-agent'] || '',
    };

    const deviceId = uuidv5(JSON.stringify(deviceData), NAMESPACE);

    deviceInfo = {
      deviceId,
      deviceName: device.vendor || 'Unknown',
      deviceModel: device.model || 'Unknown',
      platform: getPlatform(os.name),
      browserName: browser.name || 'Unknown',
      browserVersion: browser.version || 'Unknown',
      osVersion: os.version || 'Unknown',
      ipAddress: headers['x-forwarded-for'] || headers['x-real-ip'] || 'Unknown',
      lastUsedAt: new Date(),
    };
  }

  return { deviceId: deviceInfo.deviceId, deviceInfo };
};
