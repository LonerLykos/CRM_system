import {IUser} from "@/entities/user";
import {authService} from "@/entities/auth";
import {UserCard} from "./UserCard";
import s from "./UsersList.module.sass";

interface UsersListProps {
    users: IUser[];
}

export const UsersList = async ({users}: UsersListProps) => {
    if (users.length === 0) {
        return <p className={s.empty}>No managers found.</p>;
    }

    // Fetched once for the whole list so each card knows whether it is the
    // logged-in user (self) — used to lock the self Ban button.
    const {result: me} = await authService.getMe();

    return (
        <div className={s.grid}>
            {users.map(user => (
                <UserCard key={user.id} user={user} currentUserId={me?.id}/>
            ))}
        </div>
    );
};
