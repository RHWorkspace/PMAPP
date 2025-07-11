```dbml
Table users {
  id bigint [pk, increment]
  name varchar
  email varchar [unique]
  nik varchar [unique]
  password varchar
  status varchar
  type varchar
  position_id bigint [ref: > positions.id]
  division_id bigint [ref: > divisions.id]
  join_date date
  created_by bigint
  created_at timestamp
  updated_at timestamp
  email_verified_at timestamp
  remember_token varchar
}

Table positions {
  id bigint [pk, increment]
  title varchar
  description text
  rate decimal
  created_at timestamp
  updated_at timestamp
}

Table divisions {
  id bigint [pk, increment]
  title varchar
  description text
  created_at timestamp
  updated_at timestamp
}

Table teams {
  id bigint [pk, increment]
  title varchar
  description text
  division_id bigint [ref: > divisions.id]
  created_by bigint [ref: > users.id]
  created_at timestamp
  updated_at timestamp
}

Table team_members {
  id bigint [pk, increment]
  team_id bigint [ref: > teams.id]
  user_id bigint [ref: > users.id]
  role varchar
  status varchar
  created_by bigint [ref: > users.id]
  created_at timestamp
  updated_at timestamp
}

Table projects {
  id bigint [pk, increment]
  title varchar
  description text
  nilai decimal
  status varchar
  division_id bigint [ref: > divisions.id]
  start_date date
  due_date date
  completed_date date
  created_at timestamp
  updated_at timestamp
}

Table applications {
  id bigint [pk, increment]
  title varchar
  description text
  status varchar
  project_id bigint [ref: > projects.id]
  team_id bigint [ref: > teams.id]
  start_date date
  due_date date
  completed_date date
  created_by bigint [ref: > users.id]
  created_at timestamp
  updated_at timestamp
}

Table modules {
  id bigint [pk, increment]
  title varchar
  description text
  parent_id bigint [ref: > modules.id]
  application_id bigint [ref: > applications.id]
  created_by bigint [ref: > users.id]
  created_at timestamp
  updated_at timestamp
}

Table sprints {
  id bigint [pk, increment]
  title varchar
  description text
  status varchar
  team_id bigint [ref: > teams.id]
  start_date date
  due_date date
  completed_date date
  created_by bigint [ref: > users.id]
  created_at timestamp
  updated_at timestamp
}

Table tasks {
  id bigint [pk, increment]
  title varchar
  description text
  status varchar
  priority varchar
  application_id bigint [ref: > applications.id]
  module_id bigint [ref: > modules.id]
  sprint_id bigint [ref: > sprints.id]
  assigned_to_user_id bigint [ref: > users.id]
  start_date date
  due_date date
  completed_date date
  progress int
  est_hours decimal
  parent_id bigint [ref: > tasks.id]
  request_by varchar
  request_at timestamp
  request_code varchar
  link_issue varchar
  created_at timestamp
  updated_at timestamp
}

Table task_attachments {
  id bigint [pk, increment]
  task_id bigint [ref: > tasks.id]
  filename varchar
  file_url varchar
  uploaded_by bigint [ref: > users.id]
  uploaded_at timestamp
}

Table task_histories {
  id bigint [pk, increment]
  task_id bigint [ref: > tasks.id]
  title varchar
  description text
  status varchar
  progress int
  created_at timestamp
}

Table roles {
  id bigint [pk, increment]
  name varchar
  guard_name varchar
  created_at timestamp
  updated_at timestamp
}
```