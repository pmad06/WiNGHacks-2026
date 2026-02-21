import { Router } from "express";
import { User } from "./UserSchema";

const router = Router();

router.post("/users", async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});


export default router;