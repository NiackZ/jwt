import axios from "axios";
import { makeAutoObservable } from "mobx";
import { API_URL } from "../http";
import { IUser } from "../models/IUser";
import { AuthResponse } from "../models/response/AuthResponse";
import AuthService from "../services/AuthService";

export default class Store{
	user = {} as IUser
	isAuth = false
	isLoading = false
	constructor(){
		makeAutoObservable(this)
	}

	setAuth(bool:boolean){
		this.isAuth = bool
	}

	setUser(user:IUser){
		this.user = user
	}

	setLoading(bool:boolean){
		this.isLoading = bool
	}

	async login(email:string, pass:string){
		try {
			const response = await AuthService.login(email,pass)
			//console.log(response)			
			localStorage.setItem('token', response.data.accessToken)
			this.setAuth(true)
			this.setUser(response.data.user)
		} catch (error: any) {
			console.log(error.response?.data?.message);
		}
	}

	async reg(email:string, pass:string){
		try {
			const response = await AuthService.reg(email,pass)
			//console.log(response)			
			localStorage.setItem('token', response.data.accessToken)
			this.setAuth(true)
			this.setUser(response.data.user)
		} catch (error: any) {
			console.log(error.response?.data?.message);
		}
	}

	async logout(){
		try {
			const response = await AuthService.logout()
			localStorage.removeItem('token')
			this.setAuth(false)
			this.setUser({}as IUser)
		} catch (error: any) {
			console.log(error.response?.data?.message);
		}
	}

	async checkAuth(){
		this.setLoading(true)
		try {
			const response = await axios.get<AuthResponse>(`${API_URL}/refresh`,{withCredentials:true})
			localStorage.setItem('token', response.data.accessToken)
			this.setAuth(true)
			this.setUser(response.data.user)
		} catch (error:any) {
			console.log(error.response);
		} finally{
			this.setLoading(false)
		}
	}

}