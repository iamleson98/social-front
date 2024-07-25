import { H as HTTPStatusSuccess } from "../../../../chunks/consts.js";
const load = async () => {
  return {
    status: HTTPStatusSuccess
  };
};
const actions = {
  fetchCategoryList: async (event) => {
    event.params;
  }
};
export {
  actions,
  load
};
