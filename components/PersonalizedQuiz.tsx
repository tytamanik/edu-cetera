"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Sparkles, BookOpenCheck, HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface QuizQuestion {
  question: string;
  choices: string[];
  answer: string;
  topic?: string;
}

export function PersonalizedQuiz() {
  const { user, isLoaded } = useUser();
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [enrollments, setEnrollments] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

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
      setQuiz([]);
      setNotEnrolled(true);
      return;
    }
    setLoading(true);
    fetch("/api/groq-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, enrollments }),
    })
      .then((res) => res.json())
      .then((data) => {
        setQuiz(data.quiz || []);
        setUserAnswers(Array((data.quiz || []).length).fill(null));
        setNotEnrolled(!!data.notEnrolled);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load quiz.");
        setLoading(false);
      });
  }, [isLoaded, user, enrollments]);

  const handleSelect = (choice: string) => {
    if (completed) return;
    setUserAnswers((prev) => {
      const copy = [...prev];
      copy[currentIdx] = choice;
      return copy;
    });
  };

  const handleNext = () => {
    if (quiz && currentIdx < quiz.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = () => {
    if (!quiz) return;
    let correct = 0;
    quiz.forEach((q, idx) => {
      if (userAnswers[idx] && userAnswers[idx]?.trim() === q.answer.trim()) correct++;
    });
    setScore(correct);
    setCompleted(true);
  };

  if (!isLoaded || !user?.id) return null;
  if (loadingEnroll)
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-4">Loading your enrollments...</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </section>
    );

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Sparkles className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Test Your Knowledge</h2>
            <p className="text-muted-foreground mt-1">
              Take a personalized quiz based on your enrolled courses
            </p>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <HelpCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <p className="text-red-500">{error}</p>
        </div>
      ) : notEnrolled ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <BookOpenCheck className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-2">No Enrollments Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Enroll in a course to unlock personalized quizzes and boost your learning!
          </p>
        </div>
      ) : quiz && quiz.length > 0 ? (
        <form
          className="p-0 max-w-3xl mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            if (currentIdx === quiz.length - 1) handleSubmit();
            else handleNext();
          }}
        >
          {completed ? (
            <>
              {quiz.map((q, idx) => (
                <div
                  key={idx}
                  className={`transition-all rounded-lg p-4 mb-6 ${userAnswers[idx] === q.answer ? "bg-green-50 dark:bg-green-900/10" : "bg-red-50 dark:bg-red-900/10"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-bold mr-2">Q{idx + 1}</span>
                    <span className="font-semibold text-lg">{q.question}</span>
                    {q.topic && (
                      <span className="ml-auto text-xs px-2 py-1 rounded bg-primary/10 text-primary font-semibold">{q.topic}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {q.choices && q.choices.map((choice, cidx) => (
                      <label
                        key={cidx}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer border transition-all ${userAnswers[idx] === choice ? "bg-primary/10 border-primary" : "border-transparent hover:bg-muted/40"} ${choice === q.answer ? "ring-2 ring-green-400" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`quiz-q${idx}`}
                          value={choice}
                          checked={userAnswers[idx] === choice}
                          disabled
                          className="accent-primary"
                        />
                        <span className="flex-1">{choice}</span>
                        {choice === q.answer && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        {userAnswers[idx] === choice && userAnswers[idx] !== q.answer && (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 text-green-600 font-medium">
                    <span className="bg-green-100 px-2 py-1 rounded text-xs font-bold mr-2">Correct Answer</span>
                    {q.answer}
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <div className="text-lg font-bold mb-2">
                  Your Score: {score} / {quiz.length}
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Another Quiz
                </Button>
              </div>
            </>
          ) : (
            <Card className="bg-muted/10 p-6">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-bold mr-2">Q{currentIdx + 1}</span>
                  <span className="font-semibold text-lg">{quiz[currentIdx].question}</span>
                  {quiz[currentIdx].topic && (
                    <span className="ml-auto text-xs px-2 py-1 rounded bg-primary/10 text-primary font-semibold">{quiz[currentIdx].topic}</span>
                  )}
                </div>
                <RadioGroup
                  className="flex flex-col gap-2 mt-2"
                  value={userAnswers[currentIdx] ?? undefined}
                  onValueChange={(choice) => {
                    handleSelect(choice);
                    setTimeout(() => {
                      if (currentIdx === quiz.length - 1) handleSubmit();
                      else setCurrentIdx((idx) => idx + 1);
                    }, 200);
                  }}
                >
                  {quiz[currentIdx].choices && quiz[currentIdx].choices.map((choice, cidx) => (
                    <RadioGroupItem
                      key={cidx}
                      value={choice}
                      id={`quiz-q${currentIdx}-choice${cidx}`}
                      className={`peer sr-only`}
                      disabled={userAnswers[currentIdx] !== null}
                    />
                  ))}
                  {quiz[currentIdx].choices && quiz[currentIdx].choices.map((choice, cidx) => (
                    <label
                      htmlFor={`quiz-q${currentIdx}-choice${cidx}`}
                      key={cidx}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer border transition-all ${userAnswers[currentIdx] === choice ? "bg-primary/10 border-primary" : "border-transparent hover:bg-muted/40"}`}
                    >
                      <span className="flex-1">{choice}</span>
                      <span className="w-4 h-4 border rounded-full border-primary flex items-center justify-center">
                        <span className={`block w-2 h-2 rounded-full ${userAnswers[currentIdx] === choice ? "bg-primary" : ""}`}></span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
                <div className="flex justify-between items-center mt-6">
                  <Button type="button" variant="ghost" disabled={currentIdx === 0} onClick={handlePrev}>
                    Previous
                  </Button>
                  {currentIdx === quiz.length - 1 ? (
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={userAnswers[currentIdx] == null}
                    >
                      Submit Quiz
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">No quiz questions available.</p>
          {/* Debug info for troubleshooting */}
          {typeof window !== 'undefined' && (window as any).DEBUG_QUIZ && (
            <div className="bg-muted rounded p-4 mt-4 text-left text-xs max-w-xl mx-auto overflow-x-auto">
              <pre>{JSON.stringify((quiz as any)?.debug, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
