"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useMemo, useRef, useState } from "react";
import Cookie from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import { author_service, useAppData } from "@/context/AppContext";

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
});

export const blogCategories = [
  "Technology",
  "Health",
  "Finance",
  "Travel",
  "Education",
  "Entertainment",
  "Study",
];

const BlogPage = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
    blogcontent: "",
  });

  const { fetchBlogs } = useAppData();

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: any) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("title", formData.title);
    formDataToSubmit.append("description", formData.description);
    formDataToSubmit.append("category", formData.category);
    formDataToSubmit.append("blogcontent", formData.blogcontent);

    if (formData.image) {
      formDataToSubmit.append("file", formData.image);
    }

    try {
      const token = Cookie.get("token");
      const { data } = await axios.post(
        `${author_service}/api/v1/blog/new`,
        formDataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success((data as any).message);
      setFormData({
        title: "",
        description: "",
        category: "",
        image: null,
        blogcontent: "",
      });
      setContent("");
      setTimeout(() => {
        fetchBlogs(); // Refresh the blog list after adding a new blog
      }, 4000);
    } catch (error) {
      toast.error("Error while adding blog");
    } finally {
      setLoading(false);
    }
  };

  const [aiTitle, setAiTitle] = useState(false);

  const aiTitleResponse = async () => {
    try {
      setAiTitle(true);
      const { data } = await axios.post(`${author_service}/api/v1/ai/title`, {
        text: formData.title,
      });

      setFormData({
        ...formData,
        title: typeof data === "string" ? data : "",
      });
    } catch (error) {
      toast.error("Problem while fetching from ai");
      console.log(error);
    } finally {
      setAiTitle(false);
    }
  };

  const [aiDescription, setAiDescription] = useState(false);

  const aiDescriptionResponse = async () => {
    try {
      setAiDescription(true);
      const { data } = await axios.post(
        `${author_service}/api/v1/ai/description`,
        {
          title: formData.title,
          description: formData.description,
        }
      );

      setFormData({
        ...formData,
        description: typeof data === "string" ? data : "",
      });
    } catch (error) {
      toast.error("Problem while fetching from ai");
      console.log(error);
    } finally {
      setAiDescription(false);
    }
  };

  const [aiBlogLoading, setAiBlogLoading] = useState(false);

  const aiBlogResponse = async () => {
    try {
      setAiBlogLoading(true);
      const { data } = await axios.post(`${author_service}/api/v1/ai/blog`, {
        blog: formData.blogcontent,
      });

      console.log(data, "response data from ai");
      setContent((data as any).html);

      setFormData({
        ...formData,
        blogcontent: (data as any).html,
      });
    } catch (error) {
      toast.error("Problem while fetching from ai");
      console.log(error);
    } finally {
      setAiBlogLoading(false);
    }
  };

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: "Start typings...",
    }),
    []
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Add New Blog</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Title</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="title"
                type="text"
                placeholder="Enter blog title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className={
                  aiTitle ? "animate-pulse placeholder:opacity-60" : ""
                }
              />
              {formData.title === "" ? (
                ""
              ) : (
                <Button
                  type="button"
                  onClick={aiTitleResponse}
                  disabled={aiTitle}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={aiTitle ? "animate-spin" : ""} />
                </Button>
              )}
            </div>
            <Label>Description</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="description"
                type="text"
                placeholder="Enter blog title"
                value={formData.description}
                onChange={handleInputChange}
                required
                className={
                  aiDescription ? "animate-pulse placeholder:opacity-60" : ""
                }
              />
              {formData.title === "" ? (
                ""
              ) : (
                <Button
                  type="button"
                  onClick={aiDescriptionResponse}
                  disabled={aiDescription}
                >
                  <RefreshCw className={aiDescription ? "animate-spin" : ""} />
                </Button>
              )}
            </div>
            <Label>Category</Label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={formData.category || "Select category"}
                />
              </SelectTrigger>
              <SelectContent>
                {blogCategories?.map((category, index) => (
                  <SelectItem key={index} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Label>Image Upload</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <div>
              <Label>Blog Content</Label>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
                  Paste your blog or type here. You can use rich text
                  formatting. Please add Image after imporving your grammer.
                </p>
                <Button
                  type="button"
                  size={"sm"}
                  onClick={aiBlogResponse}
                  disabled={aiBlogLoading}
                >
                  <RefreshCw
                    size={16}
                    className={aiBlogLoading ? "animate-spin" : ""}
                  />
                  <span className="ml-2">Fix Grammer</span>
                </Button>
              </div>
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={(newContent) => {
                  setContent(newContent);
                  setFormData({ ...formData, blogcontent: newContent });
                }}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPage;
