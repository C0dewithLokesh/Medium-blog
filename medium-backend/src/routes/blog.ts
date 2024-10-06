import { Hono } from "hono";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

blogRouter.post("/blog", (c) => {
  return c.text("Hello Hono!");
});

blogRouter.put("/blog", (c) => {
  return c.text("Hello Hono!");
});

blogRouter.get("/blog:id", (c) => {
  return c.text("Hello Hono!");
});

blogRouter.get("/blog/bulk", (c) => {
  return c.text("Hello Hono!");
});
