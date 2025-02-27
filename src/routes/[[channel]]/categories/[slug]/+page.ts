export const ssr = false;

export const load = async (evt) => {
  return await evt.parent();
};
