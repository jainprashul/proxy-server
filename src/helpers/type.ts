import { ChildProcess } from "child_process";

export type NodeProcess = { 
    process: ChildProcess | null;
    proxy_url: string | null;
    url: string | null;
    compiling: boolean;
    processID: string;
}