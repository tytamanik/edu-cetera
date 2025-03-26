import { client } from '../adminClient'

export async function createBookmark(studentId: string, courseId: string) {
	return client.create({
		_type: 'bookmark',
		student: {
			_type: 'reference',
			_ref: studentId,
		},
		course: {
			_type: 'reference',
			_ref: courseId,
		},
		createdAt: new Date().toISOString(),
	})
}
