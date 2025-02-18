import consoleLogger from "pino";
import dayjs from "dayjs";

const isProduction = process.env.NODE_ENV === 'production';

const logger = consoleLogger({
  transport: isProduction
    ? undefined  
    : {
        target: 'pino-pretty',
        options: {
          colorize: true  
        }
      },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default logger;
