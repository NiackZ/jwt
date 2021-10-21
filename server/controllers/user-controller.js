import { validationResult } from "express-validator"
import ApiError from "../exeptions/api-error.js"
import userService from "../services/user-service.js"

class UserController{
	async reg(req, res, next){
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()){
				return next(ApiError.BadRequest('Некорректные данные при регистрации',errors.array()))
			}
			const {email, password} = req.body
			const userData = await userService.reg(email, password)

			res.cookie('refreshToken', userData.refreshToken,{maxAge: 21*24*60*60*1000, httpOnly: true})
			return res.json(userData)
		} catch (error) {
			next(error)
		}
	}

	async login(req, res, next){
		try {

			const {email, password} = req.body
			const userData = await userService.login(email, password)

			res.cookie('refreshToken', userData.refreshToken,{maxAge: 21*24*60*60*1000, httpOnly: true})
			return res.json(userData)
		} catch (error) {
			next(error)
		}
	}

	async logout(req, res, next){
		try {
			const {refreshToken} = req.cookies
			const token = await userService.logout(refreshToken)
			res.clearCookie('refreshToken')
			return res.json(token)
		} catch (error) {
			next(error)
		}
	}
	
	async refresh(req, res, next){
		try {
			const {refreshToken} = req.cookies
			const userData = await userService.refresh(refreshToken)
			res.cookie('refreshToken', userData.refreshToken,{maxAge: 21*24*60*60*1000, httpOnly: true})
			return res.json(userData)
		} catch (error) {
			next(error)
		}
	}
	
	async getUsers(req, res, next){
		try {
			const users = await userService.getAllUsers()
			return res.json(users)
		} catch (error) {
			next(error)
		}
	}
	
	async activate(req, res, next){
		try {
			const link = req.params.link
			await userService.activate(link)
			return res.redirect(process.env.CLIENT_URL)
		} catch (error) {
			next(error)
		}
	}
	
}

export default new UserController()