"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var child_process_1 = require("child_process");
var node_cron_1 = require("node-cron");
var apiRouter = (0, express_1.Router)();
var initPort = 4173;
var scriptProcess;
apiRouter.get('/start-compile', function (req, res) {
    var process = (0, child_process_1.spawn)('sh', ['/home/X/ui-server/compile.sh']);
    process.stdout.on('data', function (data) {
        console.log("stdout: ".concat(data));
    });
    process.stderr.on('data', function (data) {
        console.log("stderr: ".concat(data));
        if (data.includes('Compilation done')) {
            res.send('Compilation done');
        }
    });
});
apiRouter.post('/start-proxy', function (req, res) {
    var payload = req.body;
    var url = payload.url;
    console.log("Proxy URL : ", url);
    scriptProcess = (0, child_process_1.exec)("/home/X/ui-server/run_preview.sh ".concat(url), function (error, stdout, stderr) {
        scriptProcess = null;
        if (error) {
            console.error("Error executing script: ".concat(error));
            return res.status(500).send('Internal Server Error');
        }
        console.log("Script output: ".concat(stdout));
        return res.send({ output: stdout });
    });
    res.send({
        processID: scriptProcess.pid,
        proxy_url: scriptProcess.spawnargs[2].split(' ')[1],
        url: "http://ui-tester.h9.pentagonlab.com:".concat(initPort)
    });
});
apiRouter.get('/stop-proxy', function (req, res) {
    // Check if the script is running
    if (!scriptProcess) {
        return res.status(400).send('Script is not running');
    }
    // Terminate the script process
    scriptProcess.kill();
    (0, child_process_1.exec)('pkill -f orch-ui', function (error, stdout, stderr) {
        if (error) {
            console.error("Error stopping script: ".concat(error));
            return res.status(500).send('Internal Server Error');
        }
        console.log("Script Stopped.");
    });
    return res.status(201).send('Script stopped');
});
apiRouter.get('/processes', function (req, res) {
    (0, child_process_1.exec)('ps ux', function (error, stdout, stderr) {
        if (error) {
            console.error("Error retrieving processes: ".concat(error));
            return res.status(500).send('Internal Server Error');
        }
        var processes = stdout.split('\n').slice(1).map(function (line) {
            var _a = line.split(/\s+/), user = _a[0], pid = _a[1], cpu = _a[2], mem = _a[3], vsz = _a[4], rss = _a[5], tty = _a[6], stat = _a[7], start = _a[8], time = _a[9], command = _a[10];
            return { user: user, pid: pid, cpu: cpu, mem: mem, vsz: vsz, rss: rss, tty: tty, stat: stat, start: start, time: time, command: command };
        });
        return res.send({ processes: processes });
    });
});
apiRouter.get('/process', function (req, res) {
    res.send([
        {
            processID: scriptProcess === null || scriptProcess === void 0 ? void 0 : scriptProcess.pid,
            proxy_url: scriptProcess === null || scriptProcess === void 0 ? void 0 : scriptProcess.spawnargs[2].split(' ')[1],
            url: (scriptProcess === null || scriptProcess === void 0 ? void 0 : scriptProcess.pid) ? "http://ui-tester.h9.pentagonlab.com:".concat(initPort) : null
        }
    ]);
});
node_cron_1.default.schedule("0 */1 * * *", function (x) {
    console.log('Scheduled Compile at', x, Date());
    (0, child_process_1.exec)('/home/X/ui-server/compile.sh >> /home/X/ui-server/compile.log 2>&1');
}, {
    timezone: "Asia/Kolkata"
});
exports.default = apiRouter;
