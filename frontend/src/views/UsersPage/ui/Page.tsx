import {userService} from "@/entities/user";
import {UsersList} from "@/widgets/UsersList";
import {Pagination} from "@/shared/ui";
import {UserCreateModal} from "@/features/user-create";
import s from "./Page.module.sass";

interface UsersPageProps {
    params: { page?: string }
}

export const UsersPage = async ({params}: UsersPageProps) => {
    const {page = '1'} = params;

    const [{ok: listOk, result: listData}, {ok: statOk, result: statData}] = await Promise.all([
        userService.getAllUsers({page}),
        userService.getStatistic(),
    ]);

    if (!listOk) {
        return <div className={s.error}>Server Error: failed to load managers list.</div>;
    }

    return (
        <div className={s.page}>
            <div className={s.topBar}>
                <h1 className={s.title}>Managers</h1>
                <UserCreateModal/>
            </div>

            {statOk && statData && (
                <div className={s.statsBlock}>
                    <div className={s.statCard}>
                        <span className={s.statLabel}>Total orders</span>
                        <span className={s.statValue}>{statData.total}</span>
                    </div>
                    <div className={s.statCard}>
                        <span className={s.statLabel}>New</span>
                        <span className={s.statValue}>{statData.new}</span>
                    </div>
                    <div className={s.statCard}>
                        <span className={s.statLabel}>In work</span>
                        <span className={s.statValue}>{statData.in_work}</span>
                    </div>
                    <div className={s.statCard}>
                        <span className={s.statLabel}>Agree</span>
                        <span className={s.statValue}>{statData.agree}</span>
                    </div>
                    <div className={s.statCard}>
                        <span className={s.statLabel}>Disagree</span>
                        <span className={s.statValue}>{statData.disagree}</span>
                    </div>
                    <div className={s.statCard}>
                        <span className={s.statLabel}>Dubbing</span>
                        <span className={s.statValue}>{statData.dubbing}</span>
                    </div>
                </div>
            )}

            <UsersList users={listData.data}/>

            <Pagination
                currentPage={Number(page)}
                baseUrl="/users"
                paginationInfo={listData}
                currentParams={params}
            />
        </div>
    );
};
