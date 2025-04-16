"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CourseCard } from "@/components/CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { GetCoursesQueryResult } from "@/sanity.types";
import { Brain, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Course = GetCoursesQueryResult[number];

export function PersonalizedRecommendations() {
  const { user, isLoaded } = useUser();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [enrollments, setEnrollments] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    setLoadingEnroll(true);
    fetch("/api/user-enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setEnrollments(data.enrollments || []);
        setLoadingEnroll(false);
      })
      .catch(() => {
        setError("Failed to load enrollments.");
        setLoadingEnroll(false);
      });
  }, [isLoaded, user]);

  useEffect(() => {
    if (!isLoaded || !user?.id || !enrollments) return;
    if (enrollments.length === 0) {
      setCourses([]);
      return;
    }
    setLoading(true);
    fetch("/api/groq-recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, enrollments }),
    })
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load recommendations.");
        setLoading(false);
      });
  }, [isLoaded, user, enrollments]);

  if (!isLoaded || !user?.id) return null;
  if (loadingEnroll)
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-4">Loading your enrollments...</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </section>
    );
  if (loading)
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-4">Based on your course history</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </section>
    );
  if (error) return null;
  if (!courses || courses.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Recommended For You</h2>
            <p className="text-muted-foreground mt-1">
              Based on your learning history and interests
            </p>
          </div>
        </div>
        <Link href="/explore" prefetch={false} className="mt-4 md:mt-0">
          <Button variant="outline">
            <Brain className="mr-2 h-4 w-4" />
            More Recommendations
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.slice(0, 6).map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            href={`/courses/${course.slug}`}
          />
        ))}
      </div>
    </section>
  );
}