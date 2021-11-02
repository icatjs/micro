import { register as registerSubapps, start as coreStart, use } from '@satumjs/core';
import singleSpaMidware from '@satumjs/midware-single-spa';
import sandboxMidware from '@satumjs/midware-sandbox';
import microCodeMidware from '@satumjs/midware-microcode';
import interceptorMidware from '@satumjs/midware-interceptor';
import cacheCodeMidware from '@satumjs/midware-cachecode';

type StartOptions = { [key: string]: any };

use(singleSpaMidware, { timeout: 5 * 60 * 1000 });
use(interceptorMidware);
use(cacheCodeMidware, { softCache: true });

use((system, microApps, next) => {
  system.set('proxyEntry', (entry: string | string[], appName: string) => {
    const proxyMap = {};
    const proxySetting = localStorage.getItem('ICATMICRO_DEBUG_CONFIG') || '';
    const proxyData = proxySetting.replace(/\s/g, '').split(',');
    proxyData.forEach((item) => {
      const [itemAppName, proxyUrl] = item.split('|');
      if (itemAppName && proxyUrl) proxyMap[itemAppName] = proxyUrl;
    });

    const currentApp = microApps.find((item) => item.name === appName);
    return currentApp && proxyMap[appName] ? proxyMap[appName] : entry;
  });
  next();
});

function start(options?: StartOptions) {
  const { processUrlOption, isVite, ...restOptions } = options || {};
  if (processUrlOption) {
    use((system, _, next) => {
      system.set('processUrlOption', processUrlOption);
      next();
    });
  }
  use(sandboxMidware, isVite ? undefined : { loose: true });
  use(microCodeMidware, isVite ? { simple: true, ableLocationProxy: true } : { simple: true });
  coreStart(restOptions);
}

export { registerSubapps, start };
