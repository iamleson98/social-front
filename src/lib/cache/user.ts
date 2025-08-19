import type { User } from "$lib/gql/graphql";
import { decodeJWT } from "$lib/utils/jwt";
import { pick } from "es-toolkit";
import { Cache } from "./lmdb"


export const getUserByJWT = async (jwtToken: string) => {
  const now = Date.now() / 1000;
  const tokenStructure = decodeJWT(jwtToken);

  // if token is expired, we must invalidate the cache.
  // And perform remote API call to get the uptodate jwt
  if (tokenStructure.exp <= now) {
    if (Cache.doesExist(jwtToken))
      await Cache.remove(jwtToken);

    return null;
  }

  return await Cache.get(jwtToken) as User;
};

export const setJwtWithUser = async (jwtToken: string, user: User) => {
  const minUser = pick(user, ['userPermissions', 'id', 'email', 'editableGroups', 'accessibleChannels'])
  return await Cache.put(jwtToken, minUser);
};
