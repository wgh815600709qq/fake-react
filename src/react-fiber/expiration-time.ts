// Math.pow(2, 30) - 1
export const MAX_SIGNED_31_BIT_INT = 1073741823

type ExpirationTime = number

const NoWork = 0
const Never = 1
const Sync = MAX_SIGNED_31_BIT_INT

const UNIT_SIZE = 10
const MAGIC_NUMBER_OFFSET = MAX_SIGNED_31_BIT_INT - 1

function ceiling(num: number, precision: number): number {
  return (((num / precision) | 0) + 1) * precision
}

// 过期时间转优先级
function msToExpirationTime(ms: number): ExpirationTime {
  return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0)
}

function expirationTimeToMS(expirationTime: ExpirationTime): number {
  return (MAX_SIGNED_31_BIT_INT - expirationTime) * UNIT_SIZE
}

// 优先级转过期时间
function computeExpirationBucket(
  currentTime: ExpirationTime,
  expirationInMs: number,
  bucketSizeMs: number): ExpirationTime {
  return (
    MAGIC_NUMBER_OFFSET -
    ceiling(
      MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE,
      bucketSizeMs / UNIT_SIZE,
    )
  )
}

// 向后 5000ms，抹平250ms的误差
function computeAsyncExpiration(currentTime: ExpirationTime): ExpirationTime {
  return computeExpirationBucket(currentTime, 5000, 250)
}

// 向后 150 ms ,抹平100ms内误差
function computeInteractiveExpiration(currentTime: ExpirationTime): ExpirationTime {
  return computeExpirationBucket(currentTime, 150, 100)
}

export {
  ExpirationTime,
  NoWork,
  Never,
  Sync,
  msToExpirationTime,
  expirationTimeToMS,
  computeAsyncExpiration,
  computeInteractiveExpiration,
}
