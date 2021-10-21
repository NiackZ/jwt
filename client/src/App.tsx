import { log } from 'console';
import { observer } from 'mobx-react-lite';
import React, { FC, useContext, useEffect, useState } from 'react';
import { Context } from '.';
import LoginForm from './components/LoginForm';
import { IUser } from './models/IUser';
import UserService from './services/UserService';

const App: FC = () => {

	const {store}= useContext(Context)
	const [users, setUsers] = useState<IUser[]>([])
	async function getUsers(){
		try {
			const response = await UserService.fetchUsers()		
			setUsers(response.data)
		} catch (error) {
			console.log(error);
			
		}
	}

	useEffect(() => {
		if (localStorage.getItem('token')) 
			store.checkAuth()
	}, [])

	if (store.isLoading) return <div>Загрузка...</div>

	if (!store.isAuth) return <><LoginForm/></>

	return (
		<div>
			<h1>{store.isAuth?`Пользователь авторизован ${store.user.email}`:'Авторизуйтесь'}</h1>
			<h1>Аккаунт {store.user.isActivated ? '':'не'} подтвержден.</h1>
			<button onClick={()=>store.logout()} >Выход</button>
			<div>
				<button onClick={getUsers} >Получить пользователей</button>
				{users.map(user=><div key={user.email}>{user.email}</div>)}
			</div>
		</div>
	);
};

export default observer(App);