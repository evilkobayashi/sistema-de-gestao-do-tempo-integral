import Redis from 'ioredis'

// ponytail: cliente Redis resiliente para Railway com fallback transparente se desconectado
const redisUrl = process.env.REDIS_URL || process.env.REDISURL

let redisClient: Redis | null = null

if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) return null // desiste sem travar a aplicação
        return Math.min(times * 200, 1000)
      },
    })

    redisClient.on('error', (err) => {
      console.warn('[Redis] Conexão indisponível, chave ignorada:', err.message)
    })
  } catch (err) {
    console.warn('[Redis] Não foi possível inicializar Redis:', err)
  }
}

export const redis = redisClient

/**
 * Função helper de cache em memória/Redis com fallback automático
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // ponytail: se o Redis não estiver configurado no Railway, busca direto da fonte sem erro
  if (!redis) return fetcher()

  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached) as T
    }
  } catch {
    // Ignora falha de leitura do Redis e continua para a fonte
  }

  const freshData = await fetcher()

  try {
    await redis.set(key, JSON.stringify(freshData), 'EX', ttlSeconds)
  } catch {
    // Ignora falha de gravação do Redis
  }

  return freshData
}
