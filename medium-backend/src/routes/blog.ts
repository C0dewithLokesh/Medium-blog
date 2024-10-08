import {
  createBlogInput,
  updateBlogInput,
} from "@c0dewithlokesh/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const autHeader = c.req.header("Authorization")?.split(" ")[1];
  if (!autHeader) c.json({ message: "Please Login first" }, 401);

  try {
    const user = await verify(autHeader!, c.env.JWT_SECRET);
    if (user && typeof user.id === "string") {
      c.set("userId", user.id);
      await next();
    } else {
      return c.json({ message: "Invalid user or You are not logged in" }, 403);
    }
  } catch (error) {
    console.error(error);
    return c.json({ message: "Failed to verify token" }, 403);
  }
});

blogRouter.post("/", async (c) => {
  const prisma = c.get("prisma" as never) as PrismaClient;
  const body = await c.req.json();
  const authorId = c.get("userId");

  const { success } = createBlogInput.safeParse(body);
  if (!success) return c.json({ message: "Inputs not correct" }, 400);

  try {
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        thumbnail: body.thumbnail,
        published: body.published,
        authorId: authorId,
      },
    });

    return c.json(
      {
        message: "Blog created",
        id: blog.id,
      },
      201
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: "Failed to create the blog!" }, 500);
  }
});

blogRouter.put("/", async (c) => {
  const prisma = c.get("prisma" as never) as PrismaClient;
  const body = await c.req.json();

  const { success } = updateBlogInput.safeParse(body);
  if (!success) return c.json({ message: "Inputs not correct" }, 400);

  try {
    const blog = await prisma.blog.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
        thumbnail: body.thumbnail,
        published: body.published,
      },
    });

    return c.json(
      {
        message: "Blog updated",
        id: blog.id,
      },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: "Failed to update the blog!" }, 404);
  }
});

blogRouter.get("/bulk", async (c) => {
  const prisma = c.get("prisma" as never) as PrismaClient;
  // Todo: Add Pagination
  try {
    const blogs = await prisma.blog.findMany();
    return c.json({ blogs: blogs }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Failed to fetch the blogs!" }, 500);
  }
});

blogRouter.get("/:id", async (c) => {
  const prisma = c.get("prisma" as never) as PrismaClient;

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: c.req.param("id"),
      },
    });

    if (blog) {
      return c.json({ blog: blog }, 200);
    } else {
      return c.json({ message: "Blog not found!" }, 404);
    }
  } catch (error) {
    console.error(error);
    return c.json({ message: "Failed to fetch the blog!" }, 500);
  }
});
