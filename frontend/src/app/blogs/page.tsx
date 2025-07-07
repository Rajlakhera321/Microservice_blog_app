"use client";
import BlogCard from "@/components/blogCard";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppData } from "@/context/AppContext";
import { Filter } from "lucide-react";
import React from "react";

const Blogs = () => {
  const { toggleSidebar } = useSidebar();
  const { loading, blogLoading, blog } = useAppData();
  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center my-5">
            <h1 className="text-3xl font-bold">Latest Blogs</h1>
            <Button
              onClick={toggleSidebar}
              className="flex items-center gap-2 px-4 bg-primary text-white"
            >
              <Filter size={18} /> <span>Filter Blogs</span>
            </Button>
          </div>
          {blogLoading ? (
            <Loading />
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {blog?.length === 0 && <p>No Blogs Yet</p>}
              {blog &&
                blog.map((e, i) => {
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
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Blogs;
