import { register as registerSubapps, start as coreStart, use } from '@satumjs/core';
import singleSpaMidware from '@satumjs/midware-single-spa';
import sandboxMidware from '@satumjs/midware-sandbox';
import microCodeMidware from '@satumjs/midware-microcode';
import interceptorMidware from '@satumjs/midware-interceptor';

type StartOptions = { [key: string]: any };

use(singleSpaMidware, { timeout: 5 * 60 * 1000 });
use(sandboxMidware, { loose: true });
use(microCodeMidware);
use(interceptorMidware);

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
  const { processUrlOption, ...restOptions } = options || {};
  if (processUrlOption) {
    use((system, _, next) => {
      system.set('processUrlOption', processUrlOption);
      next();
    });
  }
  coreStart(restOptions);
}

export { registerSubapps, start };
