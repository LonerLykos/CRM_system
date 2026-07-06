import {IUser, IUserStatistic} from "@/entities/user";
import {UserManageButtons} from "@/features/user-manage";
import {formatDate} from "@/shared/libs";
import s from "./UserCard.module.sass";

interface UserCardProps {
    user: IUser;
    currentUserId?: number;
}

const STAT_ZERO: IUserStatistic = {
    total: 0,
    new: 0,
    in_work: 0,
    agree: 0,
    disagree: 0,
    dubbing: 0,
};

export const UserCard = async ({user, currentUserId}: UserCardProps) => {
    // statistic is embedded by the list endpoint — no extra fetch needed
    const statData: IUserStatistic = user.statistic ?? STAT_ZERO;

    return (
        <div className={`${s.card} ${!user.is_active ? s.inactive : ''} ${user.is_banned ? s.banned : ''}`}>
            <div className={s.header}>
                <span className={s.id}>#{user.id}</span>
                <div className={s.badges}>
                    {!user.is_active && <span className={`${s.badge} ${s.badgeInactive}`}>Inactive</span>}
                    {user.is_banned && <span className={`${s.badge} ${s.badgeBanned}`}>Banned</span>}
                    {user.is_staff && <span className={`${s.badge} ${s.badgeStaff}`}>Admin</span>}
                </div>
            </div>

            <div className={s.info}>
                <p className={s.name}>{user.name} {user.surname}</p>
                <p className={s.email}>{user.email}</p>
                <p className={s.lastLogin}>
                    Last login: {user.last_login ? formatDate(user.last_login) : 'Never'}
                </p>
            </div>

            <div className={s.stats}>
                <span className={s.statItem}>Total: <b>{statData.total}</b></span>
                <span className={s.statItem}>New: <b>{statData.new}</b></span>
                <span className={s.statItem}>In work: <b>{statData.in_work}</b></span>
                <span className={s.statItem}>Agree: <b>{statData.agree}</b></span>
                <span className={s.statItem}>Disagree: <b>{statData.disagree}</b></span>
                <span className={s.statItem}>Dubbing: <b>{statData.dubbing}</b></span>
            </div>

            <UserManageButtons
                pk={user.id}
                isActive={user.is_active}
                isBanned={user.is_banned}
                isSelf={currentUserId === user.id}
            />
        </div>
    );
};
