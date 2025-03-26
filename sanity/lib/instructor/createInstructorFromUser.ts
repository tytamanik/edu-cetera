import { client } from '../adminClient'
import { getStudentByClerkId } from '../student/getStudentByClerkId'

export async function createInstructorFromUser({
	clerkId,
	name,
	bio,
	photo,
}: {
	clerkId: string
	name: string
	bio: string
	photo?: any
}) {
	try {
		const student = await getStudentByClerkId(clerkId)

		if (!student?.data?._id) {
			throw new Error('Student not found')
		}

		const instructor = await client.create({
			_type: 'instructor',
			name,
			bio,
			photo: photo,
			clerkId,
			studentRef: {
				_type: 'reference',
				_ref: student.data._id,
			},
		})

		await client
			.patch(student.data._id)
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
