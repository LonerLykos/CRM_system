export const baseUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api`

export const urls = {
    auth: {
        login: '/auth',
        get refresh(): string {
            return `${this.login}/refresh`
        },
        get logout(): string {
            return `${this.login}/logout`
        },
        get currentUser(): string {
            return `${this.login}/me`
        },
    },
    crm: {
        orders: '/orders',
        byId(id: string): string {
            return `${this.orders}/${id}`
        },
        get choices(): string {
            return `${this.orders}/choices`
        },
        get groups(): string {
            return `${this.orders}/groups`
        },
        get createGroup(): string {
            return `${this.groups}/create`
        },
        createComment(id: string): string {
            return `${this.byId(id)}/comment`
        },
        orderUpdate(id: string): string {
            return `${this.byId(id)}/update`
        },
    },

};
