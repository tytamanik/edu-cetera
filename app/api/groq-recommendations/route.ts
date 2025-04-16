import { NextRequest, NextResponse } from "next/server";
import { getLessonCompletionHistory } from "@/sanity/lib/lessons/getLessonCompletionHistory";
import { getEnrolledCourses } from "@/sanity/lib/student/getEnrolledCourses";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ courses: [], error: "Missing userId" }, { status: 400 });

    if (!GROQ_API_KEY) {
      return NextResponse.json({ courses: [], error: "Missing GROQ_API_KEY env variable" }, { status: 500 });
    }

    // Fetch user's course history and enrolled courses
    let history, enrolled;
    try {
      [history, enrolled] = await Promise.all([
        getLessonCompletionHistory(userId),
        getEnrolledCourses(userId),
      ]);
    } catch (err) {
      return NextResponse.json({ courses: [], error: `Failed to fetch user data: ${String(err)}` }, { status: 500 });
    }

    // Collect unique course IDs from both sources
    const courseMap = new Map();
    [...(history || []), ...(enrolled || [])].forEach((item: any) => {
      const course = item.course || item;
      if (course?._id) courseMap.set(course._id, course);
    });
    const userCourses = Array.from(courseMap.values());
    if (!userCourses.length) return NextResponse.json({ courses: [], error: "No user courses found" });

    // Prepare improved prompt for Groq AI
    const prompt = `Given the following user course history and enrollments, recommend 3 additional relevant courses from our catalog.\nUser courses (with slugs):\n${userCourses.map((c: any) => `- ${c.title} (slug: ${c.slug})`).join("\n")}.\nRespond ONLY with a JSON array of up to 3 course slugs (not titles) that exist in our catalog and are not already in the user's list. Example: [\"slug-1\", \"slug-2\", \"slug-3\"]`;

    // Query Groq Cloud API
    let groqRes;
    try {
      groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: "You are a course recommendation AI for an online learning platform. Recommend relevant courses based on the user's history." },
            { role: "user", content: prompt },
          ],
          max_tokens: 256,
          temperature: 0.7,
        }),
      });
    } catch (err) {
      return NextResponse.json({ courses: [], error: `Groq API fetch error: ${String(err)}` }, { status: 500 });
    }

    if (!groqRes.ok) {
      const text = await groqRes.text();
      return NextResponse.json({ courses: [], error: `Groq API error: ${groqRes.status} ${text}` }, { status: 500 });
    }
    let groqData;
    try {
      groqData = await groqRes.json();
    } catch (err) {
      return NextResponse.json({ courses: [], error: `Groq API JSON parse error: ${String(err)}` }, { status: 500 });
    }
    // Parse the Groq response to extract course slugs/IDs
    let recommendedSlugs: string[] = [];
    try {
      const text = groqData.choices?.[0]?.message?.content || "";
      // Try to parse as JSON array, fallback to regex
      recommendedSlugs = JSON.parse(text);
      if (!Array.isArray(recommendedSlugs)) throw new Error();
    } catch {
      const text = groqData.choices?.[0]?.message?.content || "";
      recommendedSlugs = Array.from(text.matchAll(/([\w-]{6,})/g)).map((m) => (m as RegExpMatchArray)[1]);
    }
    // Fetch course details from Sanity
    let recommendedCourses;
    try {
      const { getCoursesBySlugs } = await import("@/sanity/lib/courses/getCoursesBySlugs");
      recommendedCourses = await getCoursesBySlugs(recommendedSlugs);
    } catch (err) {
      return NextResponse.json({ courses: [], error: `Sanity fetch error: ${String(err)}` }, { status: 500 });
    }

    if (!recommendedCourses || recommendedCourses.length === 0) {
      // Fallback: recommend courses from the same category (excluding already enrolled/completed)
      let fallbackCourses: any[] = [];
      const allUserCoursesDebug: any[] = userCourses.map((c: any) => ({ slug: c.slug, title: c.title, category: c.category?.slug }));
      const userCourseSlugs = userCourses.map((c: any) => c.slug);
      // Fix: always extract category slug as string
      const userCategorySlugs = Array.from(
        new Set(
          userCourses
            .map((c: any) =>
              typeof c.category?.slug === "string"
                ? c.category.slug
                : c.category?.slug?.current
            )
            .filter(Boolean)
        )
      );
      try {
        if (userCategorySlugs.length > 0) {
          // Import getCoursesByCategory
          const { getCoursesByCategory } = await import("@/sanity/lib/courses/getCoursesByCategory");
          // Get all courses from these categories
          const allCategoryCourses = (await Promise.all(userCategorySlugs.map((catSlug) => getCoursesByCategory(catSlug)))).flat();
          // Filter out courses the user already has (but allow showing if user has < all in category)
          fallbackCourses = allCategoryCourses.filter((course: any) => !userCourseSlugs.includes(course.slug));
        }
      } catch (err) {
        // If fallback fails, just return debug info
        return NextResponse.json({
          courses: [],
          debug: {
            groqRaw: groqData,
            recommendedSlugs,
            userCoursesSent: allUserCoursesDebug,
            userCategorySlugs,
            fallbackError: String(err)
          }
        });
      }
      // If user already has all courses in the category, fallbackCourses will be empty
      // Limit fallback to 6 courses
      return NextResponse.json({
        courses: fallbackCourses.slice(0, 6),
        debug: {
          groqRaw: groqData,
          recommendedSlugs,
          userCoursesSent: allUserCoursesDebug,
          userCategorySlugs,
          fallbackUsed: true,
          fallbackCount: fallbackCourses.length
        }
      });
    }

    return NextResponse.json({ courses: recommendedCourses });
  } catch (e) {
    return NextResponse.json({ courses: [], error: String(e) }, { status: 500 });
  }
}
