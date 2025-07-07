"use client";
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppData, user_service } from '@/context/AppContext';
import React, { useRef, useState } from 'react'
import Cookie from 'js-cookie';
import toast from 'react-hot-toast';
import Loading from '@/components/loading';
import axios from 'axios';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { redirect, useRouter } from 'next/navigation';

const ProfilePage = () => {
    const { user, setUser, logoutUser } = useAppData();

    if (!user) return redirect('/login');

    const logoutHandler = async () => {
        logoutUser();
    }
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        instagram: user?.instagram || '',
        facebook: user?.facebook || '',
        linkedIn: user?.linkedIn || ''
    });

    const clickHandler = () => {
        inputRef.current?.click();
    }

    const changeHandler = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();

            formData.append('file', file);
            try {
                setLoading(true);
                const token = Cookie.get('token');
                const { data } = await axios.put(
                    `${user_service}/api/v1/user/updateProfile`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.success((data as any).message);
                setLoading(false);
                Cookie.set("token", (data as any).token, {
                    expires: 5,
                    secure: true,
                    path: '/'
                });
                setUser((data as any).user);
            } catch (error: any) {
                toast.error("Image Updated Failed.")
                setLoading(false);
            }
        }
    }

    const handleFormSubmit = async (e: any) => {
        try {
            setLoading(true);
            const token = Cookie.get('token');
            const { data } = await axios.put(
                `${user_service}/api/v1/user/update`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success((data as any).message);
            setLoading(false);
            Cookie.set("token", (data as any).token, {
                expires: 5,
                secure: true,
                path: '/'
            });
            setUser((data as any).user);
            setOpen(false);
        } catch (error: any) {
            toast.error("Update Failed.")
            setLoading(false);
        }
    }

    return (
        <div className='flex justify-center items-center min-h-screen p-4'>
            {
                loading ? (<Loading />) : (
                    <Card className='w-full max-w-xl shadow-lg border roundered-2xl p-6'>
                        <CardHeader className='text-center'>
                            <CardTitle className='text-2xl font-semibold'>Profile Page</CardTitle>
                            <CardContent className='flex flex-col items-center space-y-4'>
                                <Avatar className='w-28 h-28 border-4 border-gray-200 shadow-md cursor-pointer' onClick={clickHandler}>
                                    <AvatarImage src={user?.image} alt='Profile pic' />
                                    <input type='file' className='hidden' accept='image/*' ref={inputRef} onChange={changeHandler} />
                                </Avatar>
                                <div className='w-full space-y-2 text-center'>
                                    <label className='font-medium' htmlFor="">Name</label>
                                    <p>{user?.name}</p>
                                </div>
                                {
                                    user?.bio && (
                                        <div className='w-full space-y-2 text-center'>
                                            <label className='font-medium' htmlFor="">Bio</label>
                                            <p>{user?.bio}</p>
                                        </div>
                                    )
                                }

                                <div className='flex gap-4 mt-3'>
                                    {
                                        user?.instagram && (<a href={user.instagram} target='blank' rel="noopener noreferrer">
                                            <Instagram className="text-pink-500 text-2xl" />
                                        </a>)
                                    }
                                    {
                                        user?.facebook && (<a href={user.facebook} target='blank' rel="noopener noreferrer">
                                            <Facebook className="text-blue-500 text-2xl" />
                                        </a>)
                                    }
                                    {
                                        user?.linkedIn && (<a href={user?.linkedIn} target='blank' rel="noopener noreferrer">
                                            <Linkedin className="text-pink-700 text-2xl" />
                                        </a>)
                                    }
                                </div>
                                <div className='flex flex-col sm:flex-row gap-2 mt-6 w-full justify-center'>
                                    <Button onClick={logoutHandler}>Logout</Button>
                                    <Button onClick={() => router.push("/blog/new")}>Add Blog</Button>

                                    <Dialog open={open} onOpenChange={setOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant='outline'>Edit</Button>
                                        </DialogTrigger>
                                        <DialogContent className='sm:max-w-[500px]'>
                                            <DialogHeader>
                                                <DialogTitle>Edit Profile</DialogTitle>
                                            </DialogHeader>
                                            <div className='space-y-3'>
                                                <div>
                                                    <Label className='mb-2'>Name</Label>
                                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                                </div>
                                                <div>
                                                    <Label className='mb-2'>Bio</Label>
                                                    <Input value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
                                                </div>
                                                <div>
                                                    <Label className='mb-2'>Instagram</Label>
                                                    <Input value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} />
                                                </div>
                                                <div>
                                                    <Label className='mb-2'>Facebook</Label>
                                                    <Input value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} />
                                                </div>
                                                <div>
                                                    <Label className='mb-2'>LinkedIn</Label>
                                                    <Input value={formData.linkedIn} onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })} />
                                                </div>
                                                <Button onClick={handleFormSubmit} className='w-full mt-4'>Save Changes</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </CardHeader>
                    </Card>
                )
            }
        </div>
    )
}

export default ProfilePage