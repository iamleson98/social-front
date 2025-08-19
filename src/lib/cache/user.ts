import type { User } from "$lib/gql/graphql";
import { Cache } from "./ttl-cache"
import { decode, encode } from '@msgpack/msgpack';
// import { decodeJWT } from "$lib/utils/jwt";


export const getUserByJWT = async (jwtToken: string) => {
  // const jwtObject = decodeJWT(jwtToken);

  if (Cache.has(jwtToken))
    return decode(Cache.get(jwtToken))

  return null;
};

export const setJwtWithUser = async (jwtToken: string, user: User) => {
  // const jwtObject = decodeJWT(jwtToken);

  return Cache.set(jwtToken, encode(user));
};
