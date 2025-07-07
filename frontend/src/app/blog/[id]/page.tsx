"use client";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  author_service,
  Blog,
  blog_service,
  useAppData,
  User,
} from "@/context/AppContext";
import axios from "axios";
import {
  Bookmark,
  BookmarkCheck,
  Edit,
  Trash2,
  Trash2Icon,
  User2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookie from "js-cookie";
import toast from "react-hot-toast";
import { headers } from "next/headers";

interface Comment {
  id: string;
  userid: string;
  comment: string;
  create_at: string;
  username: string;
}
const BlogPage = () => {
  const { isAuth, user, fetchBlogs, savedBlogs, getSavedBlogs } = useAppData();
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [authors, setAuthors] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);

  async function fetchComments() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${blog_service}/api/v1/comment/${id}`);
      setComments(data as any);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, [id]);

  async function addComment() {
    try {
      setLoading(true);
      const token = Cookie.get("token");
      const { data } = await axios.post(
        `${blog_service}/api/v1/comment/${id}`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success((data as any).message);
      setComment("");
      fetchComments();
    } catch (error) {
      toast.error("Problem while adding comment");
    } finally {
      setLoading(false);
    }
  }

  async function deleteComment(id: string) {
    if (confirm("Are you sure you want to delete this comment?")) {
      try {
        setLoading(true);
        const token = Cookie.get("token");
        const { data } = await axios.delete(
          `${blog_service}/api/v1/comment/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success((data as any).message);
        fetchComments();
      } catch (error) {
        toast.error("Problem while deleting comment");
      } finally {
        setLoading(false);
      }
    }
  }

  async function fetchSingleBlog() {
    setLoading(true);
    try {
      const { data } = await axios.get(`${blog_service}/api/v1/blog/${id}`);
      console.log("Single Blog Data:", data);
      setBlog((data as any).blog);
      setAuthors((data as any).author);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBlog() {
    if (confirm("Are you sure you want to delete this blog?")) {
      try {
        setLoading(true);
        const token = Cookie.get("token");
        const { data } = await axios.delete(
          `${author_service}/api/v1/blog/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success((data as any).message);
        router.push("/blogs");
        setTimeout(() => {
          fetchBlogs();
        }, 4000);
      } catch (error) {
        toast.error("Problem while deleting comment");
      } finally {
        setLoading(false);
      }
    }
  }

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (savedBlogs && savedBlogs.some((b) => b.blogid == id)) {
      setSaved(true);
    } else {
      setSaved(false);
    }
  }, [savedBlogs, id]);

  async function saveBlog() {
    const token = Cookie.get("token");
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${blog_service}/api/v1/save/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success((data as any).message);
      setSaved(!saved);
      getSavedBlogs();
    } catch (error) {
      toast.error("Problem while saving blog.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSingleBlog();
  }, [id]);

  if (!blog) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
          <p className="text-gray-600 mt-2 flex items-center">
            <Link
              href={`/profile/${(authors as any)?._id}`}
              className="flex items-center gap-2"
            >
              <img
                src={authors?.image}
                alt=""
                className="w-8 h-8 rounded-full"
              />
              {authors?.name}
            </Link>
            {isAuth && (
              <Button
                variant={"ghost"}
                className="mx-3"
                size={"lg"}
                onClick={saveBlog}
                disabled={loading}
              >
                {saved ? <BookmarkCheck /> : <Bookmark />}
              </Button>
            )}
            {blog.author == user?._id && (
              <div>
                <Button
                  size={"sm"}
                  onClick={() => router.push(`/blog/edit/${id}`)}
                >
                  <Edit />
                </Button>
                <Button
                  onClick={deleteBlog}
                  variant={"destructive"}
                  className="mx-2"
                  size={"sm"}
                  disabled={loading}
                >
                  <Trash2Icon />
                </Button>
              </div>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <p className="text-lg text-gray-700 mb-4">{blog.description}</p>
          <div
            className="prose max-w-none "
            dangerouslySetInnerHTML={{ __html: blog.blogcontent }}
          />
        </CardContent>
      </Card>
      {isAuth && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Leave a comment</h3>
          </CardHeader>
          <CardContent>
            <Label htmlFor="comment">Your Comment</Label>
            <Input
              id="comment"
              placeholder="Type your comment here"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="my-2"
            />
            <Button onClick={addComment} disabled={loading}>
              {loading ? "Adding Comment..." : "Post Comment"}
            </Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">All Comments</h3>
        </CardHeader>
        <CardContent>
          {comments && comments.length > 0 ? (
            comments.map((e, i) => {
              return (
                <div key={i} className="border-b py-2 flex items-center gap-3">
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      <span className="user border border-gray-200 rounded-full p-1">
                        <User2 />
                      </span>
                      {e?.username}
                    </p>
                    <p>{e.comment}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(e.create_at).toLocaleString()}
                    </p>
                  </div>
                  {e.userid === user?._id && (
                    <Button
                      onClick={() => deleteComment(e.id)}
                      variant={"destructive"}
                      disabled={loading}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              );
            })
          ) : (
            <p>No comments yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPage;
