import { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../util/datauri.js";
import { sql } from "../util/db.js";
import { invalidateChacheJob } from "../util/rabbitmq.js";
import TryCatch from "../util/tryCatch.js";
import cloudinary from "cloudinary";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const createBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;

  if (!file) {
    res.status(400).json({
      message: "No file to upload.",
    });
    return;
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    res.status(400).json({
      message: "Failed to generate buffer.",
    });
    return;
  }

  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
    folder: "blogs",
  });

  const result =
    await sql`INSERT INTO blogs (title, description, blogcontent, category, image, author) VALUES (${title}, ${description}, ${blogcontent}, ${category}, ${cloud.secure_url}, ${req?.user?._id}) RETURNING *`;

  await invalidateChacheJob(["blogs:*"]);

  res.status(201).json({
    message: "Blog created",
    blogs: result[0],
  });
});

export const updateBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;

  const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

  if (!blog.length) {
    res.status(404).json({
      message: "No blog with this id.",
    });
    return;
  }

  if (blog[0].author != req.user?._id) {
    res.status(401).json({
      message: "You are not author of this blog.",
    });
    return;
  }

  let imageUrl = blog[0].image;

  if (file) {
    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({
        message: "Failed to generate buffer.",
      });
      return;
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });

    imageUrl = cloud.secure_url;
  }

  const updateBlog = await sql`UPDATE blogs SET 
    title = ${title || blog[0].title},
    description = ${description || blog[0].description},
    image = ${imageUrl},
    blogcontent = ${blogcontent || blog[0].blogcontent},
    category = ${category || blog[0].category}

    WHERE id = ${id}
    RETURNING *
    `;

  await invalidateChacheJob(["blogs:*", `blog:${id}`]);

  res.status(200).json({
    message: "Blog updated",
    blogs: updateBlog[0],
  });
});

export const deleteBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

  if (!blog.length) {
    res.status(404).json({
      message: "No blog with this id.",
    });
    return;
  }

  if (blog[0].author != req.user?._id) {
    res.status(401).json({
      message: "You are not author of this blog.",
    });
    return;
  }

  await sql`DELETE FROM savedblogs WHERE blogid = ${id}`;
  await sql`DELETE FROM comments WHERE blogid = ${id}`;
  await sql`DELETE FROM blogs WHERE id = ${id}`;

  await invalidateChacheJob(["blogs:*", `blog:${id}`]);

  res.status(200).json({
    message: "Blog deleted",
  });
});

export const aiTitleResponse = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { text } = req.body;

    const prompt = `Correct the grammar of the following blog title and return only the corrected title without any additional text, formatting, or symbols: "${text}"`;

    let result;

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GEMINI_KEY as string,
    });

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      let rawtext = response.text;

      if (!rawtext) {
        res.status(400).json({
          message: "Something went wrong.",
        });
        return;
      }

      result = rawtext
        .replace(/\*\*/g, "")
        .replace(/[\r\n]+/g, "")
        .replace(/[*_`~`]/g, "")
        .trim();
    }

    await main();

    res.status(200).json(result);
  }
);

export const aiDescriptionResponse = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { title, description } = req.body;

    const prompt =
      description === ""
        ? `Generate only one short blog description based on
this title: "${title}". Your response must be only one sentence, strictly under 30 words, with no options, no
greetings, and no extra text. Do not explain. Do not say 'here is'. Just return the description only.`
        : `Fix the
grammar in the following blog description and return only the corrected sentence. Do not add anything else:
"${description}"`;

    let result;

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GEMINI_KEY as string,
    });

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      let rawtext = response.text;

      if (!rawtext) {
        res.status(400).json({
          message: "Something went wrong.",
        });
        return;
      }

      result = rawtext
        .replace(/\*\*/g, "")
        .replace(/[\r\n]+/g, "")
        .replace(/[*_`~`]/g, "")
        .trim();
    }

    await main();

    res.status(200).json(result);
  }
);

export const aiBlogResponse = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const prompt = ` You will act as a grammar correction engine. I will provide you with blog content in rich HTML format (from Jodit Editor). Do not generate or rewrite the content with new ideas. Only correct grammatical, punctuation, and spelling errors while preserving all HTML tags and formatting. Maintain inline styles, image tags, line breaks, and structural tags exactly as they are. Return the full corrected HTML string as output. `;

    const { blog } = req.body;

    if (!blog) {
      res.status(400).json({
        message: "Please provide blog",
      });
      return;
    }

    const fullMessage = `${prompt}\n\n${blog}`;

    const ai = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY as string);

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: fullMessage }],
        },
      ],
    });

    const responseText = await result.response.text();

    const cleanedHtml = responseText
      .replace(/^(html|```html|```)\n?/i, "")
      .replace(/```$/i, "")
      .replace(/\*\*/g, "")
      .replace(/[\r\n]+/g, "")
      .replace(/[*_`~]/g, "")
      .trim();

    res.status(200).json({ html: cleanedHtml });
  }
);
