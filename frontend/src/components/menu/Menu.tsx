import {useAuthStore} from "../../store/useAuthStore.ts";
import {Link, useLocation, useNavigate} from "react-router-dom";
import classNames from "classnames";
import {authService} from "../../services/auth_service.ts";


export const Menu = () => {

    const {isAuthenticated, is_staff, logout} = useAuthStore()

    const location = useLocation();
    const navigate = useNavigate()
    const isActive = (path: string) => location.pathname === path;

    const handleLogout= async () => {
        await authService.logout()
        logout()
        navigate('/login')
    }

    return (
        <div>
            {isAuthenticated ? (
                <ul>
                    <li className={classNames('pages')}>
                        {isActive('/') ? (
                            <span className={classNames("active")}>Main</span>
                        ) : (
                            <Link to={'/'}>Main</Link>
                        )}
                    </li>
                    <li className={classNames('pages')}>
                        {isActive('/crm') ? (
                            <span className={classNames("active")}>CRM</span>
                        ) : (
                            <Link to={'/crm'}>CRM</Link>
                        )}
                    </li>
                    {is_staff && (
                        <li className={classNames('pages')}>
                        {isActive('/users') ? (
                            <span className={classNames("active")}>Users</span>
                        ) : (
                            <Link to={'/users'}>Users</Link>
                        )}
                    </li>
                    )}
                    <li><button onClick={handleLogout}>Вийти</button></li>
                </ul>
            ) : (
                isActive('/login') ? (
                    <span className={classNames("active")}>Sing in</span>
                ) : (
                    <Link to={'/login'}>Sing in</Link>
                )
            )}
        </div>
    );
};
