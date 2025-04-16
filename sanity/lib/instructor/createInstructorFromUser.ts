import { client } from '../adminClient'
import { getStudentByClerkId } from '../student/getStudentByClerkId'
import { clerkClient } from '@clerk/nextjs/server'

export async function createInstructorFromUser({
	clerkId,
	name,
	bio,
	photo,
	email,
}: {
	clerkId: string
	name: string
	bio: string
	photo?: any
	email?: string
}) {
	try {
		// First, try to get the student
		const student = await getStudentByClerkId(clerkId)

		// If no student exists, create one directly
		let studentId = student?.data?._id
		
		if (!studentId) {
			// Create student directly if it doesn't exist
			const newStudent = await client.create({
				_type: 'student',
				firstName: name.split(' ')[0] || '',
				lastName: name.split(' ').slice(1).join(' ') || '',
				email: email || '',
				clerkId,
				imageUrl: '',
			})
			
			studentId = newStudent._id
			console.log('Created new student:', newStudent)
		}

		// Create the instructor profile
		const instructor = await client.create({
			_type: 'instructor',
			name,
			bio,
			photo: photo,
			clerkId,
			studentRef: {
				_type: 'reference',
				_ref: studentId,
			},
		})

		// Update the student record to link to the instructor
		await client
			.patch(studentId)
			.set({
				isInstructor: true,
				instructor: {
					_type: 'reference',
					_ref: instructor._id,
				},
			})
			.commit()

		return { success: true, instructor }
	} catch (error) {
		console.error('Error creating instructor profile:', error)
		return { success: false, error }
	}
}