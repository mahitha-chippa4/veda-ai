"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = getRedisClient;
exports.connectRedis = connectRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
let redisClient = null;
function getRedisClient() {
    if (!redisClient) {
        redisClient = new ioredis_1.default(config_1.config.redisUrl, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            lazyConnect: true,
        });
        redisClient.on('connect', () => console.log('✅ Redis connected'));
        redisClient.on('error', (err) => console.error('❌ Redis error:', err.message));
    }
    return redisClient;
}
async function connectRedis() {
    const client = getRedisClient();
    await client.connect().catch(() => { });
}
//# sourceMappingURL=client.js.map