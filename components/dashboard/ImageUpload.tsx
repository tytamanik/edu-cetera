'use client'

import { uploadCourseImageAction } from '@/app/actions/courseActions'
import { ImageIcon, UploadCloud, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface ImageUploadProps {
	courseId: string
	initialImage?: string
	onImageChange: (imageUrl: string | null) => void
}

export default function ImageUpload({
	courseId,
	initialImage,
	onImageChange,
}: ImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false)
	const [imageUrl, setImageUrl] = useState<string | null>(initialImage || null)
	const [error, setError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			setError('Please upload an image file')
			return
		}

		if (file.size > 2 * 1024 * 1024) {
			setError('Image size should be less than 2MB')
			return
		}

		try {
			setIsUploading(true)
			setError(null)

			const formData = new FormData()
			formData.append('image', file)
			formData.append('courseId', courseId)

			const result = await uploadCourseImageAction(formData)

			if (result.success && result.imageUrl) {
				setImageUrl(result.imageUrl)
				onImageChange(result.imageUrl)
			} else {
				setError(result.error || 'Failed to upload image')
			}
		} catch (err) {
			setError('An unexpected error occurred')
			console.error('Error uploading image:', err)
		} finally {
			setIsUploading(false)
		}
	}

	const handleRemoveImage = () => {
		setImageUrl(null)
		onImageChange(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	return (
		<div className='space-y-2'>
			<div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors'>
				{isUploading ? (
					<div className='py-8 flex flex-col items-center'>
						<div className='h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin'></div>
						<p className='mt-2 text-sm text-muted-foreground'>Uploading...</p>
					</div>
				) : imageUrl ? (
					<div className='relative'>
						<Image
							src={imageUrl}
							alt='Course thumbnail'
							width={300}
							height={170}
							className='mx-auto rounded-md object-cover'
						/>
						<Button
							variant='destructive'
							size='icon'
							className='absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100'
							onClick={handleRemoveImage}
						>
							<X className='h-4 w-4' />
						</Button>
					</div>
				) : (
					<div
						onClick={() => fileInputRef.current?.click()}
						className='py-8 cursor-pointer flex flex-col items-center'
					>
						<div className='h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2'>
							<ImageIcon className='h-6 w-6 text-muted-foreground' />
						</div>
						<p className='text-sm font-medium'>Click to upload course image</p>
						<p className='text-xs text-muted-foreground mt-1'>
							PNG, JPG, WEBP up to 2MB
						</p>
					</div>
				)}

				<Input
					ref={fileInputRef}
					type='file'
					accept='image/*'
					onChange={handleFileChange}
					className='hidden'
				/>
			</div>

			{!imageUrl && !isUploading && (
				<Button
					type='button'
					variant='outline'
					size='sm'
					className='w-full'
					onClick={() => fileInputRef.current?.click()}
				>
					<UploadCloud className='h-4 w-4 mr-2' />
					Upload Image
				</Button>
			)}

			{error && <p className='text-sm text-red-500 mt-1'>{error}</p>}
		</div>
	)
}
