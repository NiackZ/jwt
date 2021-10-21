import jwt from 'jsonwebtoken'
import TokenModel from '../models/token.js'

class TokenService{
	async generateTokens(payload){
		const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET,{expiresIn:'10s'})
		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET,{expiresIn:'5m'})
		return { accessToken,	refreshToken }
	}

	async saveTokens(userId, refreshToken){
		const tokenData = await TokenModel.findOne({user:userId})
		if (tokenData){
			tokenData.refreshToken = refreshToken
			return tokenData.save()
		}
		const token = await TokenModel.create({user: userId, refreshToken})
	}

	async removeToken(refreshToken){
		const tokenData = await TokenModel.deleteOne({refreshToken})
		return tokenData
	}

	async refreshToken(refreshToken){
		const tokenData = await TokenModel.deleteOne({refreshToken})
		return tokenData
	}

	async validateAccessToken(token){
		try {
			const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
			return userData
		} catch (error) {
			return null
		}
	}
	
	async validateRefreshToken(token){
		try {
			const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
			return userData
		} catch (error) {
			return null
		}
	}
	
	async findToken(token){
		const tokenData = await TokenModel.findOne({token})
		return tokenData
	}

}
export default new TokenService()