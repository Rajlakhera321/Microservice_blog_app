"use client";
import { author_service, useAppData, User } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import Loading from "@/components/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useParams } from "next/navigation";
import axios from "axios";
import { user_service } from "../../../context/AppContext";

const UserProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);

  const { id } = useParams();

  async function fetchUser() {
    try {
      const { data } = await axios.get(`${user_service}/api/v1/user/${id}`);
      setUser(data as any);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (!user) {
    return <Loading />;
  }

  console.log("user data", user);
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-xl shadow-lg border roundered-2xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Profile Page</CardTitle>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="w-28 h-28 border-4 border-gray-200 shadow-md">
              <AvatarImage src={user?.image} alt="Profile pic" />
            </Avatar>
            <div className="w-full space-y-2 text-center">
              <label className="font-medium" htmlFor="">
                Name
              </label>
              <p>{user?.name}</p>
            </div>
            {user?.bio && (
              <div className="w-full space-y-2 text-center">
                <label className="font-medium" htmlFor="">
                  Bio
                </label>
                <p>{user?.bio}</p>
              </div>
            )}

            <div className="flex gap-4 mt-3">
              {user?.instagram && (
                <a
                  href={user.instagram}
                  target="blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="text-pink-500 text-2xl" />
                </a>
              )}
              {user?.facebook && (
                <a
                  href={user.facebook}
                  target="blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="text-blue-500 text-2xl" />
                </a>
              )}
              {user?.linkedIn && (
                <a
                  href={user?.linkedIn}
                  target="blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="text-pink-700 text-2xl" />
                </a>
              )}
            </div>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default UserProfilePage;
