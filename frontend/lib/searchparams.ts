import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger
} from 'nuqs/server';

/**
 * Base search params shared across data tables.
 * Extend per-module by spreading: { ...baseSearchParams, myField: parseAsString }
 */
export const baseSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10)
};

export const searchParamsCache = createSearchParamsCache(baseSearchParams);
export const serialize = createSerializer(baseSearchParams);
