const os = require('os');

const interfaces = os.networkInterfaces();

export const getLocalIp = () => {
  let localIp = "";
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // console.log(iface.address);
        localIp = iface.address;
      }
    }
  }
  return localIp;
};