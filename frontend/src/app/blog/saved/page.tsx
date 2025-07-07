"use client";
import BlogCard from "@/components/blogCard";
import Loading from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import React from "react";

const SavedBlogs = () => {
  const { blog, savedBlogs } = useAppData();

  if (!blog || !savedBlogs) {
    return <Loading />;
  }

  const filteredBlogs = blog.filter((blog) =>
    savedBlogs.some((saved) => saved.blogid == (blog as any).id?.toString())
  );

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mt-2">Saved Blogs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((e, i) => {
            return (
              <BlogCard
                key={i}
                image={e.image}
                title={e.title}
                desc={e.description}
                id={(e as any).id}
                time={e.create_at}
              />
            );
          })
        ) : (
          <p>No saved blog yet</p>
        )}
      </div>
    </div>
  );
};

export default SavedBlogs;
