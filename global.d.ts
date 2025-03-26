// global.d.ts
declare module 'next' {
	export type PageProps = {
		params: { [key: string]: string }
		searchParams?: { [key: string]: string | string[] | undefined }
	}
}
