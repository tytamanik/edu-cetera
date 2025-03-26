// File: sanity/lib/instructor/followInstructor.ts
import { client } from '../adminClient'

export async function followInstructor(
	studentId: string,
	instructorId: string
) {
	try {
		return await client.create({
			_type: 'instructorFollow',
			student: {
				_type: 'reference',
				_ref: studentId,
			},
			instructor: {
				_type: 'reference',
				_ref: instructorId,
			},
			followedAt: new Date().toISOString(),
		})
	} catch (error) {
		console.error('Error following instructor:', error)
		throw error
	}
}

export async function unfollowInstructor(
	studentId: string,
	instructorId: string
) {
	try {
		// Find the follow record ID
		const followId = await client.fetch(
			`*[_type == "instructorFollow" && student._ref == $studentId && instructor._ref == $instructorId][0]._id`,
			{ studentId, instructorId }
		)

		if (!followId) {
			throw new Error('Follow record not found')
		}

		// Delete the follow record
		return await client.delete(followId)
	} catch (error) {
		console.error('Error unfollowing instructor:', error)
		throw error
	}
}
