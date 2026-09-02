import express from "express";

import { resolveLinkShare} from "../controller/publicshare.controller.js";

const router = express.Router();

router.get(
  "/:token",

  resolveLinkShare
);

export default router;