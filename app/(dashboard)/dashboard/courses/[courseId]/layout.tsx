import { Sidebar } from '@/components/dashboard/Sidebar'
import { checkCourseAccess } from '@/lib/auth'
import getCourseById from '@/sanity/lib/courses/getCourseById'
import { getCourseProgress } from '@/sanity/lib/lessons/getCourseProgress'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

interface CourseLayoutProps {
	children: React.ReactNode
	params: {
		courseId: string
	}
}

export default async function CourseLayout({
	children,
	params,
}: CourseLayoutProps) {
	const user = await currentUser()
	const { courseId } = params

	if (!user?.id) {
		return redirect('/')
	}

	const authResult = await checkCourseAccess(user?.id || null, courseId)
	if (!authResult.isAuthorized || !user?.id) {
		return redirect(authResult.redirect!)
	}

	const [course, progress] = await Promise.all([
		getCourseById(courseId),
		getCourseProgress(user.id, courseId),
	])

	if (!course) {
		return redirect('/my-courses')
	}

	return (
		<div className='h-full'>
			<Sidebar course={course} completedLessons={progress.completedLessons} />
			<main className='h-full lg:pt-[64px] pl-20 lg:pl-96'>{children}</main>
		</div>
	)
}
