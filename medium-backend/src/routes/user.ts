import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const prisma = c.get("prisma" as never) as PrismaClient;
  const body = await c.req.json();

  // Hashing the password before saving it
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(body.password, saltRounds);

  try {
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json(
      {
        message: "User signed up successfully!",
        token: jwt,
      },
      200
    );
  } catch (error) {
    console.log(error);
    return c.text("User already exist with this username or email", 411);
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = c.get("prisma" as never) as PrismaClient;
  const body = await c.req.json();
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      return c.json({ message: "User not found with this email" }, 404);
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      return c.json({ message: "Invalid email or password" }, 401);
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json({
      message: "User signed in successfully!",
      token: jwt,
    });
  } catch (error) {
    console.log(error);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});
