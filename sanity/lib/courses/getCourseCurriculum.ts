import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export async function getCourseCurriculum(courseId: string) {
	const query = defineQuery(`*[_type == "course" && _id == $courseId][0] {
    _id,
    title,
    "modules": modules[]-> {
      _id,
      title,
      "lessons": lessons[]-> {
        _id,
        title,
        slug,
        description,
        videoUrl,
        loomUrl,
        content
      }
    }
  }`)

	const result = await sanityFetch({
		query,
		params: { courseId },
	})

	if (!result.data) {
		return {
			_id: courseId,
			modules: [],
		}
	}

	return {
		_id: result.data._id,
		title: result.data.title,
		modules: result.data.modules || [],
	}
}
