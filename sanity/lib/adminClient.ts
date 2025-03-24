import { createClient } from 'next-sanity'

import baseUrl from '@/lib/baseUrl'
import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: true,
	stega: {
		studioUrl: `${baseUrl}/studio`,
	},
	token: process.env.SANITY_API_ADMIN_TOKEN,
})
