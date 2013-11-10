## Environment variables

Codebox use environment variables for defining its conffiguration, here is a list of all possibles configurations:

| Name | Description | Default |
| ----- | ------------------- | ------------------- |
| WORKSPACE_DIR | Workspace current directory | Shell current directory |
| WORKSPACE_NAME | Name for this workspace | "Workspace" |
| WORKSPACE_PUBLIC | If defined the workspace will be considered as public | false |
| WORKSPACE_HOOK_AUTH | Url for the authentification hook | |
| WORKSPACE_HOOK_EVENTS | Url for the events hook | |
| WORKSPACE_HOOK_SETTINGS | Url for the settings hook | |
| WORKSPACE_HOOK_TOKEN | Token to pass as Authorization header for all web hooks | |
| WORKSPACE_ADDONS_DIR | Path to the directory where to store installed addons | addons/installed |
| WORKSPACE_ADDONS_DEFAULTS_DIR | Path to the directory where to store (or where are stored) defaults addons | addons/defaults |
| WORKSPACE_ADDONS_TEMP_DIR | Path to the directory where to temporary store installed addons  | system temporary directory |
| WORKSPACE_ADDONS_DEFAULTS | List of git url for defaults addons (separated by commas) | Terminal, Editor, Manager, Settings, Video Chat |
