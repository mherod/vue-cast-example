export async function waitForCast(): Promise<WindowCast> {
  return new Promise((resolve, reject) => {
    let interval: number;

    const checkCast = () => {
      const windowCast = window["cast"];
      if (windowCast && windowCast.framework) {
        interval && clearInterval(interval);
        resolve(windowCast);
        return true;
      }
      return false;
    };
    if (checkCast()) {
      return;
    }

    interval = setInterval(checkCast, 100);

    window["__onGCastApiAvailable"] = function(loaded, errorInfo) {
      if (loaded) {
        clearInterval(interval);
        const windowCast = window["cast"];
        resolve(windowCast);
      } else {
        clearInterval(interval);
        reject(errorInfo);
      }
    };
  });
}

// @ts-ignore
export type WindowCast = typeof window.cast;
