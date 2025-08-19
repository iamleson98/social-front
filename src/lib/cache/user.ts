import type { User } from "$lib/gql/graphql";
import { Cache } from "./ttl-cache"
import { decode, encode } from '@msgpack/msgpack';
import { decodeJWT } from "$lib/utils/jwt";


export const getUserByJWT = async (jwtToken: string) => {
  const jwtObject = decodeJWT(jwtToken);

  if (Cache.has(jwtObject.user_id))
    return decode(Cache.get(jwtObject.user_id))

  return null;
};

export const setJwtWithUser = async (jwtToken: string, user: User) => {
  const jwtObject = decodeJWT(jwtToken);

  return Cache.set(jwtObject.user_id, encode(user));
};
