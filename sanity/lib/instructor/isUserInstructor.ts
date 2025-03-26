import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export async function isUserInstructor(clerkId: string) {
	try {
		const query = defineQuery(`*[_type == "student" && clerkId == $clerkId][0]{
      "isInstructor": defined(instructor)
    }`)

		const result = await sanityFetch({
			query,
			params: { clerkId },
		})

		return result.data?.isInstructor === true
	} catch (error) {
		console.error('Error checking instructor status:', error)
		return false
	}
}
