import { NextRequest, NextResponse } from "next/server";
import { getEnrolledCourses } from "@/sanity/lib/student/getEnrolledCourses";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ enrollments: [], error: "Missing userId" }, { status: 400 });
    const enrollments = await getEnrolledCourses(userId);
    // Map to course objects if enrollment has .course
    const enrolledCourses = (Array.isArray(enrollments) ? enrollments : [])
      .map((enrollment: any) => enrollment && enrollment.course ? enrollment.course : enrollment)
      .filter((course: any) => course && course.title && course.slug);
    return NextResponse.json({ enrollments: enrolledCourses });
  } catch (e) {
    return NextResponse.json({ enrollments: [], error: String(e) }, { status: 500 });
  }
}
