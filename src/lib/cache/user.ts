import type { User } from '$lib/gql/graphql';
import { decodeJWT } from '$lib/utils/jwt';
import { readCache, writeCache } from './ttl-cache';

export const getUserByJWT = async (jwtToken: string) => {
	const jwtObject = decodeJWT(jwtToken);
	return await readCache<User>(jwtObject.user_id);
};

export const setJwtWithUser = async (jwtToken: string, user: User) => {
	const jwtObject = decodeJWT(jwtToken);
	await writeCache(jwtObject.user_id, user);
};
