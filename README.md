# dean-progress-logger

A tiny, dependency-free (runtime) terminal progress logger with determinate bars, indeterminate loading animation, and ETA display — extracted from the user's custom implementation and packaged for npm.

## Install

    npm i dean-progress-logger

## Usage (CommonJS)

    const { Logger } = require('dean-progress-logger');

    async function demo() {
        const total = 50;
        const log = new Logger({ message: 'Processing items…', total, barLength: 20 });
        for (let i = 0; i <= total; i++) {
            log.update('Crunching…', i);
            await new Promise(r => setTimeout(r, 40));
        }
        log.stop('Done!');
    }

    demo();

## Usage (ESM)

    import { Logger } from 'dean-progress-logger';

    const total = 10;
    const log = new Logger({ message: 'Indexing…', total });
    let i = 0;
    const interval = setInterval(() => {
        i++;
        log.increment();
        if (i >= total) {
            clearInterval(interval);
            log.stop('Complete');
        }
    }, 100);

## API

### `new Logger(options?)`

**Options**

- `message` (string): Label to show next to the bar/animation. Default `''`.
- `total` (number|null): Total units for determinate mode. If `null`, runs indeterminate animation. Default `null`.
- `value` (number): Initial progress value. Default `0`.
- `showProgressBar` (boolean): Show determinate bar. Default `true`.
- `showLoadingAnimation` (boolean): Show indeterminate animation. Default `true`.
- `showEta` (boolean): Show ETA (only in determinate). Default `true`.
- `barLength` (number): Bar/animation width (chars). Default `10`.
- `updateThrottle` (number): Refresh interval (ms). Default `50`.
- `showAvgTimePerItem` (boolean): Append average seconds/item on stop. Default `false`.
- `fullCharacter` (string): Filled bar character. Default `\u2588`.
- `emptyCharacter` (string): Empty bar character. Default `\u2591`.
- `displayMessageFirst` (boolean): Put message before bar. Default `false`.

**Methods**

- `update(message?: string, value?: number|null): this` — Update message and/or value.
- `increment(): this` — Increment value by 1.
- `stop(endMessage?: string): void` — Stop the logger and restore console output.

## Notes

- Console methods (`log`, `warn`, `error`) are temporarily intercepted during determinate progress to keep the bar pinned while printing messages, then restored on `stop()`.
- Works in Node.js ≥ 16.

## License

MIT © 2025 Dean Schulz
