# Admin Panel Functionality 

- list all users
- see all stories and passages each user has created
- delete individual passages or stories
- deactivate accounts (with option to purge all content that user made)
- see flagged stories (add ability for users to flag stories)



## Backend requirements
`/admin` endpoint

- ✅ `/stories` see all stories
- ✅ `/admin/users/{id}` - see all content a user made

- ✅ add role column to users table so only admin role users may access admin panel

- ✅ delete passage by id
- ✅ delete story and all associated passages (add on delete cascade constraint to db)
- ✅ add active column to users table, change user queries to exclude inactive users
- add times_flagged column to passages (or boolean?)

- figure out authentication system, ensuring only admins may access admin panel / admin endpoints


- `/stats` return statistics like total stories, total passages, contributions in the last 24hrs, etc
- `/logs` add system logging, this endpoint would show logs
