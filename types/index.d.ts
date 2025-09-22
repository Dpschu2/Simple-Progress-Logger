// TypeScript declarations for dean-progress-logger
// Generated from JSDoc in src/logger.js

export interface LoggerOptions {
    message?: string;
    total?: number | null;
    value?: number;
    showProgressBar?: boolean;
    showLoadingAnimation?: boolean;
    showEta?: boolean;
    barLength?: number;
    updateThrottle?: number;
    showAvgTimePerItem?: boolean;
    fullCharacter?: string;
    emptyCharacter?: string;
    displayMessageFirst?: boolean;
}

export class Logger {
    constructor(options?: LoggerOptions);
    message: string;
    value: number;
    total: number | null;
    update(message?: string, value?: number | null): this;
    increment(): this;
    stop(endMessage?: string): void;
}

export default Logger;
