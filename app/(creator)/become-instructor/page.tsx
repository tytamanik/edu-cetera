import { checkInstructorStatusAction } from '@/app/actions/instructorActions'
import BecomeInstructorForm from '@/components/BecomeInstructorForm'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function BecomeInstructorPage() {
	const user = await currentUser()

	if (!user?.id) {
		return redirect('/')
	}

	const { isInstructor } = await checkInstructorStatusAction(user.id)

	if (isInstructor) {
		return redirect('/creator-dashboard')
	}

	return (
		<div className='container mx-auto px-4 py-12 mt-16 max-w-3xl'>
			<div className='bg-card rounded-lg shadow-lg p-8 border'>
				<h1 className='text-3xl font-bold mb-6 text-center'>
					Become a Course Creator
				</h1>
				<p className='text-muted-foreground text-center mb-8'>
					Share your knowledge and expertise with students around the world
				</p>

				<BecomeInstructorForm
					userId={user.id}
					userName={`${user.firstName || ''} ${user.lastName || ''}`}
				/>
			</div>
		</div>
	)
}
