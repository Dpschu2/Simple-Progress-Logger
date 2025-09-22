// ES Module entry: re-export Logger class
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Logger } = require('./src/logger.js');
export { Logger };
export default Logger;
