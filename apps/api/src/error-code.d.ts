import type { COMMON_ERROR_STATUS_MAP } from '@orpc/server'
import type { ErrorCode } from '@qingshaner/contract'

declare module '@orpc/server' {
  interface Registry {
    // biome-ignore lint/style/useNamingConvention: orpc lib
    ORPCErrorCode: keyof typeof COMMON_ERROR_STATUS_MAP | ErrorCode | (string & {})
  }
}
