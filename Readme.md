To use the server you need to install the following dependencies:
- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)

After installing the dependencies, you need to install the project dependencies by running the following command in the project root directory:
```bash
npm install
```

To start the server, run the following command in the project root directory:
```bash
npm start
```

The server will be running on port 80 by default. You can change the port by setting the `PORT` environment variable.

## API
The server exposes the following API endpoints:

### GET /start-compile
Starts the compilation process. Returns subscription ID.

### GET /start-proxy
Starts the proxy process. Returns subscription ID.
response:
```js
{
    processID: string
    proxy_url: string
    url: string
}
```

### GET /stop-proxy
Stops the proxy process. 

### GET /processes
Returns a list of all running processes.

### GET /process 
Returns a process by ID. 

## UI Compilation
To compile the UI, run the following command in the project root directory:
```bash
 cd ui && npm install && npm run build
```

The compiled UI will be located in the `ui/build` directory.

## License
[MIT](https://choosealicense.com/licenses/mit/)
