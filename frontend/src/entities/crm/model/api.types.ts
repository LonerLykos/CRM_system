export interface IGroupResponse {
    id: number,
    name: string,
}

export interface IChoicesResponse {
    statuses: {
        new: "New",
        in_work: "In Work",
        agree: "Agree",
        disagree: "Disagree",
        dubbing: "Dubbing"
    },
    courses: {
        FS: "Fullstack",
        QAСX: "QA Complex",
        JCX: "Java Complex",
        JSCX: "JavaScript Complex",
        FE: "Frontend",
        PCX: "Python Complex"
    },
    types: {
        pro: "Pro",
        minimal: "Minimal",
        premium: "Premium",
        incubator: "Incubator",
        vip: "VIP"
    },
    formats: {
        static: "Static",
        online: "Online"
    },
}