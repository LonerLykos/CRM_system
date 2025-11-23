export const baseUrl = '/api'

export const urls = {
    auth: {
        login: '/auth',
        get refresh() {
            return `${this.login}/refresh`
        },
        get logout() {
            return `${this.login}/logout`
        }
    },
};
