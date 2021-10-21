import ApiError from "../exeptions/api-error.js";
import tokenService from "../services/token-service.js";

export default async function (req, res, next){
	try {
		
		const authHeader = req.headers.authorization
		if (!authHeader) return next(ApiError.UnauthError())

		const accessToken = authHeader.split(' ')[1]
		if (!accessToken) return next(ApiError.UnauthError())

		const userData = await tokenService.validateAccessToken(accessToken)
		if (!userData) return next(ApiError.UnauthError())
		req.user = userData

		next()
	} catch (error) {
		return next(ApiError.UnauthError())
	}
}