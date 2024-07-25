import { H as HTTPStatusSuccess } from "../../chunks/consts.js";
const load = async () => {
  return {
    status: HTTPStatusSuccess,
    meta: {
      title: "Home",
      description: "Sitename web interface"
    }
  };
};
export {
  load
};
