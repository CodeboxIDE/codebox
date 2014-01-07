# Environment variables

Codebox use environment variables for defining its configuration, here is a list of all possibles configurations:

| Name | Description | Default |
| ----- | ------------------- | ------------------- |
| PORT | HTTP Port for running the IDE | 8000 |
| WORKSPACE\_DIR | Workspace current directory | Shell current directory |
| WORKSPACE\_NAME | Name for this workspace | "Workspace" |
| WORKSPACE\_PUBLIC | If defined the workspace will be considered as public | false |
| WORKSPACE\_USERS\_MAX | Max number of active collaborators on the box | 100 |
| WORKSPACE\_USERS\_MAX | Max number of users | 100 |
| WORKSPACE\_HOOK\_AUTH | Url for the authentification hook | |
| WORKSPACE\_HOOK\_EVENTS | Url for the events hook | |
| WORKSPACE\_HOOK\_SETTINGS | Url for the settings hook | |
| WORKSPACE\_HOOK\_TOKEN | Token to pass as Authorization header for all web hooks | |
| WORKSPACE\_ADDONS\_DIR | Path to the directory where to store installed addons | addons/installed |
| WORKSPACE\_ADDONS\_BLACKLIST | List of addons name blacklisted separated by commas |  |
| WORKSPACE\_ADDONS\_DEFAULTS_DIR | Path to the directory where to store (or where are stored) defaults addons | addons/defaults |
| WORKSPACE\_ADDONS\_TEMP_DIR | Path to the directory where to temporary store installed addons  | system temporary directory |
