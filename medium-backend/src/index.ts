import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";
import { Hono } from "hono";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();

app.use("*", async (c, next) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  c.set("prisma" as never, prisma);
  await next();
});

app.post("/api/v1/user/signup", async (c) => {
  const prisma = c.get("prisma" as never) as PrismaClient;
  const body = await c.req.json();

  // Hashing the password before saving it
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(body.password, saltRounds);

  try {
    await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });
    return c.text("User signed up successfully!");
  } catch (error) {
    c.status(411);
    console.log(error);
    return c.text("User already exist with this username or email");
  }
});

app.post("/api/v1/user/signin", async (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/v1/blog", (c) => {
  return c.text("Hello Hono!");
});

app.put("/api/v1/blog", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/v1/blog:id", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/v1/blog/bulk", (c) => {
  return c.text("Hello Hono!");
});

export default app;
