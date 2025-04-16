import { defineQuery } from 'groq';
import { sanityFetch } from '../live';

export async function getCoursesBySlugs(slugs: string[]) {
  if (!slugs || slugs.length === 0) return [];
  const getCoursesQuery = defineQuery(`*[_type == "course" && published == true && slug.current in $slugs] {
    ...,
    "slug": slug.current,
    "category": category->{...},
    "instructor": instructor->{...}
  }`);
  const courses = await sanityFetch({ query: getCoursesQuery, params: { slugs } });
  return courses.data;
}
