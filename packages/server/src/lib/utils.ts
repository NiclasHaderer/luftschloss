import { Router } from "./router";

export const getRootRouter = (router: Router): Router => {
  let parent: Router = router;

  while (parent) {
    if (!parent.parentRouter) break;
    parent = parent.parentRouter;
  }

  return parent;
};
