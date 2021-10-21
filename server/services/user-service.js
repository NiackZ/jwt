import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';

import UserModel from '../models/user.js'
import mailService from './mail-service.js'
import tokenService from './token-service.js'
import UserDto from '../dtos/user-dto.js'
import ApiError from '../exeptions/api-error.js';

class UserService{

	async DtoAndTokens(user){
		const userDto = new UserDto(user)
		const tokens = await tokenService.generateTokens({...userDto})
		await tokenService.saveTokens(userDto.id, tokens.refreshToken)
		return { ...tokens, user: userDto	}
	}

	async reg(email, password){
		
		const candidate = await UserModel.findOne({email})
		if (candidate){
			//return(`Пользователь с таким email уже существует`)
			throw ApiError.BadRequest(`Пользователь с таким email уже существует`)
		}
		const activationLink = uuidv4();
		const hashPass = await bcrypt.hash(password, 9)
		const user = await UserModel.create({email, password: hashPass, activationLink})
		await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)
		return this.DtoAndTokens(user)
	}

	async activate(link){
		const user = await UserModel.findOne({link})
		if (!user){
			//return ('Ссылка некорректа')
			throw ApiError.BadRequest('Ссылка некорректа')
		}
		user.isActivated = true
		await user.save()
	}

	async login(email, password){
		const user = await UserModel.findOne({email})
		if (!user){
			//return ('Ссылка некорректа')
			throw ApiError.BadRequest('Пользователь не найден')
		}
		const isPassEq = await bcrypt.compare(password, user.password)
		if (!isPassEq){
			throw ApiError.BadRequest('Неверный пароль')
		}
		return this.DtoAndTokens(user)
	}

	async logout(refreshToken){
		const token = await tokenService.removeToken(refreshToken)
		return token
	}
	
	async refresh(refreshToken){
		if (!refreshToken){

			throw ApiError.UnauthError()
		}
		const userData = await tokenService.validateRefreshToken(refreshToken)
		const tokenFromDB = await tokenService.findToken(refreshToken)
		if (!userData || !tokenFromDB) throw ApiError.UnauthError()
		const user = await UserModel.findById(userData.id)
		return this.DtoAndTokens(user)
	}

	async getAllUsers(){
		const users = await UserModel.find()
		return users
	}

}

export default new UserService()