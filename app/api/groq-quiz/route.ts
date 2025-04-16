import { NextRequest, NextResponse } from "next/server";
import { getEnrolledCourses } from "@/sanity/lib/student/getEnrolledCourses";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ quiz: [], error: "Missing userId" }, { status: 400 });
    if (!GROQ_API_KEY) return NextResponse.json({ quiz: [], error: "Missing GROQ_API_KEY env variable" }, { status: 500 });


    let enrolled;
    try {
      enrolled = await getEnrolledCourses(userId);
    } catch (err) {
      return NextResponse.json({ quiz: [], error: `Failed to fetch enrolled courses: ${String(err)}` }, { status: 500 });
    }

    const enrolledRaw = Array.isArray(enrolled) ? enrolled : [];
    
    const enrolledCourses = enrolledRaw
      .map((enrollment: any) => enrollment && enrollment.course ? enrollment.course : enrollment)
      .filter((course: any) => course && course.title && course.slug);
    if (!enrolledCourses.length) {
      return NextResponse.json({
        quiz: [],
        debug: {
          enrolledRaw,
          enrolledCourses,
          reason: "No enrolled courses with valid title and slug. Check enrollment.course mapping."
        }
      });
    }

 
    const courseList = enrolledCourses.map((c: any) => `- ${c.title} (slug: ${c.slug})`).join("\n");
    const prompt = `Given the following user-enrolled course${enrolledCourses.length > 1 ? 's' : ''}, generate a 5-question quiz.\n- Mix questions by topic if there are multiple courses.\n- Each question must be either multiple-choice or single-choice (provide 3-5 choices per question, only one correct answer).\n- Attach a 'topic' field to each question indicating the relevant course title.\n- Format as a JSON array of objects: [{\"question\": string, \"choices\": string[], \"answer\": string, \"topic\": string}].\n- Do NOT include any text outside the JSON array.\nCourses:\n${courseList}`;


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
            { role: "system", content: "You are an expert quiz generator for an online learning platform. Generate engaging, course-relevant quiz questions." },
            { role: "user", content: prompt },
          ],
          max_tokens: 512,
          temperature: 0.7,
        }),
      });
    } catch (err) {
      return NextResponse.json({ quiz: [], error: `Groq API fetch error: ${String(err)}` }, { status: 500 });
    }
    if (!groqRes.ok) {
      const text = await groqRes.text();
      return NextResponse.json({ quiz: [], error: `Groq API error: ${groqRes.status} ${text}` }, { status: 500 });
    }
    let groqData;
    try {
      groqData = await groqRes.json();
    } catch (err) {
      return NextResponse.json({ quiz: [], error: `Groq API JSON parse error: ${String(err)}` }, { status: 500 });
    }
    let quiz = [];
    const rawText = groqData.choices?.[0]?.message?.content || "";
    try {
      quiz = JSON.parse(rawText);
      if (!Array.isArray(quiz)) throw new Error();
    } catch {
      quiz = [];
    }
    if (!quiz || quiz.length === 0) {
      return NextResponse.json({
        quiz: [],
        debug: {
          enrolledCourses: enrolled.map((c: any) => ({ slug: c.slug, title: c.title })),
          prompt,
          groqRaw: groqData,
          groqText: rawText,
        }
      });
    }
    return NextResponse.json({ quiz, debug: { enrolledCourses: enrolled.map((c: any) => ({ slug: c.slug, title: c.title })), prompt, groqRaw: groqData, groqText: rawText } });
  } catch (e) {
    return NextResponse.json({ quiz: [], error: String(e) }, { status: 500 });
  }
}
