import { getApps, initializeApp, cert } from 'firebase-admin/app'

const admin =
	getApps()[0] ??
	initializeApp({
		storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
		credential: cert(
			JSON.parse(
				Buffer.from(
					process.env.FIREBASE_ADMIN_KEY!,
					'base64'
				).toString()
			)
		)
	})

export default admin
