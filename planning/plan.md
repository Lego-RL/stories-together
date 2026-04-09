# Long term plan

- Basic admin page - deactivating users, deleting stories most important
- Minor improvements (showing who made a story, show word counts for passages)



# Phase 1: Basic admin page

- Endpoint for deleting story
    - ✅ update story table to cascade on delete so associated passages are deleted
    - delete story function in `repositories/story`
- Endpoint for deactivating user
    - ✅update user table with 'active' column, 'role' column for admin roles
    - exclude deactivated users from user searches

- ideally make a SQL view to show active users and utilize that across all endpoints
