import rateLimit from "express-rate-limit";
import {RedisStore} from "rate-limit-redis"
import { redisClient } from "../service/queue/gmailQueueExtracter.js";

const store = (prefix: any)=> new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix
})

export const loginLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TOO_MANY_ATTEMPTS" },
  store: store("rl:login:"),
  handler: (req, res) => {
    res.status(429).json({ error: "TOO_MANY_ATTEMPTS" });
  },
});

export const otpPerPhone = rateLimit({
  windowMs: 60 * 60_000,
  limit: 5,
  keyGenerator: (req) => req.body?.phone ?? req.body?.email?.toLowerCase() ??'',
  store: store('rl:otp:phone:'),
});

// layer 2: ek IP se kitne alag numbers
export const otpPerIp = rateLimit({
  windowMs: 60 * 60_000,
  limit: 15,
  store: store('rl:otp:ip:'),
});

// layer 3: verify attempts (brute force rokne ke liye)
export const otpVerify = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  keyGenerator: (req) => req.body?.phone ?? req.body?.email?.toLowerCase() ??'',
  store: store('rl:otp:verify:'),
});