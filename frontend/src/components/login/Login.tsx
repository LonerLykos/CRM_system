import {useNavigate} from "react-router-dom";
import {zodResolver} from "@hookform/resolvers/zod";
import {authService, type LoginData} from "../../services/auth_service.ts";
import {useForm} from "react-hook-form";
import loginSchema from "../../validators/login.validator.ts";
import {useAuthStore} from "../../store/useAuthStore.ts";
import type {IActiveUserData} from "../../models/activeUserData.ts";


export const Login = () => {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)

    const {handleSubmit, register, formState: {errors, isValid}, reset} = useForm<LoginData>({
        mode: 'all',
        resolver: zodResolver(loginSchema)
    })

    const myHandler = async (data: LoginData) => {
        try {
            const userData: IActiveUserData = await authService.login(data)
            if (userData) {
                login(userData.name, userData.surname, userData.is_staff)
            }
            reset();
             navigate('/')
        } catch (error) {
            console.log(error)
            reset();
        }
    }

    return (
        <div>
            <h1>Sing in</h1>
            <form onSubmit={handleSubmit(myHandler)}>
                <div className='wrap-input'>
                    <label>
                        <input type="text" placeholder="example@mail.com" {...register('email')}/>
                    </label>

                    <p className={!errors.email ? 'hide' : 'view'}>{!errors.email ? '' : errors.email.message}</p>
                </div>
                <div className='wrap-input'>
                    <label>
                        <input type="text" placeholder="Enter your password" {...register('password')}/>
                    </label>

                    <p className={!errors.password ? 'hide' : 'view'}>{!errors.password ? '' : errors.password.message}</p>
                </div>

                <button disabled={!isValid}>Sing in</button>
            </form>
        </div>
    )
}