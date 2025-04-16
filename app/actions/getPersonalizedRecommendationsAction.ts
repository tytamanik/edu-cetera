'use server'

import { getLessonCompletionHistory } from "@/sanity/lib/lessons/getLessonCompletionHistory";
import { getEnrolledCourses } from "@/sanity/lib/student/getEnrolledCourses";
import { searchCourses } from "@/sanity/lib/courses/searchCourses";

// This action fetches personalized course recommendations based on user history
export async function getPersonalizedRecommendationsAction(userId: string) {
  try {
    // Get user's completed lessons and enrolled courses
    const [completions, enrolledCourses] = await Promise.all([
      getLessonCompletionHistory(userId),
      getEnrolledCourses(userId)
    ]);

    // If user has no history, return empty recommendations
    if (completions.length === 0 && enrolledCourses.length === 0) {
      return {
        success: true,
        hasHistory: false,
        recommendations: []
      };
    }

    // Extract course titles, categories and topics for recommendation input
    const completedCourseTitles = completions.map(completion => completion.course.title);
    const completedCourseCategories = completions
      .filter(completion => completion.course.category?.name)
      .map(completion => completion.course.category?.name);

    const enrolledCourseTitles = enrolledCourses
      .filter(enrollment => enrollment.course?.title)
      .map(enrollment => enrollment.course?.title);
    
    const enrolledCourseCategories = enrolledCourses
      .filter(enrollment => enrollment.course?.category?.name)
      .map(enrollment => enrollment.course?.category?.name);

    // Combine all course data for analysis
    const allCourseTitles = [...new Set([...completedCourseTitles, ...enrolledCourseTitles])];
    const allCategories = [...new Set([...completedCourseCategories, ...enrolledCourseCategories])];
    
    // If we don't have any data to work with, return empty recommendations
    if (allCourseTitles.length === 0 && allCategories.length === 0) {
      return {
        success: true,
        hasHistory: false,
        recommendations: []
      };
    }

    // Get enrolled course IDs to exclude them from recommendations
    const enrolledCourseIds = enrolledCourses
      .filter(enrollment => enrollment.course?._id)
      .map(enrollment => enrollment.course?._id);

    // Prepare prompt for GROQ API based on user's history
    const prompt = buildRecommendationPrompt(allCourseTitles, allCategories);
    
    // Call GROQ API to get recommended topics/categories
    const recommendedTopics = await getAIRecommendations(prompt);
    
    if (!recommendedTopics || recommendedTopics.length === 0) {
      // Fallback: use existing categories if AI fails
      const allCourses = await searchCourses("");
      return {
        success: true,
        hasHistory: true,
        recommendations: allCourses
          .filter(course => !enrolledCourseIds.includes(course._id))
          .slice(0, 6)
      };
    }

    // Get courses based on AI recommendations
    let recommendedCourses = [];
    for (const topic of recommendedTopics) {
      const topicCourses = await searchCourses(topic);
      recommendedCourses.push(...topicCourses);
    }

    // Filter out enrolled courses and remove duplicates
    const uniqueRecommendations = recommendedCourses
      .filter(course => !enrolledCourseIds.includes(course._id))
      .filter((course, index, self) => 
        index === self.findIndex(c => c._id === course._id)
      )
      .slice(0, 6); // Limit to 6 recommendations

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

// Helper function to build the prompt for GROQ
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

// Function to call GROQ API
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
    
    // Parse the comma-separated list of topics
    return recommendationsText
      .split(',')
      .map(topic => topic.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Error calling GROQ API:", error);
    return [];
  }
}