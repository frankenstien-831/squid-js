export enum LogLevel {
    None = -1,
    Error = 0,
    Warn = 1,
    Log = 2,
    Verbose = 3,
}

export default class Logger {
    private static logLevel: LogLevel = LogLevel.Verbose

    public static setLevel(level: LogLevel) {
        this.logLevel = level
    }

    public static debug(...args: any[]) {
        Logger.dispatch("debug", LogLevel.Verbose, ...args)
    }

    public static log(...args: any[]) {
        Logger.dispatch("log", LogLevel.Log, ...args)
    }

    public static warn(...args: any[]) {
        Logger.dispatch("warn", LogLevel.Warn, ...args)
    }

    public static error(...args: any[]) {
        Logger.dispatch("error", LogLevel.Error, ...args)
    }

    private static dispatch(verb: string, level: LogLevel, ...args: any[]) {
        if (this.logLevel >= level) {
            console[verb](...args)
        }
    }
}
