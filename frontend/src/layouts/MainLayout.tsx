import {RoutesComponent} from "../routes/routes.tsx";
import {Menu} from "../components/menu/Menu.tsx";


export const MainLayout = () => {
    return (
        <div>
            <Menu/>
            <RoutesComponent/>
        </div>
    );
};