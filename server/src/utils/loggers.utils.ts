import winston from "winston";

const { errors, prettyPrint, combine, timestamp, colorize } = winston.format;

export const groupLogger = winston.createLogger({
  level: "info",
  format: combine(
    errors({ stack: true }),
    prettyPrint(),
    timestamp(),
    colorize({ all: true })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "group.log" }),
  ],
});
