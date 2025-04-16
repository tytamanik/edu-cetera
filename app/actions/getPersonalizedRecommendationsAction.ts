'use server'

import { getLessonCompletionHistory } from "@/sanity/lib/lessons/getLessonCompletionHistory";
import { getEnrolledCourses } from "@/sanity/lib/student/getEnrolledCourses";
import { searchCourses } from "@/sanity/lib/courses/searchCourses";


export async function getPersonalizedRecommendationsAction(userId: string) {
  try {

    const [completions, enrolledCourses] = await Promise.all([
      getLessonCompletionHistory(userId),
      getEnrolledCourses(userId)
    ]);

 
    if (completions.length === 0 && enrolledCourses.length === 0) {
      return {
        success: true,
        hasHistory: false,
        recommendations: []
      };
    }


    const completedCourseTitles = completions.map((completion: { course: { title: string } }) => completion.course.title);
    const completedCourseCategories = completions
      .filter((completion: { course: { category: { name: string } } }) => completion.course.category?.name)
      .map((completion: { course: { category: { name: string } } }) => completion.course.category?.name);

    const enrolledCourseTitles = enrolledCourses
      .filter((enrollment: any) => enrollment.course && enrollment.course.title)
      .map((enrollment: any) => enrollment.course.title);
    
    const enrolledCourseCategories = enrolledCourses
      .filter((enrollment: any) => enrollment.course && enrollment.course.category && enrollment.course.category.name)
      .map((enrollment: any) => enrollment.course.category.name);

 
    const allCourseTitles = [...new Set([...completedCourseTitles, ...enrolledCourseTitles])];
    const allCategories = [...new Set([...completedCourseCategories, ...enrolledCourseCategories])];
    
    
    if (allCourseTitles.length === 0 && allCategories.length === 0) {
      return {
        success: true,
        hasHistory: false,
        recommendations: []
      };
    }

    
    const enrolledCourseIds = enrolledCourses
      .filter(enrollment => enrollment.course?._id)
      .map(enrollment => enrollment.course?._id);

 
    const prompt = buildRecommendationPrompt(allCourseTitles, allCategories);
    
  
    const recommendedTopics = await getAIRecommendations(prompt);
    
    if (!recommendedTopics || recommendedTopics.length === 0) {
  
      const allCourses = await searchCourses("");
      return {
        success: true,
        hasHistory: true,
        recommendations: allCourses
          .filter((course: any) => !enrolledCourseIds.includes(course._id))
          .slice(0, 6)
      };
    }


    const recommendedCourses = [];
    for (const topic of recommendedTopics as string[]) {
      const topicCourses = await searchCourses(topic);
      recommendedCourses.push(...topicCourses);
    }

    
    const uniqueRecommendations = recommendedCourses
      .filter((course: any) => !enrolledCourseIds.includes(course._id))
      .filter((course, index, self) => 
        index === self.findIndex((c: any) => c._id === course._id)
      )
      .slice(0, 6); 

    return {
      success: true,
      hasHistory: true,
      recommendations: uniqueRecommendations
    };
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    return {
      success: false,
      error: "Failed to get recommendations",
      recommendations: []
    };
  }
}


function buildRecommendationPrompt(courseTitles: (string | undefined)[], categories: (string | undefined)[]) {
  const filteredTitles = courseTitles.filter(Boolean).join(", ");
  const filteredCategories = categories.filter(Boolean).join(", ");
  
  return `
    Based on a user's learning history, recommend 3 to 5 topics or categories they might be interested in.
    
    User's completed and enrolled courses: ${filteredTitles || "None"}
    Course categories they've shown interest in: ${filteredCategories || "None"}
    
    Provide only the recommended topics or categories as a comma-separated list, no explanations.
    For example: "Machine Learning, Data Visualization, React Development"
  `;
}


async function getAIRecommendations(prompt: string): Promise<string[]> {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ API key not found in environment variables");
      return [];
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides concise course recommendations based on user learning history."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      console.error("GROQ API error:", await response.text());
      return [];
    }

    const data = await response.json();
    const recommendationsText = data.choices[0]?.message?.content || "";
    
  
    return recommendationsText
      .split(',')
      .map((topic: string) => topic.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Error calling GROQ API:", error);
    return [];
  }
}