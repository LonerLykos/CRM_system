import {cache} from "react";
import {authService} from "../api/auth.service";

// Deduplicated per render: the menu, the order table and the users list all
// need the current user.
export const getCurrentUser = cache(() => authService.getMe());
