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
import React, { useEffect, useMemo, useRef, useState } from "react";
import Cookie from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import { author_service, blog_service, useAppData } from "@/context/AppContext";
import { useParams, useRouter } from "next/navigation";

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

const EditBlogPage = () => {
  const editor = useRef(null);
  const { id } = useParams();
  const router = useRouter();
  const { fetchBlogs } = useAppData();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
    blogcontent: "",
  });

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

  // const aiTitleResponse = async () => {
  //   try {
  //     setAiTitle(true);
  //     const { data } = await axios.post(`${author_service}/api/v1/ai/title`, {
  //       text: formData.title,
  //     });

  //     setFormData({
  //       ...formData,
  //       title: typeof data === "string" ? data : "",
  //     });
  //   } catch (error) {
  //     toast.error("Problem while fetching from ai");
  //     console.log(error);
  //   } finally {
  //     setAiTitle(false);
  //   }
  // };

  // const [aiDescription, setAiDescription] = useState(false);

  // const aiDescriptionResponse = async () => {
  //   try {
  //     setAiDescription(true);
  //     const { data } = await axios.post(
  //       `${author_service}/api/v1/ai/description`,
  //       {
  //         title: formData.title,
  //         description: formData.description,
  //       }
  //     );

  //     setFormData({
  //       ...formData,
  //       description: typeof data === "string" ? data : "",
  //     });
  //   } catch (error) {
  //     toast.error("Problem while fetching from ai");
  //     console.log(error);
  //   } finally {
  //     setAiDescription(false);
  //   }
  // };

  // const [aiBlogLoading, setAiBlogLoading] = useState(false);

  // const aiBlogResponse = async () => {
  //   try {
  //     setAiBlogLoading(true);
  //     const { data } = await axios.post(`${author_service}/api/v1/ai/blog`, {
  //       blog: formData.blogcontent,
  //     });

  //     console.log(data, "response data from ai");
  //     setContent((data as any).html);

  //     setFormData({
  //       ...formData,
  //       blogcontent: (data as any).html,
  //     });
  //   } catch (error) {
  //     toast.error("Problem while fetching from ai");
  //     console.log(error);
  //   } finally {
  //     setAiBlogLoading(false);
  //   }
  // };

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: "Start typings...",
    }),
    []
  );

  const [existingImage, setExistingImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${blog_service}/api/v1/blog/${id}`);
        const blog = (data as any).blog;
        setFormData({
          title: blog.title,
          description: blog.description,
          category: blog.category,
          image: null,
          blogcontent: blog.blogcontent,
        });
        setContent(blog.blogcontent);
        setExistingImage(blog.image);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

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
      const { data } = await axios.put(
        `${author_service}/api/v1/blog/${id}`,
        formDataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success((data as any).message);
      fetchBlogs(); // Refresh the blog list after editing a blog
      router.push(`/blog/${id}`);
    } catch (error) {
      toast.error("Error while adding blog");
    } finally {
      setLoading(false);
    }
  };

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
              />
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
              />
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
              {existingImage && !formData.image && (
                <img
                  src={existingImage}
                  alt=""
                  className="w-40 h-40 object-cover rounded mb-2"
                />
              )}
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <div>
              <Label>Blog Content</Label>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
                  Paste your blog or type here. You can use rich text
                  formatting. Please add Image after imporving your grammer.
                </p>
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

export default EditBlogPage;
