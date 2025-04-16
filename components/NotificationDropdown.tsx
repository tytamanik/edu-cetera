"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";

export default function NotificationDropdown() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoaded && user?.id) {
      setLoading(true);
      fetch(`/api/notifications?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          const updates = (data.instructors || []).filter((i: any) => i.recentCourseSlug);
          setNotifications(updates);
          setUnreadCount(updates.length);
        })
        .finally(() => setLoading(false));
    }
  }, [isLoaded, user?.id]);

  return (
    <DropdownMenu onOpenChange={(open) => {
      if (open && unreadCount > 0) {
        setUnreadCount(0);
        fetch('/api/notifications/mark-read', { method: 'POST' });
      }
    }}>
      <DropdownMenuTrigger asChild>
        <button className="relative inline-flex items-center justify-center focus:outline-none">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] px-1 py-0.5 min-w-[16px] h-[16px] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No new updates from your instructors.
          </div>
        ) : (
          notifications.map((instructor: any) => (
            <DropdownMenuItem key={instructor._id} asChild>
              <Link
                href={`/courses/${instructor.recentCourseSlug}`}
                className="flex items-center gap-3 py-2 px-1 w-full hover:bg-accent rounded transition-colors"
                prefetch={false}
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  {instructor.recentCourseImage && typeof instructor.recentCourseImage === 'string' && instructor.recentCourseImage.trim() !== '' ? (
                    <Image
                      src={instructor.recentCourseImage}
                      alt={instructor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{instructor.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {instructor.recentActivity || "Published a new course"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {instructor.recentCourseDate}
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
