# Naru

The general purpose project deploy the application using the declaration inside the files

## Structure

| Folder    | Usage             |
| --------- | ----------------- |
| `src`     | The source code   |
| `test`    | The test suite    |
| `.github` | CI related stuffs |

## Configuration of the project

The engine will try to search for the `package.json` inside the project root and run the init scripts specified inside the file.
The keys are as the table below:

| Key      | Content                                                    |
| -------- | ---------------------------------------------------------- |
| `deploy` | The shell command to actually deploy the application       |
| `email`  | The email the system should notify when the error happened |
| `tag`    | The prefix that the log file shall have                    |
