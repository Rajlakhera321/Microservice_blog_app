import axios from "axios";
import { sql } from "../utils/db.js";
import TryCatch from "../utils/tryCatch.js";
import { redisClient } from "../server.js";
import { AuthenticatedRequest } from "../middelware/isAuth.js";

export const getAllBlogs = TryCatch(async (req, res) => {
  const { searchQuery = "", category = "" } = req.query;

  const cacheKey = `blogs:${searchQuery}:${category}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    console.log("Serving from Redis cache");
    res.json(JSON.parse(cached));
    return;
  }
  let blogs;

  if (searchQuery && category) {
    blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${
      "%" + searchQuery + "%"
    } OR description ILIKE ${
      "%" + searchQuery + "%"
    }) AND category = ${category} ORDER BY create_at DESC`;
  } else if (searchQuery) {
    blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${
      "%" + searchQuery + "%"
    } OR description ILIKE ${"%" + searchQuery + "%"}) ORDER BY create_at DESC`;
  } else if (category) {
    blogs =
      await sql`SELECT * FROM blogs WHERE category=${category} ORDER BY create_at DESC`;
  } else {
    blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;
  }

  console.log("Serving from db");

  await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });

  res.json(blogs);
});

export const getSingleBlog = TryCatch(async (req, res) => {
  const { id } = req.params;

  const cacheKey = `blogs:blogId-${id}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    console.log("Serving single blog from redis cache.");
    res.status(200).json(JSON.parse(cached));
    return;
  }

  const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

  if (!blog[0]) {
    res.status(404).json({
      message: "No blog found.",
    });
    return;
  }

  const { data } = await axios.get(
    `${process.env.USER_SERVICE}/api/v1/user/${blog[0].author}`
  );

  console.log("Serving from DB.");

  const responseData = { blog: blog[0], author: data };

  await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });

  res.status(200).json(responseData);
});

export const addComment = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id: blogId } = req.params;
  const { comment } = req.body;

  await sql`INSERT INTO comments (comment, blogid, userid, username) VALUES (${comment}, ${blogId}, ${req.user?._id}, ${req.user?.name}) RETURNING *`;

  res.json({
    message: "Comment Added.",
  });
});

export const getAllComments = TryCatch(async (req, res) => {
  const { id } = req.params;

  const comments =
    await sql`SELECT * FROM comments WHERE blogid = ${id} ORDER BY create_at DESC`;

  res.json(comments);
});

export const deleteComment = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { commentId } = req.params;

    const comment = await sql`SELECT * FROM comments WHERE id = ${commentId}`;

    if (comment[0].userid !== req.user?._id) {
      res.status(401).json({
        message: "You are not owner of this comment.",
      });
      return;
    }

    await sql`DELETE FROM comments WHERE id = ${commentId}`;

    res.json({
      message: "Comment Deleted",
    });
  }
);

export const saveBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { blogId } = req.params;
  const userId = req.user?._id;

  if (!blogId || !userId) {
    res.status(400).json({
      message: "Missing blog id or user id",
    });
    return;
  }

  const existing =
    await sql`SELECT * FROM savedblogs WHERE userid = ${userId} AND blogid = ${blogId}`;

  if (existing.length === 0) {
    await sql`INSERT INTO savedblogs (blogid, userid) VALUES (${blogId}, ${userId})`;

    res.json({
      message: "Blog saved",
    });
  } else {
    await sql`DELETE FROM savedblogs WHERE userid = ${userId} AND blogid = ${blogId}`;

    res.json({
      message: "Blog Unsaved.",
    });
    return;
  }
});

export const savedBlogs = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;

  const blogs = await sql`SELECT * FROM savedblogs WHERE userid = ${userId}`;

  res.json(blogs);
});
