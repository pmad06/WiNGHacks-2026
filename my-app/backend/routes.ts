import { Router } from "express";
import { User } from "./UserSchema";

const router = Router();

router.post("/users", async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json(user);
});

export default router;