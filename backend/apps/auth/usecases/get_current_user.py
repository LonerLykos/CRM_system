from apps.auth.repositories.user_repository import UserRepository


class GetCurrentUserUseCase:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def execute(self, user_id: int):
        user = self.user_repo.get_by_id(user_id)
        return user
